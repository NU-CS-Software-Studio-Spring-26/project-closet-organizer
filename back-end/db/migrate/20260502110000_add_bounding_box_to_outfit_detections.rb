class AddBoundingBoxToOutfitDetections < ActiveRecord::Migration[8.1]
  def change
    add_column :outfit_detections, :bbox_x, :float
    add_column :outfit_detections, :bbox_y, :float
    add_column :outfit_detections, :bbox_width, :float
    add_column :outfit_detections, :bbox_height, :float
  end
end
