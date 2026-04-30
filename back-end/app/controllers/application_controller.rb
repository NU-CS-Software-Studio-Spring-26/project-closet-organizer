class ApplicationController < ActionController::API
  include ActionController::Cookies

  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
  before_action :set_cors_headers

  private

  def set_cors_headers
    origin = request.headers["Origin"]
    return if origin.blank?
    return unless allowed_origins.include?(origin)

    headers["Access-Control-Allow-Origin"] = origin
    headers["Vary"] = "Origin"
    headers["Access-Control-Allow-Credentials"] = "true"
    headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, PUT, DELETE, OPTIONS"
    headers["Access-Control-Allow-Headers"] = "Origin, Content-Type, Accept, Authorization"
  end

  def allowed_origins
    frontend_port = ENV.fetch("FRONTEND_PORT", "5173")
    @allowed_origins ||= [
      "http://localhost:#{frontend_port}",
      "http://127.0.0.1:#{frontend_port}"
    ]
  end

  def render_not_found(exception)
    render json: { error: exception.message }, status: :not_found
  end

  def render_validation_errors(record)
    render json: { errors: record.errors.full_messages }, status: :unprocessable_content
  end

  def current_user
    return @current_user if defined?(@current_user)

    @current_user = User.find_by(id: session[:user_id])
  end

  def logged_in?
    current_user.present?
  end

  def require_login
    return if logged_in?

    render_unauthorized("Please sign in with Google.")
  end

  def render_unauthorized(message = "Unauthorized")
    render json: { error: message }, status: :unauthorized
  end

  def user_payload(user, include_items: true)
    payload = user.serializable_hash(only: %i[id username preferred_style email avatar_url created_at updated_at])

    if include_items
      payload["clothing_items"] = user.clothing_items.order(:name).map do |item|
        clothing_item_payload(item, include_user: false)
      end
    end

    payload
  end

  def clothing_item_payload(clothing_item, include_user: true)
    payload = clothing_item.serializable_hash(
      only: %i[id name date user_id created_at updated_at tags]
    )
    payload["size"] = clothing_item.size
    payload["image_url"] = clothing_item.photo.attached? ? url_for(clothing_item.photo) : nil
    payload["user"] = user_payload(clothing_item.user, include_items: false) if include_user
    payload
  end
end
