class ApplicationController < ActionController::API
  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found

  private

  def render_not_found(exception)
    render json: { error: exception.message }, status: :not_found
  end

  def render_validation_errors(record)
    render json: { errors: record.errors.full_messages }, status: :unprocessable_content
  end

  def user_payload(user, include_items: true)
    payload = user.serializable_hash(only: %i[id username preferred_style created_at updated_at])

    if include_items
      payload["clothing_items"] = user.clothing_items.order(:name).map do |item|
        clothing_item_payload(item, include_user: false)
      end
    end

    payload
  end

  def clothing_item_payload(clothing_item, include_user: true)
    payload = clothing_item.serializable_hash(
      only: %i[id name date availability user_id created_at updated_at tags]
    )
    payload["size"] = clothing_item.size
    payload["user"] = user_payload(clothing_item.user, include_items: false) if include_user
    payload
  end
end
