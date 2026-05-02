class OutfitCropRefiner < OpenrouterVisionService
  DEFAULT_MODEL = "openai/gpt-4.1".freeze

  def self.call(outfit_upload, outfit_detection, starting_box: nil, feedback: nil, reroute: false)
    new(
      outfit_upload,
      outfit_detection,
      starting_box: starting_box,
      feedback: feedback,
      reroute: reroute
    ).call
  end

  def initialize(outfit_upload, outfit_detection, starting_box: nil, feedback: nil, reroute: false)
    super(outfit_upload)
    @outfit_detection = outfit_detection
    @starting_box = starting_box
    @feedback = feedback
    @reroute = reroute
  end

  def call
    raise "A coarse detection box is required before refinement." if !reroute? && outfit_detection.coarse_box.blank?

    parsed = perform_structured_request(
      model: configured_model,
      prompt: refinement_prompt,
      schema_name: "outfit_crop_refinement",
      schema: refinement_schema
    )

    refined_box = normalize_box(parsed["refined_box"])
    raise "OpenRouter did not return a valid refined crop box." if refined_box.blank?

    {
      refined_box: refined_box,
      crop_confidence: normalize_unit_interval(parsed["crop_confidence"]),
      notes: parsed["notes"].to_s.strip.presence
    }
  end

  private

  attr_reader :feedback, :outfit_detection, :starting_box

  def refinement_prompt
    box = reference_box

    <<~PROMPT
      You are refining a crop for exactly one clothing item inside a larger outfit photo.

      Target item:
      - category: #{outfit_detection.category}
      - suggested name: #{outfit_detection.suggested_name.presence || outfit_detection.category.titleize}
      - dominant color: #{outfit_detection.details["dominant_color"].presence || "unknown"}
      - style: #{outfit_detection.details["style_guess"].presence || "unknown"}

      #{reference_box_prompt(box)}

      #{feedback.present? ? "Previous crop feedback:\n- #{feedback}\n" : ""}

      Return a better normalized crop box for the target item.

      Rules:
      - Keep the whole target item visible.
      - Exclude unrelated garments and background as much as possible.
      - If the previous crop feedback mentions cutoff or the wrong centered item, correct for that specifically.
      - If reroute mode is active, re-localize the target item from the full image and do not stay anchored to a bad prior crop.
      - Prefer a slightly loose crop over cutting off the item.
      - Output normalized decimals from 0 to 1.
      - Return only JSON that matches the schema.
    PROMPT
  end

  def refinement_schema
    {
      type: "object",
      additionalProperties: false,
      required: %w[refined_box crop_confidence notes],
      properties: {
        refined_box: box_schema,
        crop_confidence: unit_interval_schema,
        notes: { type: "string" }
      }
    }
  end

  def box_schema
    {
      type: "object",
      additionalProperties: false,
      required: %w[x y width height],
      properties: {
        x: unit_interval_schema,
        y: unit_interval_schema,
        width: unit_interval_schema,
        height: unit_interval_schema
      }
    }
  end

  def unit_interval_schema
    {
      type: "number",
      minimum: 0,
      maximum: 1
    }
  end

  def configured_model
    ENV.fetch(
      "OPENROUTER_CROP_REFINEMENT_MODEL",
      ENV.fetch("OPENROUTER_DETECTION_MODEL", ENV.fetch("OPENROUTER_MODEL", DEFAULT_MODEL))
    )
  end

  def reroute?
    @reroute == true
  end

  def reference_box
    return starting_box if starting_box.present?
    return nil if reroute?

    outfit_detection.refined_box || outfit_detection.coarse_box
  end

  def reference_box_prompt(box)
    if box.present?
      <<~BOX.chomp
        Reference crop box:
        - x: #{box[:x]}
        - y: #{box[:y]}
        - width: #{box[:width]}
        - height: #{box[:height]}
      BOX
    else
      "No reliable reference crop box is available. Re-localize the target item directly from the full image."
    end
  end
end
