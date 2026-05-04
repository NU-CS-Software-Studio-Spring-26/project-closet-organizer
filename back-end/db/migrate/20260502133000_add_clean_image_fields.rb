class AddCleanImageFields < ActiveRecord::Migration[8.0]
  def change
    add_column :clothing_items, :clean_image_status, :integer, null: false, default: 0
    add_column :clothing_items, :clean_image_error_message, :text
    add_column :clothing_items, :clean_image_provider, :string
    add_column :clothing_items, :clean_image_model, :string
    add_column :clothing_items, :clean_image_generated_at, :datetime

    add_column :outfit_detections, :clean_image_status, :integer, null: false, default: 0
    add_column :outfit_detections, :clean_image_error_message, :text
    add_column :outfit_detections, :clean_image_provider, :string
    add_column :outfit_detections, :clean_image_model, :string
    add_column :outfit_detections, :clean_image_generated_at, :datetime
  end
end
