# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

User.destroy_all
ClothingItem.destroy_all

user = User.create!(
  username: "demo_user",
  password: "password",
  preferred_style: "casual"
)

sizes = [ :xs, :small, :medium, :large, :xl ]
materials = [ "cotton", "denim", "wool", "linen", "polyester" ]
seasons = [ "summer", "winter", "spring", "fall" ]
styles = [ "casual", "formal", "sport" ]
brands = [ "Nike", "Uniqlo", "Zara", "H&M", "Levis" ]
colors = [ "red", "blue", "black", "white", "green" ]

20.times do |i|
  ClothingItem.create!(
    name: "Item #{i + 1}",
    size: sizes.sample,
    tags: {
      material: materials.sample,
      season: seasons.sample,
      style: styles.sample,
      brand: brands.sample,
      color: colors.sample
    },
    date: Time.now,
    availability: [ true, false ].sample,
    user: user
  )
end

puts "Seeded 20 clothing items"
