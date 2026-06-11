import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { NIGERIA_STATES_LGAS } from '../lib/data/nigeria-locations';

// Manually load env variables if not set
if (!process.env.DATABASE_URL) {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      for (const line of envContent.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const firstEqual = trimmed.indexOf('=');
          if (firstEqual !== -1) {
            const key = trimmed.substring(0, firstEqual).trim();
            let val = trimmed.substring(firstEqual + 1).trim();
            // Remove quotes if present
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.substring(1, val.length - 1);
            }
            process.env[key] = val;
          }
        }
      }
    }
  } catch (err) {
    console.error('Failed to manually read .env file:', err);
  }
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('🌱 Seeding categories and products...');

  // ── 1. Categories ────────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'food-grains' },
      update: {},
      create: { name: 'Food & Grains', slug: 'food-grains' },
    }),
    prisma.category.upsert({
      where: { slug: 'cooking-essentials' },
      update: {},
      create: { name: 'Cooking Essentials', slug: 'cooking-essentials' },
    }),
    prisma.category.upsert({
      where: { slug: 'energy-fuel' },
      update: {},
      create: { name: 'Energy & Fuel', slug: 'energy-fuel' },
    }),
    prisma.category.upsert({
      where: { slug: 'building-materials' },
      update: {},
      create: { name: 'Building Materials', slug: 'building-materials' },
    }),
    prisma.category.upsert({
      where: { slug: 'household-goods' },
      update: {},
      create: { name: 'Household Goods', slug: 'household-goods' },
    }),
    prisma.category.upsert({
      where: { slug: 'livestock-poultry' },
      update: {},
      create: { name: 'Livestock & Poultry', slug: 'livestock-poultry' },
    }),
    prisma.category.upsert({
      where: { slug: 'beverages' },
      update: {},
      create: { name: 'Beverages', slug: 'beverages' },
    }),
    prisma.category.upsert({
      where: { slug: 'vegetables-produce' },
      update: {},
      create: { name: 'Vegetables & Produce', slug: 'vegetables-produce' },
    }),
  ]);

  // Extra categories for new products
  const [
    snacks,
    personalCare,
    healthPharmacy,
    electronicAcc,
    stationery,
  ] = await Promise.all([
    prisma.category.upsert({ where: { slug: 'snacks-confectionery' }, update: {}, create: { name: 'Snacks & Confectionery', slug: 'snacks-confectionery' } }),
    prisma.category.upsert({ where: { slug: 'personal-care' }, update: {}, create: { name: 'Personal Care', slug: 'personal-care' } }),
    prisma.category.upsert({ where: { slug: 'health-pharmacy' }, update: {}, create: { name: 'Health & Pharmacy', slug: 'health-pharmacy' } }),
    prisma.category.upsert({ where: { slug: 'electronics-accessories' }, update: {}, create: { name: 'Electronics & Accessories', slug: 'electronics-accessories' } }),
    prisma.category.upsert({ where: { slug: 'stationery-office' }, update: {}, create: { name: 'Stationery & Office', slug: 'stationery-office' } }),
  ]);

  const [
    foodGrains,
    cookingEssentials,
    energyFuel,
    buildingMaterials,
    householdGoods,
    livestockPoultry,
    beverages,
    vegetablesProduce,
  ] = categories;

  console.log(`✅ ${categories.length + 5} categories upserted`);

  // ── 2. Products ───────────────────────────────────────────────────────────────
  const products = [
    // Food & Grains
    { name: 'White Rice (Local)', slug: 'white-rice-local', categoryId: foodGrains.id, unit: '50kg bag' },
    { name: 'White Rice (Imported)', slug: 'white-rice-imported', categoryId: foodGrains.id, unit: '50kg bag' },
    { name: 'Semovita', slug: 'semovita', categoryId: foodGrains.id, unit: '1.5kg pack' },
    { name: 'Garri (White)', slug: 'garri-white', categoryId: foodGrains.id, unit: 'paint bucket (~10L)' },
    { name: 'Garri (Yellow)', slug: 'garri-yellow', categoryId: foodGrains.id, unit: 'paint bucket (~10L)' },
    { name: 'Beans (Brown Honey)', slug: 'beans-brown-honey', categoryId: foodGrains.id, unit: '1 mudu (~2kg)' },
    { name: 'Beans (Black-eyed)', slug: 'beans-black-eyed', categoryId: foodGrains.id, unit: '1 mudu (~2kg)' },
    { name: 'Maize (White Corn)', slug: 'maize-white-corn', categoryId: foodGrains.id, unit: '50kg bag' },
    { name: 'Wheat Flour', slug: 'wheat-flour', categoryId: foodGrains.id, unit: '50kg bag' },
    { name: 'Spaghetti / Pasta', slug: 'spaghetti-pasta', categoryId: foodGrains.id, unit: '500g pack' },
    { name: 'Noodles (Indomie)', slug: 'noodles-indomie', categoryId: foodGrains.id, unit: 'carton (40 packs)' },
    { name: 'Groundnut (Peanuts)', slug: 'groundnut-peanuts', categoryId: foodGrains.id, unit: '1 mudu (~2kg)' },
    { name: 'Sorghum (Guinea Corn)', slug: 'sorghum-guinea-corn', categoryId: foodGrains.id, unit: '50kg bag' },
    { name: 'Millet', slug: 'millet', categoryId: foodGrains.id, unit: '50kg bag' },
    { name: 'Yam Flour (Poundo)', slug: 'yam-flour-poundo', categoryId: foodGrains.id, unit: '1.5kg pack' },

    // Cooking Essentials
    { name: 'Palm Oil', slug: 'palm-oil', categoryId: cookingEssentials.id, unit: '25 litre keg' },
    { name: 'Groundnut Oil', slug: 'groundnut-oil', categoryId: cookingEssentials.id, unit: '5 litre bottle' },
    { name: 'Vegetable Oil', slug: 'vegetable-oil', categoryId: cookingEssentials.id, unit: '5 litre bottle' },
    { name: 'Table Salt', slug: 'table-salt', categoryId: cookingEssentials.id, unit: '1kg pack' },
    { name: 'Seasoning Cubes (Maggi)', slug: 'seasoning-cubes-maggi', categoryId: cookingEssentials.id, unit: 'pack of 50' },
    { name: 'Tomato Paste (Tin)', slug: 'tomato-paste-tin', categoryId: cookingEssentials.id, unit: '400g tin' },
    { name: 'Dried Pepper (Tatashe)', slug: 'dried-pepper-tatashe', categoryId: cookingEssentials.id, unit: '1kg' },
    { name: 'Crayfish (Ground)', slug: 'crayfish-ground', categoryId: cookingEssentials.id, unit: '250g cup' },
    { name: 'Stockfish', slug: 'stockfish', categoryId: cookingEssentials.id, unit: '1 piece (avg 500g)' },
    { name: 'Dried Catfish (Eja Aro)', slug: 'dried-catfish', categoryId: cookingEssentials.id, unit: '1 piece' },

    // Energy & Fuel
    { name: 'Petrol (PMS)', slug: 'petrol-pms', categoryId: energyFuel.id, unit: '1 litre' },
    { name: 'Diesel (AGO)', slug: 'diesel-ago', categoryId: energyFuel.id, unit: '1 litre' },
    { name: 'Kerosene (DPK)', slug: 'kerosene-dpk', categoryId: energyFuel.id, unit: '1 litre' },
    { name: 'Cooking Gas (LPG)', slug: 'cooking-gas-lpg', categoryId: energyFuel.id, unit: '12.5kg cylinder' },
    { name: 'Cooking Gas Refill (5kg)', slug: 'cooking-gas-refill-5kg', categoryId: energyFuel.id, unit: '5kg refill' },
    { name: 'Charcoal', slug: 'charcoal', categoryId: energyFuel.id, unit: '25kg bag' },
    { name: 'Firewood', slug: 'firewood', categoryId: energyFuel.id, unit: 'bundle' },

    // Building Materials
    { name: 'Cement (Dangote)', slug: 'cement-dangote', categoryId: buildingMaterials.id, unit: '50kg bag' },
    { name: 'Cement (BUA)', slug: 'cement-bua', categoryId: buildingMaterials.id, unit: '50kg bag' },
    { name: 'Iron Rod (12mm)', slug: 'iron-rod-12mm', categoryId: buildingMaterials.id, unit: '1 length (12m)' },
    { name: 'Iron Rod (10mm)', slug: 'iron-rod-10mm', categoryId: buildingMaterials.id, unit: '1 length (12m)' },
    { name: 'Sharp Sand', slug: 'sharp-sand', categoryId: buildingMaterials.id, unit: '1 tipper load' },
    { name: 'Granite (Gravel)', slug: 'granite-gravel', categoryId: buildingMaterials.id, unit: '1 tipper load' },
    { name: 'Blocks (9 inches)', slug: 'blocks-9-inches', categoryId: buildingMaterials.id, unit: 'per block' },
    { name: 'Blocks (6 inches)', slug: 'blocks-6-inches', categoryId: buildingMaterials.id, unit: 'per block' },
    { name: 'Zinc Roofing Sheet', slug: 'zinc-roofing-sheet', categoryId: buildingMaterials.id, unit: 'per sheet (10ft)' },
    { name: 'Wood Plank (Hardwood)', slug: 'wood-plank-hardwood', categoryId: buildingMaterials.id, unit: '12ft piece' },
    { name: 'PVC Pipe (1/2 inch)', slug: 'pvc-pipe-half-inch', categoryId: buildingMaterials.id, unit: '6m length' },
    { name: 'Paint (Emulsion, 4L)', slug: 'paint-emulsion-4l', categoryId: buildingMaterials.id, unit: '4 litre tin' },

    // Household Goods
    { name: 'Soap (Key Soap)', slug: 'soap-key-soap', categoryId: householdGoods.id, unit: 'per bar' },
    { name: 'Detergent (Omo)', slug: 'detergent-omo', categoryId: householdGoods.id, unit: '1kg pack' },
    { name: 'Toothpaste', slug: 'toothpaste', categoryId: householdGoods.id, unit: 'per tube (75ml)' },
    { name: 'Sanitary Pad', slug: 'sanitary-pad', categoryId: householdGoods.id, unit: 'pack of 8' },
    { name: 'Mosquito Coil', slug: 'mosquito-coil', categoryId: householdGoods.id, unit: 'pack of 10' },
    { name: 'Candle', slug: 'candle', categoryId: householdGoods.id, unit: 'pack of 6' },
    { name: 'Tissue Paper', slug: 'tissue-paper', categoryId: householdGoods.id, unit: 'pack of 10 rolls' },
    { name: 'Matches', slug: 'matches', categoryId: householdGoods.id, unit: 'pack of 10 boxes' },

    // Livestock & Poultry
    { name: 'Broiler Chicken (Live)', slug: 'broiler-chicken-live', categoryId: livestockPoultry.id, unit: 'per bird (~2kg)' },
    { name: 'Broiler Chicken (Dressed)', slug: 'broiler-chicken-dressed', categoryId: livestockPoultry.id, unit: 'per kg' },
    { name: 'Goat (Live)', slug: 'goat-live', categoryId: livestockPoultry.id, unit: 'per animal' },
    { name: 'Beef (Cow Meat)', slug: 'beef-cow-meat', categoryId: livestockPoultry.id, unit: 'per kg' },
    { name: 'Eggs', slug: 'eggs', categoryId: livestockPoultry.id, unit: 'crate of 30' },
    { name: 'Fresh Fish (Tilapia)', slug: 'fresh-fish-tilapia', categoryId: livestockPoultry.id, unit: 'per kg' },
    { name: 'Fresh Fish (Catfish)', slug: 'fresh-fish-catfish', categoryId: livestockPoultry.id, unit: 'per kg' },

    // Beverages
    { name: 'Bottled Water (75cl)', slug: 'bottled-water-75cl', categoryId: beverages.id, unit: 'per bottle' },
    { name: 'Sachet Water ("Pure Water")', slug: 'sachet-water', categoryId: beverages.id, unit: 'bag of 20' },
    { name: 'Malt Drink (Malta Guinness)', slug: 'malt-drink-malta', categoryId: beverages.id, unit: 'per 33cl bottle' },
    { name: 'Soft Drink (Coca-Cola 50cl)', slug: 'soft-drink-coca-cola-50cl', categoryId: beverages.id, unit: 'per 50cl bottle' },
    { name: 'Tea (Lipton)', slug: 'tea-lipton', categoryId: beverages.id, unit: 'pack of 25 bags' },
    { name: 'Powdered Milk (Tin)', slug: 'powdered-milk-tin', categoryId: beverages.id, unit: '400g tin' },
    { name: 'Sugar (White)', slug: 'sugar-white', categoryId: beverages.id, unit: '1kg pack' },

    // Vegetables & Produce
    { name: 'Tomatoes (Fresh)', slug: 'tomatoes-fresh', categoryId: vegetablesProduce.id, unit: '1 basket (~3kg)' },
    { name: 'Onions', slug: 'onions', categoryId: vegetablesProduce.id, unit: '1 mudu (~1.5kg)' },
    { name: 'Scotch Bonnet Pepper', slug: 'scotch-bonnet-pepper', categoryId: vegetablesProduce.id, unit: '1 mudu' },
    { name: 'Yam (Tuber)', slug: 'yam-tuber', categoryId: vegetablesProduce.id, unit: 'per tuber' },
    { name: 'Cassava (Fresh)', slug: 'cassava-fresh', categoryId: vegetablesProduce.id, unit: 'per kg' },
    { name: 'Sweet Potato', slug: 'sweet-potato', categoryId: vegetablesProduce.id, unit: 'per kg' },
    { name: 'Plantain', slug: 'plantain', categoryId: vegetablesProduce.id, unit: 'per finger' },
    { name: 'Banana', slug: 'banana', categoryId: vegetablesProduce.id, unit: 'bunch' },
    { name: 'Spinach (Efo Tete)', slug: 'spinach-efo-tete', categoryId: vegetablesProduce.id, unit: 'bunch' },
    { name: 'Ugwu (Fluted Pumpkin)', slug: 'ugwu-pumpkin', categoryId: vegetablesProduce.id, unit: 'bunch' },
    { name: 'Garden Egg', slug: 'garden-egg', categoryId: vegetablesProduce.id, unit: 'bowl' },
    { name: 'Okra (Fresh)', slug: 'okra-fresh', categoryId: vegetablesProduce.id, unit: '1 mudu' },
    { name: 'Cucumber', slug: 'cucumber', categoryId: vegetablesProduce.id, unit: 'per piece' },
    { name: 'Carrot', slug: 'carrot', categoryId: vegetablesProduce.id, unit: 'per kg' },
    { name: 'Waterleaf (Gbure)', slug: 'waterleaf-gbure', categoryId: vegetablesProduce.id, unit: 'bunch' },
    { name: 'Bitter Leaf', slug: 'bitter-leaf', categoryId: vegetablesProduce.id, unit: 'bunch' },
    { name: 'Pawpaw (Papaya)', slug: 'pawpaw-papaya', categoryId: vegetablesProduce.id, unit: 'per fruit' },
    { name: 'Pineapple', slug: 'pineapple', categoryId: vegetablesProduce.id, unit: 'per fruit' },
    { name: 'Mango', slug: 'mango', categoryId: vegetablesProduce.id, unit: 'per fruit' },
    { name: 'Orange', slug: 'orange', categoryId: vegetablesProduce.id, unit: 'per fruit' },
    { name: 'Avocado (Pear)', slug: 'avocado-pear', categoryId: vegetablesProduce.id, unit: 'per fruit' },
    { name: 'Watermelon', slug: 'watermelon', categoryId: vegetablesProduce.id, unit: 'per fruit' },
    { name: 'Coconut', slug: 'coconut', categoryId: vegetablesProduce.id, unit: 'per nut' },

    // More Beverages
    { name: 'Fanta Orange (35cl)', slug: 'fanta-orange-35cl', categoryId: beverages.id, unit: 'per bottle' },
    { name: 'Sprite (35cl)', slug: 'sprite-35cl', categoryId: beverages.id, unit: 'per bottle' },
    { name: 'Pepsi (35cl)', slug: 'pepsi-35cl', categoryId: beverages.id, unit: 'per bottle' },
    { name: '7Up (35cl)', slug: '7up-35cl', categoryId: beverages.id, unit: 'per bottle' },
    { name: 'Mirinda (35cl)', slug: 'mirinda-35cl', categoryId: beverages.id, unit: 'per bottle' },
    { name: 'Ribena (30cl)', slug: 'ribena-30cl', categoryId: beverages.id, unit: 'per bottle' },
    { name: 'Lucozade Boost (330ml)', slug: 'lucozade-boost-330ml', categoryId: beverages.id, unit: 'per bottle' },
    { name: 'Bigi Cola (60cl)', slug: 'bigi-cola-60cl', categoryId: beverages.id, unit: 'per bottle' },
    { name: 'Bigi Apple (60cl)', slug: 'bigi-apple-60cl', categoryId: beverages.id, unit: 'per bottle' },
    { name: 'Five Alive (50cl)', slug: 'five-alive-50cl', categoryId: beverages.id, unit: 'per bottle' },
    { name: 'Chi Exotic Juice (50cl)', slug: 'chi-exotic-juice-50cl', categoryId: beverages.id, unit: 'per bottle' },
    { name: 'Eva Water (75cl)', slug: 'eva-water-75cl', categoryId: beverages.id, unit: 'per bottle' },
    { name: 'Swan Water (75cl)', slug: 'swan-water-75cl', categoryId: beverages.id, unit: 'per bottle' },
    { name: 'Ragolis Water (75cl)', slug: 'ragolis-water-75cl', categoryId: beverages.id, unit: 'per bottle' },
    { name: 'Orijin Bitters (33cl)', slug: 'orijin-bitters-33cl', categoryId: beverages.id, unit: 'per can' },
    { name: 'Guinness Stout (60cl)', slug: 'guinness-stout-60cl', categoryId: beverages.id, unit: 'per bottle' },
    { name: 'Star Lager (60cl)', slug: 'star-lager-60cl', categoryId: beverages.id, unit: 'per bottle' },
    { name: 'Heineken (60cl)', slug: 'heineken-60cl', categoryId: beverages.id, unit: 'per bottle' },
    { name: 'Trophy Lager (60cl)', slug: 'trophy-lager-60cl', categoryId: beverages.id, unit: 'per bottle' },
    { name: 'Goldberg Lager (60cl)', slug: 'goldberg-lager-60cl', categoryId: beverages.id, unit: 'per bottle' },
    { name: 'Peak Milk (Tin 400g)', slug: 'peak-milk-tin-400g', categoryId: beverages.id, unit: '400g tin' },
    { name: 'Dano Milk Powder (360g)', slug: 'dano-milk-powder-360g', categoryId: beverages.id, unit: '360g sachet' },
    { name: 'Milo (400g)', slug: 'milo-400g', categoryId: beverages.id, unit: '400g tin' },
    { name: 'Ovaltine (400g)', slug: 'ovaltine-400g', categoryId: beverages.id, unit: '400g tin' },
    { name: 'Bournvita (500g)', slug: 'bournvita-500g', categoryId: beverages.id, unit: '500g jar' },
    { name: 'Coffee (Nescafe 3-in-1)', slug: 'nescafe-3in1', categoryId: beverages.id, unit: 'per sachet' },
    { name: 'Zobo Drink (Local)', slug: 'zobo-drink-local', categoryId: beverages.id, unit: 'per bottle (50cl)' },
    { name: 'Kunu (Drink)', slug: 'kunu-drink', categoryId: beverages.id, unit: 'per cup' },
    { name: 'Coconut Water', slug: 'coconut-water', categoryId: beverages.id, unit: 'per nut' },
    { name: 'Yoghurt (Fan Yoghurt)', slug: 'yoghurt-fan', categoryId: beverages.id, unit: 'per 125ml cup' },
    { name: 'Ice Cream (Walls 500ml)', slug: 'ice-cream-walls-500ml', categoryId: beverages.id, unit: '500ml tub' },

    // Snacks & Confectionery
    { name: 'Gala Sausage Roll', slug: 'gala-sausage-roll', categoryId: snacks.id, unit: 'per piece' },
    { name: 'Digestive Biscuits', slug: 'digestive-biscuits', categoryId: snacks.id, unit: 'per pack' },
    { name: 'Cabin Biscuits', slug: 'cabin-biscuits', categoryId: snacks.id, unit: 'per pack' },
    { name: 'Puff Puff (Local)', slug: 'puff-puff-local', categoryId: snacks.id, unit: 'per piece' },
    { name: 'Chin Chin', slug: 'chin-chin', categoryId: snacks.id, unit: '500g bag' },
    { name: 'Plantain Chips', slug: 'plantain-chips', categoryId: snacks.id, unit: 'per pack' },
    { name: 'Popcorn (Packaged)', slug: 'popcorn-packaged', categoryId: snacks.id, unit: 'per pack' },
    { name: 'Groundnut (Roasted)', slug: 'groundnut-roasted', categoryId: snacks.id, unit: 'per cup' },
    { name: 'Peanut Butter', slug: 'peanut-butter', categoryId: snacks.id, unit: 'per jar (500g)' },
    { name: 'Tom Tom Sweet', slug: 'tom-tom-sweet', categoryId: snacks.id, unit: 'per pack of 10' },
    { name: 'Trebor Mint', slug: 'trebor-mint', categoryId: snacks.id, unit: 'per pack' },
    { name: 'Choco Milo (Chocolate)', slug: 'choco-milo', categoryId: snacks.id, unit: 'per bag' },
    { name: 'Doughnut (Local)', slug: 'doughnut-local', categoryId: snacks.id, unit: 'per piece' },
    { name: 'Bread (Sliced Loaf)', slug: 'bread-sliced-loaf', categoryId: snacks.id, unit: 'per loaf' },
    { name: 'Agege Bread', slug: 'agege-bread', categoryId: snacks.id, unit: 'per loaf' },
    { name: 'Egg Roll', slug: 'egg-roll', categoryId: snacks.id, unit: 'per piece' },
    { name: 'Sausage (Vienna)', slug: 'sausage-vienna', categoryId: snacks.id, unit: 'per tin (200g)' },
    { name: 'Sardine (Tin)', slug: 'sardine-tin', categoryId: snacks.id, unit: 'per tin (125g)' },
    { name: 'Titus Fish (Tin)', slug: 'titus-fish-tin', categoryId: snacks.id, unit: 'per tin (200g)' },
    { name: 'Corned Beef (Tin)', slug: 'corned-beef-tin', categoryId: snacks.id, unit: 'per tin (340g)' },
    { name: 'Jam (Strawberry)', slug: 'jam-strawberry', categoryId: snacks.id, unit: 'per jar (500g)' },
    { name: 'Honey (Natural)', slug: 'honey-natural', categoryId: snacks.id, unit: 'per bottle (500g)' },
    { name: 'Nutella (200g)', slug: 'nutella-200g', categoryId: snacks.id, unit: '200g jar' },
    { name: 'Chocolate (Cadbury)', slug: 'chocolate-cadbury', categoryId: snacks.id, unit: 'per bar (40g)' },
    { name: 'Wafer Biscuits', slug: 'wafer-biscuits', categoryId: snacks.id, unit: 'per pack' },
    { name: 'Crackers (Shortbread)', slug: 'crackers-shortbread', categoryId: snacks.id, unit: 'per pack' },

    // Personal Care
    { name: 'Shampoo (Pantene 400ml)', slug: 'shampoo-pantene-400ml', categoryId: personalCare.id, unit: 'per bottle' },
    { name: 'Hair Conditioner', slug: 'hair-conditioner', categoryId: personalCare.id, unit: 'per bottle (400ml)' },
    { name: 'Body Lotion (Jergens)', slug: 'body-lotion-jergens', categoryId: personalCare.id, unit: 'per bottle (400ml)' },
    { name: 'Vaseline Body Lotion', slug: 'vaseline-body-lotion', categoryId: personalCare.id, unit: 'per bottle (400ml)' },
    { name: 'Shea Butter (Raw)', slug: 'shea-butter-raw', categoryId: personalCare.id, unit: 'per 250g jar' },
    { name: 'Coconut Oil (Hair/Body)', slug: 'coconut-oil-hair-body', categoryId: personalCare.id, unit: 'per 250ml jar' },
    { name: 'Relaxer (Dark & Lovely)', slug: 'relaxer-dark-lovely', categoryId: personalCare.id, unit: 'per kit' },
    { name: 'Hair Pomade (Dax)', slug: 'hair-pomade-dax', categoryId: personalCare.id, unit: 'per tin' },
    { name: 'Deodorant (Rexona)', slug: 'deodorant-rexona', categoryId: personalCare.id, unit: 'per stick' },
    { name: 'Roll-On (Sure)', slug: 'roll-on-sure', categoryId: personalCare.id, unit: 'per bottle' },
    { name: 'Body Spray (Lynx/Axe)', slug: 'body-spray-lynx', categoryId: personalCare.id, unit: 'per can' },
    { name: 'Perfume (Local Attars)', slug: 'perfume-local-attars', categoryId: personalCare.id, unit: 'per 30ml bottle' },
    { name: 'Lip Gloss', slug: 'lip-gloss', categoryId: personalCare.id, unit: 'per piece' },
    { name: 'Powder (Cussons Baby)', slug: 'powder-cussons-baby', categoryId: personalCare.id, unit: 'per 200g tin' },
    { name: 'Bathing Soap (Dove)', slug: 'bathing-soap-dove', categoryId: personalCare.id, unit: 'per bar' },
    { name: 'Antiseptic Soap (Dettol)', slug: 'antiseptic-soap-dettol', categoryId: personalCare.id, unit: 'per bar' },
    { name: 'Toothbrush', slug: 'toothbrush', categoryId: personalCare.id, unit: 'per piece' },
    { name: 'Dental Floss', slug: 'dental-floss', categoryId: personalCare.id, unit: 'per pack' },
    { name: 'Mouthwash (Listerine)', slug: 'mouthwash-listerine', categoryId: personalCare.id, unit: 'per bottle (500ml)' },
    { name: 'Shaving Stick (Gillette)', slug: 'shaving-stick-gillette', categoryId: personalCare.id, unit: 'per piece' },
    { name: 'Shaving Foam (Gillette)', slug: 'shaving-foam-gillette', categoryId: personalCare.id, unit: 'per can' },
    { name: 'Razor Blade (Double Edge)', slug: 'razor-blade-double-edge', categoryId: personalCare.id, unit: 'pack of 5' },
    { name: 'Cotton Wool', slug: 'cotton-wool', categoryId: personalCare.id, unit: 'per 100g pack' },
    { name: 'Feminine Wipes', slug: 'feminine-wipes', categoryId: personalCare.id, unit: 'per pack' },
    { name: 'Baby Diaper (Pampers M)', slug: 'baby-diaper-pampers-m', categoryId: personalCare.id, unit: 'pack of 10' },
    { name: 'Baby Wipes', slug: 'baby-wipes', categoryId: personalCare.id, unit: 'per pack 80s' },
    { name: 'Johnson Baby Oil', slug: 'johnson-baby-oil', categoryId: personalCare.id, unit: 'per bottle (200ml)' },
    { name: 'Black Soap (Dudu Osun)', slug: 'black-soap-dudu-osun', categoryId: personalCare.id, unit: 'per bar' },

    // Health & Pharmacy
    { name: 'Paracetamol Tablet', slug: 'paracetamol-tablet', categoryId: healthPharmacy.id, unit: 'per strip of 10' },
    { name: 'Ibuprofen Tablet', slug: 'ibuprofen-tablet', categoryId: healthPharmacy.id, unit: 'per strip of 10' },
    { name: 'Amoxicillin Capsule', slug: 'amoxicillin-capsule', categoryId: healthPharmacy.id, unit: 'per strip of 10' },
    { name: 'Vitamin C Tablet', slug: 'vitamin-c-tablet', categoryId: healthPharmacy.id, unit: 'per pack of 30' },
    { name: 'Multivitamin Tablet', slug: 'multivitamin-tablet', categoryId: healthPharmacy.id, unit: 'per bottle of 30' },
    { name: 'Zinc Tablet', slug: 'zinc-tablet', categoryId: healthPharmacy.id, unit: 'per strip of 10' },
    { name: 'ORS Sachet', slug: 'ors-sachet', categoryId: healthPharmacy.id, unit: 'per sachet' },
    { name: 'Chloroquine Tablet', slug: 'chloroquine-tablet', categoryId: healthPharmacy.id, unit: 'per strip' },
    { name: 'Coartem (Malaria Drug)', slug: 'coartem-malaria', categoryId: healthPharmacy.id, unit: 'per pack' },
    { name: 'Dettol Antiseptic (500ml)', slug: 'dettol-antiseptic-500ml', categoryId: healthPharmacy.id, unit: 'per bottle' },
    { name: 'Hand Sanitizer', slug: 'hand-sanitizer', categoryId: healthPharmacy.id, unit: 'per bottle (100ml)' },
    { name: 'First Aid Bandage', slug: 'first-aid-bandage', categoryId: healthPharmacy.id, unit: 'per roll' },
    { name: 'Plaster (Band-Aid)', slug: 'plaster-band-aid', categoryId: healthPharmacy.id, unit: 'per pack of 10' },
    { name: 'Thermometer', slug: 'thermometer', categoryId: healthPharmacy.id, unit: 'per piece' },
    { name: 'Blood Glucose Test Strip', slug: 'blood-glucose-test-strip', categoryId: healthPharmacy.id, unit: 'per pack of 25' },
    { name: 'Face Mask (Surgical)', slug: 'face-mask-surgical', categoryId: healthPharmacy.id, unit: 'per box of 50' },
    { name: 'Rubber Gloves', slug: 'rubber-gloves', categoryId: healthPharmacy.id, unit: 'per pair' },
    { name: 'Eye Drops (Visine)', slug: 'eye-drops-visine', categoryId: healthPharmacy.id, unit: 'per bottle' },
    { name: 'Calamine Lotion', slug: 'calamine-lotion', categoryId: healthPharmacy.id, unit: 'per bottle (100ml)' },
    { name: 'Methylated Spirit', slug: 'methylated-spirit', categoryId: healthPharmacy.id, unit: 'per bottle (500ml)' },

    // Electronics & Accessories
    { name: 'Phone Charger (Micro USB)', slug: 'phone-charger-micro-usb', categoryId: electronicAcc.id, unit: 'per piece' },
    { name: 'Phone Charger (Type-C)', slug: 'phone-charger-type-c', categoryId: electronicAcc.id, unit: 'per piece' },
    { name: 'Earphones (Wired)', slug: 'earphones-wired', categoryId: electronicAcc.id, unit: 'per piece' },
    { name: 'Power Bank (5000mAh)', slug: 'power-bank-5000mah', categoryId: electronicAcc.id, unit: 'per piece' },
    { name: 'Phone Screen Protector', slug: 'phone-screen-protector', categoryId: electronicAcc.id, unit: 'per piece' },
    { name: 'Phone Case (Generic)', slug: 'phone-case-generic', categoryId: electronicAcc.id, unit: 'per piece' },
    { name: 'USB Flash Drive (16GB)', slug: 'usb-flash-16gb', categoryId: electronicAcc.id, unit: 'per piece' },
    { name: 'AA Battery (Pack of 4)', slug: 'aa-battery-pack-4', categoryId: electronicAcc.id, unit: 'pack of 4' },
    { name: 'AAA Battery (Pack of 4)', slug: 'aaa-battery-pack-4', categoryId: electronicAcc.id, unit: 'pack of 4' },
    { name: 'Extension Cable (3-way)', slug: 'extension-cable-3way', categoryId: electronicAcc.id, unit: 'per piece' },
    { name: 'Bulb (LED 7W)', slug: 'bulb-led-7w', categoryId: electronicAcc.id, unit: 'per bulb' },
    { name: 'Bulb (Energy Saver 20W)', slug: 'bulb-energy-saver-20w', categoryId: electronicAcc.id, unit: 'per bulb' },
    { name: 'Torch Light (Battery)', slug: 'torch-light-battery', categoryId: electronicAcc.id, unit: 'per piece' },
    { name: 'Rechargeable Lantern', slug: 'rechargeable-lantern', categoryId: electronicAcc.id, unit: 'per piece' },
    { name: 'Radio (Transistor)', slug: 'radio-transistor', categoryId: electronicAcc.id, unit: 'per piece' },
    { name: 'Electric Fan (Table)', slug: 'electric-fan-table', categoryId: electronicAcc.id, unit: 'per piece' },
    { name: 'Data Subscription (1GB MTN)', slug: 'data-1gb-mtn', categoryId: electronicAcc.id, unit: 'per 1GB' },
    { name: 'Airtime (MTN N100)', slug: 'airtime-mtn-100', categoryId: electronicAcc.id, unit: 'per N100 unit' },
    { name: 'Airtime (Glo N100)', slug: 'airtime-glo-100', categoryId: electronicAcc.id, unit: 'per N100 unit' },

    // Stationery & Office
    { name: 'Exercise Book (60 leaves)', slug: 'exercise-book-60leaves', categoryId: stationery.id, unit: 'per book' },
    { name: 'Exercise Book (80 leaves)', slug: 'exercise-book-80leaves', categoryId: stationery.id, unit: 'per book' },
    { name: 'Ballpoint Pen (Blue)', slug: 'ballpoint-pen-blue', categoryId: stationery.id, unit: 'per piece' },
    { name: 'Ballpoint Pen (Pack of 10)', slug: 'ballpoint-pen-pack-10', categoryId: stationery.id, unit: 'pack of 10' },
    { name: 'Pencil (HB)', slug: 'pencil-hb', categoryId: stationery.id, unit: 'per piece' },
    { name: 'Eraser', slug: 'eraser', categoryId: stationery.id, unit: 'per piece' },
    { name: 'Ruler (30cm)', slug: 'ruler-30cm', categoryId: stationery.id, unit: 'per piece' },
    { name: 'Mathematical Set', slug: 'mathematical-set', categoryId: stationery.id, unit: 'per set' },
    { name: 'Cardboard (A4)', slug: 'cardboard-a4', categoryId: stationery.id, unit: 'per sheet' },
    { name: 'A4 Paper Ream', slug: 'a4-paper-ream', categoryId: stationery.id, unit: 'per ream (500 sheets)' },
    { name: 'Stapler', slug: 'stapler', categoryId: stationery.id, unit: 'per piece' },
    { name: 'Staple Pin (Pack)', slug: 'staple-pin-pack', categoryId: stationery.id, unit: 'per pack' },
    { name: 'Scotch Tape', slug: 'scotch-tape', categoryId: stationery.id, unit: 'per roll' },
    { name: 'Marker (Permanent)', slug: 'marker-permanent', categoryId: stationery.id, unit: 'per piece' },
    { name: 'Highlighter', slug: 'highlighter', categoryId: stationery.id, unit: 'per piece' },
    { name: 'Glue (Stick)', slug: 'glue-stick', categoryId: stationery.id, unit: 'per piece' },
    { name: 'Calculator (Basic)', slug: 'calculator-basic', categoryId: stationery.id, unit: 'per piece' },
    { name: 'File Folder (A4)', slug: 'file-folder-a4', categoryId: stationery.id, unit: 'per piece' },
    { name: 'Envelope (A4 Size)', slug: 'envelope-a4', categoryId: stationery.id, unit: 'per piece' },

    // More Household
    { name: 'Broom (Local)', slug: 'broom-local', categoryId: householdGoods.id, unit: 'per piece' },
    { name: 'Mop & Bucket Set', slug: 'mop-bucket-set', categoryId: householdGoods.id, unit: 'per set' },
    { name: 'Dishwashing Liquid (Mama Lemon)', slug: 'dishwashing-mama-lemon', categoryId: householdGoods.id, unit: 'per bottle 500ml' },
    { name: 'Sponge (Kitchen)', slug: 'sponge-kitchen', categoryId: householdGoods.id, unit: 'per piece' },
    { name: 'Nylon Bags (Pack)', slug: 'nylon-bags-pack', categoryId: householdGoods.id, unit: 'per pack of 50' },
    { name: 'Aluminium Pot (Medium)', slug: 'aluminium-pot-medium', categoryId: householdGoods.id, unit: 'per piece' },
    { name: 'Plastic Bucket (12L)', slug: 'plastic-bucket-12l', categoryId: householdGoods.id, unit: 'per piece' },
    { name: 'Kerosene Lamp (Wick)', slug: 'kerosene-lamp-wick', categoryId: householdGoods.id, unit: 'per piece' },
    { name: 'Plastic Cup (Set of 6)', slug: 'plastic-cup-set-6', categoryId: householdGoods.id, unit: 'set of 6' },
    { name: 'Frying Pan', slug: 'frying-pan', categoryId: householdGoods.id, unit: 'per piece' },
    { name: 'Wooden Spoon', slug: 'wooden-spoon', categoryId: householdGoods.id, unit: 'per piece' },
    { name: 'Padlock', slug: 'padlock', categoryId: householdGoods.id, unit: 'per piece' },
    { name: 'Rat Poison', slug: 'rat-poison', categoryId: householdGoods.id, unit: 'per pack' },
    { name: 'Insecticide Spray (Raid)', slug: 'insecticide-spray-raid', categoryId: householdGoods.id, unit: 'per can' },
    { name: 'Air Freshener (Lavender)', slug: 'air-freshener-lavender', categoryId: householdGoods.id, unit: 'per can' },
    { name: 'Washing Powder (Omo 500g)', slug: 'washing-powder-omo-500g', categoryId: householdGoods.id, unit: '500g pack' },
    { name: 'Bleach (JIK)', slug: 'bleach-jik', categoryId: householdGoods.id, unit: 'per bottle (500ml)' },
    { name: 'Zip-Lock Bags', slug: 'zip-lock-bags', categoryId: householdGoods.id, unit: 'pack of 20' },
  ];

  let createdCount = 0;
  let skippedCount = 0;

  for (const product of products) {
    const existing = await prisma.product.findUnique({ where: { slug: product.slug } });
    if (existing) {
      skippedCount++;
      continue;
    }
    await prisma.product.create({
      data: {
        ...product,
        approved: true,
      },
    });
    createdCount++;
  }

  console.log(`✅ Products: ${createdCount} created, ${skippedCount} already existed`);

  // ── 3. Locations (Nigerian States + LGAs) ──────────────────────────────────
  console.log('🌍 Seeding Nigerian states and LGAs...');

  // Fetch all existing locations in a single query
  const existingLocations = await prisma.location.findMany({
    select: { name: true, state: true },
  });

  const existingSet = new Set(
    existingLocations.map((loc) => `${loc.name.toLowerCase()}|${loc.state.toLowerCase()}`)
  );

  const toCreate: { name: string; state: string; lga: string }[] = [];

  for (const stateData of NIGERIA_STATES_LGAS) {
    for (const lga of stateData.lgas) {
      const key = `${lga.toLowerCase()}|${stateData.state.toLowerCase()}`;
      if (!existingSet.has(key)) {
        toCreate.push({
          name: lga,
          state: stateData.state,
          lga: lga,
        });
      }
    }
  }

  if (toCreate.length > 0) {
    // Prisma's createMany is supported on PostgreSQL
    const result = await prisma.location.createMany({
      data: toCreate,
    });
    console.log(`✅ Locations: ${result.count} created via bulk insert, ${NIGERIA_STATES_LGAS.reduce((acc, curr) => acc + curr.lgas.length, 0) - toCreate.length} already existed`);
  } else {
    console.log(`✅ Locations: 0 created (all already existed)`);
  }

  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
