export interface ColorScheme {
  name: string;
  primary: string;
  text: string;
  bg: string;
}

// ロゴ生成で使っていた SmartHR 12パターン（アプリ全体の配色候補にも流用）
export const SMARTHR_12_SCHEMES: ColorScheme[] = [
  { name: "SmartHR",  primary: "#00c4cc", text: "#23221f", bg: "#ffffff" },
  { name: "Aqua",     primary: "#12abb1", text: "#23221f", bg: "#d4f4f5" },
  { name: "Marine",   primary: "#0075e3", text: "#ffffff", bg: "#26519f" },
  { name: "Sky",      primary: "#32b7f0", text: "#23221f", bg: "#ddf2fb" },
  { name: "Galaxy",   primary: "#8c5eee", text: "#ffffff", bg: "#eee5fd" },
  { name: "Sakura",   primary: "#d362af", text: "#ffffff", bg: "#82407c" },
  { name: "Momiji",   primary: "#ec5a55", text: "#ffffff", bg: "#a53f3f" },
  { name: "Sunlight", primary: "#f56121", text: "#ffffff", bg: "#faf2d0" },
  { name: "Grass",    primary: "#3dcc65", text: "#23221f", bg: "#e6f2c8" },
  { name: "Earth",    primary: "#ba621e", text: "#ffffff", bg: "#fbede1" },
  { name: "Stone",    primary: "#4e4c49", text: "#23221f", bg: "#f8f7f6" },
  { name: "Dark",     primary: "#00c4cc", text: "#ffffff", bg: "#23221f" },
];

