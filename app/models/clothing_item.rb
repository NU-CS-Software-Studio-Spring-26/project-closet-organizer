class ClothingItem < ApplicationRecord
  belongs_to :user

  enum :size, {
    xs: 0,
    small: 1,
    medium: 2,
    large: 3,
    xl: 4
  }

  validates :name, presence: true
  validates :size, presence: true
end
