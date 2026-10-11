import { brand } from "@/lib/brand";

/** Ukázkové znění pro souhlas. Před ostrým provozem doplňte skutečné údaje správce. */
export const privacyNotice = {
  title: "Zásady zpracování osobních údajů",
  intro: `Odesláním poptávky prostřednictvím kalkulačky ${brand.name} souhlasíte se zpracováním osobních údajů v rozsahu níže.`,
  sections: [
    {
      heading: "Správce údajů",
      body: `${brand.name} (dále jen „správce“). Konkrétní identifikační a kontaktní údaje správce doplní provozovatel před spuštěním.`,
    },
    {
      heading: "Jaké údaje zpracováváme",
      body: "Jméno a příjmení, telefon, e-mail, město a PSČ, poznámka k poptávce, volitelně fotografie místa a údaje o zvolené konfiguraci (typ konstrukce, rozměry, doplňky, termín).",
    },
    {
      heading: "Účel a právní základ",
      body: "Údaje zpracováváme za účelem vyřízení poptávky, přípravy orientační nabídky a domluvy zaměření. Právním základem je váš souhlas a oprávněný zájem na vyřízení obchodní poptávky.",
    },
    {
      heading: "Doba uchování",
      body: "Údaje uchováváme po dobu nutnou k vyřízení poptávky, nejdéle 24 měsíců od odeslání, pokud zákon nestanoví delší dobu nebo nevznikne smluvní vztah.",
    },
    {
      heading: "Příjemci údajů",
      body: "Údaje mohou být předány zpracovatelům zajišťujícím e-mailovou komunikaci, provoz webu nebo evidenci poptávek, výhradně v rozsahu potřebném pro uvedené účely.",
    },
    {
      heading: "Vaše práva",
      body: "Máte právo na přístup k údajům, jejich opravu nebo výmaz, omezení zpracování, námitku, přenositelnost a odvolání souhlasu. Odvoláním souhlasu není dotčena zákonnost zpracování do okamžiku odvolání. Můžete se také obrátit na Úřad pro ochranu osobních údajů.",
    },
  ],
} as const;
