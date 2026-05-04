class CreateOutfitDetections < ActiveRecord::Migration[8.1]
  def change
    create_table :outfit_detections do |t|
      t.references :outfit_upload, null: false, foreign_key: true
      t.integer :position, null: false, default: 0
      t.string :category, null: false
      t.float :confidence
      t.string :suggested_name
      t.json :details

      t.timestamps
    end
  end
end
