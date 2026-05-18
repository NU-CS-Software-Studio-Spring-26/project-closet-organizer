class AddPurchaseCurrencyToClothingItems < ActiveRecord::Migration[8.1]
  def change
    add_column :clothing_items, :purchase_currency, :string, limit: 3
  end
end
