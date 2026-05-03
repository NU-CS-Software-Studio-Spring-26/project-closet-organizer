class User < ApplicationRecord
  has_secure_password

  has_many :clothing_items, dependent: :destroy
  has_many :outfit_uploads, dependent: :destroy

  validates :username, presence: true, uniqueness: true
  validates :provider, presence: true
  validates :uid, presence: true, uniqueness: { scope: :provider }

  def self.from_google_auth(auth_hash)
    user = find_or_initialize_by(provider: auth_hash.provider, uid: auth_hash.uid)

    user.assign_attributes(
      email: auth_hash.info.email,
      username: auth_hash.info.name.presence || auth_hash.info.email,
      avatar_url: auth_hash.info.image
    )

    user.password = SecureRandom.hex(24) if user.new_record?
    user.save!
    user
  end
end
