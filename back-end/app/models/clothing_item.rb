class ClothingItem < ApplicationRecord
  SUPPORTED_PURCHASE_CURRENCIES = %w[USD EUR GBP CAD AUD JPY CHF MXN INR CNY].freeze
  DEFAULT_PURCHASE_CURRENCY = "USD"

  belongs_to :user
  has_many :outfit_items, dependent: :destroy
  has_many :outfits, through: :outfit_items
  has_one_attached :photo
  has_one_attached :cleaned_photo
  before_validation :apply_defaults, on: :create
  before_validation :normalize_category
  before_validation :normalize_tags
  before_validation :normalize_brand
  before_validation :normalize_purchase_currency

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

  validates :name, presence: true, length: { maximum: InputLengthPolicy::MAX_CLOTHING_ITEM_NAME }
  validates :brand, length: { maximum: InputLengthPolicy::MAX_CLOTHING_ITEM_BRAND }, allow_blank: true
  validates :category, length: { maximum: InputLengthPolicy::MAX_CLOTHING_ITEM_CATEGORY }, allow_blank: true
  validates :size, presence: true
  validates :purchase_price,
    numericality: {
      greater_than_or_equal_to: 0,
      less_than: 1_000_000
    },
    allow_nil: true
  validates :purchase_currency,
    inclusion: { in: SUPPORTED_PURCHASE_CURRENCIES },
    allow_nil: true
  validate :tags_meet_length_policy
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

  def normalize_tags
    self.tags = TagListNormalizer.call(tags)
  end

  def tags_meet_length_policy
    InputLengthPolicy.validate_tag_list(self, :tags, tags)
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

  def normalize_purchase_currency
    code = purchase_currency.to_s.strip.upcase.presence

    if purchase_price.blank?
      self.purchase_currency = nil
      return
    end

    self.purchase_currency = code || DEFAULT_PURCHASE_CURRENCY
  end
end
