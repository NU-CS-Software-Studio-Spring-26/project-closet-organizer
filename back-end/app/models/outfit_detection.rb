class OutfitDetection < ApplicationRecord
  belongs_to :outfit_upload

  validates :category, presence: true
  validates :position, presence: true
end
