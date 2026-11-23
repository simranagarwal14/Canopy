export interface GardenOption {
  value: string;
  label: string;
  /** Short regional / scientific detail lines shown under the dropdown and on the dashboard. */
  details: string[];
}

export const HUMIDITY_OPTIONS: GardenOption[] = [
  {
    value: "arid",
    label: "Arid / Dry (Thar, Kutch, Ladakh)",
    details: ["Relative humidity: ~20–40% RH", "IMD annual rainfall: below ~500 mm/yr"],
  },
  {
    value: "semi-arid",
    label: "Semi-Arid (Deccan interior, Punjab–Haryana, Gujarat)",
    details: ["Relative humidity: ~40–55% RH", "IMD annual rainfall: ~500–1,000 mm/yr"],
  },
  {
    value: "sub-humid",
    label: "Sub-Humid / Gangetic (Indo-Gangetic plains, Central India)",
    details: ["Relative humidity: ~55–70% RH", "IMD annual rainfall: ~1,000–1,500 mm/yr"],
  },
  {
    value: "tropical-humid",
    label: "Tropical Humid (Kerala, Konkan coast, North-East, Western Ghats)",
    details: ["Relative humidity: ~70–90% RH", "IMD annual rainfall: above ~1,500 mm/yr"],
  },
];

export const SUNLIGHT_OPTIONS: GardenOption[] = [
  {
    value: "direct-intense",
    label: "Direct Intense Sun",
    details: ["6+ hours/day of direct sun", "~50,000–100,000 lux", "DLI ~30–50 mol/m²/day"],
  },
  {
    value: "bright-indirect",
    label: "Bright Indirect Light",
    details: ["4–6 hours/day of bright light", "~10,000–25,000 lux", "DLI ~15–30 mol/m²/day"],
  },
  {
    value: "partial-shade",
    label: "Partial / Dappled Shade",
    details: ["2–4 hours/day of light", "~5,000–10,000 lux", "DLI ~6–15 mol/m²/day"],
  },
  {
    value: "low-indoor",
    label: "Low Indoor Light",
    details: ["Under 2 hours/day", "~500–2,500 lux", "DLI ~1–5 mol/m²/day"],
  },
];

export const PLACEMENT_OPTIONS: GardenOption[] = [
  { value: "balcony", label: "Balcony", details: ["Semi-open, partly sheltered from rain and wind"] },
  { value: "indoor", label: "Indoor", details: ["Inside the home, near a window or under grow light"] },
  { value: "terrace", label: "Terrace", details: ["Open roof space with full exposure to sun and weather"] },
  { value: "garden", label: "Garden", details: ["Ground-level beds or large planters"] },
];

export const SOIL_OPTIONS: GardenOption[] = [
  {
    value: "desert-sandy",
    label: "Desert / Sandy (Aridisol)",
    details: ["pH ~7.5–8.5", "Very fast drainage, very low water retention"],
  },
  {
    value: "alluvial",
    label: "Alluvial (Inceptisol)",
    details: ["pH ~6.5–8.0", "Good drainage, good water retention and fertility"],
  },
  {
    value: "black-regur",
    label: "Black Regur (Vertisol)",
    details: ["pH ~7.5–8.7", "Slow drainage when wet, very high water retention"],
  },
  {
    value: "red-laterite",
    label: "Red / Laterite (Alfisol)",
    details: ["pH ~5.0–6.5", "Fast drainage, low-to-moderate retention, low nutrients"],
  },
  {
    value: "cocopeat-vermi",
    label: "Coco-Peat + Vermicompost (container mix)",
    details: ["pH ~5.8–6.8", "Airy and well drained, moderate retention, nutrient-rich"],
  },
];

function find(options: GardenOption[], value: string): GardenOption | undefined {
  return options.find((o) => o.value === value);
}

export const isValidOption = (options: GardenOption[], value: unknown): value is string =>
  typeof value === "string" && options.some((o) => o.value === value);

export const describeHumidity = (v: string) => find(HUMIDITY_OPTIONS, v);
export const describeSunlight = (v: string) => find(SUNLIGHT_OPTIONS, v);
export const describeSoil = (v: string) => find(SOIL_OPTIONS, v);
export const describePlacement = (v: string) => find(PLACEMENT_OPTIONS, v);
