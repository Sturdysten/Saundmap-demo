const map = L.map("map").setView([30, 30], 2);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

const songList = document.getElementById("song-list");
const searchInput = document.getElementById("search");
const globalSearchInput = document.getElementById("global-search");
const searchResults = document.getElementById("search-results");
const playlistsList = document.getElementById("playlists-list");
const playlistDetail = document.getElementById("playlist-detail");
const playlistDetailTitle = document.getElementById("playlist-detail-title");
const playlistDetailDescription = document.getElementById("playlist-detail-description");
const playlistSongs = document.getElementById("playlist-songs");
const favoritesList = document.getElementById("favorites-list");
const mySongsList = document.getElementById("my-songs-list");
const uploadForm = document.getElementById("upload-form");
const showListButton = document.getElementById("show-list-button");
const showMapButton = document.getElementById("show-map-button");
const mapPage = document.getElementById("map-page");

const navButtons = document.querySelectorAll(".nav-button");
const pages = document.querySelectorAll(".page");

let allSongs = [];
let allPlaylists = [];
let markers = [];

function isMobile() {
  return window.innerWidth <= 768;
}

function setMobileMapView(mode) {
  if (!mapPage) return;
  if (!isMobile()) return;

  mapPage.classList.remove("mobile-show-list", "mobile-show-map");

  if (mode === "list") {
    mapPage.classList.add("mobile-show-list");
    if (showListButton) showListButton.classList.add("active-toggle");
    if (showMapButton) showMapButton.classList.remove("active-toggle");
  }

  if (mode === "map") {
    mapPage.classList.add("mobile-show-map");
    if (showMapButton) showMapButton.classList.add("active-toggle");
    if (showListButton) showListButton.classList.remove("active-toggle");

    setTimeout(function() {
      map.invalidateSize();
    }, 100);
  }
}

function setDefaultMobileMapView() {
  if (!mapPage) return;

  mapPage.classList.remove("mobile-show-list", "mobile-show-map");

  if (isMobile()) {
    mapPage.classList.add("mobile-show-map");
    if (showMapButton) showMapButton.classList.add("active-toggle");
    if (showListButton) showListButton.classList.remove("active-toggle");
  } else {
    if (showMapButton) showMapButton.classList.remove("active-toggle");
    if (showListButton) showListButton.classList.remove("active-toggle");
  }
}

function getFavoriteSongIds() {
  const saved = localStorage.getItem("favoriteSongIds");
  return saved ? JSON.parse(saved) : [];
}

function saveFavoriteSongIds(ids) {
  localStorage.setItem("favoriteSongIds", JSON.stringify(ids));
}

function getUploadedSongs() {
  const saved = localStorage.getItem("uploadedSongs");
  return saved ? JSON.parse(saved) : [];
}

function saveUploadedSongs(songs) {
  localStorage.setItem("uploadedSongs", JSON.stringify(songs));
}

function isFavorite(songId) {
  return getFavoriteSongIds().includes(songId);
}

function addFavorite(songId) {
  const ids = getFavoriteSongIds();
  if (!ids.includes(songId)) {
    ids.push(songId);
    saveFavoriteSongIds(ids);
  }
  refreshAllViews();
}

function removeFavorite(songId) {
  const ids = getFavoriteSongIds().filter(function(id) {
    return id !== songId;
  });
  saveFavoriteSongIds(ids);
  refreshAllViews();
}

function toggleFavorite(songId) {
  if (isFavorite(songId)) {
    removeFavorite(songId);
  } else {
    addFavorite(songId);
  }
}

function clearMarkers() {
  markers.forEach(function(marker) {
    map.removeLayer(marker);
  });
  markers = [];
}

function openSongOnMap(song) {
  showPage("map-page");
  map.setView([song.lat, song.lon], 8);

  if (isMobile()) {
    setMobileMapView("map");
  }

  markers.forEach(function(marker) {
    const markerLatLng = marker.getLatLng();
    if (markerLatLng.lat === song.lat && markerLatLng.lng === song.lon) {
      marker.openPopup();
    }
  });
}

function createFavoriteButton(song) {
  const button = document.createElement("button");
  button.className = "favorite-button";
  button.textContent = isFavorite(song.id) ? "Poista suosikeista" : "Lisää suosikkeihin";

  button.addEventListener("click", function() {
    toggleFavorite(song.id);
  });

  return button;
}

function renderSongs(list) {
  if (!songList) return;

  songList.innerHTML = "";
  clearMarkers();

  list.forEach(function(song) {
    const marker = L.marker([song.lat, song.lon]).addTo(map);
    markers.push(marker);

    const popupGenre = song.genre ? `<strong>Genre:</strong> ${song.genre}<br>` : "";
    const popupDescription = song.description ? `${song.description}<br><br>` : "<br>";

    marker.bindPopup(`
      <div style="min-width: 240px;">
        <strong>${song.title}</strong><br>
        ${song.artist}<br>
        ${song.city}<br>
        ${popupGenre}
        ${popupDescription}
        <audio controls style="width: 100%;">
          <source src="${song.file}" type="audio/mpeg">
          Selaimesi ei tue audioelementtiä.
        </audio>
      </div>
    `);

    const card = document.createElement("div");
    card.className = "song-card";

    card.innerHTML = `
      <h3>${song.title}</h3>
      <p><strong>Artisti:</strong> ${song.artist}</p>
      <p><strong>Kaupunki:</strong> ${song.city}</p>
      ${song.genre ? `<p><strong>Genre:</strong> ${song.genre}</p>` : ""}
      ${song.description ? `<p>${song.description}</p>` : ""}
      <button class="map-button">Tarkenna kartalla</button>
    `;

    const mapButton = card.querySelector(".map-button");
    mapButton.addEventListener("click", function() {
      openSongOnMap(song);
    });

    card.appendChild(createFavoriteButton(song));
    songList.appendChild(card);
  });

  setTimeout(function() {
    map.invalidateSize();
  }, 100);
}

function renderSearchResults(list) {
  if (!searchResults) return;

  searchResults.innerHTML = "";

  if (list.length === 0) {
    searchResults.innerHTML = "<p>Ei hakutuloksia.</p>";
    return;
  }

  list.forEach(function(song) {
    const card = document.createElement("div");
    card.className = "search-result-card";

    card.innerHTML = `
      <h3>${song.title}</h3>
      <p><strong>Artisti:</strong> ${song.artist}</p>
      <p><strong>Kaupunki:</strong> ${song.city}</p>
      ${song.genre ? `<p><strong>Genre:</strong> ${song.genre}</p>` : ""}
      ${song.description ? `<p>${song.description}</p>` : ""}
      <button class="map-button">Avaa kartalla</button>
    `;

    const mapButton = card.querySelector(".map-button");
    mapButton.addEventListener("click", function() {
      openSongOnMap(song);
    });

    card.appendChild(createFavoriteButton(song));
    searchResults.appendChild(card);
  });
}

function renderPlaylistDetail(playlist) {
  if (!playlistDetail || !playlistDetailTitle || !playlistDetailDescription || !playlistSongs) return;

  playlistSongs.innerHTML = "";
  playlistDetail.classList.remove("hidden");
  playlistDetailTitle.textContent = playlist.name;
  playlistDetailDescription.textContent = playlist.description;

  const songsInPlaylist = playlist.songIds
    .map(function(songId) {
      return allSongs.find(function(song) {
        return song.id === songId;
      });
    })
    .filter(function(song) {
      return song;
    });

  if (songsInPlaylist.length === 0) {
    playlistSongs.innerHTML = "<p>Soittolistalla ei ole vielä kappaleita.</p>";
    return;
  }

  songsInPlaylist.forEach(function(song) {
    const card = document.createElement("div");
    card.className = "playlist-song-card";

    card.innerHTML = `
      <h4>${song.title}</h4>
      <p><strong>Artisti:</strong> ${song.artist}</p>
      <p><strong>Kaupunki:</strong> ${song.city}</p>
      ${song.genre ? `<p><strong>Genre:</strong> ${song.genre}</p>` : ""}
      ${song.description ? `<p>${song.description}</p>` : ""}
      <button class="map-button">Avaa kartalla</button>
    `;

    const mapButton = card.querySelector(".map-button");
    mapButton.addEventListener("click", function() {
      openSongOnMap(song);
    });

    card.appendChild(createFavoriteButton(song));
    playlistSongs.appendChild(card);
  });
}

function renderPlaylists(list) {
  if (!playlistsList) return;

  playlistsList.innerHTML = "";

  if (!list || list.length === 0) {
    playlistsList.innerHTML = "<p>Soittolistoja ei löytynyt.</p>";
    return;
  }

  list.forEach(function(playlist) {
    const card = document.createElement("div");
    card.className = "playlist-card";

    card.innerHTML = `
      <h3>${playlist.name}</h3>
      <p>${playlist.description}</p>
      <p><strong>Kappaleita:</strong> ${playlist.songIds.length}</p>
      <button>Avaa soittolista</button>
    `;

    const button = card.querySelector("button");
    button.addEventListener("click", function() {
      renderPlaylistDetail(playlist);
    });

    playlistsList.appendChild(card);
  });
}

function renderFavorites() {
  if (!favoritesList) return;

  favoritesList.innerHTML = "";

  const favoriteIds = getFavoriteSongIds();

  if (favoriteIds.length === 0) {
    favoritesList.innerHTML = "<p>Et ole lisännyt vielä yhtään suosikkia.</p>";
    return;
  }

  const favoriteSongs = favoriteIds
    .map(function(songId) {
      return allSongs.find(function(song) {
        return song.id === songId;
      });
    })
    .filter(function(song) {
      return song;
    });

  favoriteSongs.forEach(function(song) {
    const card = document.createElement("div");
    card.className = "favorite-song-card";

    card.innerHTML = `
      <h4>${song.title}</h4>
      <p><strong>Artisti:</strong> ${song.artist}</p>
      <p><strong>Kaupunki:</strong> ${song.city}</p>
      ${song.genre ? `<p><strong>Genre:</strong> ${song.genre}</p>` : ""}
      ${song.description ? `<p>${song.description}</p>` : ""}
      <button class="map-button">Avaa kartalla</button>
      <button class="remove-button">Poista suosikeista</button>
    `;

    const mapButton = card.querySelector(".map-button");
    const removeButton = card.querySelector(".remove-button");

    mapButton.addEventListener("click", function() {
      openSongOnMap(song);
    });

    removeButton.addEventListener("click", function() {
      removeFavorite(song.id);
    });

    favoritesList.appendChild(card);
  });
}

function renderMySongs() {
  if (!mySongsList) return;

  mySongsList.innerHTML = "";

  const uploadedSongs = getUploadedSongs();

  if (uploadedSongs.length === 0) {
    mySongsList.innerHTML = "<p>Et ole lisännyt vielä omia julkaisuja.</p>";
    return;
  }

  uploadedSongs.forEach(function(song) {
    const card = document.createElement("div");
    card.className = "my-song-card";

    card.innerHTML = `
      <h4>${song.title}</h4>
      <p><strong>Artisti:</strong> ${song.artist}</p>
      <p><strong>Kaupunki:</strong> ${song.city}</p>
      <p><strong>Genre:</strong> ${song.genre || "-"}</p>
      <p>${song.description || ""}</p>
      <button class="map-button">Avaa kartalla</button>
    `;

    const mapButton = card.querySelector(".map-button");
    mapButton.addEventListener("click", function() {
      openSongOnMap(song);
    });

    mySongsList.appendChild(card);
  });
}

function refreshAllViews() {
  renderSongs(allSongs);
  renderSearchResults(allSongs);
  renderFavorites();
  renderMySongs();
}

function showPage(pageId) {
  pages.forEach(function(page) {
    page.classList.remove("active-page");
  });

  navButtons.forEach(function(button) {
    button.classList.remove("active");
  });

  const selectedPage = document.getElementById(pageId);
  if (selectedPage) {
    selectedPage.classList.add("active-page");
  }

  const activeButton = document.querySelector(`[data-page="${pageId}"]`);
  if (activeButton) {
    activeButton.classList.add("active");
  }

  if (pageId === "map-page") {
    setDefaultMobileMapView();

    setTimeout(function() {
      map.invalidateSize();
    }, 100);
  }

  if (pageId === "favorites-page") {
    renderFavorites();
  }

  if (pageId === "profile-page") {
    renderMySongs();
  }
}

Promise.all([
  fetch("data/songs.json").then(function(response) {
    return response.json();
  }),
  fetch("data/playlists.json").then(function(response) {
    return response.json();
  })
])
  .then(function(results) {
    const songs = results[0];
    const playlists = results[1];
    const uploadedSongs = getUploadedSongs();

    allSongs = songs.concat(uploadedSongs);
    allPlaylists = playlists;

    renderSongs(allSongs);
    renderSearchResults(allSongs);
    renderPlaylists(allPlaylists);
    renderFavorites();
    renderMySongs();
    setDefaultMobileMapView();
  })
  .catch(function(error) {
    console.error("Data loading error:", error);
  });

if (searchInput) {
  searchInput.addEventListener("input", function() {
    const value = searchInput.value.toLowerCase();

    const filtered = allSongs.filter(function(song) {
      return (
        song.title.toLowerCase().includes(value) ||
        song.artist.toLowerCase().includes(value) ||
        song.city.toLowerCase().includes(value) ||
        (song.genre && song.genre.toLowerCase().includes(value)) ||
        (song.description && song.description.toLowerCase().includes(value))
      );
    });

    renderSongs(filtered);
  });
}

if (globalSearchInput) {
  globalSearchInput.addEventListener("input", function() {
    const value = globalSearchInput.value.toLowerCase();

    const filtered = allSongs.filter(function(song) {
      return (
        song.title.toLowerCase().includes(value) ||
        song.artist.toLowerCase().includes(value) ||
        song.city.toLowerCase().includes(value) ||
        (song.genre && song.genre.toLowerCase().includes(value)) ||
        (song.description && song.description.toLowerCase().includes(value))
      );
    });

    renderSearchResults(filtered);
  });
}

if (uploadForm) {
  uploadForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = document.getElementById("upload-title").value.trim();
    const artist = document.getElementById("upload-artist").value.trim();
    const city = document.getElementById("upload-city").value.trim();
    const genre = document.getElementById("upload-genre").value.trim();
    const description = document.getElementById("upload-description").value.trim();
    const lat = parseFloat(document.getElementById("upload-lat").value);
    const lon = parseFloat(document.getElementById("upload-lon").value);

    const uploadedSongs = getUploadedSongs();

    const newSong = {
      id: Date.now(),
      title: title,
      artist: artist,
      city: city,
      genre: genre,
      description: description,
      lat: lat,
      lon: lon,
      file: "audio/demo.mp3"
    };

    uploadedSongs.push(newSong);
    saveUploadedSongs(uploadedSongs);

    allSongs.push(newSong);
    refreshAllViews();

    uploadForm.reset();
    alert("Julkaisu lisätty onnistuneesti.");
  });
}

navButtons.forEach(function(button) {
  button.addEventListener("click", function() {
    const pageId = button.getAttribute("data-page");
    showPage(pageId);
  });
});

if (showListButton) {
  showListButton.addEventListener("click", function() {
    setMobileMapView("list");
  });
}

if (showMapButton) {
  showMapButton.addEventListener("click", function() {
    setMobileMapView("map");
  });
}

window.addEventListener("resize", function() {
  if (document.getElementById("map-page").classList.contains("active-page")) {
    setDefaultMobileMapView();

    setTimeout(function() {
      map.invalidateSize();
    }, 100);
  }
});