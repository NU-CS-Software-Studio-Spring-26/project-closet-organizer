class ClothingItem < ApplicationRecord
  belongs_to :user
  has_one_attached :photo
  has_one_attached :cleaned_photo

  enum :size, {
    xs: 0,
    small: 1,
    medium: 2,
    large: 3,
    xl: 4
  }
  enum :clean_image_status, {
    idle: 0,
    processing: 1,
    succeeded: 2,
    failed: 3
  }, prefix: true

  validates :name, presence: true
  validates :size, presence: true
  validate :photo_must_be_an_image
  validate :photo_size_within_limit

  def display_photo_attachment
    cleaned_photo.attached? ? cleaned_photo : photo
  end

  def source_photo_for_cleaning
    display_photo_attachment
  end

  private

  def photo_must_be_an_image
    return unless photo.attached?
    return if photo.blob.content_type&.start_with?("image/")

    errors.add(:photo, "must be an image")
  end

  def photo_size_within_limit
    return unless photo.attached?
    return if photo.blob.byte_size <= 10.megabytes

    errors.add(:photo, "must be 10 MB or smaller")
  end
end
