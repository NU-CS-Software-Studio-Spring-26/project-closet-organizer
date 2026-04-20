class CreateClothingItems < ActiveRecord::Migration[8.1]
  def change
    create_table :clothing_items do |t|
      t.string :name
      t.integer :size
      t.json :tags
      t.datetime :date
      t.boolean :availability

      t.timestamps
    end
  end
end
