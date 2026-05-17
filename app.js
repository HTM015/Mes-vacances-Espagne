const KEY = "horizon-chill-v2";
const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=39.47&longitude=-0.38&current=temperature_2m,weather_code&timezone=auto";
const MAX_PHOTOS = 24;

const BUDGET_CATS = [
  { id: "transport", label: "Transport", emoji: "🚗" },
  { id: "hebergement", label: "Logement", emoji: "🏠" },
  { id: "activites", label: "Activités", emoji: "🌴" },
  { id: "autre", label: "Autre", emoji: "✨" },
];

const defaults = {
  destination: "Autour de Valencia, 30 min max",
  startDate: "",
  endDate: "",
  budgetMax: "2600",
  routeNotes:
    "Liege -> Marseille\nPause 1 ou 2 jours a Marseille avec parking.\nMarseille -> region de Valencia.\nPenser pauses longues, eau, snacks, doudou, dessins animes telecharges.",
  housingNotes: "Clim, parking, cuisine, lave-linge si possible. Rythme tranquille avec la petite.",
  freeNotes:
    "Chercher un appart avec clim, parking, cuisine, lave-linge si possible.\nObjectif: un peu plage, un peu visite, rythme tranquille avec la petite.",
  darkMode: true,
  currentTab: "home",
  weather: { temp: 28, label: "Ensoleillé", emoji: "☀️" },
  homeChecks: [
    { text: "Climatisation", done: false },
    { text: "Parking facile ou inclus", done: false },
    { text: "Cuisine", done: false },
    { text: "30 min max de Valencia", done: false },
    { text: "Plage pas trop loin", done: false },
    { text: "Annulation gratuite si possible", done: false },
  ],
  activities: [
    { text: "Oceanografic Valencia", done: false },
    { text: "Plage calme le matin", done: false },
    { text: "Balade courte dans Valencia", done: false },
    { text: "Spot drone a verifier avant de voler", done: false },
  ],
  packing: [
    { text: "Cartes ID / passeports", done: false },
    { text: "Permis, assurance, carte grise", done: false },
    { text: "Doudou, couches, lingettes", done: false },
    { text: "Creme solaire, chapeaux, maillots", done: false },
    { text: "Drone, batteries, chargeur, cartes memoire", done: false },
    { text: "Chargeurs telephone et voiture", done: false },
  ],
  documents: [
    { text: "Cartes identite / passeports", done: false },
    { text: "Reservations logement", done: false },
    { text: "Assurance voyage", done: false },
    { text: "Permis de conduire", done: false },
    { text: "Carte grise + assurance auto", done: false },
    { text: "Papiers bebe / pharmacie", done: false },
  ],
  routeSteps: [
    {
      title: "Liege -> Marseille",
      note: "Pauses longues, eau, snacks, dessins animes telecharges.",
      type: "route",
      distanceKm: 950,
      driveMin: 540,
      tolls: 180,
    },
    {
      title: "Pause Marseille 1-2 jours",
      note: "Vieux-Port, parking, sieste obligatoire pour la petite.",
      type: "pause",
      distanceKm: 0,
      driveMin: 0,
      tolls: 220,
    },
    {
      title: "Marseille -> region Valencia",
      note: "Depart tot, arrivee fin d'aprem, courses a l'arrivee.",
      type: "route",
      distanceKm: 780,
      driveMin: 480,
      tolls: 160,
    },
  ],
  budgetItems: [
    { text: "Essence + peages", amount: 340, category: "transport" },
    { text: "Pause Marseille", amount: 220, category: "hebergement" },
  ],
  photos: [],
};

let state = load();
let currentTab = state.currentTab || "home";

function load() {
  const saved = localStorage.getItem(KEY);
  const legacy = localStorage.getItem("vacances-chill-simple-v1");
  if (!saved && legacy) {
    try {
      const old = JSON.parse(legacy);
      return migrateOld(old);
    } catch {
      /* ignore */
    }
  }
  if (!saved) return structuredClone(defaults);
  try {
    return { ...structuredClone(defaults), ...JSON.parse(saved) };
  } catch {
    return structuredClone(defaults);
  }
}

function migrateOld(old) {
  const next = structuredClone(defaults);
  Object.assign(next, old);
  if (old.budgetItems) {
    next.budgetItems = old.budgetItems.map((item) => ({
      ...item,
      category: item.category || guessCategory(item.text),
    }));
  }
  return next;
}

function guessCategory(text) {
  const t = text.toLowerCase();
  if (/essence|peage|route|essence|carburant/.test(t)) return "transport";
  if (/hotel|appart|logement|airbnb/.test(t)) return "hebergement";
  if (/ocean|plage|visite|activite|resto/.test(t)) return "activites";
  return "autre";
}

function save() {
  state.currentTab = currentTab;
  localStorage.setItem(KEY, JSON.stringify(state));
}

function $(selector) {
  return document.querySelector(selector);
}

function money(value) {
  return `${Number(value || 0).toLocaleString("fr-BE")} €`;
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);
}

function getBudgetSpent() {
  return state.budgetItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
}

function getBudgetMax() {
  return Number(state.budgetMax || 0);
}

function getRouteTotals() {
  return state.routeSteps.reduce(
    (acc, step) => {
      acc.distanceKm += Number(step.distanceKm || 0);
      acc.driveMin += Number(step.driveMin || 0);
      acc.tolls += Number(step.tolls || 0);
      return acc;
    },
    { distanceKm: 0, driveMin: 0, tolls: 0 }
  );
}

function formatDrive(minutes) {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h${m ? ` ${m}min` : ""}` : `${m} min`;
}

function getCountdownText() {
  if (!state.startDate) return "À définir";
  const start = new Date(`${state.startDate}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const days = Math.ceil((start - today) / 86400000);
  if (days > 1) return `J-${days}`;
  if (days === 1) return "Demain";
  if (days === 0) return "Aujourd'hui";
  return "En route";
}

function getWeatherText() {
  const w = state.weather || defaults.weather;
  return `${w.emoji} ${w.temp}° ${w.label}`;
}

function wmoEmoji(code) {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "🌨️";
  if (code <= 82) return "🌦️";
  if (code <= 86) return "🌨️";
  return "⛈️";
}

function wmoLabel(code) {
  if (code === 0) return "Dégagé";
  if (code <= 3) return "Nuageux";
  if (code <= 48) return "Brume";
  if (code <= 67) return "Pluie";
  if (code <= 77) return "Neige";
  if (code <= 82) return "Averses";
  return "Orage";
}

function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove("show"), 2800);
}

async function fetchWeather() {
  try {
    const res = await fetch(WEATHER_URL);
    if (!res.ok) return;
    const data = await res.json();
    const temp = Math.round(data.current.temperature_2m);
    const code = data.current.weather_code;
    state.weather = { temp, label: wmoLabel(code), emoji: wmoEmoji(code) };
    save();
    renderHero();
    renderStats();
  } catch {
    /* hors ligne : garder la dernière météo */
  }
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const max = 900;
        let w = img.width;
        let h = img.height;
        if (w > h && w > max) {
          h = Math.round((h * max) / w);
          w = max;
        } else if (h > max) {
          w = Math.round((w * max) / h);
          h = max;
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function exportBackup() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `the-sun-road-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Sauvegarde exportée ✓");
}

function importBackup(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      state = { ...structuredClone(defaults), ...data };
      currentTab = state.currentTab || "home";
      save();
      render();
      setTab(currentTab);
      showToast("Sauvegarde importée ✓");
    } catch {
      showToast("Fichier JSON invalide");
    }
  };
  reader.readAsText(file);
}

function estimateFuel() {
  const totals = getRouteTotals();
  const liters = Math.round((totals.distanceKm / 100) * 7.2);
  return liters ? `~${liters} L` : "—";
}

function getPrepProgress() {
  const routeDone = state.routeSteps.length >= 2;
  const budgetOk = getBudgetMax() > 0 && getBudgetSpent() <= getBudgetMax();
  const actDone = state.activities.filter((a) => a.done).length;
  const actTarget = Math.max(state.activities.length, 1);
  const packDone = state.packing.filter((p) => p.done).length;
  const packTarget = Math.max(state.packing.length, 1);
  const docsDone = state.documents.filter((d) => d.done).length;
  const docsTarget = Math.max(state.documents.length, 1);

  const score =
    (routeDone ? 25 : 0) +
    (budgetOk ? 20 : getBudgetMax() ? 10 : 0) +
    (actDone / actTarget) * 20 +
    (packDone / packTarget) * 20 +
    (docsDone / docsTarget) * 15;

  return {
    percent: Math.min(100, Math.round(score)),
    items: [
      { label: "Route", done: routeDone, detail: routeDone ? "✅" : `${state.routeSteps.length} étapes` },
      {
        label: "Budget",
        done: budgetOk,
        detail: budgetOk ? "✅" : money(getBudgetMax() - getBudgetSpent()) + " reste",
      },
      {
        label: "Activités",
        done: actDone >= 3,
        detail: `${actDone}/${state.activities.length}`,
      },
      {
        label: "Valise",
        done: packDone === packTarget && packTarget > 0,
        detail: `${Math.round((packDone / packTarget) * 100)}%`,
      },
    ],
  };
}

function applyTimeTheme() {
  const hour = new Date().getHours();
  document.body.classList.remove("time-morning", "time-afternoon", "time-evening", "time-night");
  if (hour >= 6 && hour < 12) document.body.classList.add("time-morning");
  else if (hour >= 12 && hour < 17) document.body.classList.add("time-afternoon");
  else if (hour >= 17 && hour < 21) document.body.classList.add("time-evening");
  else document.body.classList.add("time-night");
}

function applyTheme() {
  document.body.classList.toggle("theme-light", !state.darkMode);
  const btn = $("#themeToggle");
  if (btn) btn.textContent = state.darkMode ? "🌙" : "☀️";
  document.querySelector('meta[name="theme-color"]').content = state.darkMode ? "#0b1220" : "#e8f4ff";
}

function setTab(tab) {
  currentTab = tab;
  document.querySelectorAll(".panel").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === tab);
  });
  document.querySelectorAll(".nav-item").forEach((btn) => {
    const active = btn.dataset.tab === tab;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-current", active ? "page" : "false");
  });
  save();
}

function renderHero() {
  const spent = getBudgetSpent();
  const max = getBudgetMax();
  const left = Math.max(0, max - spent);

  $("#heroDestination").textContent = state.destination || "—";
  $("#heroCountdown").textContent = getCountdownText();
  $("#heroBudget").textContent = max ? money(left) : "—";
  $("#heroWeather").textContent = getWeatherText();
}

function renderStats() {
  const spent = getBudgetSpent();
  const max = getBudgetMax();
  const left = Math.max(0, max - spent);
  const totals = getRouteTotals();
  const packDone = state.packing.filter((p) => p.done).length;
  const packTotal = state.packing.length;

  $("#statBudgetLeft").textContent = max ? money(left) : "—";
  $("#statFuel").textContent = estimateFuel();
  $("#statDistance").textContent = totals.distanceKm ? `${totals.distanceKm} km` : "—";
  $("#statDriveTime").textContent = formatDrive(totals.driveMin);
  $("#statWeather").textContent = getWeatherText();
  $("#statPacking").textContent = `${packDone} / ${packTotal}`;
  $("#statCountdown").textContent = getCountdownText();

  $("#mapDistance").textContent = totals.distanceKm ? `${totals.distanceKm} km` : "—";
  $("#mapTime").textContent = formatDrive(totals.driveMin);
  $("#mapTolls").textContent = totals.tolls ? money(totals.tolls) : "—";
}

function renderPrep() {
  const prep = getPrepProgress();
  $("#prepPercent").textContent = `${prep.percent}%`;
  $("#prepBar").style.width = `${prep.percent}%`;
  $("#prepChecks").innerHTML = prep.items
    .map(
      (item) => `
      <li class="${item.done ? "done" : ""}">
        <span>${item.done ? "✅" : "○"}</span>
        <span>${escapeHtml(item.label)} — ${escapeHtml(item.detail)}</span>
      </li>`
    )
    .join("");
}

function renderChecks(key, selector) {
  const container = $(selector);
  if (!container) return;
  container.innerHTML = state[key]
    .map(
      (item, index) => `
        <label class="check ${item.done ? "done" : ""}" data-key="${key}" data-index="${index}">
          <input type="checkbox" data-check="${key}" data-index="${index}" ${item.done ? "checked" : ""} />
          <span>${escapeHtml(item.text)}</span>
        </label>`
    )
    .join("");
}

function renderRows(key, selector) {
  const container = $(selector);
  if (!container) return;
  const empty = $(`#${key === "activities" ? "activity" : "packing"}Empty`);
  const hasItems = state[key].length > 0;
  container.innerHTML = state[key]
    .map(
      (item, index) => `
        <div class="row ${item.done ? "done" : ""}">
          <input type="checkbox" data-check="${key}" data-index="${index}" ${item.done ? "checked" : ""} />
          <span class="row-text">${escapeHtml(item.text)}</span>
          <button class="delete" type="button" data-delete="${key}" data-index="${index}" aria-label="Supprimer">×</button>
        </div>`
    )
    .join("");
  if (empty) empty.classList.toggle("hidden", hasItems);
}

function renderBudget() {
  const spent = getBudgetSpent();
  const max = getBudgetMax() || 1;
  const left = Math.max(0, max - spent);
  const percent = Math.min(100, Math.round((spent / max) * 100));
  const circumference = 327;
  const offset = circumference - (percent / 100) * circumference;

  $("#budgetSpentTotal").textContent = money(spent);
  $("#budgetLeftTotal").textContent = money(left);
  $("#budgetMaxLabel").textContent = money(max);
  $("#budgetPercentLabel").textContent = `${percent}%`;

  const ring = $("#budgetRing");
  if (ring) {
    ring.style.strokeDashoffset = String(offset);
    if (!document.getElementById("budgetGradient")) {
      const svg = ring.closest("svg");
      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      defs.innerHTML = `<linearGradient id="budgetGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#2dd4bf"/>
        <stop offset="50%" stop-color="#a78bfa"/>
        <stop offset="100%" stop-color="#fb923c"/>
      </linearGradient>`;
      svg.prepend(defs);
      ring.setAttribute("stroke", "url(#budgetGradient)");
    }
  }

  const byCat = {};
  BUDGET_CATS.forEach((c) => {
    byCat[c.id] = 0;
  });
  state.budgetItems.forEach((item) => {
    const cat = item.category || "autre";
    byCat[cat] = (byCat[cat] || 0) + Number(item.amount || 0);
  });

  $("#budgetCategories").innerHTML = BUDGET_CATS.map((cat) => {
    const amount = byCat[cat.id] || 0;
    const pct = spent ? Math.round((amount / spent) * 100) : 0;
    return `
      <div class="cat-row">
        <div class="cat-head">
          <span>${cat.emoji} ${cat.label}</span>
          <span>${money(amount)}</span>
        </div>
        <div class="cat-bar">
          <div class="cat-fill ${cat.id}" style="width:${pct}%"></div>
        </div>
      </div>`;
  }).join("");

  const list = $("#budgetList");
  const empty = $("#budgetEmpty");
  list.innerHTML = state.budgetItems
    .map((item, index) => {
      const cat = BUDGET_CATS.find((c) => c.id === (item.category || "autre"));
      return `
        <div class="row budget-row">
          <span class="tag ${item.category || "autre"}">${cat ? cat.emoji : "✨"}</span>
          <div class="row-text">
            <span>${escapeHtml(item.text)}</span>
            <span class="row-meta"><span class="tag money">${money(item.amount)}</span></span>
          </div>
          <button class="delete" type="button" data-delete="budgetItems" data-index="${index}" aria-label="Supprimer">×</button>
        </div>`;
    })
    .join("");
  empty.classList.toggle("hidden", state.budgetItems.length > 0);
}

function renderTimeline() {
  const container = $("#routeTimeline");
  const empty = $("#routeEmpty");
  const has = state.routeSteps.length > 0;
  container.innerHTML = state.routeSteps
    .map(
      (step, index) => `
      <article class="timeline-item" style="animation-delay:${index * 0.06}s">
        <div class="timeline-card">
          <h4>${escapeHtml(step.title)}</h4>
          <div class="row-meta">
            <span class="tag ${step.type === "pause" ? "pause" : "route"}">${step.type === "pause" ? "Pause" : "Route"}</span>
            ${step.distanceKm ? `<span class="tag route">${step.distanceKm} km</span>` : ""}
            ${step.driveMin ? `<span class="tag route">${formatDrive(step.driveMin)}</span>` : ""}
            ${step.tolls ? `<span class="tag money">${money(step.tolls)}</span>` : ""}
          </div>
          <p>${escapeHtml(step.note || "")}</p>
          <button class="delete" type="button" data-delete="routeSteps" data-index="${index}" aria-label="Supprimer étape" style="margin-top:8px">Supprimer</button>
        </div>
      </article>`
    )
    .join("");
  empty.classList.toggle("hidden", has);
  renderMiniMap();
}

function renderMiniMap() {
  const map = $("#miniMap");
  const pins = [
    { label: "Liege", x: 18, y: 22 },
    { label: "Marseille", x: 48, y: 55 },
    { label: "Valencia", x: 78, y: 78 },
  ];
  const path = "M 36 44 Q 120 90 220 130 Q 300 150 340 200";
  map.innerHTML = `
    <svg class="map-route" viewBox="0 0 360 220" preserveAspectRatio="none">
      <path d="${path}" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="4" stroke-dasharray="8 10" stroke-linecap="round"/>
    </svg>
    ${pins
      .map(
        (p) => `<span class="map-pin" data-label="${p.label}" style="left:${p.x}%;top:${p.y}%"></span>`
      )
      .join("")}`;
}

function renderGallery() {
  const gallery = $("#gallery");
  const empty = $("#galleryEmpty");
  gallery.innerHTML = state.photos
    .map(
      (photo, index) => `
      <figure class="gallery-item">
        <img src="${photo}" alt="Souvenir ${index + 1}" loading="lazy" />
        <button type="button" data-delete-photo="${index}" aria-label="Supprimer photo">×</button>
      </figure>`
    )
    .join("");
  empty.classList.toggle("hidden", state.photos.length > 0);
}

function renderPacking() {
  renderRows("packing", "#packingList");
  const done = state.packing.filter((p) => p.done).length;
  const total = state.packing.length || 1;
  const pct = Math.round((done / total) * 100);
  $("#packingBar").style.width = `${pct}%`;
  $("#packingLabel").textContent = `${done} / ${state.packing.length}`;
}

function render() {
  applyTimeTheme();
  applyTheme();

  ["destination", "startDate", "endDate", "budgetMax", "routeNotes", "freeNotes", "housingNotes"].forEach(
    (id) => {
      const node = $(`#${id}`);
      if (node) node.value = state[id] || "";
    }
  );

  renderHero();
  renderStats();
  renderPrep();
  renderChecks("homeChecks", "#homeChecks");
  renderChecks("documents", "#documentsList");
  renderRows("activities", "#activityList");
  renderPacking();
  renderBudget();
  renderTimeline();
  renderGallery();
}

function openSheet(mode) {
  const sheet = $("#addSheet");
  const fields = $("#sheetFields");
  const title = $("#sheetTitle");
  fields.innerHTML = "";
  sheet.dataset.mode = mode;

  if (mode === "activity") {
    title.textContent = "Nouvelle activité";
    fields.innerHTML = `<label>Idée <input name="text" required placeholder="Plage, aquarium…" /></label>`;
  } else if (mode === "packing") {
    title.textContent = "Ajouter à la valise";
    fields.innerHTML = `<label>Article <input name="text" required placeholder="Maillot, chargeur…" /></label>`;
  } else if (mode === "budget") {
    title.textContent = "Nouvelle dépense";
    fields.innerHTML = `
      <label>Description <input name="text" required placeholder="Hotel, essence…" /></label>
      <label>Montant <input name="amount" type="number" min="0" step="1" required placeholder="0" /></label>
      <label>Catégorie
        <select name="category">
          ${BUDGET_CATS.map((c) => `<option value="${c.id}">${c.emoji} ${c.label}</option>`).join("")}
        </select>
      </label>`;
  } else if (mode === "route") {
    title.textContent = "Nouvelle étape";
    fields.innerHTML = `
      <label>Titre <input name="title" required placeholder="Ville -> Ville" /></label>
      <label>Note <input name="note" placeholder="Pause, rappel…" /></label>
      <label>Type
        <select name="type">
          <option value="route">Route</option>
          <option value="pause">Pause</option>
        </select>
      </label>
      <label>Distance (km) <input name="distanceKm" type="number" min="0" step="10" /></label>
      <label>Temps (min) <input name="driveMin" type="number" min="0" step="15" /></label>
      <label>Péages (€) <input name="tolls" type="number" min="0" step="10" /></label>`;
  }

  sheet.showModal();
  const first = fields.querySelector("input, select");
  if (first) first.focus();
}

function handleSheetSubmit(event) {
  event.preventDefault();
  const sheet = $("#addSheet");
  const mode = sheet.dataset.mode;
  const data = new FormData(event.target);

  if (mode === "activity") {
    state.activities.push({ text: data.get("text").trim(), done: false });
  } else if (mode === "packing") {
    state.packing.push({ text: data.get("text").trim(), done: false });
  } else if (mode === "budget") {
    state.budgetItems.push({
      text: data.get("text").trim() || "Dépense",
      amount: Number(data.get("amount") || 0),
      category: data.get("category") || "autre",
    });
  } else if (mode === "route") {
    state.routeSteps.push({
      title: data.get("title").trim(),
      note: data.get("note").trim(),
      type: data.get("type") || "route",
      distanceKm: Number(data.get("distanceKm") || 0),
      driveMin: Number(data.get("driveMin") || 0),
      tolls: Number(data.get("tolls") || 0),
    });
  }

  sheet.close();
  event.target.reset();
  save();
  render();
}

document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => setTab(btn.dataset.tab));
});

$("#fab").addEventListener("click", () => {
  const map = {
    home: "activity",
    cities: null,
    route: "route",
    activities: "activity",
    budget: "budget",
    more: "packing",
  };
  const mode = map[currentTab];
  if (mode) openSheet(mode);
  else setTab("activities");
});

$("#themeToggle").addEventListener("click", () => {
  state.darkMode = !state.darkMode;
  save();
  applyTheme();
});

$("#sheetCancel").addEventListener("click", () => $("#addSheet").close());
$("#addForm").addEventListener("submit", handleSheetSubmit);

document.addEventListener("input", (event) => {
  const id = event.target.id;
  if (
    !["destination", "startDate", "endDate", "budgetMax", "routeNotes", "freeNotes", "housingNotes"].includes(
      id
    )
  )
    return;
  state[id] = event.target.value;
  save();
  renderHero();
  renderStats();
  renderPrep();
  renderBudget();
});

document.addEventListener("change", (event) => {
  const key = event.target.dataset.check;
  if (!key) return;
  const row = event.target.closest(".check, .row");
  state[key][Number(event.target.dataset.index)].done = event.target.checked;
  if (row) {
    row.classList.toggle("done", event.target.checked);
    row.classList.add("pop");
    setTimeout(() => row.classList.remove("pop"), 400);
  }
  save();
  renderStats();
  renderPrep();
  renderPacking();
});

document.addEventListener("click", (event) => {
  const del = event.target.closest("[data-delete]");
  if (del) {
    state[del.dataset.delete].splice(Number(del.dataset.index), 1);
    save();
    render();
    return;
  }
  const photoDel = event.target.closest("[data-delete-photo]");
  if (photoDel) {
    state.photos.splice(Number(photoDel.dataset.deletePhoto), 1);
    save();
    renderGallery();
  }
});

$("#photoInput").addEventListener("change", async (event) => {
  const files = [...event.target.files];
  if (!files.length) return;
  for (const file of files) {
    if (state.photos.length >= MAX_PHOTOS) {
      showToast(`Maximum ${MAX_PHOTOS} photos`);
      break;
    }
    try {
      const dataUrl = await compressImage(file);
      state.photos.push(dataUrl);
    } catch {
      showToast("Photo non importée");
    }
  }
  save();
  renderGallery();
  event.target.value = "";
});

$("#resetData").addEventListener("click", () => {
  if (!confirm("Effacer toutes les données locales ?")) return;
  localStorage.removeItem(KEY);
  state = structuredClone(defaults);
  currentTab = "home";
  save();
  render();
});

$("#exportData").addEventListener("click", exportBackup);
$("#importData").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (file) importBackup(file);
  event.target.value = "";
});

render();
setTab(currentTab);
fetchWeather();

setInterval(applyTimeTheme, 60000);

setInterval(fetchWeather, 30 * 60 * 1000);
