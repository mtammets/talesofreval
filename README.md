# Tales Of Reval

## Tänane seis

Figma ühendus on olemas ja töötab.

Kinnitatud ligipääs:
- Figma fail: `ToR-2024-Veeb`
- File key: `XzEEHzFZlNHs6hEZpdLKFX`
- Codex saab failist metadata ja design context'i kätte

Live serveri õige app tuli ka välja:
- live document root Zone'is: `tor-full-stack`
- see projekt ei ole vana staatiline sait ega WordPress
- `site/` kaustas on nüüd live serverist toodud päris full-stack rakendus
- MongoDB sõltuvus on nüüd avalikult saidilt eemaldatud
- kodulehe sisu tuleb nüüd lokaalsetest failidest, mitte andmebaasist
- backend jäi alles ainult e-mailivormide jaoks

## Projekti struktuur

`site/` sees:
- `frontend/` = React klient
- `backend/` = Express API
- `backend/.env` = olemas

Praegune arhitektuur:
- `frontend` renderdab kogu avaliku saidi lokaalse fallback-sisu pealt
- `backend` teenindab ainult `/email` endpoint'e
- mailide saatmine on mõeldud Zone `localhost:25` SMTP relay jaoks
- MongoDB-d ega Firebase'i pole enam vaja

## Arendus

Käivita:

```bash
npm run dev
```

Rooti `npm run dev` käivitab:
- frontend `site/frontend`
- backend `site/backend`

Terminal näitab alati:
- `Arvutis:` kohaliku aadressi
- `Telefonis:` sama WiFi võrguaadressi telefonist testimiseks

Märkus:
- avalik sisu töötab nüüd ka ilma backendita
- backendit on vaja ainult vormide jaoks (`Book now`, `Contact us`, `Free tour`)

## Mis on tehtud

- Vana vale staatiline sait eemaldati projektist
- Jäeti alles ainult arenduseks vajalik root setup
- `site/` kaust pandi aktiivseks rakenduse kaustaks
- Frontendi ja rooti sõltuvused paigaldati uuesti
- Backendi `env` fail nimetati õigeks `.env` failiks
- Kontrolliti, et frontend käivitub lokaalselt
- Kontrolliti, et backend loeb `.env` faili sisse
- Avalikud tekstid, teenused, team, story ja tuurikuupäevad viidi lokaalsete fallback-failide peale
- Backendi Mongo/Firebase route'id, mudelid ja kontrollerid eemaldati
- `Book now`, `Contact us` ja `Free tour` jäid tööle läbi Node + Nodemailer voolu
- PM2 config lihtsustati Zone jaoks
- proxy jäeti alles ainult `/email` endpoint'ile

## Praegune loogika

Avalik sait:
- ei kasuta enam MongoDB-d
- ei lae enam `/texts`, `/services`, `/events`, `/storytellers`, `/tours` API-sid
- kasutab lokaalset sisu failidest `site/frontend/src/content/`

Backend:
- käivitub ilma andmebaasita
- vastab `GET /health`
- teenindab ainult:
  - `POST /email`
  - `POST /email/contact`
  - `POST /email/free-tour`

E-mailide saatmine:
- kasutab `nodemailer` seadistust `host: localhost`, `port: 25`
- see on mõeldud Zone serveri kohaliku mail relay jaoks
- lokaalses arvutis ei pruugi mail tegelikult välja minna, kui kohalik SMTP puudub

Lokaalne päris e-maili test:
- backend toetab nüüd ka tavalist SMTP seadistust `.env` kaudu
- kui määrad `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, siis saad testida oma päris e-mailidega ka lokaalselt
- kui `SMTP_HOST` puudub, jääb vaikimisi Zone-stiilis `localhost:25` režiim
- `MAIL_TO` määrab, kuhu sinu saidi vormiteavitused lähevad
- `MAIL_FROM` määrab, millise saatja aadressiga kiri välja läheb

## Homme edasi

Järgmine loogiline samm:

1. Kontrollida Zone serveris, et `localhost:25` kaudu maili saatmine toimib päriselt
2. Kontrollida, et `Book now`, `Contact us` ja `Free tour` jõuavad `info@talesofreval.ee`
3. Vajadusel viia `Free tour` kuupäevad eraldi serveri JSON faili, kui neid on vaja muuta ilma redeploy'ta
4. Soovi korral eemaldada järgmises passis ka Stripe/Virtual Tour välisteenus, kui eesmärk on täiesti minimaalne Zone-lahendus
