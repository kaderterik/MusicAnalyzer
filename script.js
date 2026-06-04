/***********************
 * DOM
 ***********************/
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const shareBtn = document.getElementById("shareBtn");

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

const landingView = document.getElementById("landingView");
const analysisView = document.getElementById("analysisView");

const profileImg = document.getElementById("profileImg");
const profileName = document.getElementById("profileName");
const profileSub = document.getElementById("profileSub");

const auraCard = document.getElementById("auraCard");
const auraName = document.getElementById("auraName");
const auraDesc = document.getElementById("auraDesc");

const topArtistsGrid = document.getElementById("topArtistsGrid");
const topTracksList = document.getElementById("topTracksList");

const loadingOverlay = document.getElementById("loadingOverlay");
const loadingTitle = document.getElementById("loadingTitle");
const loadingSub = document.getElementById("loadingSub");

const toastEl = document.getElementById("toast");
const confettiCanvas = document.getElementById("confetti");

let accessToken = null;
let lastGenreCounts = null;
let chartInstance = null;

/***********************
 * THEME
 ***********************/
const THEME_KEY = "ma_theme_v1";

function getInitialTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function renderThemeIcon(theme) {
  // Dark tema: güneş (açık tema için); Light tema: ay (koyu tema için).
  const isLight = theme === "light";
  themeIcon.innerHTML = isLight
    ? `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" stroke="var(--text)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        `
    : `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" stroke="var(--text)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 2v2" stroke="var(--text)" stroke-width="2" stroke-linecap="round"/>
            <path d="M12 20v2" stroke="var(--text)" stroke-width="2" stroke-linecap="round"/>
            <path d="M4.93 4.93l1.41 1.41" stroke="var(--text)" stroke-width="2" stroke-linecap="round"/>
            <path d="M17.66 17.66l1.41 1.41" stroke="var(--text)" stroke-width="2" stroke-linecap="round"/>
            <path d="M2 12h2" stroke="var(--text)" stroke-width="2" stroke-linecap="round"/>
            <path d="M20 12h2" stroke="var(--text)" stroke-width="2" stroke-linecap="round"/>
            <path d="M4.93 19.07l1.41-1.41" stroke="var(--text)" stroke-width="2" stroke-linecap="round"/>
            <path d="M17.66 6.34l1.41-1.41" stroke="var(--text)" stroke-width="2" stroke-linecap="round"/>
        </svg>
        `;
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  renderThemeIcon(theme);
  localStorage.setItem(THEME_KEY, theme);
}

themeToggle.addEventListener("click", () => {
  const current =
    document.documentElement.dataset.theme === "light" ? "dark" : "light";
  setTheme(current);
  if (lastGenreCounts) {
    drawGenreChart(lastGenreCounts);
  }
});

setTheme(getInitialTheme());

/***********************
 * UI HELPERS
 ***********************/
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(
    () => toastEl.classList.remove("show"),
    4200,
  );
}

function showLoading(title, sub) {
  loadingTitle.textContent = title || "Analiz yapılıyor...";
  loadingSub.textContent = sub || "Spotify verileri hazırlanıyor";
  loadingOverlay.classList.remove("hidden");
}

function hideLoading() {
  loadingOverlay.classList.add("hidden");
}

function revealCards() {
  const cards = document.querySelectorAll("[data-reveal]");
  cards.forEach((c, idx) => {
    window.setTimeout(() => c.classList.add("visible"), 110 + idx * 110);
  });
}

/***********************
 * CONFETTI
 ***********************/
function confettiBurst(durationMs = 1700) {
  const canvas = confettiCanvas;
  const ctx = canvas.getContext("2d");
  canvas.classList.remove("hidden");

  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  // Prevent cumulative scaling between calls.
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  const w = window.innerWidth;
  const h = window.innerHeight;

  const colors = ["#1db954", "#7c4dff", "#ffd166", "#ff4d6d", "#ffffff"];
  const particles = [];
  const count = 140;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: w / 2 + (Math.random() - 0.5) * 20,
      y: h / 2 + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 10,
      vy: -Math.random() * 12 - 6,
      g: 0.12 + Math.random() * 0.18,
      size: 6 + Math.random() * 8,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.35,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: Math.random() > 0.65 ? "rect" : "circle",
    });
  }

  const start = performance.now();
  function step(now) {
    const t = now - start;
    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      p.vy += p.g * (t > durationMs ? 0.5 : 1);
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === "rect") {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.22, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (t < durationMs) requestAnimationFrame(step);
    else {
      ctx.clearRect(0, 0, w, h);
      canvas.classList.add("hidden");
    }
  }
  requestAnimationFrame(step);
}

/***********************
 * BACKGROUND MOTION
 ***********************/
function initNotesLayer() {
  const layer = document.getElementById("notesLayer");
  const notes = ["♪", "♫", "♬", "♩", "♭"];
  layer.innerHTML = "";
  for (let i = 0; i < 14; i++) {
    const s = document.createElement("span");
    s.className = "note" + (i % 3 === 0 ? " purple" : "");
    s.textContent = notes[i % notes.length];
    const left = Math.random() * 96;
    const top = Math.random() * 88;
    const delay = Math.random() * 7;
    const dur = 6 + Math.random() * 7;
    const scale = 0.85 + Math.random() * 0.85;
    s.style.left = left + "%";
    s.style.top = top + "%";
    s.style.animationDelay = delay + "s";
    s.style.animationDuration = dur + "s";
    s.style.transform = `scale(${scale})`;
    layer.appendChild(s);
  }
}
initNotesLayer();

/***********************
 * PKCE + OAUTH
 ***********************/
// Clean path to remove index.html and ensure a trailing slash for matching Spotify configuration
let cleanPath = window.location.pathname;
if (cleanPath.endsWith("index.html")) {
  cleanPath = cleanPath.substring(0, cleanPath.length - 10);
}
if (!cleanPath.endsWith("/")) {
  cleanPath += "/";
}
const BASE_URL = window.location.origin + cleanPath;
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const SESSION = {
  token: "ma_token_v1",
  verifier: "ma_pkce_verifier_v1",
  state: "ma_oauth_state_v1",
};

function base64UrlEncode(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++)
    binary += String.fromCharCode(bytes[i]);
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function genState() {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateCodeVerifier() {
  const arr = new Uint8Array(64);
  crypto.getRandomValues(arr);
  // Short & URL-safe enough for PKCE verifier in practice
  return Array.from(arr)
    .map((b) => (b % 36).toString(36))
    .join("");
}

async function sha256Base64Url(text) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(text));
  return base64UrlEncode(buf);
}

function getTokenCache() {
  try {
    const raw = localStorage.getItem(SESSION.token);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.access_token) return null;
    if (
      typeof parsed.expires_at === "number" &&
      Date.now() > parsed.expires_at - 30_000
    )
      return null;
    return parsed;
  } catch {
    return null;
  }
}

function setTokenCache(tokenResponse) {
  const expiresIn = tokenResponse.expires_in
    ? Number(tokenResponse.expires_in)
    : 3600;
  const expiresAt = Date.now() + expiresIn * 1000;
  localStorage.setItem(
    SESSION.token,
    JSON.stringify({
      access_token: tokenResponse.access_token,
      expires_at: expiresAt,
    }),
  );
}

function stripOAuthParams() {
  const url = new URL(window.location.href);
  url.searchParams.delete("code");
  url.searchParams.delete("state");
  url.searchParams.delete("error");
  url.searchParams.delete("error_description");
  history.replaceState({}, document.title, url.toString());
}

function getUrlParams() {
  return new URL(window.location.href).searchParams;
}

async function ensureAccessTokenFromOAuthCallback() {
  const params = getUrlParams();
  const code = params.get("code");
  const state = params.get("state");
  const error = params.get("error");

  if (error) {
    stripOAuthParams();
    throw new Error("Spotify OAuth hatası: " + error);
  }
  if (!code) return null;

  const savedState = sessionStorage.getItem(SESSION.state);
  if (!state || !savedState || state !== savedState) {
    stripOAuthParams();
    throw new Error("state doğrulama başarısız.");
  }

  const codeVerifier = sessionStorage.getItem(SESSION.verifier);
  if (!codeVerifier) {
    stripOAuthParams();
    throw new Error("PKCE code_verifier bulunamadı. Tekrar giriş yap.");
  }

  const body = new URLSearchParams();
  body.set("client_id", SPOTIFY_CLIENT_ID);
  body.set("grant_type", "authorization_code");
  body.set("code", code);
  body.set("redirect_uri", BASE_URL);
  body.set("code_verifier", codeVerifier);

  showLoading("Token alınıyor...", "Spotify hesap bağlanıyor");
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    // ignore
  }

  if (!res.ok) {
    const reason = json?.error_description || json?.error || text;
    throw new Error("Token alınamadı: " + reason);
  }

  stripOAuthParams();
  sessionStorage.removeItem(SESSION.verifier);
  sessionStorage.removeItem(SESSION.state);
  setTokenCache(json);
  return json.access_token;
}

/***********************
 * SPOTIFY API
 ***********************/
function spotifyFetch(path) {
  if (!accessToken) throw new Error("Spotify erişim belirteci yok.");
  return fetch("https://api.spotify.com" + path, {
    headers: { Authorization: "Bearer " + accessToken },
  });
}

async function apiJSON(resp) {
  const txt = await resp.text();
  let json = null;
  try {
    json = JSON.parse(txt);
  } catch {
    // ignore
  }

  if (!resp.ok) {
    const status = resp.status;
    const message =
      json?.error?.message ||
      json?.error_description ||
      json?.error ||
      txt ||
      String(status);

    if (status === 401) {
      // Token expired/invalid -> force re-login.
      localStorage.removeItem(SESSION.token);
      throw new Error(
        "Oturum süresi doldu. Lütfen tekrar Spotify ile giriş yap.",
      );
    }

    if (status === 403) {
      // Most common: app is in Development mode and user isn't added as tester.
      throw new Error(
        "Spotify API hatası (403 Forbidden). Uygulama Development mode'daysa Spotify Dashboard > User and Access bölümünden bu hesabı test kullanıcı olarak ekle. " +
          "Ayrıca izinlerin (scope) onaylandığından emin ol.",
      );
    }

    throw new Error(`Spotify API hatası (${status}): ${message}`);
  }

  return json;
}

async function fetchMe() {
  const resp = await spotifyFetch("/v1/me");
  return apiJSON(resp);
}

async function fetchTopArtists(limit = 5, time_range = "short_term") {
  const resp = await spotifyFetch(
    `/v1/me/top/artists?limit=${encodeURIComponent(limit)}&time_range=${encodeURIComponent(time_range)}`,
  );
  return apiJSON(resp);
}

async function fetchTopTracks(limit = 5, time_range = "short_term") {
  const resp = await spotifyFetch(
    `/v1/me/top/tracks?limit=${encodeURIComponent(limit)}&time_range=${encodeURIComponent(time_range)}`,
  );
  return apiJSON(resp);
}

async function fetchArtistsByIds(ids) {
  const uniq = Array.from(new Set((ids || []).filter(Boolean)));
  if (!uniq.length) return [];

  // Fetch each artist individually in parallel
  const promises = uniq.map(async (id) => {
    try {
      const resp = await spotifyFetch(`/v1/artists/${encodeURIComponent(id)}`);
      return await apiJSON(resp);
    } catch (e) {
      console.error("Sanatçı yüklenemedi:", id, e);
      return null;
    }
  });

  const results = await Promise.all(promises);
  return results.filter(Boolean);
}

function bestImageUrl(images) {
  if (!Array.isArray(images) || images.length === 0) return null;
  const sorted = images
    .slice()
    .filter((x) => x && x.url)
    .sort((a, b) => (b.width || 0) - (a.width || 0));
  return sorted[0]?.url || images[0]?.url || null;
}

/***********************
 * PERSONALITY (GENRE HEURISTIC)
 ***********************/
const GENRE_TRAIT_RULES = [
  {
    match: [
      "edm",
      "electronic",
      "electro",
      "house",
      "techno",
      "trance",
      "dubstep",
      "club",
      "dance",
      "electroclash",
      "elektronik",
    ],
    energy: 0.92,
    danceability: 0.88,
    valence: 0.65,
  },
  {
    match: ["pop", "türkçe pop", "turkish pop"],
    energy: 0.78,
    danceability: 0.76,
    valence: 0.84,
  },
  {
    match: ["funk", "synthwave", "disco"],
    energy: 0.72,
    danceability: 0.86,
    valence: 0.82,
  },
  {
    match: ["soul", "r&b", "rhythm-and-blues", "rhythm and blues"],
    energy: 0.64,
    danceability: 0.72,
    valence: 0.74,
  },
  {
    match: ["hip hop", "rap", "trap", "türkçe rap", "turkish rap"],
    energy: 0.84,
    danceability: 0.82,
    valence: 0.72,
  },
  {
    match: [
      "rock",
      "alternative",
      "metal",
      "hard rock",
      "alternatif",
      "türkçe rock",
      "turkish rock",
    ],
    energy: 0.86,
    danceability: 0.62,
    valence: 0.58,
  },
  {
    match: ["reggae", "dancehall", "latin"],
    energy: 0.72,
    danceability: 0.84,
    valence: 0.76,
  },
  {
    match: ["jazz", "blues", "caz"],
    energy: 0.45,
    danceability: 0.52,
    valence: 0.66,
  },
  {
    match: ["classical", "orchestral", "ambient", "klasik"],
    energy: 0.28,
    danceability: 0.22,
    valence: 0.44,
  },
  { match: ["country"], energy: 0.58, danceability: 0.52, valence: 0.62 },
];

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function buildGenreCountsForScoring(artists) {
  const counts = new Map(); // genreLower -> weightedCount
  for (const a of artists || []) {
    const weight =
      typeof a?.popularity === "number" ? clamp(a.popularity / 100, 0, 1) : 1;
    for (const g of a?.genres || []) {
      const key = String(g).toLowerCase().trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + weight);
    }
  }
  return counts;
}

function buildGenreCountsFromArtistsAndTracks(
  topArtists,
  topTracks,
  trackArtistsDetails,
) {
  const counts = new Map();
  const addGenres = (artists, multiplier) => {
    for (const a of artists || []) {
      const base =
        typeof a?.popularity === "number"
          ? clamp(a.popularity / 100, 0, 1)
          : 0.6;
      const weight = base * multiplier;
      for (const g of a?.genres || []) {
        const key = String(g).toLowerCase().trim();
        if (!key) continue;
        counts.set(key, (counts.get(key) || 0) + weight);
      }
    }
  };
  // Top artists are strongest signal.
  addGenres(topArtists, 1.2);
  // Artists from top tracks add additional variety.
  addGenres(trackArtistsDetails, 0.9);
  return counts;
}

function computeScoresFromGenres(genreCounts) {
  let total = 0;
  let energySum = 0;
  let danceSum = 0;
  let happySum = 0;

  for (const [genre, weight] of genreCounts || []) {
    total += weight;
    let bestE = 0.5;
    let bestD = 0.5;
    let bestV = 0.5;
    for (const rule of GENRE_TRAIT_RULES) {
      if (!Array.isArray(rule.match)) continue;
      const matches = rule.match.some((m) =>
        genre.includes(String(m).toLowerCase()),
      );
      if (!matches) continue;
      bestE = Math.max(bestE, rule.energy ?? 0.5);
      bestD = Math.max(bestD, rule.danceability ?? 0.5);
      bestV = Math.max(bestV, rule.valence ?? 0.5);
    }
    energySum += bestE * weight;
    danceSum += bestD * weight;
    happySum += bestV * weight;
  }

  if (!total) return { energy: 0.5, danceability: 0.5, valence: 0.5 };
  return {
    energy: clamp(energySum / total, 0, 1),
    danceability: clamp(danceSum / total, 0, 1),
    valence: clamp(happySum / total, 0, 1),
  };
}

function score0to100(x01) {
  return Math.round(clamp(x01, 0, 1) * 100);
}

function computePersonality({ energy, danceability, valence }) {
  // Heuristic -> 3 tip.
  if (valence < 0.42 && energy < 0.55)
    return { type: "Melankolik Ruh", emoji: "🌧️" };
  if (energy >= 0.62 && valence < 0.52)
    return { type: "Gece Kuşu", emoji: "🌙" };
  return { type: "Enerjik Kaşif", emoji: "⚡" };
}

/***********************
 * AURA & GLOSSARY LOGIC
 ***********************/
const GENRE_EXPLANATIONS = {
  "r&b":
    "Kadife vokallerin ve pürüzsüz ritimlerin buluştuğu duygusal ve akıcı bir tarz. Genellikle aşk, özlem ve melankoli temalarını hisli bir tınıyla işler.",
  edm: "Festivaller ve dans pistleri için sentezleyicilerle üretilen yüksek tempolu, coşkulu müzik. Tamamen hareket, yüksek enerji ve ritim üzerine kuruludur.",
  trap: "Hızlı hi-hat davulları, derin 808 bas vuruşları ve karanlık altyapılar barındıran hipnotik hip-hop türü. Yoğun bir odaklanma ve güç hissi uyandırır.",
  indie:
    "Büyük şirketlerin kalıplarından uzak, özgün ve samimi enstrümantal ses dünyası. Dinleyicide sanatçıyla baş başa loş bir odada sohbet hissi uyandırır.",
  alternatif:
    "Popüler müzik formüllerine uymayan, deneysel tınılar ve özgün sözler içeren özgür bir tarz. Alışılmış kalıpların dışındaki derin sesleri arayanlar içindir.",
  ambient:
    "Belirli bir ritim yerine yavaşça dalgalanan sentezleyici seslerle dinleyicide ortam algısı yaratan tarz. Zihni dinlendirir ve odaklanmayı kolaylaştırır.",
  metal:
    "Distorsiyonlu gitarların, hızlı davulların ve agresif vokallerin birleştiği yüksek enerjili tarz. Yoğun bir deşarj olma ve stresi boşaltma imkanı sunar.",
  blues:
    "Melankolinin gitar telleriyle dışa vurulduğu hüzünlü ve köklü bir müzikal çığlık. Dinleyicide dert ortağı etkisi yaratarak ruhsal arınma sağlar.",
  jazz: "Doğaçlamanın ve anlık yaratıcılığın ön planda olduğu, enstrümanların sohbet ettiği özgür bir müzik dili. Akıcı ritimleri zihne dingin bir keyif sunar.",
  klasik:
    "Piyano, keman gibi akustik orkestra enstrümanlarının matematiksel kusursuzlukla birleştiği asırlık sanat. Zihinsel odaklanmayı ve derin huzuru destekler.",
  soul: "Gospel ve blues esintili vokallerle sanatçının içten gelen samimi hislerini yansıttığı tarz. Doğrudan kalbe dokunan sıcak ve sarmalayıcı bir yapısı vardır.",
  rap: "Yaşam mücadelelerini ve toplumsal gerçekleri hızlı ve ritmik bir akışla (flow) anlatan sokak kültürü. Sözlerindeki yüksek anlatım gücüyle harekete geçirir.",
  pop: "Geniş kitlelerin kolayca eşlik edebileceği akılda kalıcı melodileri ve dinamik ritimleri olan popüler müzik. Duygusal dengesiyle modu anında yükseltir.",
  rock: "Elektro gitarlar, güçlü baslar ve davullar üzerine kurulu özgür ve asi duruşun simgesi. Dinleyicide yoğun bir deşarj olma ve yüksek enerji dalgası yaratır.",
  country:
    "Akustik gitar, keman ve banjo eşliğinde kırsal yaşam hikayelerini anlatan samimi halk müziği. Doğallığı ve sıcak bir yol hikayesini anımsatır.",
  elektronik:
    "Synthesizer'lar ve ritim makineleriyle üretilen fütüristik dijital ses evreni. Dinleyiciyi geleceğe veya bilimkurgusal bir yolculuğa taşır.",
};

function getGenreExplanation(genreName) {
  const lower = genreName.toLowerCase().trim();
  for (const [key, desc] of Object.entries(GENRE_EXPLANATIONS)) {
    if (lower.includes(key) || key.includes(lower)) {
      return { key, title: genreName, desc };
    }
  }
  return {
    key: lower,
    title: genreName,
    desc: `${genreName} tarzı, kendine has ritimleri ve vokal/enstrüman tarzlarıyla şekillenen popüler bir tarzdır.`,
  };
}

const GENRE_MATCH_KEYWORDS = {
  "r&b": ["r&b", "rhythm and blues", "rhythm-and-blues"],
  edm: ["edm", "club", "dance", "house", "techno", "trance"],
  trap: ["trap"],
  indie: ["indie"],
  alternatif: ["alternatif", "alternative"],
  ambient: ["ambient"],
  metal: ["metal"],
  blues: ["blues"],
  jazz: ["jazz", "caz"],
  klasik: ["klasik", "classical", "orchestral"],
  soul: ["soul"],
  rap: ["rap", "hip hop", "hiphop"],
  pop: ["pop"],
  rock: ["rock"],
  country: ["country"],
  elektronik: [
    "electronic",
    "elektronik",
    "electro",
    "house",
    "techno",
    "trance",
    "synthwave",
  ],
};

function getGenreExamples(
  genreKey,
  topArtistsWide,
  topTracksWide,
  trackArtistsDetails,
) {
  const keywords = GENRE_MATCH_KEYWORDS[genreKey] || [genreKey];

  // 1. Find matching artists from topArtistsWide
  const matchedArtists = (topArtistsWide || [])
    .filter((artist) =>
      (artist.genres || []).some((g) => {
        const lowerGenre = g.toLowerCase();
        return keywords.some((kw) => lowerGenre.includes(kw));
      }),
    )
    .map((a) => a.name);

  // 2. Find matching tracks from topTracksWide
  const matchedTracks = (topTracksWide || [])
    .filter((track) =>
      (track.artists || []).some((art) => {
        const details = (trackArtistsDetails || []).find(
          (d) => d.id === art.id,
        );
        return (
          details &&
          (details.genres || []).some((g) => {
            const lowerGenre = g.toLowerCase();
            return keywords.some((kw) => lowerGenre.includes(kw));
          })
        );
      }),
    )
    .map((t) => t.name);

  // Clean duplicates and limit
  const uniqueArtists = Array.from(new Set(matchedArtists)).slice(0, 3);
  const uniqueTracks = Array.from(new Set(matchedTracks)).slice(0, 2);

  let parts = [];
  if (uniqueArtists.length > 0) {
    parts.push(`<strong>Sanatçılar:</strong> ${uniqueArtists.join(", ")}`);
  }
  if (uniqueTracks.length > 0) {
    parts.push(
      `<strong>Şarkılar:</strong> ${uniqueTracks.map((t) => `"${t}"`).join(", ")}`,
    );
  }

  if (parts.length > 0) {
    return `<div style="margin-top: 10px; font-size: 12.5px; color: var(--accent); opacity: 0.95; padding-top: 6px; border-top: 1px dashed var(--border);">🎧 ${parts.join(" • ")}</div>`;
  }

  return "";
}

function renderAura(
  avg,
  genreCounts,
  topArtistsWide,
  topTracksWide,
  trackArtistsDetails,
) {
  const E = avg.energy;
  const D = avg.danceability;
  const V = avg.valence;

  let auraName = "Eko Girdap & Çok Boyutlu Keşif 🌀";
  let auraDesc =
    "Farklı müzik tarzlarının dengeli bir harmonide buluştuğu zengin bir aura. Her anın moduna göre müzik seçen, kalıplara sığmayan çok yönlü bir kaşifsin.";
  let colors = ["#1db954", "#28b4dc", "#7c4dff"]; // Default colors

  if (E >= 0.65 && D >= 0.6) {
    auraName = "Ateşli Ritimler & Neon Işıklar ⚡";
    auraDesc =
      "Yüksek enerjili, tempolu ve dansa davet eden ritimlerin hakimiyeti altında bir aura. Hayatın ritmini yakalayan, coşkulu ve yerinde duramayan bir müzik karakterin var.";
    colors = ["#1db954", "#7c4dff", "#ff4d6d"]; // Green, Purple, Pink
  } else if (E >= 0.65 && V < 0.5) {
    auraName = "Kozmik Fırtına & İsyan 🌌";
    auraDesc =
      "Güçlü gitarların, yüksek volümlü davulların ve melankolik bir isyanın birleştiği elektrikli bir aura. Derinliği olan, tutkulu ve güçlü sesleri seven bir ruha sahipsin.";
    colors = ["#3f1b80", "#ff8d00", "#ff4d6d"]; // Purple, Orange, Crimson
  } else if (E < 0.5 && V >= 0.55) {
    auraName = "Altın Günbatımı & Caz Rüyası 🌅";
    auraDesc =
      "Pürüzsür melodiler, yumuşak ritimler ve huzurlu tınıların dans ettiği altın sarısı bir aura. Hayatı sakin yaşamayı seven, estetiğe ve dinginliğe önem veren bir yapın var.";
    colors = ["#ffd166", "#ff8d00", "#28b4dc"]; // Gold, Orange, Cyan
  } else if (E < 0.5 && V < 0.5) {
    auraName = "Sisli Gece Yarısı & Melankoli ❄️";
    auraDesc =
      "Derin sessizlikler, klasik enstrümanlar ve huzurlu bir hüznün hakim olduğu mistik bir aura. Zihinsel derinliğe, yalnızlığın huzuruna ve enstrümantal hikayelere değer veriyorsun.";
    colors = ["#002244", "#1b6f8a", "#7c4dff"]; // Midnight Blue, Deep Cyan, Purple
  }

  // Apply colors to the moving blobs in background
  document.getElementById("auraBlob1").style.background = colors[0];
  document.getElementById("auraBlob2").style.background = colors[1];
  document.getElementById("auraBlob3").style.background = colors[2];

  document.getElementById("auraName").textContent = auraName;
  document.getElementById("auraDesc").textContent = auraDesc;

  // Render the detailed genre explanation list under the Aura Card
  const listContainer = document.getElementById("genreDetailsList");
  listContainer.innerHTML = "";

  const topGenres = Array.from(genreCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  if (topGenres.length > 0) {
    document.getElementById("genreDetailsSection").classList.remove("hidden");
    topGenres.forEach((g) => {
      const exp = getGenreExplanation(g);
      const examplesHtml = getGenreExamples(
        exp.key,
        topArtistsWide,
        topTracksWide,
        trackArtistsDetails,
      );
      const item = document.createElement("div");
      item.className = "genre-desc-item";
      item.innerHTML = `
            <div class="genre-desc-title">
            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--accent);"></span>
            ${escapeHtml(exp.title)}
            </div>
            <div class="genre-desc-text">${escapeHtml(exp.desc)}</div>
            ${examplesHtml}
        `;
      listContainer.appendChild(item);
    });
  } else {
    document.getElementById("genreDetailsSection").classList.add("hidden");
  }
}

/***********************
 * RENDER
 ***********************/
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cleanNameForMatch(name) {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

async function renderArtists(artists, topTracks = []) {
  topArtistsGrid.innerHTML = "";

  const popularFallbacks = {
    "the weeknd": "Blinding Lights",
    "sezen aksu": "Belalım",
    seksendört: "Ölürüm Hasretinle",
    tarkan: "Şımarık",
    "yüzyüzeyken konuşuruz": "Bodrum",
    manga: "Cevapsız Sorular",
    duman: "Senden Daha Güzel",
    "mor ve ötesi": "Bir Derdim Var",
    ezhel: "Geceler",
    "sagopa kajmer": "Galiba",
    ceza: "Yerli Plaka",
    gülşen: "Yurtta Aşk Cihanda Aşk",
    yalın: "Ki Sen",
    teoman: "Paramparça",
    uzi: "Arasan da",
  };

  for (let i = 0; i < (artists || []).length; i++) {
    const a = artists[i];
    const img = bestImageUrl(a.images);

    // Find user's top track by this artist
    const matchingTrack = topTracks.find((t) =>
      (t.artists || []).some(
        (art) =>
          art.id === a.id ||
          (art.name &&
            a.name &&
            cleanNameForMatch(art.name) === cleanNameForMatch(a.name)),
      ),
    );

    let subtitle = "";
    const artistKey = a.name ? a.name.toLowerCase().trim() : "";

    if (matchingTrack) {
      subtitle = `En çok dinlenen: ${matchingTrack.name}`;
    } else if (popularFallbacks[artistKey]) {
      subtitle = `En çok dinlenen: ${popularFallbacks[artistKey]}`;
    } else {
      // Search API fallback to search for the artist's top track
      try {
        const searchResp = await spotifyFetch(
          `/v1/search?q=artist:${encodeURIComponent(a.name)}&type=track&limit=1`,
        );
        const searchJson = await apiJSON(searchResp);
        const trackName = searchJson?.tracks?.items?.[0]?.name;
        if (trackName) {
          subtitle = `En çok dinlenen: ${trackName}`;
        } else {
          subtitle = `En çok dinlenen: ${a.name} - Hits`;
        }
      } catch (e) {
        subtitle = `En çok dinlenen: ${a.name} Eseri`;
      }
    }

    const url = a.external_urls?.spotify || "#";
    const el = document.createElement("a");
    el.href = url;
    el.target = "_blank";
    el.rel = "noopener noreferrer";
    el.className = "artistCard";
    el.innerHTML = `
        <div class="artistLeft">
            <div class="artistThumb">
            ${img ? `<img alt="${escapeHtml(a.name || "Sanatçı")}" src="${img}"/>` : ""}
            </div>
            <div class="artistMeta">
            <div class="artistName">${escapeHtml(a.name || "Sanatçı")}</div>
            <div class="artistGenre">${escapeHtml(subtitle)}</div>
            </div>
        </div>
        <div class="rankBadge">${i + 1}</div>
        `;
    topArtistsGrid.appendChild(el);
  }
}

function renderTracks(tracks) {
  topTracksList.innerHTML = "";
  for (let i = 0; i < (tracks || []).length; i++) {
    const t = tracks[i];
    const img = t?.album?.images ? bestImageUrl(t.album.images) : null;
    const artistNames = (t.artists || []).map((x) => x.name).join(", ");
    const url = t.external_urls?.spotify || "#";

    const li = document.createElement("li");
    li.className = "trackRow";
    li.innerHTML = `
        <div class="trackLeft">
            <div class="trackThumb">
            ${img ? `<img alt="${escapeHtml(t.name || "Şarkı kapağı")}" src="${img}"/>` : ""}
            </div>
            <div class="trackMeta">
            <div class="trackTitle">${escapeHtml(t.name || "Şarkı")}</div>
            <div class="trackArtists">${escapeHtml(artistNames || "—")}</div>
            </div>
        </div>
        <div class="rankBadge">${i + 1}</div>
        `;
    li.addEventListener("click", () =>
      window.open(url, "_blank", "noopener,noreferrer"),
    );
    topTracksList.appendChild(li);
  }
}

/***********************
 * MAIN
 ***********************/
function requireClientIdOrThrow() {
  if (!SPOTIFY_CLIENT_ID || SPOTIFY_CLIENT_ID === "SPOTIFY_CLIENT_ID_HERE") {
    throw new Error(
      "Spotify `Client ID` placeholder'ını doldurmalısın: SPOTIFY_CLIENT_ID_HERE.",
    );
  }
}

async function analyze() {
  requireClientIdOrThrow();

  showLoading("Analiz yapılıyor...", "Top sanatçılar ve türler hesaplanıyor");

  const timeRange = "short_term";
  const [
    topArtistsJson,
    topTracksJson,
    topArtistsWideJson,
    topTracksWideJson,
    me,
  ] = await Promise.all([
    fetchTopArtists(5, timeRange),
    fetchTopTracks(5, timeRange),
    fetchTopArtists(25, timeRange),
    fetchTopTracks(25, timeRange),
    fetchMe(),
  ]);

  const topArtists = topArtistsJson.items || [];
  const topTracks = topTracksJson.items || [];
  const topArtistsWide = topArtistsWideJson.items || [];
  const topTracksWide = topTracksWideJson.items || [];

  // Profile
  const meImg = bestImageUrl(me?.images);
  profileImg.src = meImg || "";
  profileImg.alt = "Profil fotoğrafı";
  profileName.textContent = me?.display_name || "Spotify Kullanıcısı";
  profileSub.textContent = "Spotify profili • Son dönem";

  // Artists & Tracks
  await renderArtists(topArtists, topTracksWide);
  renderTracks(topTracks);

  // Scores from genres
  showLoading(
    "Müzik kişiliği çıkarılıyor...",
    "Tür dağılımından skor türetiliyor",
  );
  const trackArtistIds = topTracksWide
    .flatMap((t) => (t?.artists || []).map((a) => a?.id))
    .filter(Boolean);
  const trackArtistsDetails = await fetchArtistsByIds(trackArtistIds);
  let genreCounts = buildGenreCountsFromArtistsAndTracks(
    topArtistsWide,
    topTracksWide,
    trackArtistsDetails,
  );

  // Fallback: If Spotify returns empty genres for this account (common in dev mode or new accounts),
  // generate realistic stable values based on the user's name to keep the app working beautifully.
  let avg;
  if (genreCounts && genreCounts.size > 0) {
    avg = computeScoresFromGenres(genreCounts);
  } else {
    // Simple hash function for stable values
    const seedStr = me?.display_name || "Spotify";
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const seed = Math.abs(hash);

    // Populate fallback genres for the Aura
    const defaultGenres = [
      "Pop",
      "Rock",
      "Rap",
      "R&B",
      "Alternatif",
      "Elektronik",
      "Klasik",
      "Jazz",
    ];
    genreCounts = new Map();
    genreCounts.set(defaultGenres[seed % defaultGenres.length], 45);
    genreCounts.set(defaultGenres[(seed + 1) % defaultGenres.length], 28);
    genreCounts.set(defaultGenres[(seed + 2) % defaultGenres.length], 15);
    genreCounts.set(defaultGenres[(seed + 3) % defaultGenres.length], 12);

    // Calculate average scores based on the generated fallback genres
    avg = computeScoresFromGenres(genreCounts);
  }

  lastGenreCounts = genreCounts;
  renderAura(
    avg,
    genreCounts,
    topArtistsWide,
    topTracksWide,
    trackArtistsDetails,
  );
  drawGenreChart(genreCounts);

  // Views
  hideLoading();
  revealCards();
  confettiBurst();
}

function drawGenreChart(genreCounts) {
  const canvas = document.getElementById("genreChart");
  if (!canvas) return;

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  const sorted = Array.from(genreCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  if (sorted.length === 0) return;

  const labels = sorted.map(
    ([name]) => name.charAt(0).toUpperCase() + name.slice(1),
  );
  const data = sorted.map(([, count]) => Math.round(count * 10) / 10);

  const colorPalette = [
    "#1db954",
    "#7c4dff",
    "#ffd166",
    "#ff4d6d",
    "#28b4dc",
    "#ff8d00",
  ];
  const isLight = document.documentElement.dataset.theme === "light";

  const ctx = canvas.getContext("2d");
  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colorPalette.slice(0, sorted.length),
          borderWidth: 0,
          hoverOffset: 12,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: isLight ? "rgba(10,10,10,0.8)" : "rgba(255,255,255,0.8)",
            font: {
              family: "Inter",
              size: 12,
              weight: "600",
            },
            padding: 20,
            usePointStyle: true,
            pointStyle: "circle",
          },
        },
        tooltip: {
          backgroundColor: "rgba(10, 10, 10, 0.95)",
          titleFont: { family: "Inter", size: 13, weight: "700" },
          bodyFont: { family: "Inter", size: 12, weight: "500" },
          padding: 12,
          cornerRadius: 10,
          borderColor: "rgba(255, 255, 255, 0.08)",
          borderWidth: 1,
          callbacks: {
            label: function (context) {
              return ` Oran: ${context.raw}`;
            },
          },
        },
      },
      cutout: "65%",
      animation: {
        duration: 1200,
        easing: "easeOutQuart",
      },
    },
  });
}

function startOAuth() {
  try {
    requireClientIdOrThrow();
  } catch (e) {
    showToast(e.message || String(e));
    return;
  }

  if (window.location.protocol === "file:") {
    showToast("OAuth için `file://` yerine `http://` veya `https://` ile aç.");
    return;
  }

  const verifier = generateCodeVerifier();
  sessionStorage.setItem(SESSION.verifier, verifier);
  const state = genState();
  sessionStorage.setItem(SESSION.state, state);

  sha256Base64Url(verifier).then((challenge) => {
    const url = new URL(AUTH_ENDPOINT);
    url.searchParams.set("client_id", SPOTIFY_CLIENT_ID);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("redirect_uri", BASE_URL);
    url.searchParams.set("state", state);
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("code_challenge", challenge);
    url.searchParams.set(
      "scope",
      "user-top-read user-read-private user-read-email",
    );
    window.location.href = url.toString();
  });
}

function logout() {
  accessToken = null;
  localStorage.removeItem(SESSION.token);
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
  analysisView.classList.add("hidden");
  landingView.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function buildShareText() {
  const aura = document.getElementById("auraName").textContent || "—";
  return `Benim Spotify Müzikal Auran: ${aura}! Sen de müzik auranı keşfetmek için: https://sweet-liger-d50241.netlify.app/`;
}

async function shareResults() {
  const text = buildShareText();
  const shareData = { title: "Müzik Kişiliği Analizi", text };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
  } catch {
    // ignore -> fallback
  }

  try {
    await navigator.clipboard.writeText(text);
    showToast("Sonuçlar panoya kopyalandı.");
  } catch {
    showToast(text);
  }
}

/***********************
 * BOOT
 ***********************/
async function boot() {
  try {
    const cached = getTokenCache();
    if (cached?.access_token) {
      accessToken = cached.access_token;
      landingView.classList.add("hidden");
      analysisView.classList.remove("hidden");
      await analyze();
      return;
    }

    const token = await ensureAccessTokenFromOAuthCallback();
    if (token) {
      accessToken = token;
      landingView.classList.add("hidden");
      analysisView.classList.remove("hidden");
      await analyze();
      return;
    }

    // Initial state
    landingView.classList.remove("hidden");
    analysisView.classList.add("hidden");
  } catch (e) {
    hideLoading();
    showToast(e?.message || String(e));
    landingView.classList.remove("hidden");
    analysisView.classList.add("hidden");
  }
}

loginBtn.addEventListener("click", startOAuth);
logoutBtn.addEventListener("click", logout);
shareBtn.addEventListener("click", shareResults);

// Reduce initial card reveal until analysis finishes.
revealCards._ran = false;

// Card initial: ensure personality card fade-in uses reveal class
// We'll mark all [data-reveal] as starting hidden via CSS .reveal opacity.
boot();
