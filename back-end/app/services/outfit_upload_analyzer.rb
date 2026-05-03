class OutfitUploadAnalyzer
  def self.call(outfit_upload)
    new(outfit_upload).call
  end

  def initialize(outfit_upload)
    @outfit_upload = outfit_upload
  end

  def call
    outfit_upload.update!(status: :processing, error_message: nil)

    result = OutfitPhotoDetector.call(outfit_upload)

    outfit_upload.transaction do
      outfit_upload.outfit_detections.delete_all

      result.fetch(:items, []).each_with_index do |item, index|
        detection = outfit_upload.outfit_detections.create!(detection_attributes(item, index))
        process_detection_crop!(detection)
      end

      outfit_upload.update!(
        status: :succeeded,
        provider: result[:provider],
        vision_model: result[:vision_model],
        raw_response: result[:raw_response],
        detected_at: Time.current
      )
    end
  rescue StandardError => error
    outfit_upload.update!(status: :failed, error_message: error.message)
    raise
  end

  private

  attr_reader :outfit_upload

  def detection_attributes(item, index)
    {
      category: item.fetch(:category),
      confidence: item[:confidence],
      suggested_name: item[:suggested_name],
      details: item[:details] || {},
      coarse_bbox_x: item.dig(:coarse_box, :x),
      coarse_bbox_y: item.dig(:coarse_box, :y),
      coarse_bbox_width: item.dig(:coarse_box, :width),
      coarse_bbox_height: item.dig(:coarse_box, :height),
      bbox_x: item.dig(:bounding_box, :x),
      bbox_y: item.dig(:bounding_box, :y),
      bbox_width: item.dig(:bounding_box, :width),
      bbox_height: item.dig(:bounding_box, :height),
      crop_status: :pending,
      position: index
    }
  end

  def process_detection_crop!(detection)
    crop_cycle_limit.times do |cycle_index|
      attempt_refinement_and_verification!(detection, **crop_cycle_options(detection, cycle_index))
      return finalize_detection_crop!(detection) if detection.crop_status_verified?
    end
  rescue StandardError => error
    detection.update!(
      crop_status: :failed,
      crop_attempts: detection.crop_attempts + 1,
      crop_notes: [ detection.crop_notes, error.message ].compact_blank.join(" | ")
    )
  ensure
    finalize_detection_crop!(detection)
  end

  def attempt_refinement_and_verification!(detection, starting_box: nil, feedback: nil, reroute: false)
    refined = OutfitCropRefiner.call(
      outfit_upload,
      detection,
      starting_box: starting_box,
      feedback: feedback,
      reroute: reroute
    )
    detection.update!(
      refined_bbox_x: refined.dig(:refined_box, :x),
      refined_bbox_y: refined.dig(:refined_box, :y),
      refined_bbox_width: refined.dig(:refined_box, :width),
      refined_bbox_height: refined.dig(:refined_box, :height),
      crop_confidence: refined[:crop_confidence],
      crop_status: :refined,
      crop_attempts: detection.crop_attempts + 1,
      crop_notes: combine_crop_notes(detection.crop_notes, refined[:notes], feedback)
    )

    verification = OutfitCropVerifier.call(outfit_upload, detection)
    detection.update!(
      final_bbox_x: verification.dig(:final_box, :x),
      final_bbox_y: verification.dig(:final_box, :y),
      final_bbox_width: verification.dig(:final_box, :width),
      final_bbox_height: verification.dig(:final_box, :height),
      crop_quality_score: verification[:quality_score],
      crop_status: verification[:accepted] ? :verified : :rejected,
      crop_attempts: detection.crop_attempts + 1,
      crop_notes: combine_crop_notes(
        detection.crop_notes,
        verification[:notes],
        verification[:issues].presence&.join(", ")
      )
    )
  end

  def crop_retry_feedback(detection, full_relocalization: false)
    guidance = [
      detection.crop_notes,
      "Previous crop was rejected for #{detection.category}.",
      "Find the full #{detection.category} again from the original image before returning the next crop.",
      (full_relocalization ? "Do not stay anchored to the prior box if it is misleading." : nil)
    ]

    combine_crop_notes(*guidance)
  end

  def combine_crop_notes(*parts)
    parts.compact_blank.join(" | ").presence
  end

  def crop_cycle_options(detection, cycle_index)
    return { starting_box: detection.coarse_box } if cycle_index.zero?

    full_relocalization = cycle_index > 1

    {
      starting_box: (full_relocalization ? nil : detection.final_box || detection.refined_box || detection.coarse_box),
      feedback: crop_retry_feedback(detection, full_relocalization: full_relocalization),
      reroute: true
    }
  end

  def crop_cycle_limit
    value = Integer(ENV.fetch("OUTFIT_CROP_CYCLE_LIMIT", "1"))
    [ value, 1 ].max
  rescue ArgumentError, TypeError
    1
  end

  def finalize_detection_crop!(detection)
    best_box = detection.final_box || detection.refined_box || detection.coarse_box

    detection.update!(
      final_bbox_x: best_box&.dig(:x),
      final_bbox_y: best_box&.dig(:y),
      final_bbox_width: best_box&.dig(:width),
      final_bbox_height: best_box&.dig(:height),
      crop_status: best_box.present? ? :verified : :failed,
      crop_confidence: nil,
      crop_quality_score: nil,
      crop_notes: nil
    )
  end
end
