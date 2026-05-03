class ApplicationController < ActionController::API
  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
  before_action :set_cors_headers

  private

  def set_cors_headers
    origin = request.headers["Origin"]
    return if origin.blank?
    return unless allowed_origins.include?(origin)

    headers["Access-Control-Allow-Origin"] = origin
    headers["Vary"] = "Origin"
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
      only: %i[
        id
        name
        date
        user_id
        created_at
        updated_at
        tags
        clean_image_status
        clean_image_error_message
        clean_image_provider
        clean_image_model
        clean_image_generated_at
      ]
    )
    payload["size"] = clothing_item.size
    payload["image_url"] = clothing_item.display_photo_attachment.attached? ? url_for(clothing_item.display_photo_attachment) : nil
    payload["original_image_url"] = clothing_item.photo.attached? ? url_for(clothing_item.photo) : nil
    payload["cleaned_image_url"] = clothing_item.cleaned_photo.attached? ? url_for(clothing_item.cleaned_photo) : nil
    payload["user"] = user_payload(clothing_item.user, include_items: false) if include_user
    payload
  end

  def outfit_upload_payload(outfit_upload)
    payload = outfit_upload.serializable_hash(
      only: %i[
        id
        user_id
        provider
        vision_model
        error_message
        detected_at
        created_at
        updated_at
      ]
    )
    payload["status"] = outfit_upload.status
    payload["source_photo_url"] = outfit_upload.source_photo.attached? ? url_for(outfit_upload.source_photo) : nil
    payload["detections"] = outfit_upload.outfit_detections.map { |detection| outfit_detection_payload(detection) }
    payload
  end

  def outfit_detection_payload(outfit_detection)
    payload = outfit_detection.serializable_hash(
      only: %i[
        id
        outfit_upload_id
        category
        confidence
        suggested_name
        details
        position
        clean_image_status
        clean_image_error_message
        clean_image_provider
        clean_image_model
        clean_image_generated_at
        created_at
        updated_at
      ]
    )
    payload["bounding_box"] = outfit_detection.preferred_preview_box
    payload["coarse_box"] = outfit_detection.coarse_box
    payload["refined_box"] = outfit_detection.refined_box
    payload["final_box"] = outfit_detection.final_box
    payload["cleaned_image_url"] = outfit_detection.cleaned_photo.attached? ? url_for(outfit_detection.cleaned_photo) : nil
    payload
  end
end
