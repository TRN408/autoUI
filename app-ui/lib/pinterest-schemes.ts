// ─────────────────────────────────────────────────────────────────
//  Pinterest パレット（08lux_design/color-palette より）
//  4色パレットの「薄い方から3色」を bg / primary / text に割り当て
//  規則: 最暗色を除いた3色 → bg=最明 / primary=中間 / text=最暗
// ─────────────────────────────────────────────────────────────────

export interface PinterestScheme {
  name: string;
  primary: string;
  text: string;
  bg: string;
}

export const PINTEREST_SCHEMES: PinterestScheme[] = [
  // ── スクリーンショット1 行1 ──────────────────────────────────
  // 白浜のアクア: Ocean Blue / Tropical Blue / Mint Aqua / Pearl Mist
  { name: "白浜のアクア",      primary: "#7ecece", text: "#4a9ab5", bg: "#d4e8ea" },
  // 暮葉のガーデン: Amber Brown / Pumpkin Gold / Olive Honey / Linen White
  { name: "暮葉のガーデン",    primary: "#c4a030", text: "#c87c28", bg: "#ede0c4" },
  // 紅砂のゆらぎ: (deep red) / Cocoa Wine / Mocha Taupe / Honey Beige
  { name: "紅砂のゆらぎ",     primary: "#a07060", text: "#7a3040", bg: "#e2cca8" },
  // 砂煙の記憶: Desert Coal / Rustic Mocha / Linen Camel / Pale Sand
  { name: "砂煙の記憶",       primary: "#c4a880", text: "#8c6040", bg: "#eadcc8" },
  // 晴青の花畑: Herb Green / Spring Herb / Buttery Ochre / Mist Blue
  { name: "晴青の花畑",       primary: "#c4a840", text: "#6a9450", bg: "#b8ccd8" },
  // 影色のさくらんぼ: Velvet Black / Cocoa Ash / Smoky Rose / Pale Mauve
  { name: "影色のさくらんぼ",  primary: "#b07890", text: "#6a5060", bg: "#e0ccd4" },
  // 光の沈殿: Calm Sky / (Blush) / (Apricot) / Pale Ivory
  { name: "光の沈殿",         primary: "#e8b090", text: "#78b4d8", bg: "#faedd8" },

  // ── スクリーンショット1 行2 ──────────────────────────────────
  // 濃淡のドレープ: Deep Plum / Iris Purple / Twilight Blue / Ash Lavender
  { name: "濃淡のドレープ",    primary: "#8080b8", text: "#6a4888", bg: "#c8c0d8" },
  // 青葉のマカロン: (dark green) / Golden Syrup / Lemon Yellow / (light mint)
  { name: "青葉のマカロン",    primary: "#e0d040", text: "#c88818", bg: "#e8ecd8" },
  // くつろぎの水際: Navy Shadow / Ocean Blue / (mid) / Mint Gray
  { name: "くつろぎの水際",    primary: "#a8b8b8", text: "#306098", bg: "#d8e8e0" },
  // 遠景のローズヴェール: Berry Smoke / Soft Magenta / Candy Pink / Baby Pink
  { name: "遠景のローズヴェール", primary: "#e88ea6", text: "#c45e7e", bg: "#f8d0dc" },
  // 白昼のビター: Cocoa Black / (mid blue) / Pale Sky / Milk White
  { name: "白昼のビター",      primary: "#c8d8e8", text: "#a0b0c0", bg: "#f0ece8" },
  // 空を渡る記憶: Night Teal / Sky Blue / (light blue) / Vanilla Milk
  { name: "空を渡る記憶",      primary: "#8ec0d0", text: "#4090b0", bg: "#f0e8d0" },
  // 咲き添う燈めき: Ink Black / Berry Rouge / (warm brown) / Ivory Sand
  { name: "咲き添う燈めき",    primary: "#c07050", text: "#882040", bg: "#ece0c8" },

  // ── スクリーンショット2 行1 ──────────────────────────────────
  // 溶金のかたち: Burnt Orange / Warm Amber / (pale gold) / Pale Honey
  { name: "溶金のかたち",      primary: "#d4a860", text: "#c07828", bg: "#f0dca8" },
  // 小さな楽園: Shadow Green / Soft Emerald / Olive Green / Cream Beige
  { name: "小さな楽園",        primary: "#7a9a50", text: "#4a8860", bg: "#e8e0c8" },
  // 彩火の花束: Deep Cherry / Dust Rose / Sunset Orange / Honey Orange
  { name: "彩火の花束",        primary: "#e87840", text: "#c04040", bg: "#f0b870" },
  // 格子に滲む光: Forest Ash / Calm Mist / Ice Gray / Pearl White
  { name: "格子に滲む光",      primary: "#c8d0cc", text: "#a8b0a8", bg: "#f0eee8" },
  // 風わたる丘: (orange) / Olive Café / Light Khaki / (lightest)
  { name: "風わたる丘",        primary: "#c8b878", text: "#8a7040", bg: "#e0d8b8" },
  // 深青のゆりかご: Deep Navy / Dusty Teal / Sandy Blue / (light)
  { name: "深青のゆりかご",    primary: "#80a8b8", text: "#408090", bg: "#c8d8e0" },
  // 午睡のカフェ: Roast Coffee / Warm Amber / Latte Beige / Pearl White
  { name: "午睡のカフェ",      primary: "#d4b888", text: "#a07040", bg: "#f0e8d8" },

  // ── スクリーンショット2 行2 ──────────────────────────────────
  // 色褪せない遊景: Brick Red / Warm Orange / Honey Gold / Moss Green
  { name: "色褪せない遊景",    primary: "#c86830", text: "#6a8830", bg: "#d8a840" },
  // 風を連れて: Deep Shadow / Ocean Teal / Mint Blue / (light)
  { name: "風を連れて",        primary: "#70b8b0", text: "#3a8888", bg: "#d0e8e0" },
  // 光差す境界: (Wood Brown) / Urban Orange / Sand Honey / Cream
  { name: "光差す境界",        primary: "#d4a860", text: "#d06020", bg: "#ece0c8" },
  // 糸に宿る春: Forest Olive / Honey Glow / Petal Pink / Soft Apricot
  { name: "糸に宿る春",        primary: "#e89898", text: "#c8a040", bg: "#f0c8a0" },
  // 可憐のひとかけら: Plum Wine / Dusty Rose / Mint Lavender / Pale Lilac
  { name: "可憐のひとかけら",  primary: "#b8c8c8", text: "#c07080", bg: "#e0d8e8" },
  // 白樺とぬくもり: Burnt Amber / Mustard Gold / Olive Stone / Mint Beige
  { name: "白樺とぬくもり",    primary: "#909060", text: "#c09030", bg: "#d8d8c0" },
  // 眠る海色: (dark teal) / (mid) / (light) / Pearl White
  { name: "眠る海色",          primary: "#90b8b0", text: "#4a7878", bg: "#e8f0e8" },

  // ── スクリーンショット3 行1 ──────────────────────────────────
  // 陽だまりの影: Cocoa Brown / Spice Orange / Olive Green / Butter Yellow
  { name: "陽だまりの影",      primary: "#808030", text: "#c07030", bg: "#e8d870" },
  // 影の経過: Shadow Black / Basil Gray / Silver Mist / Milk White
  { name: "影の経過",          primary: "#b0acac", text: "#686060", bg: "#f0eeec" },
  // ラムネの花束: Ocean Blue / Bright Cyan / Mint Blue / Ice Blue
  { name: "ラムネの花束",      primary: "#80d0c8", text: "#40b8d0", bg: "#c0e8e8" },
  // 石街の温度: Urban Black / Mocha Brown / Brick Red / Stone Gray
  { name: "石街の温度",        primary: "#b04040", text: "#806050", bg: "#b8b0a8" },
  // 夜明け前のネオン: Velvet Plum / Ocean Lilac / Forest Pink / Milk Rose
  { name: "夜明け前のネオン",  primary: "#d080b8", text: "#a060c0", bg: "#f0d0e8" },
  // 碧石の層: Teal Stone / Forest Sage / Mint Blue / Pearl Aqua
  { name: "碧石の層",          primary: "#80b8c0", text: "#508070", bg: "#c0e0e0" },
  // 砂丘の孤木: (dark) / (warm sand) / (dusty blue) / (light beige)
  { name: "砂丘の孤木",        primary: "#8090a0", text: "#c09060", bg: "#e0d0b8" },

  // ── スクリーンショット3 行2 ──────────────────────────────────
  // 橙香の灯火: Shadow Moss / Shadow Honey / Wood Taupe / Sand Milk
  { name: "橙香の灯火",        primary: "#c0a878", text: "#8a7030", bg: "#ece0c8" },
  // 凍湖の空気: Forest Muse / Ocean Blue / Ice Blue / Winter
  { name: "凍湖の空気",        primary: "#90c0d8", text: "#4880a0", bg: "#e0ecf0" },
  // 黄花の余白: Night Forest / Ocean Teal / Mustard Gold / Golden Sand
  { name: "黄花の余白",        primary: "#c8a020", text: "#408078", bg: "#e8d888" },
  // 掌の翡翠: Moss Stone / Forest Jade / Crystal Mint / Pearl Gray
  { name: "掌の翡翠",          primary: "#98c8a8", text: "#6a9870", bg: "#d8e8d8" },
  // 春風の花瓶: Olive Leaf / Sunset Coral / Honey Yellow / Cloud White
  { name: "春風の花瓶",        primary: "#e8c030", text: "#e07050", bg: "#f8f0e0" },
  // 群青の星影: Night Ink / Ocean Navy / Sea Glass / Stone Gray
  { name: "群青の星影",        primary: "#6090b0", text: "#2848a0", bg: "#b0c0c8" },
  // 朱器の佇まい: Garnet Red / Dusty Taupe / (mid) / Cream Milk
  { name: "朱器の佇まい",      primary: "#c8b8a8", text: "#a08070", bg: "#f0e8e0" },

  // ── スクリーンショット4 行1 ──────────────────────────────────
  // ネオンの花芽: Electric Pink / Blossom Pink / Sun Honey / Lilac Mist
  { name: "ネオンの花芽",      primary: "#e8c068", text: "#e87098", bg: "#e8d8f0" },
  // ひらく春の気配: Berry Wine / Candy Pink / Fresh Olive / Honey Yellow
  { name: "ひらく春の気配",    primary: "#98a048", text: "#e87890", bg: "#e8d060" },
  // 束ねた紅の記憶: Garnet Red / Cherry Red / Rose Coral / Stone Beige
  { name: "束ねた紅の記憶",    primary: "#e07060", text: "#c03030", bg: "#e8d8c8" },
  // 花と暮らす: Ink Black / Wood Brown / Warm Greige / Linen Gray
  { name: "花と暮らす",        primary: "#c0a890", text: "#7a5040", bg: "#e0d8d0" },
  // 風待つ一輪: (dark) / (mid blue-brown) / Smoke Blue / (pale)
  { name: "風待つ一輪",        primary: "#a0b0c8", text: "#7080a0", bg: "#e0e8f0" },
  // 春果のひかり: Cherry Red / Moon Green / Lime Green / Silk Butter
  { name: "春果のひかり",      primary: "#a8c030", text: "#789030", bg: "#f0e8a8" },
  // 琥珀フライト: (Earth Taupe) / Honey Orange / Warm Wheat / Honey Light
  { name: "琥珀フライト",      primary: "#e8c880", text: "#e09030", bg: "#f8e8c0" },

  // ── スクリーンショット4 行2 ──────────────────────────────────
  // 淡光のシュシュ: Dust Blue / Flour Gray / Cocoa Beige / Cream Seed
  { name: "淡光のシュシュ",    primary: "#c8b8a0", text: "#b0b8b8", bg: "#ece8e0" },
  // 深緑の浮遊: Deep Pine / Moon Green / Olive Gray / (light)
  { name: "深緑の浮遊",        primary: "#8a9060", text: "#4a7840", bg: "#e0e8d8" },
  // アーストーンの朝: Coal Black / Mocha Bark / Dusty Latte / Linen Cream
  { name: "アーストーンの朝",  primary: "#c0a878", text: "#806040", bg: "#ece0c8" },
  // 薄暮オレンジ: Charcoal Gray / Cocoa Sand / Amber Orange / Honey Light
  { name: "薄暮オレンジ",      primary: "#d89040", text: "#a08060", bg: "#f0d888" },
  // レモングラスの丘: Forest Green / Lemon Glow / Golden Wheat / Silk Aqua
  { name: "レモングラスの丘",  primary: "#a8c830", text: "#5a7830", bg: "#e8f0c8" },
  // 硝子色の街: Steel Blue / Sea Glass / Powder Blue / Ivy Pearl
  { name: "硝子色の街",        primary: "#a8c0d0", text: "#7090a0", bg: "#d8e8f0" },
  // 紫光の器: Royal Plum / Soft Iris / Lilac Mist / Fog White
  { name: "紫光の器",          primary: "#c0a8e0", text: "#9070c0", bg: "#e8e0f0" },

  // ── スクリーンショット5 行1 ──────────────────────────────────
  // 秋灯フローラ: Wine Brown / Honey Amber / Ash Greige / Pearl Gray
  { name: "秋灯フローラ",      primary: "#c0b0a0", text: "#c07830", bg: "#e8e0d8" },
  // 蒼冷ウェーブ: Steel Blue / Ice Blue / Silver Gray / Snow White
  { name: "蒼冷ウェーブ",      primary: "#b0b8c0", text: "#7098b8", bg: "#e8ecf0" },
  // 枯花の静物: Olive Moss / Amber Wood / Autumn Gold / Stone Gray
  { name: "枯花の静物",        primary: "#d0a848", text: "#a07840", bg: "#e8e0d0" },
  // 残照メロウ: Dusky Plum / Rosy Silk / Sunset Peach / Pearl Pink
  { name: "残照メロウ",        primary: "#f0a888", text: "#e08090", bg: "#f8d8d0" },
  // 幸運の焼き色: Deep Clover / Sea / Lime Herb / Dusty Fern
  { name: "幸運の焼き色",      primary: "#90b830", text: "#4a8870", bg: "#c8d890" },
  // 柔光のリビング: Honey Bronze / Warm Butter / Dusty Gray / Oat Milk
  { name: "柔光のリビング",    primary: "#e0c060", text: "#b07830", bg: "#f0e8d0" },
  // 春葉の気配: Deep Fern / Berry Wine / Pearl Pink / (light green)
  { name: "春葉の気配(2)",     primary: "#8a2848", text: "#2a5030", bg: "#c8d8b8" },

  // ── スクリーンショット5 行2 ──────────────────────────────────
  // 灯火の雪原: Ink Black / Frost Blue / Sand Bridge / Snow Mist
  { name: "灯火の雪原",        primary: "#c0b080", text: "#6890b0", bg: "#e8e8e0" },
  // 砂糖菓子の標高: Smoky Wine / Midnight Blue / (golden) / Winter
  { name: "砂糖菓子の標高",    primary: "#a0a8c0", text: "#2a3868", bg: "#e8e8f0" },
  // 若葉の体温: Moss Green / Misty Sage / Stone Mist / Linen White
  { name: "若葉の体温",        primary: "#b8c0a8", text: "#90a870", bg: "#ece8d8" },
  // 蒼白の斜面: Cold Aqua / (mid) / Winter Mist / Winter White
  { name: "蒼白の斜面",        primary: "#c8d8e0", text: "#b0a888", bg: "#e8eeee" },
  // 南風の影: Midnight Sea / Moody Blue / Soft Purple / Soak Coral
  { name: "南風の影",          primary: "#9080b0", text: "#4060a0", bg: "#e0a898" },
  // 陽だまりの調合: Amber Sun / Herb Yellow / Warm Sand / Honey Lemon
  { name: "陽だまりの調合",    primary: "#e0c878", text: "#d08828", bg: "#f0e0a8" },
  // 抱擁の色: Warm Umber / Milk Caramel / Stone Cream / Peach Cream
  { name: "抱擁の色",          primary: "#e0c8b0", text: "#c09060", bg: "#f0e0d0" },

  // ── 追加バッチ（スクリーンショット6〜10） ────────────────────────

  // ── スクリーンショット6 行1 ──────────────────────────────────
  // 紅の沈黙: Shadow Black / Deep Berry / Passion Pink / Dusty Rose
  { name: "紅の沈黙",          primary: "#e890a0", text: "#9a2850", bg: "#e8c8d0" },
  // 海風の石段: Marine Ink / Azure Sky / Coastal Aqua / Sea Mist
  { name: "海風の石段",         primary: "#80c8d8", text: "#4898c0", bg: "#d8eef5" },
  // 恋菓のテーブル: (Milk Cocoa) / Cherry Red / Peach Pink / Ivory Milk
  { name: "恋菓のテーブル",     primary: "#f0a898", text: "#c03040", bg: "#f8ece0" },
  // ネオンの靴音: Ink Black / Berry Pink / Neon Pink / Ice Blue
  { name: "ネオンの靴音",       primary: "#e840a0", text: "#c06080", bg: "#d8f0f8" },
  // 色玉のひみつ箱: (Forest Green) / Primary Blue / Candy Red / Golden Yellow
  { name: "色玉のひみつ箱",     primary: "#e04050", text: "#2050c0", bg: "#f0d868" },
  // 翠の奥行き: Shadow Tea / Deep Sky / Fresh Cyan / Mist Ash
  { name: "翠の奥行き",         primary: "#40c8d8", text: "#2878a8", bg: "#d8e8e8" },
  // 風の花標本: (dark) / Apricot / Golden Mil / Pale Ivory
  { name: "風の花標本",         primary: "#e8b870", text: "#c87850", bg: "#f0e0c0" },

  // ── スクリーンショット6 行2 ──────────────────────────────────
  // 夜窓に眠る瞳: (Urban Navy) / Cocoa Rose / Soft Ash / Quiet White
  { name: "夜窓に眠る瞳",       primary: "#c0b8b0", text: "#8a5848", bg: "#f0eeec" },
  // 波音のグラデ: (Night Sea) / Stone Gray / Dusty Aqua / Winter
  { name: "波音のグラデ",        primary: "#90b0b8", text: "#606878", bg: "#e8eef0" },
  // 淡彩スイート: (dark) / Mint Jade / Coral / Light Cream
  { name: "淡彩スイート",        primary: "#80d0c0", text: "#e890b8", bg: "#f8f0e0" },
  // 花野を染める: (darkest) / Burnt Orange / Apricot Milk / Smoke Gray
  { name: "花野を染める",        primary: "#d09060", text: "#a87848", bg: "#f0e0c8" },
  // 幻羽のパステル: (darkest) / Sky Blue / Soft Sky / Dream Blue
  { name: "幻羽のパステル",      primary: "#88c0e0", text: "#4890c0", bg: "#e0f0f8" },
  // 暮れ際の灯影: (Shadow Gray) / Evening Navy / Fog Blue / Golden Dusk
  { name: "暮れ際の灯影",        primary: "#a0b8c8", text: "#204868", bg: "#e8d060" },
  // 蒼闇に沈む森: (Shadow Navy) / Foggy Navy / Forest Blue / Milk Blue
  { name: "蒼闇に沈む森",        primary: "#7090b0", text: "#305078", bg: "#d0e0f0" },

  // ── スクリーンショット7 行1 ──────────────────────────────────
  // 草花の呼吸: (Deep Leaf) / Dusty Rose / Petal Pink / Mist Green
  { name: "草花の呼吸",          primary: "#c88090", text: "#408068", bg: "#e8d8dc" },
  // 静海の入口: (Muted Cocoa) / Soft Caramel / Ocean Blue / Pale Sky
  { name: "静海の入口",          primary: "#4888b8", text: "#b88858", bg: "#d8e8f0" },
  // 沈光フライト: (Earth Brown) / Brick Red / Sun Honey / Pale Butter
  { name: "沈光フライト",         primary: "#e0a840", text: "#c04840", bg: "#f0e4b0" },
  // 夢の反射: (Berry Red) / Mauve Pink / Stone Gray / Candy Pink
  { name: "夢の反射",             primary: "#b09098", text: "#c07088", bg: "#f0c8d8" },
  // 遠回りの景色: (Sunset Red) / Sky Blue / Warm Saffron / Honey Beige
  { name: "遠回りの景色",         primary: "#c09050", text: "#4890c0", bg: "#f0dfc0" },
  // 雨色アスファルト: (Noir Black) / Smoke Gray / Fog Blue / Pearl Gray
  { name: "雨色アスファルト",     primary: "#9090a8", text: "#606060", bg: "#e8e8e8" },
  // 終夜の赤銀河: (Cosmic Black) / Red Shadow / Burning Rose / Dusty Rose
  { name: "終夜の赤銀河",         primary: "#c07070", text: "#8a2040", bg: "#e8c8c8" },

  // ── スクリーンショット7 行2 ──────────────────────────────────
  // 果実が照らす空: (Olive Leaf) / Lime Honey / Orange Peel / Pale Brown
  { name: "果実が照らす空",       primary: "#e87838", text: "#c0b030", bg: "#f0e0c0" },
  // 光憩の宿: (darkest) / Amber Honey / Sky Blue / Light Cream
  { name: "光憩の宿",             primary: "#6098c0", text: "#c08828", bg: "#f0e8d0" },
  // 蒼星のきらめき: (Deep Blue) / Winter Iris / Crystal Blue / Snow Milk
  { name: "蒼星のきらめき",        primary: "#80a8e0", text: "#6070b8", bg: "#f0f0f8" },
  // 空がほどける刻: (Sky Blue) / Pale Ocean / Golden Sand / Salt Luster
  { name: "空がほどける刻",        primary: "#d8c880", text: "#90b8c8", bg: "#f0ece0" },
  // 影樹の静寂: (Shadow Pine) / Pine Green / Herb Green / Fog Leaf
  { name: "影樹の静寂",            primary: "#80a858", text: "#3a6838", bg: "#c8d8b8" },
  // 褪せた青の休暇: (Navy Blue) / Sage Green / Snowy Ridge / Fog Milk
  { name: "褪せた青の休暇",        primary: "#c8d0b8", text: "#789070", bg: "#f0f0e8" },
  // 甘色の足あと: (Deep Aqua) / Soft Ammonite / Coral / Light
  { name: "甘色の足あと",          primary: "#e0a078", text: "#3a8888", bg: "#f8e8d8" },

  // ── スクリーンショット8 行1 ──────────────────────────────────
  // 柑橘がほどける: (Herb Olive) / Honey Amber / Soft Honey / Warm Ivory
  { name: "柑橘がほどける",        primary: "#e0c068", text: "#c89030", bg: "#f0e8d0" },
  // 甘風スプラッシュ: (Plum Pink) / Candy Pink / Floral Mauve / Cotton Pink
  { name: "甘風スプラッシュ",      primary: "#e090b0", text: "#b06090", bg: "#f8e0e8" },
  // 深海標本: (Ink Navy) / Iris Blue / Deep Lilac / Cloud Violet
  { name: "深海標本",              primary: "#8878c8", text: "#5058b0", bg: "#e0d8f0" },
  // 湯気越しの甘さ: (Cacao Black) / Toffee Brown / Latte Beige / Sugar White
  { name: "湯気越しの甘さ",        primary: "#d0a870", text: "#8a6040", bg: "#f8f0e0" },
  // 足音から始まる: (darkest) / Olive Gray / Muted Fawn / Peach Milk
  { name: "足音から始まる",         primary: "#c0a888", text: "#708090", bg: "#f8e8e0" },
  // 雪原のブルーグレイ: (Storm Blue) / Ice Blue / Stone Gray / Frozen Blue
  { name: "雪原のブルーグレイ",    primary: "#b0c0c8", text: "#7898b8", bg: "#d8e8f0" },
  // 夜紅に咲く: (Ink Blue) / Brick Red / Petal Pink / Rose Milk
  { name: "夜紅に咲く",            primary: "#e89098", text: "#c03840", bg: "#f8e0e4" },

  // ── スクリーンショット8 行2 ──────────────────────────────────
  // 夜色の油彩: (Night Navy) / Ocean Blue / Salt Marine / Soft Ice
  { name: "夜色の油彩",            primary: "#7898b8", text: "#2858a0", bg: "#d8e8f0" },
  // 壁に残る夕映え: (Cacao Wood) / Dusty Olive / Quiet Salt / Light Cream
  { name: "壁に残る夕映え",        primary: "#909050", text: "#806040", bg: "#f0e8d8" },
  // 朝光を待つ椅子: (Bitter Black) / Latte Brown / Amber Orange / Honey Gold
  { name: "朝光を待つ椅子",        primary: "#e09040", text: "#9a7050", bg: "#f0d870" },
  // 夢境のグラデーション: (darkest) / Pastel Purple / Dream Sky / Fairy Pink
  { name: "夢境のグラデーション",  primary: "#c8d0f0", text: "#d090c0", bg: "#f8e0f0" },
  // ミルキーな夢支度: (darkest) / Dusty Rose / Warm Beige / Lavender / Very light
  { name: "ミルキーな夢支度",      primary: "#d0c0d8", text: "#c09090", bg: "#f8f0f0" },
  // 紫霧に沈む楽園: (Shadow Black) / Iris Blue / Foggy Purple / Cloud Violet
  { name: "紫霧に沈む楽園",        primary: "#c090d8", text: "#5858b0", bg: "#e0d8f0" },
  // 観覧車が眠る前に: (darkest) / Berry Wine / Lavender Blue / Light
  { name: "観覧車が眠る前に",      primary: "#a890c0", text: "#704080", bg: "#e8e0f0" },

  // ── スクリーンショット9 行1 ──────────────────────────────────
  // 冬砂糖のきらめき: (Cocoa Brown) / Dusty Rose / Hazy Mauve / Soft Camel
  { name: "冬砂糖のきらめき",      primary: "#c0a898", text: "#c07880", bg: "#e8d8c8" },
  // 星灯りのサーカス: (Classic Blue) / Golden Honey / Coral Clay / Ash Blue
  { name: "星灯りのサーカス",      primary: "#e89840", text: "#e06848", bg: "#c8d0e0" },
  // 雪光の静物: (Winter Gray) / Icy Blue / Silver Milk / Silk White
  { name: "雪光の静物",            primary: "#c8d4e0", text: "#8898b0", bg: "#f0f0f4" },
  // 鉛色の空音: (Shadow Blue) / Dusty Blue / Flour Gray / Ash Blue
  { name: "鉛色の空音",            primary: "#b0b8c0", text: "#708090", bg: "#d0d8e0" },
  // 夜更けのパティスリー: (Ink Black) / Garnet Red / Frosting Gray / Silver Gray
  { name: "夜更けのパティスリー",  primary: "#c0c8c8", text: "#a02040", bg: "#e0e0e0" },
  // 森が眠る色: (Winter Lilac) / True Lavender / Pearl Beige / Snow Milk
  { name: "森が眠る色",            primary: "#e8dcc8", text: "#c0a8c8", bg: "#f8f0e8" },
  // 冬支度の光片: (darkest) / Amber Glow / Caramel Latte / Vanilla Milk
  { name: "冬支度の光片",          primary: "#e0c890", text: "#c08838", bg: "#f8f0d8" },

  // ── スクリーンショット9 行2 ──────────────────────────────────
  // カフェ越しの街: (Bitter Brown) / Steel Blue / Burnt Honey / Oat Milk
  { name: "カフェ越しの街",        primary: "#c09040", text: "#5878a0", bg: "#f0e8d8" },
  // 波間のニュアンス: (darkest) / Dust Blue / Soft Camel / Fog White
  { name: "波間のニュアンス",      primary: "#c8b8a0", text: "#909898", bg: "#f0f0ec" },
  // 指先の色遊び: (darkest) / Candy Rose / Aqua Blue / Herb Yellow
  { name: "指先の色遊び",          primary: "#90c8a0", text: "#e890a0", bg: "#e8e8d0" },
  // 水際の翡翠色: (Herbal Green) / Mint Green / Sand Olive / Oat Milk
  { name: "水際の翡翠色",          primary: "#b8c8a0", text: "#70b090", bg: "#f0e8d8" },
  // 氷脈の息吹: (Icy Sapphire) / Frost Sky / Frosted Snow / Snow Dream
  { name: "氷脈の息吹",            primary: "#d0e0f0", text: "#88aac8", bg: "#f0f4f8" },
  // 光差す角道: (darkest) / Sunset Amber / Soft Butter / Light
  { name: "光差す角道",            primary: "#e0c060", text: "#c09030", bg: "#f8f0d8" },
  // 甘い聖夜の微睡み: (Forest Green) / Warm Garnet / Olive Bliss / Magic Milk
  { name: "甘い聖夜の微睡み",      primary: "#c8b068", text: "#902038", bg: "#f8f0e0" },

  // ── スクリーンショット10 行1 ──────────────────────────────────
  // 紫罫のホリデー: (Dusty Plum) / Rosy Plum / Powder Pink / Silver Mauve
  { name: "紫罫のホリデー",        primary: "#e0a8b8", text: "#b06080", bg: "#e0d0d8" },
  // 黎明の教会: (Shadow Navy) / Misty Indigo / Soft Graphite / Warm Wood
  { name: "黎明の教会",            primary: "#a0a0a8", text: "#585888", bg: "#e0d8c8" },
  // 秋風の花弁: (Ruby Plum) / Candy Rose / Sunset Cream / Pale Cream
  { name: "秋風の花弁",            primary: "#f0c0a0", text: "#e07088", bg: "#f8e8d8" },
  // 空色の祝福: (Moss Green) / Lemon Glow / Mint Mist / Cloud Milk
  { name: "空色の祝福",            primary: "#d0e880", text: "#a0c8b8", bg: "#f4f4f0" },
  // 蒼宙のムーン: (Midnight Blue) / Sea Blue / Smoky Gray / Beige Honey
  { name: "蒼宙のムーン",          primary: "#9090a0", text: "#4878b0", bg: "#e8e0c8" },
  // 雪淡の遊光: (Steel Blue) / Coastal Blue / Cloud Blue / Silky Snow
  { name: "雪淡の遊光",            primary: "#c0d0e0", text: "#7898b8", bg: "#f0f4f8" },
  // 静海のルミナス: (Horizon Navy) / Dusty Lilac / Blossom Rose / Soft Apricot
  { name: "静海のルミナス",         primary: "#e8a8b8", text: "#b098c0", bg: "#f8e0d0" },

  // ── スクリーンショット10 行2 ──────────────────────────────────
  // ロマンスの残り香: (Olive Shadow) / Vintage Rose / Rosy Dust / Misty Pink
  { name: "ロマンスの残り香",       primary: "#d09098", text: "#b06070", bg: "#f0d8d8" },
  // 真紅の夜飾り: (Midnight Ink) / Wine Scarlet / Soft Mocha / Frosted Light
  { name: "真紅の夜飾り",           primary: "#c09090", text: "#9a2840", bg: "#f0e8e8" },
  // 窓辺のパレット: (Olive Gray) / Fog Sky / Rosy Milk / Silk White
  { name: "窓辺のパレット",         primary: "#e8d4c8", text: "#788890", bg: "#f8f0ec" },
  // 聖夜のきらめき: (Forest Wine) / Wine Red / Honey Brown / Sand Milk
  { name: "聖夜のきらめき",         primary: "#c09060", text: "#a03040", bg: "#f0e4d0" },
  // 淡海のリネン: (Shadow Teal) / Aqua Leaf / Mint Silver / Soft Mint
  { name: "淡海のリネン",           primary: "#a0c8c0", text: "#508878", bg: "#d8f0e8" },
  // 春露のアルバム: (Dusty Olive) / Stone Apricot / Blush Pink / Country Peach
  { name: "春露のアルバム",         primary: "#e8b8a8", text: "#c09060", bg: "#f8e8d8" },
  // 深紫の夢路: (Ink Shadow) / Indigo Night / Vivid Blue / Pale Lilac
  { name: "深紫の夢路",             primary: "#8878c0", text: "#384088", bg: "#e8d8f0" },

  // ── 追加バッチ（スクリーンショット11〜15） ───────────────────────

  // ── スクリーンショット11 行1 ────────────────────────────────────
  // 葉隠れの詩: (Burnt Maple) / Golden Honey / Olive Moss / Pale Wheat
  { name: "葉隠れの詩",            primary: "#c4a030", text: "#808040", bg: "#f0e8c8" },
  // 柔光のリボン: (Dusty Wood) / Clay Red / Almond Linen / Sand Cream
  { name: "柔光のリボン",           primary: "#e0c8a8", text: "#c04840", bg: "#f0e4d0" },
  // 冬街のギフト: (Ink Stone) / Herb Smoke / Cloudy Blue / Mist White
  { name: "冬街のギフト",           primary: "#a0b0c0", text: "#708060", bg: "#f0f0f0" },
  // 薄宵のアロマ: (Shadow Plum) / Plum Smoke / Flesh Rose / Shell Gray
  { name: "薄宵のアロマ",           primary: "#e0a0a8", text: "#b07080", bg: "#e8e0de" },
  // 薄桃のさざ波: (Emerald Green) / Herb Leaf / Misty Khaki / Coral Pink
  { name: "薄桃のさざ波",           primary: "#c0b898", text: "#6a9870", bg: "#f0d8c8" },
  // ひとときの隠れ家: (Moss Shadow) / Antique Blue / Rustic Cocoa / Pale Butter
  { name: "ひとときの隠れ家",       primary: "#8898a8", text: "#a07848", bg: "#f0e8c8" },
  // 星霧のメヌエット: (Abyss Blue) / Skyline Blue / Steel Blue / Misty Silver
  { name: "星霧のメヌエット",        primary: "#7090b0", text: "#4060a0", bg: "#d8e0e8" },

  // ── スクリーンショット11 行2 ────────────────────────────────────
  // 光色の眠り: (Dreamy Blue) / Milky Lilac / Buttery Honey / Vanilla Milk
  { name: "光色の眠り",             primary: "#e0c880", text: "#c0b8d0", bg: "#f8f0e0" },
  // 青渦のテラス: (Cocoa Wood) / Coral Red / Ocean Blue / Mint
  { name: "青渦のテラス",           primary: "#3878a8", text: "#d05040", bg: "#d0e8e0" },
  // 光雨のオーシャン: (Nightfall Blue) / Dusty Mauve / Coral Range / Sandy Honey
  { name: "光雨のオーシャン",        primary: "#e09060", text: "#c090a8", bg: "#f0d880" },
  // 冬灯りのラテ: (Berry Rose) / Caramel Milk / Comfy Pink / Cotton Pink
  { name: "冬灯りのラテ",           primary: "#f0b8c8", text: "#e09088", bg: "#f8e0e8" },
  // 夕凪のヨット: (Blue) / Milky Water / Sunset Honey / One Gold
  { name: "夕凪のヨット",           primary: "#d0a848", text: "#4878a0", bg: "#f0e8c8" },
  // 曇色のドレープ: (Foggy Mocha) / Dusty Greige / Pale Ash / Froze Milk
  { name: "曇色のドレープ",          primary: "#c8c0b8", text: "#988880", bg: "#f0eeec" },
  // ノクターンの欠片: (Dark Veil) / Ash Violet / Mid Purple / Light Lavender
  { name: "ノクターンの欠片",        primary: "#b090c0", text: "#806898", bg: "#e8d8f0" },

  // ── スクリーンショット12 行1 ────────────────────────────────────
  // 秋晴れのレール: (Bronze Shade) / Rust Orange / Honey Light / Sky Blue
  { name: "秋晴れのレール",          primary: "#e8c068", text: "#c06830", bg: "#d8e8f8" },
  // 日向のオレンジ: (Apricot Stone) / Maple Sand / Caramel Veil / Winery Ivory
  { name: "日向のオレンジ",          primary: "#e0c098", text: "#c09060", bg: "#f0e8d0" },
  // フィルムの中の果実: (Velvet Red) / Scarlet Pop / Konica Blue / Pale Almond
  { name: "フィルムの中の果実",      primary: "#4090c0", text: "#e03040", bg: "#f0e4d0" },
  // 静謐の樹影: (Shadow Brown) / Deep Moss / Herb Fern / Cloud Ash
  { name: "静謐の樹影",             primary: "#80a870", text: "#3a6040", bg: "#d0d8c8" },
  // ガラス越しの安らぎ: (Cedar Moss) / Misty Green / Foggy Olive / White Linen
  { name: "ガラス越しの安らぎ",      primary: "#b0b898", text: "#788858", bg: "#f4f0e8" },
  // 紅の残響: (Silk Black) / Faded Ink / Old Timber / Antique Ruby
  { name: "紅の残響",               primary: "#b05848", text: "#8a6040", bg: "#e8e0d8" },
  // 陽光の果樹園: (Bark Ash) / Sunny Saffron / Warm Gold / Light Yellow
  { name: "陽光の果樹園",            primary: "#e8c040", text: "#e09020", bg: "#f8f0c0" },

  // ── スクリーンショット12 行2 ────────────────────────────────────
  // 紫影の断片: (Abyss Ink) / Cyber Plum / Electric Iris / Ether Lilac
  { name: "紫影の断片",             primary: "#a058d0", text: "#7040a0", bg: "#d8c8e8" },
  // 空と葉の間に: (Moss Shadow) / Warm Orange / Warm Sand / Light Cream
  { name: "空と葉の間に",            primary: "#d0a878", text: "#c07848", bg: "#f0e8d8" },
  // 葉の滴、香る刻: (Ash Black) / Deep Brick / Hazelnut Clay / Honey Amber
  { name: "葉の滴、香る刻",          primary: "#c09060", text: "#8a3028", bg: "#e8c880" },
  // 心を綴じる糸: (Deep Denim) / Vintage Teal / Blue Whisper / Linen Blue
  { name: "心を綴じる糸",            primary: "#90b8c8", text: "#408888", bg: "#e0e8f0" },
  // 砂色の街路: (Vintage Wood) / Soft Brume / Dawn Khaki / Morning Fog
  { name: "砂色の街路",             primary: "#c8b898", text: "#9c8068", bg: "#e8e4d8" },
  // 夕凪の息: (Faded Ocean) / Silver Sky / Sunset Coral / Pale Blush
  { name: "夕凪の息",               primary: "#f09080", text: "#a0b8c0", bg: "#f8e8e0" },
  // 檸檬の残響: (darkest) / Old Honey / Sand Corner / Fresh Light
  { name: "檸檬の残響",             primary: "#e0c060", text: "#c8a828", bg: "#f8f0d8" },

  // ── スクリーンショット13 行1 ────────────────────────────────────
  // 恋するティーセット: (darkest) / Rose Orange / Amber Glow / Ivory Mix
  { name: "恋するティーセット",      primary: "#e0b060", text: "#e08060", bg: "#f8f0e0" },
  // 淡く晴れる日: (Breeze Granite) / Drop Mauve / Coral Breeze / Soft White
  { name: "淡く晴れる日",            primary: "#f0a890", text: "#909898", bg: "#f8f0ec" },
  // 夢嗅いの灯: (Note Whisper) / Night Grape / Lilac Charm / Bonnet Dawn
  { name: "夢嗅いの灯",             primary: "#c090c0", text: "#704080", bg: "#f0e8d8" },
  // 海の子守唄: (Silicon Sea) / Harbor Sky / Stone Taupe / Silver Shell
  { name: "海の子守唄",             primary: "#b0b8a8", text: "#6898b8", bg: "#e8e8e0" },
  // 午後のシトラス: (Cocoa Bark) / Amber Glow / Sun Drop / Sugar Milk
  { name: "午後のシトラス",          primary: "#e8d020", text: "#d08830", bg: "#f8f4e0" },
  // 風紡ぎの丘: (Old Timber) / Ash Mocha / Fog Blue / Morning Fog
  { name: "風紡ぎの丘",             primary: "#a0b0c0", text: "#a08868", bg: "#e8eef0" },
  // 夜明けのベリー: (Indigo Night) / Ocean Noir / Berry Wine / Pale Ash
  { name: "夜明けのベリー",          primary: "#9a3060", text: "#202848", bg: "#e0d8d8" },

  // ── スクリーンショット13 行2 ────────────────────────────────────
  // カフェの香り: (Mocha Ash) / Nut Brown / Latte Beige / Soft Nougat
  { name: "カフェの香り",            primary: "#d4b890", text: "#a07848", bg: "#f0e8d8" },
  // 木の香る家: (Maple Wood) / Warm Clay / Cozy Mustard / Clear Cream
  { name: "木の香る家",             primary: "#c8a040", text: "#b07850", bg: "#f0e8d0" },
  // 北風を抱いて: (Ink Navy) / Misty Sea / Haze Cloud / Pale Sky
  { name: "北風を抱いて",            primary: "#b8d0e0", text: "#6090a8", bg: "#e8f0f8" },
  // 空の王冠: (Classic Umber) / Golden Veil / Stone Blue / Dusty Cream
  { name: "空の王冠",               primary: "#d4b040", text: "#7890a8", bg: "#f0e8d8" },
  // 木箱のオレンジ: (Cocoa Ash) / Maple Fizz / Summer Amber / Light
  { name: "木箱のオレンジ",          primary: "#e08030", text: "#e05820", bg: "#f0e0c8" },
  // 赫の果実: (Pure Noir) / Dark Cherry / Passion Red / Rose Milk
  { name: "赫の果実",               primary: "#e03050", text: "#8a1830", bg: "#f8e0e4" },
  // 風を編む旅: (Forest Olive) / Horizon Green / Sky Veil / Soft Cloud
  { name: "風を編む旅",             primary: "#98c0b0", text: "#5a8868", bg: "#e8f0e8" },

  // ── スクリーンショット14 行1 ────────────────────────────────────
  // 影のボタニカ: (Twilight Ink) / Moonlit Navy / Moss Green / Dust Stone
  { name: "影のボタニカ",            primary: "#6a9860", text: "#283868", bg: "#d8d8c8" },
  // 風のアトリウム: (Mist Grey) / Cool Breeze / Front Dew / Cloud Milk
  { name: "風のアトリウム",          primary: "#c0d0d8", text: "#90a8b8", bg: "#f4f4f4" },
  // 枯葉の手紙: (Burnt Leaf) / Maple Spice / Camel Brown / Antique Beige
  { name: "枯葉の手紙",             primary: "#c09058", text: "#b06030", bg: "#f0e0c8" },
  // 深紅の帳: (Obsidian Red) / Dark Cherry / Passion Red / Rose Ivory
  { name: "深紅の帳",               primary: "#d04060", text: "#8a1830", bg: "#f0e0e0" },
  // 秋陽のシルエット: (darkest) / Autumn Flame / Honey Sun / Milk Agate / Soft Cream
  { name: "秋陽のシルエット",        primary: "#e8d0a0", text: "#e09030", bg: "#f8f0e0" },
  // 凪ぐ心、静かな朝: (Deep Fern) / Misty Mint / Slate Blue / Winter Air
  { name: "凪ぐ心、静かな朝",       primary: "#90a8b0", text: "#7ab090", bg: "#e8eeee" },
  // 橙の夢路: (Autumn Back) / Rust Orange / Autumn Glow / Ivory Milk
  { name: "橙の夢路",               primary: "#e8a840", text: "#c05828", bg: "#f8f0e0" },

  // ── スクリーンショット14 行2 ────────────────────────────────────
  // 青を溶かして: (Bitter Cacao) / Deep Marine / Cool Breeze / Soft White
  { name: "青を溶かして",            primary: "#88b0d0", text: "#204088", bg: "#f0f4f8" },
  // 君へ結ぶ: (Baked Mocha) / Rose Camil / Peach Mocha / Milk Tea
  { name: "君へ結ぶ",               primary: "#f0b8a0", text: "#d09098", bg: "#f8ece4" },
  // 紫影の庭: (Forest Veil) / Shadow Plum / Mystic Lilac / Cloud
  { name: "紫影の庭",               primary: "#c090c8", text: "#804080", bg: "#e8e0f0" },
  // 碧海の囁き: (Tropic Wave) / Tide Mint / Sky Blue / Shell Cream
  { name: "碧海の囁き",             primary: "#90c8d0", text: "#60b0a8", bg: "#f0f0e8" },
  // 焔色の編み目: (Night Pine/darkest) / Maple Bark / Amber Gold / Ivory Glow
  { name: "焔色の編み目",            primary: "#c89040", text: "#9a5030", bg: "#f0e8c8" },
  // 蒼灰の地層: (Misty Gallery) / Cool Beige / Blue Bliss / Silver Fog
  { name: "蒼灰の地層",             primary: "#b0c0c8", text: "#a09888", bg: "#e8e8e8" },
  // 真夜中の花宴: (Shadow Onyx) / Plum Velvet / Rose Quartz / Soft Pearl
  { name: "真夜中の花宴",            primary: "#d0a0b0", text: "#9a4878", bg: "#f0e8e8" },

  // ── スクリーンショット15 行1 ────────────────────────────────────
  // 銀河のポラロイド: (Royal Night) / Foggy Blue / Starburst Gold / Lunar Beige
  { name: "銀河のポラロイド",         primary: "#d0a030", text: "#5878a8", bg: "#e8e0c8" },
  // 実り色の序章: (Rustic Orange) / Maple Honey / Oat Milk / Soft Ivory
  { name: "実り色の序章",            primary: "#e8d898", text: "#c89040", bg: "#f8f0e0" },
  // 恋のひとしずく: (Deep Berry) / Passion Red / Candy Pink / Sub Rose
  { name: "恋のひとしずく",          primary: "#f090a8", text: "#c03048", bg: "#f8d8e0" },
  // 蒼き微睡み: (Shadow Ink) / Ocean Teal / Icy Brine / Ocean Veil
  { name: "蒼き微睡み",             primary: "#90c0c8", text: "#408890", bg: "#e8f0f0" },
  // ルージュの足音: (Indigo Fog) / Berry Red / Honey Oak / Mint Silver
  { name: "ルージュの足音",          primary: "#d8a058", text: "#a03040", bg: "#d8d8d0" },
  // 風渡る青壁: (Ink Blue) / Midnight Teal / Misty Ocean / Pale Luster
  { name: "風渡る青壁",             primary: "#7098a8", text: "#205878", bg: "#d8e8f0" },
  // 夕空の綿雲: (darkest) / Medium Peach / Canvas Peach / Silver Lily
  { name: "夕空の綿雲",             primary: "#f0b8a0", text: "#d08870", bg: "#f8e8e0" },

  // ── スクリーンショット15 行2 ────────────────────────────────────
  // 果皮の香り: (Bitter Orange) / Mango Glow / Honey Sand / Fresh Lemon
  { name: "果皮の香り",             primary: "#e0c060", text: "#e08028", bg: "#f0e8a0" },
  // 苺と淡雪: (Rustic Clay) / Copper Rose / Camel Sand / Cream Cloud
  { name: "苺と淡雪",               primary: "#e0c0a0", text: "#c07870", bg: "#f4ece0" },
  // ベロアの階夢: (Ash Smoke) / Black Cherry / Candy Rouge / Light Pink
  { name: "ベロアの階夢",            primary: "#d03060", text: "#7a1030", bg: "#f0d0d8" },
  // 深翠の天蓋: (Black Walnut) / Forest Moss / Herb Garden / Wheat Mist
  { name: "深翠の天蓋",             primary: "#5a8848", text: "#2a5030", bg: "#d8e0c0" },
  // 蒼灰の街角: (Harbor Blue) / Steel Ash / Silver Haze / Winters Fog
  { name: "蒼灰の街角",             primary: "#c0c8d0", text: "#809098", bg: "#e8eef0" },
  // 星屑の海: (Cosmic Ink) / Twilight Plum / Deep Sky / Milky Glow
  { name: "星屑の海",               primary: "#5080c0", text: "#7050a0", bg: "#e0d8f0" },
  // エメラルドの祝宴: (Forest Green) / Antique Gold / Ivory Gloss / Misty Silver
  { name: "エメラルドの祝宴",        primary: "#d4b048", text: "#608040", bg: "#f0ece0" },

  // ── 追加バッチ（スクリーンショット16〜20） ───────────────────────

  // ── スクリーンショット16 行1 ────────────────────────────────────
  { name: "薄明の空彩",              primary: "#e8a888", text: "#c08090", bg: "#f8e0d0" },
  { name: "レンガ色の陽光",          primary: "#d09040", text: "#c06030", bg: "#f0e0c0" },
  { name: "果実の夜想曲",            primary: "#d0a0c0", text: "#804070", bg: "#f8e0e8" },
  { name: "午後三時の宝石",          primary: "#f0e0c0", text: "#e07060", bg: "#f8f0e8" },
  { name: "バニラ色のやすらぎ",      primary: "#e0c060", text: "#c08830", bg: "#f8f0d8" },
  { name: "古都の深呼吸",            primary: "#909848", text: "#c06840", bg: "#f0e8d0" },
  { name: "空と歩幅",                primary: "#a8c8e0", text: "#5888b8", bg: "#f0f0f0" },

  // ── スクリーンショット16 行2 ────────────────────────────────────
  { name: "灯火のオータム",          primary: "#e0c050", text: "#b07830", bg: "#f8f0d8" },
  { name: "青空トイボックス",        primary: "#4090b0", text: "#e09020", bg: "#f8f8f4" },
  { name: "波紋の幻想",              primary: "#90d0c0", text: "#60b0b8", bg: "#d8f0f0" },
  { name: "柔らかな風音",            primary: "#b09878", text: "#809868", bg: "#e8e8e0" },
  { name: "気高き花影",              primary: "#b03050", text: "#708048", bg: "#f0d8d8" },
  { name: "きらめく灰夜",            primary: "#a0a8a8", text: "#c07830", bg: "#e8e8e8" },
  { name: "宵空の閃光",              primary: "#b068a0", text: "#8098c0", bg: "#f0d8e0" },

  // ── スクリーンショット17 行1 ────────────────────────────────────
  { name: "街色のワルツ",            primary: "#e8b898", text: "#a08090", bg: "#f0e8e0" },
  { name: "秋育の茶会",              primary: "#b09068", text: "#8a5a38", bg: "#e0d0c0" },
  { name: "静かな知の灯",            primary: "#d0b898", text: "#c08868", bg: "#e8e4e0" },
  { name: "夜想の書庫",              primary: "#c0b888", text: "#706088", bg: "#f0ece0" },
  { name: "春風のクロス",            primary: "#f09880", text: "#40b0a0", bg: "#f8f4e0" },
  { name: "静寂のエスプレッソ",      primary: "#8a7848", text: "#508048", bg: "#d8d8d0" },
  { name: "夕凪のヴェール",          primary: "#e0c030", text: "#c09020", bg: "#f0e8c0" },

  // ── スクリーンショット17 行2 ────────────────────────────────────
  { name: "緑風のガーデン",          primary: "#8ab058", text: "#508030", bg: "#f0ece0" },
  { name: "褪せゆく花時",            primary: "#d09898", text: "#e08898", bg: "#f0e0d8" },
  { name: "南風のオアシス",          primary: "#4898b0", text: "#909848", bg: "#f0e8d0" },
  { name: "香るひととき",            primary: "#e0c050", text: "#c08830", bg: "#f8f0d8" },
  { name: "桃色スパークル",          primary: "#f8c0c0", text: "#e870a0", bg: "#f8f0f0" },
  { name: "彩りの吐息",              primary: "#a8c8e0", text: "#e08090", bg: "#f8f4f0" },
  { name: "瞳に宿る影",              primary: "#b09878", text: "#806040", bg: "#e8e0d8" },

  // ── スクリーンショット18 行1 ────────────────────────────────────
  { name: "甘やかな朝",              primary: "#d0a838", text: "#90b878", bg: "#d8f0f0" },
  { name: "茜空の航路",              primary: "#d0a098", text: "#6878a0", bg: "#f0e8d8" },
  { name: "爽風のボエム",            primary: "#90a8a0", text: "#6a9070", bg: "#f4f4f0" },
  { name: "秘密の赤",                primary: "#788848", text: "#c03040", bg: "#e8e0d0" },
  { name: "蒼影のフィルム",          primary: "#80b0c0", text: "#3880a8", bg: "#f0ece8" },
  { name: "朝摘みの果実",            primary: "#e09848", text: "#e06820", bg: "#f0e8d8" },
  { name: "煉瓦街の停留所",          primary: "#a0b0c0", text: "#5070a8", bg: "#f0e8e0" },

  // ── スクリーンショット18 行2 ────────────────────────────────────
  { name: "深碧のアトリエ",          primary: "#b0c8d8", text: "#c06830", bg: "#f0eeec" },
  { name: "空の綴り",                primary: "#d8c070", text: "#7898c0", bg: "#f8f4ec" },
  { name: "灯りのポルカ",            primary: "#7898b8", text: "#e05838", bg: "#f0e8d8" },
  { name: "アボカド日和",            primary: "#b0c858", text: "#7a9040", bg: "#f8f0d8" },
  { name: "シュガールームの冒険",    primary: "#f0a8c0", text: "#e07898", bg: "#f8e0f0" },
  { name: "月影の幻想峰",            primary: "#c0c8d0", text: "#8090a0", bg: "#f0f0ec" },
  { name: "夏色レトロ",              primary: "#e0a898", text: "#387888", bg: "#e8f0f0" },

  // ── スクリーンショット19 行1 ────────────────────────────────────
  { name: "夢見草のお茶会",          primary: "#d0b840", text: "#808040", bg: "#f0e8d0" },
  { name: "煌夏のサンセット",        primary: "#80d0e0", text: "#d0a830", bg: "#e8f4f8" },
  { name: "天河の宝石",              primary: "#50a0a8", text: "#308858", bg: "#e8f0f0" },
  { name: "翠光のワルツ",            primary: "#90c8b0", text: "#488878", bg: "#d8f0e8" },
  { name: "暖陽の図書室",            primary: "#d4b030", text: "#b8a050", bg: "#f0ecd0" },
  { name: "海風のメモリー",          primary: "#f0d8c8", text: "#7098a8", bg: "#f4f0ec" },
  { name: "乙女の薔薇園",            primary: "#f0c0c0", text: "#d08090", bg: "#f8f0f0" },

  // ── スクリーンショット19 行2 ────────────────────────────────────
  { name: "運河に揺れる影",          primary: "#b0a898", text: "#c07848", bg: "#e8e0d8" },
  { name: "星条のシュガー",          primary: "#e89898", text: "#d02838", bg: "#f8e8e8" },
  { name: "月光の首飾り",            primary: "#e0c858", text: "#d4a828", bg: "#f8f4e8" },
  { name: "空白の設計図",            primary: "#d0c8b8", text: "#a09070", bg: "#f0ece8" },
  { name: "彩りのシャッター",        primary: "#e09060", text: "#c05830", bg: "#f0e0c8" },
  { name: "なみうたの記憶",          primary: "#c0d0d8", text: "#7098b0", bg: "#f0ece0" },
  { name: "とろける瞬き",            primary: "#f0b0c0", text: "#e08090", bg: "#f8e8e8" },

  // ── スクリーンショット20 行1 ────────────────────────────────────
  { name: "静寂に潜む香り",          primary: "#c08880", text: "#606858", bg: "#d8d0d0" },
  { name: "きらめきのバカンス",      primary: "#e8d040", text: "#e890a8", bg: "#f8f0e0" },
  { name: "龍青の階層",              primary: "#7090c0", text: "#4060a8", bg: "#d8e8f8" },
  { name: "枯れ色のブーケ",          primary: "#c09878", text: "#a06038", bg: "#e8e4e0" },
  { name: "宵の空気に舞って",        primary: "#c8b8d0", text: "#7090c0", bg: "#f0e8f0" },
  { name: "しゅわりと弾けて",        primary: "#f8c0c8", text: "#e08090", bg: "#f8f8c0" },
  { name: "潮騒のオリーブ",          primary: "#c0c8a0", text: "#709088", bg: "#f4f0ec" },

  // ── スクリーンショット20 行2 ────────────────────────────────────
  { name: "太陽を見上げて",          primary: "#e8d020", text: "#78c0c8", bg: "#e0f8c0" },
  { name: "ベリーショコラの夢",      primary: "#7a9858", text: "#d03058", bg: "#f8e0e8" },
  { name: "グリッターの魔法",        primary: "#d0a028", text: "#9060a8", bg: "#f8e8d8" },
  { name: "花飾りのミント",          primary: "#a0c898", text: "#589070", bg: "#e8f4e8" },
  { name: "赤と影の静寂",            primary: "#c0c8b0", text: "#d08070", bg: "#f0f0ec" },
  { name: "水彩と果実",              primary: "#80b8c0", text: "#a060a0", bg: "#f0f0d0" },
  { name: "トロピカルの影",          primary: "#c0c898", text: "#508060", bg: "#f0f8d0" },
];
