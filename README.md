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
  - `GET /api/story-events`
  - story feed admin CRUD endpoint'e `/api/story-events/admin` all

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

Story feed admin:
- URL: `/login`
- pärast sisselogimist näeb admin päris saiti ning saab `Our story` sündmusi otse `/story` lehel lisada, muuta ja kustutada
- sisselogimine käib nüüd tavalise login-vormiga üle serveripoolse sessiooni ja `HttpOnly` cookie abil
- minimaalsed võtmed:
  - `ADMIN_USERNAME`
  - `ADMIN_SESSION_SECRET`
- soovitus productionis:
  - kasuta `ADMIN_PASSWORD_HASH` väärtust kujul `scrypt$<saltBase64>$<hashBase64>`
  - jäta `ADMIN_PASSWORD` ainult lokaalseks või üleminekuvariandiks
- admin salvestab `Our story` sündmused faili `site/backend/data/story-events.json`
- üleslaetud story pildid salvestuvad kausta `site/backend/uploads/story/`

Püsiv salvestus Zone'is:
- vaikimisi salvestab backend lokaalis failid repo sisse:
  - `site/backend/data/site-settings.json`
  - `site/backend/data/story-events.json`
  - `site/backend/uploads/site/`
  - `site/backend/uploads/story/`
- productionis on mõistlik panna `.env` faili:
  - `APP_STORAGE_DIR=/data01/virt72693/domeenid/www.talesofreval.ee/app-storage`
- siis salvestuvad kõik edit-mode muudatused repo-välisesse püsikausta:
  - `app-storage/data/site-settings.json`
  - `app-storage/data/story-events.json`
  - `app-storage/uploads/site/`
  - `app-storage/uploads/story/`
- esimese käivituse ajal kopeerib backend vaikimisi JSON algandmed sinna automaatselt
- nii ei kirjuta järgmine `git pull` ega deploy edititud sisu üle

## Preview aadress Zone'is

Preview sait on seadistatud kliendile kontrollimiseks enne päris live'i vahetust:
- avalik aadress: `https://preview.talesofreval.ee`
- Zone alamdomeen: `preview.talesofreval.ee`
- DNS/veebiserver: Zone alamdomeen, mitte käsitsi lisatud eraldi A-kirje
- subdomain proxy: `mod_proxy` port `5021`
- PM2 rakendus: `tales-preview`
- PM2 script: `/data01/virt72693/domeenid/www.talesofreval.ee/tor-preview/backend/server.js`
- rakenduse kaust: `/data01/virt72693/domeenid/www.talesofreval.ee/tor-preview`
- preview storage: `/data01/virt72693/domeenid/www.talesofreval.ee/preview-storage`
- Zone loopback IP: `127.1.67.5`

Preview `.env` olulised väärtused:

```env
PORT=5021
NODE_ENV=production
APP_STORAGE_DIR=/data01/virt72693/domeenid/www.talesofreval.ee/preview-storage
PREVIEW_NOINDEX=true
BIND_HOST=127.1.67.5
MAIL_TO=mtammets@gmail.com
MAIL_FROM=infotest@talesofreval.ee
MAIL_WEBSITE=https://preview.talesofreval.ee
```

Preview server kasutab `BIND_HOST` muutujat, sest Zone Node.js rakendus peab kuulama virtuaalserveri loopback IP peal. Koodis on ka `PREVIEW_NOINDEX`, mis lisab preview vastustele:
- `X-Robots-Tag: noindex, nofollow, noarchive`
- `/robots.txt`, kus `Disallow: /`

Preview seadistuse käigus leitud probleemid:
- alguses andis `preview.talesofreval.ee` `503 Service Unavailable`
- põhjus ei olnud DNS ega SSL, vaid PM2 `tales-preview` oli `errored`
- PM2 logid olid Zone UI kaudu praktiliselt nähtamatud, sest preview protsessi log path oli `/dev/null`
- käsitsi serveris käivitades tuli välja viga `Cannot find module 'multer'`
- lahendus: `/tor-preview` kaustas käivitati `npm install --omit=dev`
- pärast seda `tales-preview` läks PM2-s `online`
- käivitati `pm2 save`, et protsess jääks serveri restartide järel alles

Preview piltide probleem:
- preview andmetes olid piltide URL-id olemas, aga `preview-storage/uploads` oli tühi
- backend teenindab pilte `APP_STORAGE_DIR` alt, mitte `/tor-preview/backend/uploads` alt
- olemasolevad pildid kopeeriti:
  - `/tor-preview/backend/uploads/site` -> `/preview-storage/uploads/site`
  - `/tor-preview/backend/uploads/story` -> `/preview-storage/uploads/story`
- kontrolli tulemus: `uploadRefs=135`, `missingUploadFiles=0`

Preview admin:
- admin URL: `https://preview.talesofreval.ee/login`
- login-vorm kontrollib ainult parooli; kasutajanime backend ei kontrolli
- kontrollitud:
  - admin login vastab `200`
  - `GET /api/admin/me` vastab sisselogitult `200`
  - sisu salvestuse endpoint vastab `200`
  - pildi upload töötab, server töötleb uploadi `webp` failiks ja teenindab selle `/uploads/site/...` alt

Preview e-mailid:
- `Book now`, `Contact us` ja `Free tour` sisemised teavitused lähevad preview's `MAIL_TO` aadressile `mtammets@gmail.com`
- kliendile saadetakse koopia/kinnitus tema vormi sisestatud aadressile
- preview saatja on `infotest@talesofreval.ee`
- live `talesofreval.ee` vana `tor-full` rakendus saadab `Book now` kirjad koodis hardcoded aadressile `info@talesofreval.ee`

## Homme edasi

Järgmine loogiline samm:

1. Lasta kliendil kontrollida `https://preview.talesofreval.ee` sisu, vorme ja admini edit-mode'i
2. Enne live'i muutmist vahetada admini ajutine parool tugevama vastu
3. Kui klient kinnitab, tõsta preview/live muudatused päris `talesofreval.ee` alla
4. Live'i vahetuse ajal panna päris production `.env` väärtused üle:
   - `MAIL_TO=info@talesofreval.ee`
   - `MAIL_FROM=info@talesofreval.ee`
   - `MAIL_WEBSITE=https://www.talesofreval.ee`
   - `PREVIEW_NOINDEX=false` või eemalda see
5. Kontrollida Zone serveris, et päris live `Book now`, `Contact us` ja `Free tour` jõuavad `info@talesofreval.ee`
