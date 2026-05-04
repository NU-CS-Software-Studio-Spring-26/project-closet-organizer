class Outfit < ApplicationRecord
  belongs_to :user
  has_many :outfit_items, dependent: :destroy
  has_many :clothing_items, through: :outfit_items

  validates :name, presence: true
  validate :tags_must_be_an_array

  private

  def tags_must_be_an_array
    return if tags.nil? || tags.is_a?(Array)

    errors.add(:tags, "must be an array")
  end
end
