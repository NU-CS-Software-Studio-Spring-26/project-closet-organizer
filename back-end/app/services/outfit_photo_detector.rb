require "base64"
require "json"
require "net/http"
require "uri"

class OutfitPhotoDetector
  DEFAULT_BASE_URL = "https://openrouter.ai/api/v1".freeze
  DEFAULT_MODEL = "openai/gpt-4.1-mini".freeze

  def self.call(outfit_upload)
    new(outfit_upload).call
  end

  def initialize(outfit_upload)
    @outfit_upload = outfit_upload
  end

  def call
    ensure_configuration!

    response = perform_request
    content = extract_message_content(response)
    parsed = parse_detection_payload(content)

    {
      provider: "openrouter",
      vision_model: configured_model,
      items: normalize_items(parsed.fetch("items", [])),
      raw_response: response
    }
  end

  private

  attr_reader :outfit_upload

  def perform_request
    uri = URI.parse("#{base_url}/chat/completions")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = (uri.scheme == "https")
    http.read_timeout = 60
    http.open_timeout = 10

    request = Net::HTTP::Post.new(uri)
    request["Authorization"] = "Bearer #{api_key}"
    request["Content-Type"] = "application/json"
    request["HTTP-Referer"] = ENV["OPENROUTER_SITE_URL"] if ENV["OPENROUTER_SITE_URL"].present?
    request["X-Title"] = ENV["OPENROUTER_APP_NAME"] if ENV["OPENROUTER_APP_NAME"].present?
    request.body = request_payload.to_json

    response = http.request(request)
    body = JSON.parse(response.body)

    return body if response.is_a?(Net::HTTPSuccess)

    error_message = body.dig("error", "message") || "OpenRouter request failed with status #{response.code}"
    raise error_message
  rescue JSON::ParserError
    raise "OpenRouter returned an unreadable response."
  end

  def request_payload
    {
      model: configured_model,
      temperature: 0.1,
      max_tokens: 900,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a fashion cataloging assistant. Return only valid JSON."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: detection_prompt
            },
            {
              type: "image_url",
              image_url: {
                url: source_photo_data_url
              }
            }
          ]
        }
      ]
    }
  end

  def detection_prompt
    <<~PROMPT
      Analyze this outfit photo and identify the visible clothing items and accessories that should become separate closet entries.

      Return a JSON object with this shape:
      {
        "items": [
          {
            "category": "shirt",
            "confidence": 0.93,
            "visible": true,
            "suggested_name": "White Button-Up Shirt",
            "dominant_color": "white",
            "material_guess": "cotton",
            "style_guess": "classic",
            "notes": "Any short note that helps explain the item."
          }
        ]
      }

      Rules:
      - Include only items that are clearly visible enough to be useful.
      - Use short, normalized categories like shirt, blouse, jacket, coat, pants, jeans, shorts, skirt, dress, belt, shoes, hat, bag.
      - Confidence must be a number from 0 to 1.
      - If material or style is unclear, use an empty string.
      - Return only JSON and no markdown.
    PROMPT
  end

  def extract_message_content(response)
    content = response.dig("choices", 0, "message", "content")

    case content
    when String
      content
    when Array
      content.filter_map { |part| part["text"] }.join("\n")
    else
      raise "OpenRouter did not return detection content."
    end
  end

  def parse_detection_payload(content)
    cleaned = content.to_s.strip
    cleaned = cleaned.sub(/\A```json\s*/i, "").sub(/\A```\s*/i, "").sub(/\s*```\z/, "")

    JSON.parse(cleaned)
  rescue JSON::ParserError
    json_start = cleaned.index("{")
    json_end = cleaned.rindex("}")
    raise "OpenRouter returned detection data that was not valid JSON." unless json_start && json_end

    JSON.parse(cleaned[json_start..json_end])
  end

  def normalize_items(items)
    Array(items).filter_map do |item|
      next if item["visible"] == false

      category = item["category"].to_s.strip.downcase
      next if category.blank?

      {
        category: category,
        confidence: normalize_confidence(item["confidence"]),
        suggested_name: item["suggested_name"].to_s.strip.presence,
        details: {
          dominant_color: item["dominant_color"].to_s.strip,
          material_guess: item["material_guess"].to_s.strip,
          style_guess: item["style_guess"].to_s.strip,
          notes: item["notes"].to_s.strip
        }.compact_blank
      }
    end
  end

  def normalize_confidence(value)
    Float(value)
  rescue ArgumentError, TypeError
    nil
  end

  def source_photo_data_url
    content_type = outfit_upload.source_photo.blob.content_type.presence || "image/jpeg"
    encoded = Base64.strict_encode64(outfit_upload.source_photo.download)
    "data:#{content_type};base64,#{encoded}"
  end

  def ensure_configuration!
    raise "OPENROUTER_API_KEY is not configured." if api_key.blank?
  end

  def api_key
    ENV["OPENROUTER_API_KEY"]
  end

  def base_url
    ENV.fetch("OPENROUTER_BASE_URL", DEFAULT_BASE_URL)
  end

  def configured_model
    ENV.fetch("OPENROUTER_MODEL", DEFAULT_MODEL)
  end
end
