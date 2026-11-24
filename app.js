// Cat Gallery: loads real cat photos from public APIs in the visitor's browser.

const BATCH = 12;
const FAV_KEY = "cat-gallery-favorites";

const gallery = document.getElementById("gallery");
const statusEl = document.getElementById("status");
const moreBtn = document.getElementById("more");
const shuffleBtn = document.getElementById("shuffle");
const favBtn = document.getElementById("showFavs");
const favCount = document.getElementById("favCount");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");

let photos = [];          // URLs currently shown
let seen = new Set();     // avoid duplicates
let loading = false;
let showingFavs = false;
let current = -1;         // lightbox index
let favorites = loadFavorites();

function loadFavorites() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
  catch { return []; }
}
function saveFavorites() {
  localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
  favCount.textContent = favorites.length;
}

// Primary source: The Cat API (real photos). The keyless endpoint returns up to 10 per call.
async function fromCatApi(count) {
  const urls = [];
  while (urls.length < count) {
    const res = await fetch(
      "https://api.thecatapi.com/v1/images/search?limit=10&mime_types=jpg,png"
    );
    if (!res.ok) throw new Error("The Cat API returned " + res.status);
    const data = await res.json();
    if (!data.length) break;
    for (const item of data) if (item.url) urls.push(item.url);
  }
  return urls.slice(0, count);
}

// Fallback source: Cataas (Cat as a Service), also real photos.
async function fromCataas(count) {
  const res = await fetch(`https://cataas.com/api/cats?limit=${count}&skip=${Math.floor(Math.random() * 1000)}`);
  if (!res.ok) throw new Error("Cataas returned " + res.status);
  const data = await res.json();
  return data.map((c) => `https://cataas.com/cat/${c.id || c._id}`);
}

async function fetchCats(count) {
  try {
    return await fromCatApi(count);
  } catch (err) {
    console.warn("Falling back to Cataas:", err);
    return await fromCataas(count);
  }
}

function addCard(url) {
  const index = photos.length;
  photos.push(url);

  const card = document.createElement("div");
  card.className = "card";

  const img = document.createElement("img");
  img.alt = "A cat";
  img.loading = "lazy";
  img.src = url;
  img.onload = () => card.classList.add("loaded");
  img.onerror = () => card.remove();

  const fav = document.createElement("button");
  fav.className = "fav";
  fav.setAttribute("aria-label", "Toggle favorite");
  const update = () => (fav.textContent = favorites.includes(url) ? "♥" : "♡");
  update();
  fav.onclick = (e) => {
    e.stopPropagation();
    favorites = favorites.includes(url)
      ? favorites.filter((f) => f !== url)
      : [...favorites, url];
    saveFavorites();
    update();
  };

  card.onclick = () => openLightbox(index);
  card.append(img, fav);
  gallery.append(card);
}

async function loadMore() {
  if (loading || showingFavs) return;
  loading = true;
  moreBtn.disabled = true;
  statusEl.textContent = "Fetching cats…";
  try {
    const urls = await fetchCats(BATCH);
    let added = 0;
    for (const url of urls) {
      if (seen.has(url)) continue;
      seen.add(url);
      addCard(url);
      added++;
    }
    statusEl.textContent = added ? "" : "No new cats this time — try again!";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Couldn't reach the cat servers. Check your connection and try again.";
  } finally {
    loading = false;
    moreBtn.disabled = false;
  }
}

function reset() {
  gallery.innerHTML = "";
  photos = [];
  seen = new Set();
}

function shuffle() {
  showingFavs = false;
  favBtn.classList.add("secondary");
  reset();
  loadMore();
}

function toggleFavorites() {
  showingFavs = !showingFavs;
  favBtn.classList.toggle("secondary", !showingFavs);
  reset();
  if (showingFavs) {
    favorites.forEach(addCard);
    moreBtn.style.display = "none";
    statusEl.textContent = favorites.length ? "" : "No favorites yet — tap ♡ on a cat you love.";
  } else {
    moreBtn.style.display = "";
    statusEl.textContent = "";
    loadMore();
  }
}

function openLightbox(i) {
  current = i;
  lightboxImg.src = photos[i];
  lightbox.classList.add("open");
}
function closeLightbox() {
  lightbox.classList.remove("open");
  current = -1;
}
function step(delta) {
  if (current < 0 || !photos.length) return;
  openLightbox((current + delta + photos.length) % photos.length);
}

lightbox.onclick = (e) => { if (e.target === lightbox) closeLightbox(); };
lightbox.querySelector(".close").onclick = closeLightbox;
lightbox.querySelector(".prev").onclick = (e) => { e.stopPropagation(); step(-1); };
lightbox.querySelector(".next").onclick = (e) => { e.stopPropagation(); step(1); };
document.addEventListener("keydown", (e) => {
  if (current < 0) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
});

moreBtn.onclick = loadMore;
shuffleBtn.onclick = shuffle;
favBtn.onclick = toggleFavorites;

// Infinite scroll: load more when near the bottom.
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 600) loadMore();
});

saveFavorites();
loadMore();
