class AddStagedCropFieldsToOutfitDetections < ActiveRecord::Migration[8.1]
  def change
    add_column :outfit_detections, :coarse_bbox_x, :float
    add_column :outfit_detections, :coarse_bbox_y, :float
    add_column :outfit_detections, :coarse_bbox_width, :float
    add_column :outfit_detections, :coarse_bbox_height, :float

    add_column :outfit_detections, :refined_bbox_x, :float
    add_column :outfit_detections, :refined_bbox_y, :float
    add_column :outfit_detections, :refined_bbox_width, :float
    add_column :outfit_detections, :refined_bbox_height, :float

    add_column :outfit_detections, :final_bbox_x, :float
    add_column :outfit_detections, :final_bbox_y, :float
    add_column :outfit_detections, :final_bbox_width, :float
    add_column :outfit_detections, :final_bbox_height, :float

    add_column :outfit_detections, :crop_status, :integer, null: false, default: 0
    add_column :outfit_detections, :crop_confidence, :float
    add_column :outfit_detections, :crop_quality_score, :float
    add_column :outfit_detections, :crop_notes, :text
    add_column :outfit_detections, :crop_attempts, :integer, null: false, default: 0

    reversible do |direction|
      direction.up do
        execute <<~SQL
          UPDATE outfit_detections
          SET
            coarse_bbox_x = bbox_x,
            coarse_bbox_y = bbox_y,
            coarse_bbox_width = bbox_width,
            coarse_bbox_height = bbox_height
        SQL
      end
    end
  end
end
