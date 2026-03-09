# Data model

## users
- id
- username
- email
- password_hash
- display_name
- city
- bio
- avatar_url
- role
- created_at

## songs
- id
- user_id
- title
- artist_name
- city
- genre
- description
- latitude
- longitude
- audio_url
- cover_url
- created_at

## playlists
- id
- user_id
- name
- description
- is_public
- created_at

## playlist_songs
- id
- playlist_id
- song_id
- position

## favorites
- id
- user_id
- song_id
- created_at

## comments
- id
- user_id
- song_id
- body
- created_at