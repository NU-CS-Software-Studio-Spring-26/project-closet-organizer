class UsersController < ApplicationController
  before_action :set_user, only: %i[show update destroy]

  def index
    @users = User.includes(:clothing_items).order(:username)
    render json: @users.map { |user| user_payload(user) }
  end

  def show
    render json: user_payload(@user)
  end

  def create
    @user = User.new(user_params)

    if @user.save
      render json: user_payload(@user), status: :created
    else
      render_validation_errors(@user)
    end
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
    @user = User.find(params[:id])
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
