class UsersController < ApplicationController
  before_action :require_login
  before_action :require_admin, only: %i[index show]
  before_action :set_user, only: %i[ show update destroy ]

  def index
    render json: User.order(:username).map { |user| user_payload(user) }
  end

  def show
    render json: user_payload(@user)
  end

  def create
    render_unauthorized("User creation is handled through Google sign-in.")
  end

  def update
    if @user.update(user_params)
      render json: user_payload(@user)
    else
      render_validation_errors(@user)
    end
  end

  def destroy
    @user.destroy
    head :no_content
  end

  private

  def set_user
    @user = admin? ? User.find(params[:id]) : current_user
  end

  def user_params
    permitted = params.require(:user).permit(:username, :preferred_style, :password, :password_confirmation)

    if permitted[:password].blank? && permitted[:password_confirmation].blank?
      permitted.except(:password, :password_confirmation)
    else
      permitted
    end
  end
end
