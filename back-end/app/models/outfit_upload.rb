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
  validate :source_photo_meets_image_policy

  def analyze!
    OutfitUploadAnalyzer.call(self)
  end

  private

  def source_photo_must_be_present
    return if source_photo.attached?

    errors.add(:source_photo, "must be attached")
  end

  def source_photo_meets_image_policy
    ImageAttachmentPolicy.validate_attached(self, :source_photo, source_photo)
  end
end
