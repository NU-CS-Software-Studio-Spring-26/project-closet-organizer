class User < ApplicationRecord
  EMAIL_PROVIDER = "email"
  GOOGLE_PROVIDER = "google_oauth2"

  has_secure_password

  has_many :clothing_items, dependent: :destroy
  has_many :outfits, dependent: :destroy
  has_many :outfit_uploads, dependent: :destroy

  generates_token_for :password_reset, expires_in: 2.hours do
    password_salt&.last(10)
  end

  validates :username, presence: true, uniqueness: true,
                       length: { maximum: InputLengthPolicy::MAX_USERNAME }
  validates :email, length: { maximum: InputLengthPolicy::MAX_EMAIL },
                    uniqueness: { case_sensitive: false, allow_blank: true }
  validates :email, presence: true, if: :email_account?
  validates :preferred_style, length: { maximum: InputLengthPolicy::MAX_PREFERRED_STYLE },
                              allow_blank: true
  validates :provider, presence: true
  validates :uid, presence: true, uniqueness: { scope: :provider }
  validate :accepted_terms_must_be_present, on: :registration

  attr_accessor :accepted_terms, :current_password

  def self.from_google_auth(auth_hash)
    user = find_for_google_auth(auth_hash)
    preferred_username = auth_hash.info.name.presence || auth_hash.info.email.presence || "User"

    user.assign_attributes(
      provider: auth_hash.provider,
      uid: auth_hash.uid,
      email: auth_hash.info.email,
      username: resolved_google_username(user, preferred_username),
      avatar_url: auth_hash.info.image,
      accepted_terms_at: user.accepted_terms_at || Time.current
    )

    user.password = SecureRandom.hex(24) if user.new_record?
    user.save!
    user
  end

  def self.register_with_password!(attributes)
    existing = find_by_normalized_email(attributes[:email])
    if existing.present?
      if existing.google_account?
        raise ActiveRecord::RecordInvalid.new(existing.tap {
          _1.errors.add(:email, "is already linked to Google sign-in. Use Google to access that account.")
        })
      end

      raise ActiveRecord::RecordInvalid.new(existing.tap {
        _1.errors.add(:email, "is already in use.")
      })
    end

    accepted_terms = ActiveModel::Type::Boolean.new.cast(attributes[:accepted_terms])
    user = new(
      username: attributes[:username].to_s.strip,
      email: attributes[:email].to_s.strip.downcase,
      preferred_style: attributes[:preferred_style].to_s.strip.presence,
      provider: EMAIL_PROVIDER,
      uid: email_uid(attributes[:email])
    )
    user.accepted_terms = accepted_terms
    user.accepted_terms_at = Time.current if accepted_terms
    user.password = attributes[:password]
    user.password_confirmation = attributes[:password_confirmation]
    user.save!(context: :registration)
    user
  end

  def self.find_for_google_auth(auth_hash)
    find_by(provider: auth_hash.provider, uid: auth_hash.uid) ||
      find_by_normalized_email(auth_hash.info.email) ||
      new
  end

  def self.find_by_password_reset_token(token)
    find_by_token_for(:password_reset, token.to_s)
  end

  def self.resolved_google_username(user, preferred_username)
    return user.username if user.persisted? && user.username.present?
    return preferred_username unless username_taken?(preferred_username, except_id: user.id)

    suffix = 2

    loop do
      candidate = "#{preferred_username} #{suffix}"
      return candidate unless username_taken?(candidate, except_id: user.id)

      suffix += 1
    end
  end

  def self.find_by_normalized_email(email)
    return if email.blank?

    where("lower(email) = ?", email.to_s.downcase).first
  end

  def self.email_uid(email)
    email.to_s.strip.downcase
  end

  def self.username_taken?(username, except_id: nil)
    scope = where(username: username)
    scope = scope.where.not(id: except_id) if except_id.present?
    scope.exists?
  end

  def email_account?
    provider == EMAIL_PROVIDER
  end

  def google_account?
    provider == GOOGLE_PROVIDER
  end

  def password_login_enabled?
    email_account?
  end

  def authenticate_current_password(candidate)
    return true unless password_login_enabled?

    authenticate(candidate.to_s).present?
  end

  private_class_method :find_for_google_auth, :resolved_google_username, :username_taken?, :email_uid

  private

  def accepted_terms_must_be_present
    return if accepted_terms_at.present?
    return if ActiveModel::Type::Boolean.new.cast(accepted_terms)

    errors.add(:accepted_terms, "must be accepted before creating an account.")
  end
end
