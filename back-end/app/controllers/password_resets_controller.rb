class PasswordResetsController < ApplicationController
  def create
    email = params.dig(:password_reset, :email).to_s.strip.downcase
    user = User.find_by_normalized_email(email)

    development_reset_url = nil

    if user&.password_login_enabled?
      token = user.generate_token_for(:password_reset)
      UserMailer.password_reset(user, token).deliver_later
      development_reset_url = frontend_password_reset_url(token) if Rails.env.development?
    end

    payload = {
      message: "If an account with that email exists, password reset instructions were sent."
    }
    payload[:development_reset_url] = development_reset_url if development_reset_url.present?

    render json: payload
  end

  def update
    user = User.find_by_password_reset_token(params.dig(:password_reset, :token).to_s)
    if user.nil?
      render json: { error: "This reset link is invalid or has expired." }, status: :unprocessable_content
      return
    end

    user.password = params.dig(:password_reset, :password)
    user.password_confirmation = params.dig(:password_reset, :password_confirmation)

    if user.save
      render json: { message: "Your password has been updated. You can sign in now." }
    else
      render_validation_errors(user)
    end
  end

  private

  def frontend_password_reset_url(token)
    base = ENV["FRONTEND_BASE_URL"].presence || begin
      host = ENV.fetch("FRONTEND_HOST", "127.0.0.1")
      port = ENV.fetch("FRONTEND_PORT", "5173")
      scheme = ENV.fetch("FRONTEND_SCHEME", "http")
      "#{scheme}://#{host}:#{port}"
    end

    "#{base}/reset-password?token=#{CGI.escape(token)}"
  end
end
