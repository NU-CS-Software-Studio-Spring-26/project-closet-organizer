class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :username
      t.string :password_digest
      t.string :preferred_style

      t.timestamps
    end
  end
end
