# Picshare API

Een RESTful API voor de Picshare foto-deelplatform.

## Technologieën

* PHP 7.4+
* MySQL/MariaDB
* PDO voor databaseverbindingen
* JSON Web Tokens (JWT) voor authenticatie

## Installatie

1. Clone deze repository naar je webserver
2. Importeer `portfolio_db.sql` in je MySQL/MariaDB database
3. Update de database configuratie in `config/database.php`
4. Zorg dat de webserver toegang heeft tot de bestanden
5. Wijzig de JWT secret key in `models/Auth.php`

## API Endpoints

### Authenticatie

- `POST /api/auth` - Inloggen, registreren en token verificatie
  - Body: `{"action": "login", "email": "...", "password": "..."}`
  - Body: `{"action": "register", "username": "...", "email": "...", "password": "..."}`
  - Body: `{"action": "verify_token", "token": "..."}`

### Gebruikers

- `GET /api/users` - Alle gebruikers ophalen (authenticatie vereist)
- `GET /api/users/{id}` - Specifieke gebruiker ophalen
- `PUT /api/users/{id}` - Gebruiker bijwerken (alleen eigen profiel)
- `DELETE /api/users/{id}` - Gebruiker verwijderen (alleen eigen account)

### Albums

- `GET /api/albums` - Albums ophalen van de ingelogde gebruiker
- `GET /api/albums/{id}` - Specifiek album ophalen
- `POST /api/albums` - Nieuw album aanmaken
- `PUT /api/albums/{id}` - Album bijwerken
- `DELETE /api/albums/{id}` - Album verwijderen

### Album Permissies

- `GET /api/album_permissions/{album_id}` - Permissies ophalen voor een album
- `POST /api/album_permissions` - Permissie toevoegen voor een gebruiker
- `PUT /api/album_permissions/{id}` - Permissie bijwerken
- `DELETE /api/album_permissions/{id}` - Permissie verwijderen

### Foto's

- `GET /api/photos/album/{album_id}` - Foto's van een album ophalen
- `GET /api/photos/{id}` - Specifieke foto ophalen
- `POST /api/photos` - Foto toevoegen aan een album
- `DELETE /api/photos/{id}` - Foto verwijderen

### Vriendschappen

- `GET /api/friends` - Vrienden ophalen
- `GET /api/friends/requests` - Vriendschapsverzoeken ophalen
- `POST /api/friends` - Vriendschapsverzoek versturen
- `PUT /api/friends/requests/{id}` - Vriendschapsverzoek accepteren/weigeren
- `DELETE /api/friends/{user_id}` - Vriendschap verwijderen

## Authenticatie

De API gebruikt JWT tokens voor authenticatie. Na inloggen of registreren wordt een token geretourneerd dat gebruikt moet worden in de Authorization header van volgende requests:

```
Authorization: Bearer {token}
```

## Voorbeelden

### Inloggen

```
POST /api/auth
Content-Type: application/json

{
  "action": "login",
  "email": "john.doe@example.com",
  "password": "securepassword"
}
```

### Album aanmaken

```
POST /api/albums
Content-Type: application/json
Authorization: Bearer {token}

{
  "album_name": "Vakantie 2023",
  "thumbnail": "thumbnail.jpg"
}
```

## Foutafhandeling

De API retourneert gepaste HTTP-statuscodes:

- 200 OK - Request geslaagd
- 201 Created - Resource aangemaakt
- 400 Bad Request - Ongeldige input
- 401 Unauthorized - Authenticatie vereist
- 403 Forbidden - Geen toegang tot de resource
- 404 Not Found - Resource niet gevonden
- 405 Method Not Allowed - Methode niet ondersteund
- 500 Internal Server Error - Serverfout 