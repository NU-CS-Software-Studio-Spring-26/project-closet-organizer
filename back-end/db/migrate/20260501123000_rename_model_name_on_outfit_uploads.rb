class RenameModelNameOnOutfitUploads < ActiveRecord::Migration[8.1]
  def change
    return unless column_exists?(:outfit_uploads, :model_name)
    return if column_exists?(:outfit_uploads, :vision_model)

    rename_column :outfit_uploads, :model_name, :vision_model
  end
end
