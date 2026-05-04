class OutfitUploadAnalysisJob < ApplicationJob
  queue_as :default

  def perform(outfit_upload_id)
    outfit_upload = OutfitUpload.find_by(id: outfit_upload_id)
    return unless outfit_upload

    outfit_upload.analyze!
  rescue StandardError => error
    Rails.logger.error(
      "OutfitUploadAnalysisJob failed for upload #{outfit_upload_id}: " \
      "#{error.class}: #{error.message}"
    )
  end
end
