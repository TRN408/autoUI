// SmartHRColor.clr から抽出した公式カラーパレット
export interface SmartHRColor {
  name: string;
  hex: string;
  group: string;
  textRecommended?: boolean;
}

export const SMARTHR_PALETTE: SmartHRColor[] = [
  // ── ブランドカラー ──
  { name: "SmartHR Blue", hex: "#00c4cc", group: "Brand" },
  { name: "Orange",       hex: "#ff9900", group: "Brand" },
  { name: "Black",        hex: "#23221f", group: "Brand", textRecommended: true },
  { name: "White",        hex: "#ffffff", group: "Brand" },
  { name: "DANGER",       hex: "#e01e5a", group: "Brand" },

  // ── Stone ──
  { name: "Stone01", hex: "#f8f7f6", group: "Stone" },
  { name: "Stone02", hex: "#edebe6", group: "Stone" },
  { name: "Stone03", hex: "#aaa69f", group: "Stone" },
  { name: "Stone04", hex: "#4e4c49", group: "Stone", textRecommended: true },

  // ── Aqua ──
  { name: "Aqua01", hex: "#d4f4f5", group: "Aqua" },
  { name: "Aqua02", hex: "#69d9de", group: "Aqua" },
  { name: "Aqua03", hex: "#12abb1", group: "Aqua" },
  { name: "Aqua04", hex: "#0f7f85", group: "Aqua", textRecommended: true },

  // ── Sakura ──
  { name: "Sakura01", hex: "#f9e9f7", group: "Sakura" },
  { name: "Sakura02", hex: "#f8b2e1", group: "Sakura" },
  { name: "Sakura03", hex: "#d362af", group: "Sakura" },
  { name: "Sakura04", hex: "#82407c", group: "Sakura" },

  // ── Momiji ──
  { name: "Momiji01", hex: "#ffe7e5", group: "Momiji" },
  { name: "Momiji02", hex: "#ff9e9c", group: "Momiji" },
  { name: "Momiji03", hex: "#ec5a55", group: "Momiji" },
  { name: "Momiji04", hex: "#a53f3f", group: "Momiji" },

  // ── Sunlight ──
  { name: "Sunlight01", hex: "#faf2d0", group: "Sunlight" },
  { name: "Sunlight02", hex: "#ffee11", group: "Sunlight" },
  { name: "Sunlight03", hex: "#ffd74a", group: "Sunlight" },
  { name: "Sunlight04", hex: "#f56121", group: "Sunlight" },

  // ── Grass ──
  { name: "Grass01", hex: "#e6f2c8", group: "Grass" },
  { name: "Grass02", hex: "#aee26b", group: "Grass" },
  { name: "Grass03", hex: "#3dcc65", group: "Grass" },
  { name: "Grass04", hex: "#378445", group: "Grass" },

  // ── Sky ──
  { name: "Sky01", hex: "#ddf2fb", group: "Sky" },
  { name: "Sky02", hex: "#8fe2fc", group: "Sky" },
  { name: "Sky03", hex: "#32b7f0", group: "Sky" },
  { name: "Sky04", hex: "#1376a0", group: "Sky" },

  // ── Marine ──
  { name: "Marine01", hex: "#dee9ff", group: "Marine" },
  { name: "Marine02", hex: "#8ac0ff", group: "Marine" },
  { name: "Marine03", hex: "#0075e3", group: "Marine" },
  { name: "Marine04", hex: "#26519f", group: "Marine" },

  // ── Galaxy ──
  { name: "Galaxy01", hex: "#eee5fd", group: "Galaxy" },
  { name: "Galaxy02", hex: "#9d8ef8", group: "Galaxy" },
  { name: "Galaxy03", hex: "#8c5eee", group: "Galaxy" },
  { name: "Galaxy04", hex: "#6e4ca6", group: "Galaxy" },

  // ── Earth ──
  { name: "Earth01", hex: "#fbede1", group: "Earth" },
  { name: "Earth02", hex: "#f2d3a4", group: "Earth" },
  { name: "Earth03", hex: "#ba621e", group: "Earth" },
  { name: "Earth04", hex: "#76533e", group: "Earth" },
];

// グループ一覧
export const PALETTE_GROUPS = [
  "Brand", "Stone", "Aqua", "Sakura", "Momiji",
  "Sunlight", "Grass", "Sky", "Marine", "Galaxy", "Earth",
] as const;

// hex → color オブジェクト のマップ
export const PALETTE_BY_HEX: Record<string, SmartHRColor> = Object.fromEntries(
  SMARTHR_PALETTE.map((c) => [c.hex.toLowerCase(), c])
);

// ── ユーティリティ ────────────────────────────────────

function hexToRGB(hex: string): [number, number, number] {
  const h = hex.replace("#", "").toLowerCase();
  const full = h.length === 3
    ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
    : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function colorDistance(a: string, b: string): number {
  const [r1, g1, b1] = hexToRGB(a);
  const [r2, g2, b2] = hexToRGB(b);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

/** 入力 hex に最も近い SmartHR カラーを返す */
export function findClosestColor(hex: string): { color: SmartHRColor; distance: number } {
  let best: { color: SmartHRColor; distance: number } | null = null;
  for (const color of SMARTHR_PALETTE) {
    const d = colorDistance(hex, color.hex);
    if (!best || d < best.distance) best = { color, distance: d };
  }
  return best!;
}

/** 入力 hex が SmartHR パレットの色かどうか */
export function isSmartHRColor(hex: string): boolean {
  const norm = hex.toLowerCase().replace("#", "");
  const full = norm.length === 3
    ? norm[0] + norm[0] + norm[1] + norm[1] + norm[2] + norm[2]
    : norm;
  return ("#" + full) in PALETTE_BY_HEX;
}
