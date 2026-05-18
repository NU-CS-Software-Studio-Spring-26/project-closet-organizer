class ClothingItem < ApplicationRecord
  belongs_to :user
  has_many :outfit_items, dependent: :destroy
  has_many :outfits, through: :outfit_items
  has_one_attached :photo
  has_one_attached :cleaned_photo
  before_validation :apply_defaults, on: :create
  before_validation :normalize_category
  before_validation :normalize_tags
  before_validation :normalize_brand

  enum :size, {
    xs: 0,
    small: 1,
    medium: 2,
    large: 3,
    xl: 4,
    na: 5
  }
  enum :clean_image_status, {
    idle: 0,
    processing: 1,
    succeeded: 2,
    failed: 3
  }, prefix: true

  validates :name, presence: true
  validates :size, presence: true
  validate :photo_attachment_meets_policy

  def display_photo_attachment
    cleaned_photo.attached? ? cleaned_photo : photo
  end

  def source_photo_for_cleaning
    display_photo_attachment
  end

  private

  def photo_attachment_meets_policy
    ImageAttachmentPolicy.validate_attached(self, :photo, photo)
  end

  def normalize_tags
    self.tags = TagListNormalizer.call(tags)
  end

  def normalize_brand
    self.brand = brand.to_s.strip.presence
  end

  def apply_defaults
    self.size = :na if size.blank?
  end

  def normalize_category
    self.category = category.to_s.strip.downcase.presence
  end
end
