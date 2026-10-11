import type {
  Addons,
  Anchoring,
  StepId,
  StructureGroup,
  StructureType,
  Timeline,
} from "@/types/calculator";

export const priceDisclaimer =
  "Konečná cena závisí na přesném zaměření a stavební připravenosti.";

export const primaryCta = "Odeslat poptávku a rezervovat zaměření zdarma";

export const calculatorSteps: Array<{ id: StepId; label: string; short: string }> = [
  { id: 1, label: "Konstrukce", short: "Typ" },
  { id: 2, label: "Rozměry", short: "Rozměry" },
  { id: 3, label: "Doplňky", short: "Doplňky" },
  { id: 4, label: "Lokalita", short: "Místo" },
  { id: 5, label: "Poptávka", short: "Kontakt" },
];

export const structureGroupCatalog: Record<StructureGroup, { title: string; short: string }> = {
  pergola: { title: "Pergoly", short: "Pergoly" },
  winter_garden: { title: "Zimní zahrady", short: "Zimní zahrady" },
  carport: { title: "Přístřešky pro auto", short: "Přístřešky" },
};

export const structureCatalog: Record<
  StructureType,
  {
    title: string;
    short: string;
    description: string;
    group: StructureGroup;
    image: string;
  }
> = {
  bioclimatic: {
    group: "pergola",
    title: "Bioklimatická hliníková pergola",
    short: "Bioklimatická",
    description: "Otočné lamely regulují stín, vzduch i déšť.",
    image: "/structures/bioclimatic.jpg",
  },
  glass: {
    group: "pergola",
    title: "Zasklená / prosklená pergola",
    short: "Zasklená",
    description: "Střecha ze skla pouští dovnitř maximum světla.",
    image: "/structures/glass.jpg",
  },
  polycarbonate: {
    group: "pergola",
    title: "Polykarbonátová pergola",
    short: "Polykarbonát",
    description: "Lehká střecha, spolehlivá proti dešti a sněhu.",
    image: "/structures/polycarbonate.jpg",
  },
  fixed_roof: {
    group: "pergola",
    title: "Hliníková pergola s fixní střechou",
    short: "Fixní střecha",
    description: "Pevná hliníková střecha bez pohyblivých částí.",
    image: "/structures/fixed-roof.jpg",
  },
  fabric_sliding: {
    group: "pergola",
    title: "Pergola s posuvnou látkovou střechou",
    short: "Posuvná látka",
    description: "Voděodolná látka, kterou zasunete podle počasí.",
    image: "/structures/fabric-sliding.jpg",
  },
  fabric_rolling: {
    group: "pergola",
    title: "Pergola s rolovací látkovou střechou",
    short: "Rolovací látka",
    description: "Látková střecha se sroluje i na velké ploše.",
    image: "/structures/fabric-rolling.jpg",
  },
  simple: {
    group: "pergola",
    title: "Pergola Simple",
    short: "Simple",
    description: "Základní hliníková konstrukce, levnější varianta na terasu.",
    image: "/structures/simple.jpg",
  },
  photovoltaic: {
    group: "pergola",
    title: "Fotovoltaická pergola",
    short: "Fotovoltaika",
    description: "Střecha s panely dává stín a vyrábí elektřinu.",
    image: "/structures/photovoltaic.jpg",
  },
  winter_garden: {
    group: "winter_garden",
    title: "Sezónní / nezateplená zimní zahrada",
    short: "Sezónní",
    description: "Prosklení na jaro až podzim, bez plné izolace.",
    image: "/structures/winter-garden.jpg",
  },
  winter_insulated: {
    group: "winter_garden",
    title: "Zateplená zimní zahrada",
    short: "Zateplená",
    description: "Celoroční prosklený prostor s izolací.",
    image: "/structures/winter-insulated.jpg",
  },
  carport: {
    group: "carport",
    title: "Přístřešek pro auto Carbo",
    short: "Carbo",
    description: "Jednoduchý hliníkový přístřešek nad stání.",
    image: "/structures/carport.jpg",
  },
  carport_trapez: {
    group: "carport",
    title: "Přístřešek pro auto Trapez",
    short: "Trapez",
    description: "Trapézová střecha, odolná a praktická.",
    image: "/structures/carport-trapez.jpg",
  },
  carport_thermo: {
    group: "carport",
    title: "Přístřešek pro auto Thermo",
    short: "Thermo",
    description: "Komfortnější varianta s lepší izolací střechy.",
    image: "/structures/carport-thermo.jpg",
  },
};

export const structureGroupsList = (Object.keys(structureGroupCatalog) as StructureGroup[]).map(
  (id) => ({ id, ...structureGroupCatalog[id] }),
);

export function structuresInGroup(group: StructureGroup) {
  return (Object.keys(structureCatalog) as StructureType[])
    .filter((id) => structureCatalog[id].group === group)
    .map((id) => ({ id, ...structureCatalog[id] }));
}

export const anchoringCatalog: Record<Anchoring, { title: string; description: string }> = {
  wall: {
    title: "Kotvená ke zdi",
    description: "Jedna strana navazuje na dům. Méně sloupů a patek.",
  },
  freestanding: {
    title: "Samostojná",
    description: "Vlastní konstrukce v ploše. Víc sloupů a základů.",
  },
};

export const timelineCatalog: Record<Timeline, { title: string; description: string }> = {
  asap: {
    title: "Co nejdříve",
    description: "Chceme realizaci v nejbližším volném termínu.",
  },
  within_3_months: {
    title: "Do 3 měsíců",
    description: "Plánujeme montáž v této sezóně.",
  },
  next_year: {
    title: "Pouze orientační poptávka na příští rok",
    description: "Zatím srovnáváme rozpočet, nespěcháme.",
  },
};

export const addonCatalog = {
  led: {
    title: "LED osvětlení",
    description: "Stmívatelné světlo po obvodu střechy.",
    image: "/structures/addons/led.jpg",
  },
  screens: {
    title: "Screenové rolety",
    description: "Boční rolety proti větru a slunci, až 3 strany.",
    image: "/structures/addons/screens.jpg",
  },
  sensors: {
    title: "Dešťové a větrné senzory",
    description: "Automaticky zavřou lamely nebo stáhnou rolety.",
    image: "/structures/addons/sensors.jpg",
  },
  heaterPrep: {
    title: "Příprava na infrazářič",
    description: "Výztuha a kabeláž pro pozdější topení.",
    image: "/structures/addons/heater.jpg",
  },
  glassWalls: {
    title: "Posuvné prosklení",
    description: "Skleněné stěny po stranách pro víc tepla a ticha.",
    image: "/structures/addons/glass.jpg",
  },
  curtains: {
    title: "Textilní závěsy",
    description: "Látkové bočnice pro soukromí a měkké stínění.",
    image: "/structures/addons/curtains.jpg",
  },
} as const;

/** Práce mimo m² střechy, napíšou se do poznámky. */
export const otherServices = [
  "Terasy",
  "Oplocení a vjezdové brány",
  "Podlahy",
  "Zámková dlažba",
  "Klimatizace",
  "Tepelná čerpadla",
  "Markýzy",
  "Prosklené stěny",
];

export function screenSidesLabel(count: number) {
  if (count === 1) return "1 strana";
  if (count >= 2 && count <= 4) return `${count} strany`;
  return `${count} stran`;
}

export function selectedAddonLabels(addons: Addons) {
  const labels: string[] = [];
  if (addons.led) labels.push("LED osvětlení");
  if (addons.screenSides > 0) labels.push(`Screeny · ${screenSidesLabel(addons.screenSides)}`);
  if (addons.sensors) labels.push("Senzory déšť a vítr");
  if (addons.heaterPrep) labels.push("Příprava na infrazářič");
  if (addons.glassWalls) labels.push("Posuvné prosklení");
  if (addons.curtains) labels.push("Textilní závěsy");
  return labels;
}
