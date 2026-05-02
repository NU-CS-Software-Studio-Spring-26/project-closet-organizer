class OutfitUploadsController < ApplicationController
  before_action :set_outfit_upload, only: :show

  def create
    @outfit_upload = OutfitUpload.new(outfit_upload_params)

    if @outfit_upload.save
      begin
        @outfit_upload.analyze!
      rescue StandardError
        # The upload record preserves the failure state and error message for the UI.
      end

      render json: outfit_upload_payload(@outfit_upload.reload), status: :created
    else
      render_validation_errors(@outfit_upload)
    end
  end

  def show
    render json: outfit_upload_payload(@outfit_upload)
  end

  private

  def set_outfit_upload
    @outfit_upload = OutfitUpload.find(params[:id])
  end

  def outfit_upload_params
    params.require(:outfit_upload).permit(:user_id, :source_photo)
  end
end
