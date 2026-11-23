/**
 * Curated gardening supplies for the Inventory shelves. Edit freely — each shelf is a category and each
 * item becomes a tile with shop-search links. Links are *search* URLs (not specific products), so they
 * never go stale; `query` is what gets searched.
 */
export type SupplyIconKind = "hose" | "soil" | "compost" | "gloves" | "can";

export interface SupplyItem {
  name: string;
  tip: string;
  query: string;
}

export interface SupplyShelf {
  id: string;
  title: string;
  blurb: string;
  icon: SupplyIconKind;
  items: SupplyItem[];
}

export const SUPPLY_SHELVES: SupplyShelf[] = [
  {
    id: "hose",
    title: "Hose pipes",
    blurb: "Reach every pot without the carrying.",
    icon: "hose",
    items: [
      { name: "Flexible garden hose (15 m)", tip: "Kink-resistant, reinforced PVC — long enough for most balconies and terraces.", query: "garden hose pipe 15 m" },
      { name: "Adjustable spray nozzle", tip: "Switch between a soft shower for seedlings and a jet for tough cleaning.", query: "garden hose spray nozzle adjustable" },
      { name: "Tap connector & hose fittings", tip: "A snug tap adapter stops leaks and wasted water.", query: "garden hose tap connector adapter" },
    ],
  },
  {
    id: "soil",
    title: "Soil & potting mixes",
    blurb: "The right mix keeps roots happy and drainage honest.",
    icon: "soil",
    items: [
      { name: "Potting mix for containers", tip: "A light, well-drained blend — better than garden soil in pots.", query: "potting mix for plants" },
      { name: "Coco-peat blocks", tip: "Airy and moisture-holding. Pair with vermicompost for a container mix.", query: "cocopeat block for plants" },
      { name: "Cactus & succulent mix", tip: "Gritty and fast-draining — ideal for Cactus.", query: "cactus succulent soil mix" },
    ],
  },
  {
    id: "compost",
    title: "Manure & compost",
    blurb: "Food for the soil — matched to your plants' fertilizer schedule.",
    icon: "compost",
    items: [
      { name: "Vermicompost", tip: "Gentle all-rounder for Tulsi, Rose and Tomato.", query: "vermicompost organic manure" },
      { name: "Well-rotted cow dung manure", tip: "Slow-release organic feeding; mix into the top layer of soil.", query: "cow dung manure for plants" },
      { name: "Bone meal", tip: "Supports blooms on flowering plants like Rose.", query: "bone meal fertilizer for plants" },
    ],
  },
  {
    id: "gloves",
    title: "Gardening gloves",
    blurb: "Thorns, spines and soil — hands stay safe.",
    icon: "gloves",
    items: [
      { name: "Coated gardening gloves", tip: "Grippy palms, breathable back — good for everyday potting.", query: "gardening gloves" },
      { name: "Thorn-proof rose gloves", tip: "Long cuffs protect forearms when pruning Rose.", query: "thorn proof gardening gloves rose pruning" },
      { name: "Heavy-duty gloves", tip: "Extra protection for handling spiny Cactus.", query: "heavy duty gardening gloves puncture resistant" },
    ],
  },
  {
    id: "cans",
    title: "Watering cans",
    blurb: "A gentle pour beats a flood.",
    icon: "can",
    items: [
      { name: "Watering can with rose head (5 L)", tip: "The sprinkler head spreads water softly over soil.", query: "watering can 5 litre garden" },
      { name: "Long-spout can for indoor plants (1–2 L)", tip: "Reach under leaves and into crowded shelves.", query: "long spout indoor watering can" },
      { name: "Hand spray bottle / mister", tip: "For seedlings and humidity-loving plants.", query: "plant mister spray bottle" },
    ],
  },
];

export const shopLinks = (query: string) => ({
  amazon: `https://www.amazon.in/s?k=${encodeURIComponent(query)}`,
  flipkart: `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`,
});
