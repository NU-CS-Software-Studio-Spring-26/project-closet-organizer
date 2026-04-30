class SessionsController < ApplicationController
  def create
    auth_hash = request.env["omniauth.auth"]
    if auth_hash.blank?
      redirect_to frontend_login_redirect(error: "google_auth_failed")
      return
    end

    user = User.from_google_auth(auth_hash)
    reset_session
    session[:user_id] = user.id

    redirect_to frontend_closet_redirect
  rescue ActiveRecord::RecordInvalid
    redirect_to frontend_login_redirect(error: "signin_failed")
  end

  def failure
    redirect_to frontend_login_redirect(error: params[:message].presence || "auth_cancelled")
  end

  def me
    return render_unauthorized unless logged_in?

    render json: user_payload(current_user)
  end

  def destroy
    reset_session
    head :no_content
  end

  private

  def frontend_base_url
    host = ENV.fetch("FRONTEND_HOST", "127.0.0.1")
    port = ENV.fetch("FRONTEND_PORT", "5173")
    "http://#{host}:#{port}"
  end

  def frontend_closet_redirect
    "#{frontend_base_url}/closet"
  end

  def frontend_login_redirect(error:)
    "#{frontend_base_url}/?auth_error=#{CGI.escape(error)}"
  end
end
