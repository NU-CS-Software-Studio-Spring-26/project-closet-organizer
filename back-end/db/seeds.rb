require "date"

srand(20260425)

ClothingItem.destroy_all
User.destroy_all

SEASON_MONTHS = {
  spring: [3, 4, 5],
  summer: [6, 7, 8],
  fall: [9, 10, 11],
  winter: [12, 1, 2],
  all_season: (1..12).to_a
}.freeze

WARDROBE_LIBRARY = {
  smart_casual: [
    ["Oxford Shirt", "J.Crew", "cotton", "spring", "blue"],
    ["Merino Crewneck Sweater", "Uniqlo", "merino_wool", "winter", "charcoal"],
    ["Straight-Leg Jeans", "Madewell", "denim", "all_season", "indigo"],
    ["Tailored Chinos", "Banana Republic", "twill", "fall", "khaki"],
    ["Leather Loafers", "Sam Edelman", "leather", "all_season", "black"],
    ["Single-Breasted Blazer", "Theory", "wool_blend", "fall", "navy"]
  ],
  athleisure: [
    ["Training Joggers", "Lululemon", "recycled_polyester", "all_season", "black"],
    ["Performance Tee", "Nike", "moisture_wicking_jersey", "summer", "heather_gray"],
    ["Running Hoodie", "Under Armour", "performance_fleece", "winter", "gray"],
    ["Quarter-Zip Pullover", "Vuori", "polyester", "fall", "navy"],
    ["Hybrid Shorts", "Ten Thousand", "nylon", "summer", "stone"],
    ["Trail Shell Jacket", "Patagonia", "ripstop", "spring", "olive"]
  ],
  minimal: [
    ["Rib Tank", "Uniqlo", "cotton", "summer", "black"],
    ["Relaxed Trousers", "COS", "twill", "all_season", "taupe"],
    ["Linen Button-Down", "Everlane", "linen", "spring", "white"],
    ["Slip Skirt", "Aritzia", "satin", "summer", "cream"],
    ["Wool Coat", "Mango", "wool", "winter", "camel"],
    ["Ankle Boots", "Steve Madden", "suede", "fall", "brown"]
  ],
  vintage: [
    ["Band Tee", "Levis", "cotton", "all_season", "washed_black"],
    ["High-Rise Mom Jeans", "Levis", "denim", "all_season", "light_blue"],
    ["Corduroy Jacket", "Free People", "corduroy", "fall", "rust"],
    ["Pleated Midi Dress", "Reformation", "viscose", "summer", "sage"],
    ["Western Boots", "Frye", "leather", "fall", "cognac"],
    ["Wool Beret", "Anthropologie", "wool", "winter", "burgundy"]
  ],
  polished: [
    ["Silk Blouse", "Sezane", "silk", "spring", "ivory"],
    ["Pleated Trousers", "Aritzia", "crepe", "all_season", "black"],
    ["Cashmere Cardigan", "Naadam", "cashmere", "winter", "oatmeal"],
    ["Pencil Skirt", "Theory", "wool_blend", "fall", "charcoal"],
    ["Block Heel Pumps", "Cole Haan", "leather", "all_season", "black"],
    ["Trench Coat", "Everlane", "cotton_blend", "spring", "sand"]
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
    password: "password",
    preferred_style: "smart_casual",
    size_profile: :standard,
    item_count: 20
  },
  {
    username: "annabel_goldman",
    password: "password",
    preferred_style: "polished",
    size_profile: :standard,
    item_count: 0
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
    password: user_data[:password],
    preferred_style: user_data[:preferred_style]
  )

  style_pool = WARDROBE_LIBRARY.fetch(user.preferred_style.to_sym)
  size_pool = SIZE_PROFILES.fetch(user_data[:size_profile])

  user_data[:item_count].times do
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
