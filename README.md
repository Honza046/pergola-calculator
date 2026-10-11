# Kalkulačka poptávek

Orientační konfigurátor pro pergoly, prosklené přístřešky a carporty. Landing page i vložitelný widget.

## Spuštění

```bash
npm install
cp .env.example .env.local
npm run dev
```

Bez `RESEND_API_KEY` a webhooku se v režimu `next dev` poptávka přijme a vypíše do logu serveru. V produkci bez nastaveného doručení endpoint vrátí chybu, aby se zpráva neztratila.

## Ceny a značka

- Sazby: `lib/calculator.ts` → `priceConfig`
- Texty typů, doplňků a disclaimer: `lib/catalog.ts`
- Název firmy: `lib/brand.ts` nebo `NEXT_PUBLIC_BRAND_NAME`

Referenční výsledek: bioklimatická pergola 5 × 3,5 m kotvená ke zdi, bez doplňků → 165 000 – 195 000 Kč bez DPH.

## Vložení na web

```html
<iframe
  src="https://vase-domena.cz/embed"
  title="Kalkulačka poptávky"
  data-pergola-calculator
  style="width:100%;border:0;min-height:760px"
></iframe>
<script src="https://vase-domena.cz/embed.js" async></script>
```

`embed.js` poslouchá zprávy `source: "pergola-calculator"` a nastavuje výšku iframe. Po odeslání poptávky přijde i `{ type: "lead", leadId }`.

## E-mail a tabulka

Resend posílá poptávku na `LEAD_TO_EMAIL` a potvrzení klientovi. `RESEND_FROM` musí být ověřená doména.

Google Sheets přes Apps Script. Webová aplikace nasazená jako „kdokoli“ s přístupem POST. Tajemství dejte do vlastností skriptu `WEBHOOK_SECRET` a do `GOOGLE_SHEETS_WEBHOOK_SECRET`.

```javascript
function doPost(e) {
  var body = JSON.parse(e.postData.contents);
  var expected = PropertiesService.getScriptProperties().getProperty("WEBHOOK_SECRET");
  if (expected && body.secret !== expected) {
    return ContentService.createTextOutput("unauthorized");
  }
  var sheet = SpreadsheetApp.getActive().getSheetByName("Poptavky") || SpreadsheetApp.getActive().getSheets()[0];
  var row = body.row;
  if (sheet.getLastRow() === 0) sheet.appendRow(Object.keys(row));
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  sheet.appendRow(headers.map(function (key) { return row[key] == null ? "" : row[key]; }));
  return ContentService.createTextOutput("ok");
}
```

Fotografie jdou jako přílohy e-mailu majiteli. Do tabulky se ukládá jen jejich počet.

## Testy

```bash
npm test
```
