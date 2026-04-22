class RemoveAvailabilityFromClothingItems < ActiveRecord::Migration[8.1]
  def change
    remove_column :clothing_items, :availability, :boolean
  end
end
