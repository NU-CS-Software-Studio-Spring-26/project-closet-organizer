class OutfitDetectionsController < ApplicationController
  before_action :set_outfit_detection

  def generate_clean_image
    temporary_files = []

    source_photo = source_photo_for_cleaning(@outfit_detection, temporary_files)
    unless source_photo
      render json: { error: "This detection does not have a usable crop to clean." }, status: :unprocessable_content
      return
    end

    @outfit_detection.update!(
      clean_image_status: :processing,
      clean_image_error_message: nil
    )

    generated = OpenrouterImageCleaner.call(
      source_photo,
      prompt_context: detection_clean_prompt_context(@outfit_detection)
    )
    generated_tempfile = generated.fetch(:tempfile)
    generated_tempfile.rewind
    temporary_files << generated_tempfile

    @outfit_detection.cleaned_photo.attach(
      io: generated_tempfile,
      filename: generated.fetch(:filename),
      content_type: generated.fetch(:content_type)
    )
    @outfit_detection.update!(
      clean_image_status: :succeeded,
      clean_image_error_message: nil,
      clean_image_provider: generated.fetch(:provider),
      clean_image_model: generated.fetch(:model),
      clean_image_generated_at: Time.current
    )

    render json: outfit_detection_payload(@outfit_detection.reload)
  rescue StandardError => error
    @outfit_detection.update(
      clean_image_status: :failed,
      clean_image_error_message: error.message
    )
    render json: { error: error.message }, status: :unprocessable_content
  ensure
    cleanup_temporary_files(temporary_files)
  end

  private

  def set_outfit_detection
    @outfit_detection = OutfitDetection.find(params[:id])
  end

  def source_photo_for_cleaning(outfit_detection, temporary_files)
    return outfit_detection.cleaned_photo if outfit_detection.cleaned_photo.attached?

    crop_box = outfit_detection.preferred_preview_box
    return nil unless crop_box

    cropped_photo = ClothingItemPhotoCropper.call(
      outfit_detection.outfit_upload.source_photo,
      crop_box
    )
    cropped_tempfile = cropped_photo.fetch(:tempfile)
    cropped_tempfile.rewind
    temporary_files << cropped_tempfile

    Struct.new(:tempfile, :original_filename, :content_type, keyword_init: true).new(
      tempfile: cropped_tempfile,
      original_filename: cropped_photo.fetch(:filename),
      content_type: cropped_photo.fetch(:content_type)
    )
  end

  def detection_clean_prompt_context(outfit_detection)
    {
      name: outfit_detection.suggested_name,
      category: outfit_detection.category,
      color: outfit_detection.details["dominant_color"],
      material: outfit_detection.details["material_guess"],
      style: outfit_detection.details["style_guess"]
    }.compact_blank
  end

  def cleanup_temporary_files(temporary_files)
    Array(temporary_files).each(&:close!)
  end
end
