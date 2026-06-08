class UserMailer < ApplicationMailer
  def password_reset(user, token)
    @user = user
    @reset_url = password_reset_url(token: token)

    mail to: user.email, subject: "Reset your #{PROJECT_NAME} password"
  end

  private

  PROJECT_NAME = "Curated Closet"

  def password_reset_url(token:)
    "#{frontend_base_url}/reset-password?token=#{CGI.escape(token)}"
  end

  def frontend_base_url
    configured = ENV["FRONTEND_BASE_URL"]&.strip
    return configured if configured.present?

    host = ENV.fetch("FRONTEND_HOST", "127.0.0.1")
    port = ENV.fetch("FRONTEND_PORT", "5173")
    scheme = ENV.fetch("FRONTEND_SCHEME", "http")

    "#{scheme}://#{host}:#{port}"
  end
end
