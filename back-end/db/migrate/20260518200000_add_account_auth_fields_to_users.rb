class AddAccountAuthFieldsToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :accepted_terms_at, :datetime unless column_exists?(:users, :accepted_terms_at)

    if index_exists?(:users, :email, name: "index_users_on_email")
      remove_index :users, name: "index_users_on_email"
    end

    add_index :users, :email, unique: true, where: "email IS NOT NULL AND email != ''",
                              name: "index_users_on_email"
  end
end
