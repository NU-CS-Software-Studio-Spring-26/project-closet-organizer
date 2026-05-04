class CreateOutfits < ActiveRecord::Migration[8.1]
  def change
    create_table :outfits do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name, null: false
      t.json :tags
      t.text :notes

      t.timestamps
    end
  end
end
