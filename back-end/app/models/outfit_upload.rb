class OutfitUpload < ApplicationRecord
  belongs_to :user
  has_one_attached :source_photo
  has_many :outfit_detections, -> { order(:position) }, dependent: :destroy

  enum :status, {
    pending: 0,
    processing: 1,
    succeeded: 2,
    failed: 3
  }

  validates :status, presence: true
  validate :source_photo_must_be_present
  validate :source_photo_must_be_an_image
  validate :source_photo_size_within_limit

  def analyze!
    update!(status: :processing, error_message: nil)

    result = OutfitPhotoDetector.call(self)

    transaction do
      outfit_detections.delete_all

      result.fetch(:items, []).each_with_index do |item, index|
        detection = outfit_detections.create!(
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
        )

        process_detection_crop!(detection)
      end

      update!(
        status: :succeeded,
        provider: result[:provider],
        vision_model: result[:vision_model],
        raw_response: result[:raw_response],
        detected_at: Time.current
      )
    end
  rescue StandardError => error
    update!(status: :failed, error_message: error.message)
    raise
  end

  private

  def process_detection_crop!(detection)
    attempt_refinement_and_verification!(detection, starting_box: detection.coarse_box)
    return if detection.crop_status_verified?

    attempt_refinement_and_verification!(
      detection,
      starting_box: detection.final_box || detection.refined_box || detection.coarse_box,
      feedback: crop_retry_feedback(detection),
      reroute: true
    )
    return if detection.crop_status_verified?

    attempt_refinement_and_verification!(
      detection,
      feedback: crop_retry_feedback(detection, full_relocalization: true),
      reroute: true
    )
  rescue StandardError => error
    detection.update!(
      crop_status: :failed,
      crop_attempts: detection.crop_attempts + 1,
      crop_notes: [ detection.crop_notes, error.message ].compact_blank.join(" | ")
    )
  end

  def attempt_refinement_and_verification!(detection, starting_box: nil, feedback: nil, reroute: false)
    refined = OutfitCropRefiner.call(
      self,
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

    verification = OutfitCropVerifier.call(self, detection)
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

  def source_photo_must_be_present
    return if source_photo.attached?

    errors.add(:source_photo, "must be attached")
  end

  def source_photo_must_be_an_image
    return unless source_photo.attached?
    return if source_photo.blob.content_type&.start_with?("image/")

    errors.add(:source_photo, "must be an image")
  end

  def source_photo_size_within_limit
    return unless source_photo.attached?
    return if source_photo.blob.byte_size <= 10.megabytes

    errors.add(:source_photo, "must be 10 MB or smaller")
  end
end
