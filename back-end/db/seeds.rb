require "date"

srand(20260425)

ClothingItem.destroy_all
User.destroy_all

SEASON_MONTHS = {
  spring: [ 3, 4, 5 ],
  summer: [ 6, 7, 8 ],
  fall: [ 9, 10, 11 ],
  winter: [ 12, 1, 2 ],
  all_season: (1..12).to_a
}.freeze

WARDROBE_LIBRARY = {
  smart_casual: [
    [ "Oxford Shirt", "J.Crew", "cotton", "spring", "blue" ],
    [ "Merino Crewneck Sweater", "Uniqlo", "merino_wool", "winter", "charcoal" ],
    [ "Straight-Leg Jeans", "Madewell", "denim", "all_season", "indigo" ],
    [ "Tailored Chinos", "Banana Republic", "twill", "fall", "khaki" ],
    [ "Leather Loafers", "Sam Edelman", "leather", "all_season", "black" ],
    [ "Single-Breasted Blazer", "Theory", "wool_blend", "fall", "navy" ]
  ],
  athleisure: [
    [ "Training Joggers", "Lululemon", "recycled_polyester", "all_season", "black" ],
    [ "Performance Tee", "Nike", "moisture_wicking_jersey", "summer", "heather_gray" ],
    [ "Running Hoodie", "Under Armour", "performance_fleece", "winter", "gray" ],
    [ "Quarter-Zip Pullover", "Vuori", "polyester", "fall", "navy" ],
    [ "Hybrid Shorts", "Ten Thousand", "nylon", "summer", "stone" ],
    [ "Trail Shell Jacket", "Patagonia", "ripstop", "spring", "olive" ]
  ],
  minimal: [
    [ "Rib Tank", "Uniqlo", "cotton", "summer", "black" ],
    [ "Relaxed Trousers", "COS", "twill", "all_season", "taupe" ],
    [ "Linen Button-Down", "Everlane", "linen", "spring", "white" ],
    [ "Slip Skirt", "Aritzia", "satin", "summer", "cream" ],
    [ "Wool Coat", "Mango", "wool", "winter", "camel" ],
    [ "Ankle Boots", "Steve Madden", "suede", "fall", "brown" ]
  ],
  vintage: [
    [ "Band Tee", "Levis", "cotton", "all_season", "washed_black" ],
    [ "High-Rise Mom Jeans", "Levis", "denim", "all_season", "light_blue" ],
    [ "Corduroy Jacket", "Free People", "corduroy", "fall", "rust" ],
    [ "Pleated Midi Dress", "Reformation", "viscose", "summer", "sage" ],
    [ "Western Boots", "Frye", "leather", "fall", "cognac" ],
    [ "Wool Beret", "Anthropologie", "wool", "winter", "burgundy" ]
  ],
  polished: [
    [ "Silk Blouse", "Sezane", "silk", "spring", "ivory" ],
    [ "Pleated Trousers", "Aritzia", "crepe", "all_season", "black" ],
    [ "Cashmere Cardigan", "Naadam", "cashmere", "winter", "oatmeal" ],
    [ "Pencil Skirt", "Theory", "wool_blend", "fall", "charcoal" ],
    [ "Block Heel Pumps", "Cole Haan", "leather", "all_season", "black" ],
    [ "Trench Coat", "Everlane", "cotton_blend", "spring", "sand" ]
  ]
}.freeze

ADJECTIVES = %w[
  Classic Relaxed Textured Everyday Soft Structured Lightweight Refined Heritage
  Clean Tailored Cozy Cropped Oversized Slim Breathable Studio Weekend
].freeze

SIZE_PROFILES = {
  slim: %i[xs small medium medium medium],
  standard: %i[small medium medium large],
  relaxed: %i[medium large large xl]
}.freeze

seed_users = [
  {
    username: "alexis_ward",
    email: "alexis.ward@example.com",
    provider: "google_oauth2",
    uid: "seed-alexis-ward",
    password: "password",
    preferred_style: "smart_casual",
    size_profile: :standard,
    item_count: 20
  },
  {
    username: "annabel_goldman",
    email: "annabel.goldman@example.com",
    provider: "google_oauth2",
    uid: "seed-annabel-goldman",
    password: "password",
    preferred_style: "polished",
    size_profile: :standard,
    item_count: 0
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

def random_purchase_date(season_name)
  season_key = season_name.to_sym
  month = SEASON_MONTHS.fetch(season_key).sample
  year = month > Date.today.month ? Date.today.year - 1 : Date.today.year
  day = rand(1..27)
  Date.new(year, month, day)
end

def build_item_name(base_name)
  "#{ADJECTIVES.sample} #{base_name}"
end

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

  if user_data[:items].present?
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
    next
  end

  style_pool = WARDROBE_LIBRARY.fetch(user.preferred_style.to_sym)
  size_pool = SIZE_PROFILES.fetch(user_data.fetch(:size_profile, :standard))

  user_data.fetch(:item_count, 0).times do
    base_name, brand, material, season, color = style_pool.sample

    ClothingItem.create!(
      name: build_item_name(base_name),
      size: size_pool.sample,
      date: random_purchase_date(season),
      user: user,
      tags: {
        material: material,
        season: season,
        style: user.preferred_style,
        brand: brand,
        color: color
      }
    )
    created_items_count += 1
  end
end

puts "Seeded #{User.count} users and #{created_items_count} clothing items"
