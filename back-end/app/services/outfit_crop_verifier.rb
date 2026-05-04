class OutfitCropVerifier < OpenrouterVisionService
  DEFAULT_MODEL = "openai/gpt-4.1".freeze

  def self.call(outfit_upload, outfit_detection)
    new(outfit_upload, outfit_detection).call
  end

  def initialize(outfit_upload, outfit_detection)
    super(outfit_upload)
    @outfit_detection = outfit_detection
  end

  def call
    raise "A refined crop box is required before verification." if outfit_detection.refined_box.blank?

    parsed = perform_structured_request(
      model: configured_model,
      prompt: verification_prompt,
      schema_name: "outfit_crop_verification",
      schema: verification_schema
    )

    {
      accepted: parsed["accepted"] == true,
      quality_score: normalize_unit_interval(parsed["quality_score"]),
      issues: Array(parsed["issues"]).map(&:to_s),
      notes: parsed["notes"].to_s.strip.presence,
      final_box: normalize_box(parsed["final_box"]) || outfit_detection.refined_box
    }
  end

  private

  attr_reader :outfit_detection

  def verification_prompt
    refined = outfit_detection.refined_box

    <<~PROMPT
      You are verifying whether a proposed crop box isolates exactly one target clothing item well enough to save as a closet image.

      Target item:
      - category: #{outfit_detection.category}
      - suggested name: #{outfit_detection.suggested_name.presence || outfit_detection.category.titleize}

      Proposed refined crop box:
      - x: #{refined[:x]}
      - y: #{refined[:y]}
      - width: #{refined[:width]}
      - height: #{refined[:height]}

      Evaluate the crop and decide whether it is good enough.

      Rules:
      - Accept only if the crop is centered on the intended item and most of the item is visible.
      - Reject if major parts are cut off or if another item dominates the crop.
      - If needed, correct the crop with a better final box.
      - quality_score must be a normalized decimal from 0 to 1.
      - Return only JSON that matches the schema.
    PROMPT
  end

  def verification_schema
    {
      type: "object",
      additionalProperties: false,
      required: %w[accepted quality_score issues notes final_box],
      properties: {
        accepted: { type: "boolean" },
        quality_score: unit_interval_schema,
        issues: {
          type: "array",
          items: { type: "string" }
        },
        notes: { type: "string" },
        final_box: box_schema
      }
    }
  end

  def configured_model
    ENV.fetch(
      "OPENROUTER_CROP_VERIFICATION_MODEL",
      ENV.fetch("OPENROUTER_CROP_REFINEMENT_MODEL", ENV.fetch("OPENROUTER_MODEL", DEFAULT_MODEL))
    )
  end
end
