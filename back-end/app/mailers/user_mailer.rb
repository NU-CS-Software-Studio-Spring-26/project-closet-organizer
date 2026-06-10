class UserMailer < ApplicationMailer
  default from: "noreply@curatedcloset.app"

  def password_reset(user, token)
    @user = user
    @reset_url = "#{ENV.fetch("FRONTEND_BASE_URL", "http://localhost:5173")}/reset-password?token=#{token}"
    mail(to: user.email, subject: "Reset your Curated Closet password")
  end
end
