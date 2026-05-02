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
        outfit_detections.create!(
          category: item.fetch(:category),
          confidence: item[:confidence],
          suggested_name: item[:suggested_name],
          details: item[:details] || {},
          position: index
        )
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
