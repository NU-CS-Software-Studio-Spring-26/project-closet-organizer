class CreateOutfitUploads < ActiveRecord::Migration[8.1]
  def change
    create_table :outfit_uploads do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :status, null: false, default: 0
      t.string :provider
      t.string :vision_model
      t.text :error_message
      t.json :raw_response
      t.datetime :detected_at

      t.timestamps
    end
  end
end
