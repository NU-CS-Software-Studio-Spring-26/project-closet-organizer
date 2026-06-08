class UsersController < ApplicationController
  before_action :require_login, except: :create
  before_action :require_admin, only: %i[index show]
  before_action :set_user, only: %i[ show update destroy ]

  DEFAULT_PER_PAGE = 24
  MAX_PER_PAGE = 100

  def index
    scope = User.order(:username)
    page = scope.page(params[:page]).per(resolved_per_page)

    render json: {
      users: page.map { |user| payloads.user(user, include_items: false) },
      meta: {
        page: page.current_page,
        per_page: page.limit_value,
        total_pages: page.total_pages,
        total_count: page.total_count
      }
    }
  end

  def show
    render json: payloads.user(@user)
  end

  def create
    user = User.register_with_password!(registration_params)
    reset_session
    session[:user_id] = user.id
    render json: payloads.user(user), status: :created
  rescue ActiveRecord::RecordInvalid => error
    render_validation_errors(error.record)
  end

  def update
    if password_change_requested? && !@user.password_login_enabled?
      render json: { error: "Password is managed through Google sign-in for this account." },
             status: :unprocessable_content
      return
    end

    if password_change_requested? && !@user.authenticate_current_password(params.dig(:user, :current_password))
      render json: { error: "Current password is incorrect." }, status: :unauthorized
      return
    end

    if @user.update(user_params)
      render json: payloads.user(@user)
    else
      render_validation_errors(@user)
    end
  end

  def destroy
    if @user.password_login_enabled? && !@user.authenticate_current_password(params.dig(:user, :password))
      render json: { error: "Current password is incorrect." }, status: :unauthorized
      return
    end

    deleting_self = @user.id == current_user.id
    @user.destroy
    reset_session if deleting_self
    head :no_content
  end

  private

  def set_user
    @user = admin? ? User.find(params[:id]) : current_user
  end

  def registration_params
    params.require(:user).permit(
      :username,
      :email,
      :preferred_style,
      :password,
      :password_confirmation,
      :accepted_terms
    )
  end

  def user_params
    permitted = params.require(:user).permit(
      :username,
      :preferred_style,
      :password,
      :password_confirmation
    )

    if permitted[:password].blank? && permitted[:password_confirmation].blank?
      permitted.except(:password, :password_confirmation)
    else
      permitted
    end
  end

  def password_change_requested?
    password = params.dig(:user, :password).to_s
    password_confirmation = params.dig(:user, :password_confirmation).to_s
    password.present? || password_confirmation.present?
  end

  def resolved_per_page
    raw = params[:per_page].presence&.to_i
    return DEFAULT_PER_PAGE if raw.blank? || raw <= 0

    [ raw, MAX_PER_PAGE ].min
  end
end
