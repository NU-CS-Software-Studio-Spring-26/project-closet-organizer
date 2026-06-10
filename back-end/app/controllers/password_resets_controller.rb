class PasswordResetsController < ApplicationController
  def create
    email = params[:email].to_s.strip.downcase
    user = User.find_local_by_email(email)
    if user
      token = user.generate_token_for(:password_reset)
      UserMailer.password_reset(user, token).deliver_now
    end
    render json: { message: "If that email is registered, you'll receive a reset link shortly." }
  end

  def update
    user = User.find_by_token_for(:password_reset, params[:token].to_s)
    unless user
      return render json: { errors: [ "Reset link is invalid or has expired." ] },
                    status: :unprocessable_entity
    end

    if params[:password].blank?
      return render json: { errors: [ "New password can't be blank." ] },
                    status: :unprocessable_entity
    end

    if user.update(password: params[:password], password_confirmation: params[:password_confirmation])
      render json: { message: "Password reset successfully. You can now sign in." }
    else
      render_validation_errors(user)
    end
  end
end
