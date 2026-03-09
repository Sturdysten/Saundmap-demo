# API plan

## Auth
### POST /auth/register
Body:
{
  "username": "demo",
  "email": "demo@example.com",
  "password": "secret123"
}

### POST /auth/login
Body:
{
  "email": "demo@example.com",
  "password": "secret123"
}

### GET /auth/me
Returns current user.

---

## Songs
### GET /songs
Query params:
- q
- city
- genre
- userId

### GET /songs/:id
Returns one song.

### POST /songs
Body:
{
  "title": "Night Drive",
  "artist_name": "DJ Aurora",
  "city": "Helsinki",
  "genre": "Electronic",
  "description": "Yöajelun tunnelmaa.",
  "latitude": 60.1699,
  "longitude": 24.9384,
  "audio_url": "https://...",
  "cover_url": "https://..."
}

### PATCH /songs/:id
Updates one song.

### DELETE /songs/:id
Deletes one song.

---

## Playlists
### GET /playlists
### GET /playlists/:id

### POST /playlists
Body:
{
  "name": "Yöajo",
  "description": "Tunnelmallisia kappaleita iltaan."
}

### POST /playlists/:id/songs
Body:
{
  "song_id": 12
}

### DELETE /playlists/:id/songs/:songId

---

## Favorites
### GET /favorites
Returns current user's favorite songs.

### POST /favorites
Body:
{
  "song_id": 12
}

### DELETE /favorites/:songId

---

## Profile
### GET /users/:id
Returns public profile.

### GET /me/songs
Returns current user's songs.

### GET /me/playlists
Returns current user's playlists.