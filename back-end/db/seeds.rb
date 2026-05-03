# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

ClothingItem.destroy_all
User.destroy_all

seed_users = [
  {
    username: "alexis_ward",
    email: "alexis.ward@example.com",
    provider: "google_oauth2",
    uid: "seed-alexis-ward",
    password: "password",
    preferred_style: "smart_casual",
    items: [
      { name: "Ivory Silk Blouse", size: :small, date: Date.new(2026, 3, 5), material: "silk", season: "spring", style: "smart_casual", brand: "Sezane", color: "ivory" },
      { name: "Straight-Leg Dark Wash Jeans", size: :medium, date: Date.new(2025, 11, 12), material: "denim", season: "all_season", style: "casual", brand: "Madewell", color: "indigo" },
      { name: "Camel Wool Coat", size: :medium, date: Date.new(2025, 12, 1), material: "wool", season: "winter", style: "polished", brand: "Everlane", color: "camel" },
      { name: "Black Loafers", size: :small, date: Date.new(2025, 10, 20), material: "leather", season: "fall", style: "polished", brand: "Sam Edelman", color: "black" },
      { name: "Striped Oxford Shirt", size: :medium, date: Date.new(2026, 2, 14), material: "cotton", season: "spring", style: "smart_casual", brand: "J.Crew", color: "blue" },
      { name: "Taupe Wide-Leg Trousers", size: :medium, date: Date.new(2025, 9, 8), material: "linen_blend", season: "fall", style: "workwear", brand: "COS", color: "taupe" },
      { name: "Golden Knit Cardigan", size: :medium, date: Date.new(2026, 1, 17), material: "cashmere_blend", season: "winter", style: "layered", brand: "Banana Republic", color: "mustard" },
      { name: "White Leather Sneakers", size: :medium, date: Date.new(2026, 4, 10), material: "leather", season: "spring", style: "casual", brand: "Veja", color: "white" }
    ]
  },
  {
    username: "jordan_lee",
    email: "jordan.lee@example.com",
    provider: "google_oauth2",
    uid: "seed-jordan-lee",
    password: "password",
    preferred_style: "athleisure",
    items: [
      { name: "Heather Gray Running Hoodie", size: :large, date: Date.new(2026, 2, 2), material: "performance_fleece", season: "winter", style: "athleisure", brand: "Nike", color: "gray" },
      { name: "Black Training Joggers", size: :large, date: Date.new(2026, 1, 24), material: "recycled_polyester", season: "winter", style: "athleisure", brand: "Lululemon", color: "black" },
      { name: "Forest Performance Tee", size: :medium, date: Date.new(2026, 3, 22), material: "moisture_wicking_jersey", season: "spring", style: "sport", brand: "Under Armour", color: "green" },
      { name: "Navy Quarter-Zip Pullover", size: :large, date: Date.new(2025, 11, 3), material: "polyester", season: "fall", style: "athleisure", brand: "Vuori", color: "navy" },
      { name: "Stone Utility Shorts", size: :medium, date: Date.new(2025, 8, 19), material: "nylon", season: "summer", style: "casual", brand: "Ten Thousand", color: "stone" },
      { name: "Trail Running Vest", size: :medium, date: Date.new(2025, 10, 7), material: "ripstop", season: "fall", style: "outdoor", brand: "Patagonia", color: "black" },
      { name: "White Court Sneakers", size: :large, date: Date.new(2025, 7, 14), material: "leather", season: "summer", style: "sport", brand: "Adidas", color: "white" },
      { name: "Slate Rain Shell Jacket", size: :large, date: Date.new(2026, 4, 12), material: "nylon", season: "spring", style: "outdoor", brand: "Arcteryx", color: "slate" }
    ]
  },
  {
    username: "maya_patel",
    email: "maya.patel@example.com",
    provider: "google_oauth2",
    uid: "seed-maya-patel",
    password: "password",
    preferred_style: "minimal",
    items: [
      { name: "Oat Linen Blazer", size: :small, date: Date.new(2026, 3, 18), material: "linen", season: "spring", style: "minimal", brand: "Mango", color: "oat" },
      { name: "Black Rib Tank", size: :xs, date: Date.new(2026, 4, 4), material: "cotton", season: "spring", style: "minimal", brand: "Uniqlo", color: "black" },
      { name: "Cream Slip Skirt", size: :small, date: Date.new(2025, 6, 9), material: "satin", season: "summer", style: "dressy", brand: "Zara", color: "cream" },
      { name: "Charcoal Merino Sweater", size: :small, date: Date.new(2025, 12, 11), material: "merino_wool", season: "winter", style: "minimal", brand: "COS", color: "charcoal" },
      { name: "Brown Ankle Boots", size: :small, date: Date.new(2025, 10, 1), material: "suede", season: "fall", style: "classic", brand: "Steve Madden", color: "brown" },
      { name: "Light Wash Denim Jacket", size: :medium, date: Date.new(2025, 9, 21), material: "denim", season: "fall", style: "casual", brand: "Levis", color: "light_blue" },
      { name: "Soft White T-Shirt", size: :small, date: Date.new(2026, 2, 27), material: "cotton", season: "all_season", style: "minimal", brand: "Everlane", color: "white" },
      { name: "Sand Pleated Trousers", size: :small, date: Date.new(2025, 11, 29), material: "twill", season: "winter", style: "workwear", brand: "Aritzia", color: "sand" }
    ]
  }
]

created_items_count = 0

seed_users.each do |user_data|
  user = User.create!(
    username: user_data[:username],
    email: user_data[:email],
    provider: user_data[:provider],
    uid: user_data[:uid],
    password: user_data[:password],
    preferred_style: user_data[:preferred_style]
  )

  user_data[:items].each do |item_data|
    ClothingItem.create!(
      name: item_data[:name],
      size: item_data[:size],
      date: item_data[:date],
      user: user,
      tags: item_data.slice(:material, :season, :style, :brand, :color)
    )
    created_items_count += 1
  end
end

puts "Seeded #{User.count} users and #{created_items_count} clothing items"
