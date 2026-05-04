class RenameModelNameOnOutfitUploads < ActiveRecord::Migration[8.1]
  def change
    rename_column :outfit_uploads, :model_name, :vision_model
  end
end
