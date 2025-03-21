# PicSure PHP Backend

Dit is de PHP backend voor de PicSure applicatie. Deze backend maakt gebruik van een MySQL database met PDO voor de verbinding.

## Vereisten

- PHP 7.4 of hoger
- MySQL of MariaDB
- Webserver (Apache, Nginx, etc.)

## Installatie

1. **Database opzetten**:
   - Maak een MySQL database aan (bijvoorbeeld `portfolio_db`)
   - Importeer het schema vanuit `../database/schema.sql`

2. **Backend configureren**:
   - Pas de database configuratie aan in `config.php`:
     - `host`: Uw database host (standaard: localhost)
     - `dbname`: Uw database naam (standaard: portfolio_db)
     - `user`: Uw database gebruikersnaam
     - `password`: Uw database wachtwoord

3. **Backend plaatsen op uw webserver**:
   - Upload de hele `backend` map naar uw webserver
   - Zorg ervoor dat de webserver schrijfrechten heeft voor de `uploads` map

4. **Testgegevens laden**:
   - Open `http://uw-domain.com/backend/seed.php` in uw browser om testgegevens toe te voegen
   - U krijgt een bevestiging als de seed succesvol is uitgevoerd

## API Endpoints

De volgende API endpoints zijn beschikbaar:

### Albums

- `GET /backend/api.php?albums`: Alle albums ophalen
- `GET /backend/api.php?albums&userId={id}`: Albums van een specifieke gebruiker ophalen
- `POST /backend/api.php?albums`: Nieuw album aanmaken

### Gebruikers

- `GET /backend/api.php?users`: Alle gebruikers ophalen
- `GET /backend/api.php?users&id={id}`: Een specifieke gebruiker ophalen
- `POST /backend/api.php?users`: Nieuwe gebruiker registreren

### Login

- `POST /backend/api.php?login`: Gebruiker inloggen (vereist email en wachtwoord)

## Verbinding maken met de frontend

1. Pas het `API_URL` aan in `src/pages/Albums.jsx`:
   ```js
   const API_URL = 'http://uw-domain.com/backend';
   ```

2. Zorg ervoor dat de CORS headers correct zijn ingesteld als uw frontend en backend op verschillende domeinen draaien 