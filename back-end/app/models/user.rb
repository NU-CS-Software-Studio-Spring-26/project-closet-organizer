class User < ApplicationRecord
  has_secure_password

  has_many :clothing_items, dependent: :destroy
  has_many :outfit_uploads, dependent: :destroy

  validates :username, presence: true, uniqueness: true
end
