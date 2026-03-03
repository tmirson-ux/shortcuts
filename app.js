/**
 * Shortcuts state - localStorage persistence + seed data
 * Key: "homepage.shortcuts"
 * Data model: shortcuts map, folders map, items array (ordered layout)
 */

const ENABLE_RESUME = true;

const STORAGE_KEY = "homepage.shortcuts";
const TILE_SIZE_KEY = "homepage.tileSize";
const TILE_VIEW_KEY = "homepage.tileView";
const TILE_GRID_SIZE_KEY = "homepage.gridSize";
const SHOW_LABELS_KEY = "homepage.showLabels";
const SHOW_SHORTCUTS_KEY = "homepage.showShortcuts";
const SHOW_RESUME_KEY = "homepage.showResume";
const SHORTCUTS_ROWS_KEY = "homepage.shortcutsRows";
const STATE_VERSION = 2;

let isDraggingShortcut = false;
let shortcutsExpanded = false;

function getTileView() {
  try {
    const v = localStorage.getItem(TILE_VIEW_KEY);
    if (v === "list" || v === "grid") return v;
    const legacy = localStorage.getItem(TILE_SIZE_KEY);
    if (legacy === "list") return "list";
  } catch (_) {}
  return "grid";
}

function setTileView(view) {
  try {
    localStorage.setItem(TILE_VIEW_KEY, view);
  } catch (_) {}
}

const GRID_SIZE_STOPS = [0, 50, 100]; /* small, default, large */

function snapToGridStop(val) {
  const v = Math.max(0, Math.min(100, val));
  return GRID_SIZE_STOPS.reduce((prev, curr) =>
    Math.abs(curr - v) < Math.abs(prev - v) ? curr : prev
  );
}

function getGridSize() {
  try {
    const v = parseInt(localStorage.getItem(TILE_GRID_SIZE_KEY), 10);
    if (!isNaN(v) && v >= 0 && v <= 100) return snapToGridStop(v);
    const legacy = localStorage.getItem(TILE_SIZE_KEY);
    if (legacy === "small") return 0;
    if (legacy === "large") return 100;
  } catch (_) {}
  return 50;
}

function setGridSize(val) {
  try {
    localStorage.setItem(TILE_GRID_SIZE_KEY, String(snapToGridStop(val)));
  } catch (_) {}
}

function gridSizeToTileSize(val) {
  if (val <= 25) return "small";
  if (val <= 75) return "default";
  return "large";
}

function getTileSize() {
  if (getTileView() === "list") return "list";
  return gridSizeToTileSize(getGridSize());
}

function setTileSize(size) {
  if (size === "list") {
    setTileView("list");
  } else {
    setTileView("grid");
    if (size === "small") setGridSize(16);
    else if (size === "large") setGridSize(84);
    else setGridSize(50);
  }
}

function getShowLabels() {
  if (getTileView() === "list") return true;
  try {
    const v = localStorage.getItem(SHOW_LABELS_KEY);
    if (v === "false") return false;
  } catch (_) {}
  return true;
}

function setShowLabels(show) {
  try {
    localStorage.setItem(SHOW_LABELS_KEY, String(show));
  } catch (_) {}
}

function getShowResume() {
  try {
    const v = localStorage.getItem(SHOW_RESUME_KEY);
    if (v === "true") return true;
  } catch (_) {}
  return false;
}

function setShowResume(show) {
  try {
    localStorage.setItem(SHOW_RESUME_KEY, String(show));
  } catch (_) {}
}

function getShowShortcuts() {
  try {
    const v = localStorage.getItem(SHOW_SHORTCUTS_KEY);
    if (v === "false") return false;
  } catch (_) {}
  return true;
}

function setShowShortcuts(show) {
  try {
    localStorage.setItem(SHOW_SHORTCUTS_KEY, String(show));
  } catch (_) {}
}

function getShortcutsRows() {
  try {
    const v = localStorage.getItem(SHORTCUTS_ROWS_KEY);
    const n = parseInt(v, 10);
    if (!isNaN(n) && n >= 1 && n <= 4) return n;
  } catch (_) {}
  return 1;
}

function setShortcutsRows(rows) {
  try {
    localStorage.setItem(SHORTCUTS_ROWS_KEY, String(rows));
  } catch (_) {}
}

const ITEMS_PER_ROW_DEFAULT = 10;

function getItemsPerRow() {
  const size = getTileSize();
  if (size === "small") return 12;
  if (size === "large") return 8;
  return ITEMS_PER_ROW_DEFAULT;
}

function getMaxShortcutsToShow() {
  const rows = getShortcutsRows();
  return rows * getItemsPerRow();
}

function applyCustomization() {
  const section = document.getElementById("shortcuts-section");
  if (!section) return;
  section.setAttribute("data-tile-size", getTileSize());
  section.setAttribute("data-show-labels", getShowLabels() ? "true" : "false");
  section.setAttribute("data-show-shortcuts", getShowShortcuts() ? "true" : "false");
  section.setAttribute("data-shortcuts-rows", String(getShortcutsRows()));
}

const faviconUrl = (domain) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

/** Override domain -> dial image key when derived name differs (e.g. mail.google.com -> gmail) */
const DIAL_DOMAIN_MAP = {
  "mail.google.com": "gmail",
  "x.com": "twitter",
};

/** Derive dial image key from domain. youtube.com -> youtube, github.com -> github */
function getDialImageKey(domain) {
  if (DIAL_DOMAIN_MAP[domain]) return DIAL_DOMAIN_MAP[domain];
  const parts = domain.split(".");
  if (parts.length >= 3) return parts[1];
  return parts[0];
}

function getDialImagePaths(domain) {
  const key = getDialImageKey(domain);
  if (!key) return null;
  return [`images/dial/${key}.png`, `images/dial/${key}.svg`];
}

const SEED_SHORTCUTS_ARRAY = [
  { id: "s1", title: "Firefox", url: "https://mozilla.org/firefox", faviconUrl: faviconUrl("mozilla.org"), sponsored: true, sponsoredLabel: "Sponsored", pinned: false, hasUpdates: false, lastVisited: null },
  { id: "s2", title: "Mozilla VPN", url: "https://mozilla.org/products/vpn", faviconUrl: faviconUrl("mozilla.org"), sponsored: true, sponsoredLabel: "Sponsored", pinned: false, hasUpdates: false, lastVisited: null },
  { id: 1, title: "Google", url: "https://google.com", faviconUrl: faviconUrl("google.com"), sponsored: false, pinned: true, hasUpdates: false, lastVisited: "2025-02-27T10:00:00Z" },
  { id: 2, title: "YouTube", url: "https://youtube.com", faviconUrl: faviconUrl("youtube.com"), sponsored: false, pinned: true, hasUpdates: true, lastVisited: "2025-02-27T09:30:00Z" },
  { id: 3, title: "Gmail", url: "https://mail.google.com", faviconUrl: faviconUrl("mail.google.com"), sponsored: false, pinned: true, hasUpdates: true, updateCount: 3, lastVisited: "2025-02-27T08:15:00Z" },
  { id: 4, title: "Twitter", url: "https://twitter.com", faviconUrl: faviconUrl("twitter.com"), sponsored: false, pinned: false, hasUpdates: false, lastVisited: "2025-02-26T18:00:00Z" },
  { id: 5, title: "Facebook", url: "https://facebook.com", faviconUrl: faviconUrl("facebook.com"), sponsored: false, pinned: false, hasUpdates: true, lastVisited: "2025-02-26T14:00:00Z" },
  { id: 6, title: "Instagram", url: "https://instagram.com", faviconUrl: faviconUrl("instagram.com"), sponsored: false, pinned: false, hasUpdates: false, lastVisited: "2025-02-26T12:00:00Z" },
  { id: 7, title: "Reddit", url: "https://reddit.com", faviconUrl: faviconUrl("reddit.com"), sponsored: false, pinned: false, hasUpdates: false, lastVisited: "2025-02-25T20:00:00Z" },
  { id: 8, title: "Wikipedia", url: "https://wikipedia.org", faviconUrl: faviconUrl("wikipedia.org"), sponsored: false, pinned: false, hasUpdates: false, lastVisited: "2025-02-25T15:30:00Z" },
  { id: 9, title: "GitHub", url: "https://github.com", faviconUrl: faviconUrl("github.com"), sponsored: false, pinned: true, hasUpdates: true, lastVisited: "2025-02-27T07:00:00Z" },
  { id: 10, title: "Amazon", url: "https://amazon.com", faviconUrl: faviconUrl("amazon.com"), sponsored: false, pinned: false, hasUpdates: false, lastVisited: "2025-02-24T19:00:00Z" },
];

/**
 * Build initial state from seed array (shortcuts map, folders map, items array)
 */
function buildInitialState() {
  const shortcuts = {};
  const items = [];
  for (const s of SEED_SHORTCUTS_ARRAY) {
    const normalized = {
      ...s,
      sponsored: s.sponsored ?? false,
      sponsoredLabel: s.sponsoredLabel ?? "Sponsored",
      hasUpdates: s.hasUpdates ?? false,
      updateCount: s.updateCount ?? 0,
    };
    shortcuts[String(s.id)] = normalized;
    items.push({ type: "shortcut", id: String(s.id) });
  }
  return { version: STATE_VERSION, shortcuts, folders: {}, items };
}

/**
 * Migrate old array format to new state format
 */
function migrateFromLegacy(parsed) {
  if (!Array.isArray(parsed)) return null;
  const shortcuts = {};
  const items = [];
  const sponsored = parsed.filter((s) => s.sponsored);
  const pinned = parsed.filter((s) => s.pinned && !s.sponsored);
  const unpinned = parsed.filter((s) => !s.pinned && !s.sponsored);
  for (const s of [...sponsored, ...pinned, ...unpinned]) {
    const normalized = {
      ...s,
      sponsored: s.sponsored ?? false,
      sponsoredLabel: s.sponsoredLabel ?? "Sponsored",
      hasUpdates: s.hasUpdates ?? false,
      updateCount: s.updateCount ?? 0,
    };
    shortcuts[String(s.id)] = normalized;
    items.push({ type: "shortcut", id: String(s.id) });
  }
  return { version: STATE_VERSION, shortcuts, folders: {}, items };
}

/**
 * Load state from localStorage
 */
function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.version === STATE_VERSION && parsed.shortcuts && parsed.items) {
        return parsed;
      }
      const migrated = migrateFromLegacy(Array.isArray(parsed) ? parsed : null);
      if (migrated) {
        saveState(migrated);
        return migrated;
      }
    }
  } catch (_) {
    /* ignore */
  }
  return buildInitialState();
}

/**
 * Save state to localStorage
 */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_) {
    /* ignore */
  }
}

/**
 * Get shortcuts map from state
 */
function getShortcuts(state) {
  return state.shortcuts || {};
}

/**
 * Get folders map from state
 */
function getFolders(state) {
  return state.folders || {};
}

/**
 * Get items array from state
 */
function getItems(state) {
  return state.items || [];
}

/**
 * Get sponsored shortcut ids (for layout ordering)
 */
function getSponsoredIds(state) {
  const shortcuts = getShortcuts(state);
  return Object.keys(shortcuts).filter((id) => shortcuts[id]?.sponsored);
}

/**
 * Mock content cards data (static)
 */
const MOCK_CONTENT_CARDS = [
  { id: 1, title: "Getting Started with Web Development", snippet: "Learn the fundamentals of HTML, CSS, and JavaScript to build your first website.", size: "big", topic: "Technology" },
  { id: 2, title: "Modern CSS Techniques", snippet: "Explore flexbox, grid, and custom properties for responsive layouts.", size: "default", topic: "Technology" },
  { id: 3, title: "JavaScript Best Practices", snippet: "Write clean, maintainable code with these essential patterns and tips.", size: "small", topic: "Technology" },
  { id: 4, title: "Browser DevTools Guide", snippet: "Master the tools that help you debug and optimize your web applications.", size: "default", topic: "Technology" },
  { id: 5, title: "Accessibility Fundamentals", snippet: "Make your sites usable for everyone with ARIA and semantic HTML.", size: "small", topic: "Technology" },
  { id: 6, title: "TypeScript Essentials", snippet: "Add type safety to your JavaScript projects.", size: "default", topic: "Technology" },
  { id: 7, title: "React Hooks", snippet: "Modern state management in React.", size: "default", topic: "Technology" },
  { id: 8, title: "Performance Optimization", snippet: "Speed up your pages with lazy loading, caching, and code splitting.", size: "big", topic: "Development" },
  { id: 9, title: "Progressive Web Apps", snippet: "Build installable, offline-capable web experiences.", size: "default", topic: "Development" },
  { id: 10, title: "API Design", snippet: "RESTful and GraphQL best practices.", size: "small", topic: "Development" },
  { id: 11, title: "Testing Strategies", snippet: "Unit, integration, and e2e testing.", size: "small", topic: "Development" },
  { id: 12, title: "CI/CD Pipelines", snippet: "Automate your deployment workflow.", size: "default", topic: "Development" },
  { id: 13, title: "Monitoring & Observability", snippet: "Track performance and errors in production.", size: "small", topic: "Development" },
  { id: 14, title: "Design Systems", snippet: "Create consistent UIs with reusable components and tokens.", size: "small", topic: "Design" },
  { id: 15, title: "UI Patterns", snippet: "Common patterns for modern interfaces.", size: "default", topic: "Design" },
  { id: 16, title: "Color Theory", snippet: "Effective use of color in design.", size: "default", topic: "Design" },
  { id: 17, title: "Typography", snippet: "Choosing and pairing fonts.", size: "small", topic: "Design" },
  { id: 18, title: "Motion Design", snippet: "Micro-interactions and animations.", size: "small", topic: "Design" },
  { id: 19, title: "Debugging Tips", snippet: "Efficient debugging workflows.", size: "default", topic: "Development" },
  { id: 20, title: "Code Review", snippet: "Best practices for reviewing code.", size: "small", topic: "Development" },
  { id: 21, title: "Documentation", snippet: "Writing maintainable docs.", size: "small", topic: "Development" },
];

/** Row templates - each fills 4 columns exactly */
const CONTENT_ROW_TEMPLATES = {
  a: { big: 1, default: 1, small: 2 },   /* big + 2 small + 1 default */
  b: { big: 0, default: 4, small: 0 },   /* 4 default */
  c: { big: 0, default: 2, small: 4 },    /* 2 small + 2 default + 2 small */
};

const FALLBACK_FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect fill='%237c3aed' width='32' height='32' rx='6'/%3E%3Ctext x='16' y='21' font-size='14' fill='white' text-anchor='middle' font-family='sans-serif'%3E%3F%3C/text%3E%3C/svg%3E";

const PIN_ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>';

/**
 * Renders a single shortcut tile with hover overlay
 */
function renderShortcutTile(shortcut, options = {}) {
  const { showSponsoredLabel = false, showPinButton = false, draggable = false, area, indexInArea } = options;

  const wrapper = document.createElement("div");
  wrapper.className = "shortcut-tile-wrapper";

  const tile = document.createElement("a");
  tile.href = shortcut.url;
  tile.className = "shortcut-tile";
  tile.setAttribute("data-id", shortcut.id);
  if (area != null) tile.setAttribute("data-area", area);
  if (indexInArea != null) tile.setAttribute("data-index", String(indexInArea));
  if (options.itemIndex != null) tile.setAttribute("data-item-index", String(options.itemIndex));
  if (showPinButton) tile.classList.add("shortcut-tile--pinned");
  if (showSponsoredLabel) tile.classList.add("shortcut-tile--sponsored");
  if (draggable) {
    tile.draggable = true;
    tile.setAttribute("draggable", "true");
  }

  const iconWrapper = document.createElement("div");
  iconWrapper.className = "shortcut-icon-wrapper";
  const isLarge = getTileSize() === "large";
  const isList = getTileSize() === "list";

  if (!isList && shortcut.hasUpdates && !shortcut.sponsored) {
    const updateBadge = document.createElement("span");
    updateBadge.className = "shortcut-update-badge";
    const isSmall = getTileSize() === "small";
    if (!isSmall && shortcut.updateCount != null && shortcut.updateCount > 0) {
      updateBadge.textContent = shortcut.updateCount > 9 ? "9+" : String(shortcut.updateCount);
      updateBadge.classList.add("shortcut-update-badge--count");
    }
    iconWrapper.appendChild(updateBadge);
  }

  if (isLarge && shortcut.url) {
    const domain = getDomainFromUrl(shortcut.url);
    const dialPaths = getDialImagePaths(domain);
    if (dialPaths) {
      const dialImg = document.createElement("img");
      dialImg.alt = "";
      dialImg.className = "shortcut-dial-image";
      let pathIndex = 0;
      dialImg.onload = () => iconWrapper.classList.add("shortcut-icon-wrapper--has-dial");
      dialImg.onerror = () => {
        pathIndex++;
        if (pathIndex < dialPaths.length) {
          dialImg.src = dialPaths[pathIndex];
        } else {
          dialImg.remove();
          iconWrapper.classList.remove("shortcut-icon-wrapper--has-dial");
          appendFavicon(iconWrapper, shortcut);
          const pinBtn = iconWrapper.querySelector(".shortcut-pin-btn");
          if (pinBtn) {
            const fav = iconWrapper.querySelector(".shortcut-favicon");
            if (fav) iconWrapper.insertBefore(fav, pinBtn);
          }
        }
      };
      dialImg.src = dialPaths[0];
      iconWrapper.appendChild(dialImg);
    }
  }

  if (!(isLarge && shortcut.url && getDialImagePaths(getDomainFromUrl(shortcut.url)))) {
    appendFavicon(iconWrapper, shortcut);
  }

  function appendFavicon(container, s) {
    const favicon = document.createElement("img");
    favicon.src = s.faviconUrl || FALLBACK_FAVICON;
    favicon.alt = "";
    favicon.className = "shortcut-favicon";
    favicon.onerror = () => { favicon.src = FALLBACK_FAVICON; };
    container.appendChild(favicon);
    return favicon;
  }

  if (showPinButton && !isList) {
    const pinBtn = document.createElement("button");
    pinBtn.type = "button";
    pinBtn.className = "shortcut-pin-btn shortcut-pin-btn--pinned";
    pinBtn.setAttribute("aria-label", "Unpin shortcut");
    pinBtn.innerHTML = PIN_ICON_SVG;
    pinBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      togglePin(shortcut.id);
    });
    iconWrapper.appendChild(pinBtn);
  }

  if (isList && shortcut.hasUpdates && !shortcut.sponsored) {
    const updateBadge = document.createElement("span");
    updateBadge.className = "shortcut-update-badge";
    iconWrapper.appendChild(updateBadge);
  }

  tile.appendChild(iconWrapper);

  const title = document.createElement("span");
  title.className = "shortcut-title";
  title.textContent = shortcut.title;
  if (!getShowLabels()) title.classList.add("shortcut-title--hidden");
  tile.appendChild(title);

  if (showSponsoredLabel && shortcut.sponsoredLabel) {
    const label = document.createElement("span");
    label.className = "shortcut-sponsored-label" + (!getShowLabels() ? " shortcut-title--hidden" : "");
    label.textContent = shortcut.sponsoredLabel;
    tile.appendChild(label);
  }

  if (!shortcut.sponsored) {
    tile.addEventListener("click", (e) => {
      if (shortcut.hasUpdates && isGmailShortcut(shortcut)) {
        e.preventDefault();
        markShortcutAsRead(shortcut.id);
        renderShortcuts();
        showToast("Marked as read");
        window.open(shortcut.url, "_blank");
      }
    });
  }

  wrapper.appendChild(tile);

  if (isList && !shortcut.sponsored) {
    const listActions = document.createElement("div");
    listActions.className = "shortcut-list-actions";

    if (showPinButton) {
      const pinBtn = document.createElement("button");
      pinBtn.type = "button";
      pinBtn.className = "shortcut-pin-btn shortcut-pin-btn--pinned";
      pinBtn.setAttribute("aria-label", "Unpin shortcut");
      pinBtn.innerHTML = PIN_ICON_SVG;
      pinBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        togglePin(shortcut.id);
      });
      listActions.appendChild(pinBtn);
    }

    const ctxBtn = document.createElement("button");
    ctxBtn.type = "button";
    ctxBtn.className = "shortcut-context-btn";
    ctxBtn.setAttribute("aria-label", "Shortcut options");
    ctxBtn.innerHTML = "⋯";
    ctxBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleContextMenu(wrapper, shortcut);
    });
    listActions.appendChild(ctxBtn);

    wrapper.appendChild(listActions);
  } else if (!shortcut.sponsored) {
    const ctxBtn = document.createElement("button");
    ctxBtn.type = "button";
    ctxBtn.className = "shortcut-context-btn";
    ctxBtn.setAttribute("aria-label", "Shortcut options");
    ctxBtn.innerHTML = "⋯";
    ctxBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleContextMenu(wrapper, shortcut);
    });
    wrapper.appendChild(ctxBtn);
  }

  if (isInstagramShortcut(shortcut)) {
    setupShortcutExpandBehavior(wrapper, shortcut);
  } else {
    const overlay = createShortcutOverlay(shortcut);
    wrapper.appendChild(overlay);
    setupShortcutOverlayBehavior(wrapper, tile, overlay);
  }

  return wrapper;
}

/**
 * Renders a folder tile (2x2 favicons + title)
 */
function renderFolderTile(folder, shortcutsMap, options = {}) {
  const { itemIndex } = options;
  const shortcutIds = folder.shortcutIds || [];
  const favicons = shortcutIds.slice(0, 4).map((id) => {
    const s = shortcutsMap[id];
    return s?.faviconUrl || FALLBACK_FAVICON;
  });

  const wrapper = document.createElement("div");
  wrapper.className = "shortcut-tile-wrapper folder-tile-wrapper";

  const tile = document.createElement("div");
  tile.className = "shortcut-tile folder-tile";
  tile.setAttribute("data-type", "folder");
  tile.setAttribute("data-id", folder.id);
  tile.setAttribute("data-item-index", String(itemIndex));
  tile.setAttribute("data-drop-target", "folder");

  const iconWrapper = document.createElement("div");
  iconWrapper.className = "shortcut-icon-wrapper folder-icon-wrapper";
  const grid = document.createElement("div");
  grid.className = "folder-favicons-grid";
  if (favicons.length > 0) {
    favicons.forEach((src) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.className = "folder-favicon";
      img.onerror = () => { img.src = FALLBACK_FAVICON; };
      grid.appendChild(img);
    });
  } else {
    const empty = document.createElement("div");
    empty.className = "folder-empty-placeholder";
    empty.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>';
    grid.appendChild(empty);
  }
  iconWrapper.appendChild(grid);
  tile.appendChild(iconWrapper);

  const title = document.createElement("span");
  title.className = "shortcut-title" + (!getShowLabels() ? " shortcut-title--hidden" : "");
  title.textContent = folder.title || "Folder";
  tile.appendChild(title);

  tile.addEventListener("click", (e) => {
    e.preventDefault();
    openFolderPopover(wrapper, folder, shortcutsMap);
  });

  wrapper.appendChild(tile);
  return wrapper;
}

function isYouTubeShortcut(shortcut) {
  const url = (shortcut.url || "").toLowerCase();
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function isRedditShortcut(shortcut) {
  return (shortcut.url || "").toLowerCase().includes("reddit.com");
}

function isAmazonShortcut(shortcut) {
  return (shortcut.url || "").toLowerCase().includes("amazon.com");
}

function isTwitterShortcut(shortcut) {
  const url = (shortcut.url || "").toLowerCase();
  return url.includes("twitter.com") || url.includes("x.com");
}

function isInstagramShortcut(shortcut) {
  return (shortcut.url || "").toLowerCase().includes("instagram.com");
}

/** Fake posts for Reddit Popular preview (local, no API) */
const REDDIT_POPULAR_POSTS = [
  { subreddit: "r/AskReddit", title: "What's a skill that took you years to master but looks easy to others?", score: "2.4K", comments: "891" },
  { subreddit: "r/travel", title: "What's the most underrated city you've ever visited?", score: "1.8K", comments: "423" },
  { subreddit: "r/AskReddit", title: "What's something that was normal 20 years ago but seems crazy now?", score: "3.1K", comments: "1.2K" },
];

/** Fake trending for Twitter/X overlay (local, no API) */
const TWITTER_TRENDING = [
  { topic: "Technology", tag: "#AI", posts: "12.4K" },
  { topic: "Sports", tag: "#WorldCup", posts: "89.2K" },
  { topic: "Entertainment", tag: "#NewRelease", posts: "45.1K" },
  { topic: "News", tag: "#Breaking", posts: "234K" },
];

/** Fake inbox for Gmail overlay (local, no API) */
const GMAIL_FAKE_INBOX = [
  { from: "GitHub", subject: "Your daily digest", preview: "3 new notifications in your repositories...", time: "2m" },
  { from: "Stripe", subject: "Payment received", preview: "You received $149.00 from Acme Corp", time: "1h" },
  { from: "Calendar", subject: "Meeting reminder", preview: "Team standup in 30 minutes", time: "2h" },
];

/** Fake categories for Amazon overlay (local, no API) */
const AMAZON_CATEGORIES = [
  { name: "Electronics", icon: "📱" },
  { name: "Books", icon: "📚" },
  { name: "Home", icon: "🏠" },
  { name: "Fashion", icon: "👕" },
];

/** Overlay image for sponsored shortcuts: Firefox (s1), Mozilla VPN (s2) */
function getSponsoredOverlayImageUrl(shortcut) {
  if (!shortcut?.sponsored) return null;
  if (shortcut.id === "s1") return "images/firefox.png";
  if (shortcut.id === "s2") return "images/vpn.png";
  return null;
}

/**
 * Create the hover overlay popover for a shortcut
 */
function createShortcutOverlay(shortcut) {
  const domain = getDomainFromUrl(shortcut.url);
  const sponsoredImageUrl = getSponsoredOverlayImageUrl(shortcut);
  const youtubeImage = isYouTubeShortcut(shortcut);
  const gmailInbox = isGmailShortcut(shortcut);
  const redditHeadlines = isRedditShortcut(shortcut);
  const amazonCategories = isAmazonShortcut(shortcut);
  const twitterTrending = isTwitterShortcut(shortcut);
  const overlayImageUrl = sponsoredImageUrl || (youtubeImage ? "images/youtube.png" : null);
  const useImagePreview = !!overlayImageUrl;

  const overlay = document.createElement("div");
  overlay.className = "shortcut-hover-overlay";
  overlay.setAttribute("role", "tooltip");

  const isSponsoredOverlay = !!sponsoredImageUrl;
  const gmailInboxHtml = GMAIL_FAKE_INBOX.map((e) => `
    <button type="button" class="shortcut-overlay-gmail-item" data-fake-gmail-item>
      <div class="shortcut-overlay-gmail-row">
        <span class="shortcut-overlay-gmail-from">${escapeHtml(e.from)}</span>
        <span class="shortcut-overlay-gmail-time">${escapeHtml(e.time)}</span>
      </div>
      <span class="shortcut-overlay-gmail-subject">${escapeHtml(e.subject)}</span>
      <span class="shortcut-overlay-gmail-preview">${escapeHtml(e.preview)}</span>
    </button>
  `).join("");
  const redditPostsHtml = REDDIT_POPULAR_POSTS.map((p) => `
    <button type="button" class="shortcut-overlay-reddit-item" data-fake-reddit-post>
      <span class="shortcut-overlay-reddit-sub">${escapeHtml(p.subreddit)}</span>
      <span class="shortcut-overlay-reddit-title">${escapeHtml(p.title)}</span>
      <span class="shortcut-overlay-reddit-meta">↑ ${escapeHtml(p.score)} · ${escapeHtml(p.comments)} comments</span>
    </button>
  `).join("");
  const categoriesHtml = AMAZON_CATEGORIES.map((c) => `<div class="shortcut-overlay-category-square"><span class="shortcut-overlay-category-icon">${escapeHtml(c.icon)}</span><span class="shortcut-overlay-category-name">${escapeHtml(c.name)}</span></div>`).join("");
  const trendingHtml = TWITTER_TRENDING.map((t) => `<div class="shortcut-overlay-trending-item"><span class="shortcut-overlay-trending-topic">${escapeHtml(t.topic)}</span><span class="shortcut-overlay-trending-tag">${escapeHtml(t.tag)}</span><span class="shortcut-overlay-trending-posts">${escapeHtml(t.posts)} posts</span></div>`).join("");
  overlay.innerHTML = isSponsoredOverlay
    ? `
    <div class="shortcut-overlay-preview shortcut-overlay-preview--image shortcut-overlay-preview--sponsored">
      <img class="shortcut-overlay-image" src="${overlayImageUrl}" alt="Preview of ${escapeHtml(shortcut.title)}">
    </div>
    <div class="shortcut-overlay-sponsored-label">Sponsored</div>
  `
    : redditHeadlines
    ? `
    <div class="shortcut-overlay-preview shortcut-overlay-preview--reddit">
      <span class="shortcut-overlay-reddit-title-header">Popular</span>
      <div class="shortcut-overlay-reddit-list">${redditPostsHtml}</div>
    </div>
    <div class="shortcut-overlay-actions">
      <button type="button" class="shortcut-overlay-btn" data-action="tab-group">Open in tab group</button>
      <button type="button" class="shortcut-overlay-btn" data-action="folder">Create folder</button>
    </div>
  `
    : twitterTrending
    ? `
    <div class="shortcut-overlay-preview shortcut-overlay-preview--trending">
      <span class="shortcut-overlay-trending-title">Trending</span>
      <div class="shortcut-overlay-trending-list">${trendingHtml}</div>
    </div>
    <div class="shortcut-overlay-actions">
      <button type="button" class="shortcut-overlay-btn" data-action="tab-group">Open in tab group</button>
      <button type="button" class="shortcut-overlay-btn" data-action="folder">Create folder</button>
    </div>
  `
    : gmailInbox
    ? `
    <div class="shortcut-overlay-preview shortcut-overlay-preview--gmail">
      <span class="shortcut-overlay-gmail-title-header">Inbox</span>
      <div class="shortcut-overlay-gmail-list">${gmailInboxHtml}</div>
    </div>
    <div class="shortcut-overlay-actions">
      <button type="button" class="shortcut-overlay-btn" data-action="tab-group">Open in tab group</button>
      <button type="button" class="shortcut-overlay-btn" data-action="folder">Create folder</button>
    </div>
  `
    : amazonCategories
    ? `
    <div class="shortcut-overlay-preview shortcut-overlay-preview--categories">
      <span class="shortcut-overlay-categories-title">Shop by category</span>
      <div class="shortcut-overlay-categories-grid">${categoriesHtml}</div>
    </div>
    <div class="shortcut-overlay-actions">
      <button type="button" class="shortcut-overlay-btn" data-action="tab-group">Open in tab group</button>
      <button type="button" class="shortcut-overlay-btn" data-action="folder">Create folder</button>
    </div>
  `
    : useImagePreview
    ? `
    <div class="shortcut-overlay-preview shortcut-overlay-preview--image">
      <img class="shortcut-overlay-image" src="${overlayImageUrl}" alt="Preview of ${escapeHtml(shortcut.title)}">
    </div>
    <div class="shortcut-overlay-actions">
      <button type="button" class="shortcut-overlay-btn" data-action="tab-group">Open in tab group</button>
      <button type="button" class="shortcut-overlay-btn" data-action="folder">Create folder</button>
    </div>
  `
    : `
    <div class="shortcut-overlay-preview">
      <iframe
        class="shortcut-overlay-iframe"
        sandbox="allow-scripts allow-same-origin"
        title="Preview of ${escapeHtml(shortcut.title)}"
      ></iframe>
      <div class="shortcut-overlay-fallback hidden" data-domain="${escapeHtml(domain)}">
        <span class="shortcut-overlay-fallback-domain">${escapeHtml(domain)}</span>
        <span class="shortcut-overlay-fallback-msg">Preview unavailable</span>
      </div>
    </div>
    <div class="shortcut-overlay-actions">
      <button type="button" class="shortcut-overlay-btn" data-action="tab-group">Open in tab group</button>
      <button type="button" class="shortcut-overlay-btn" data-action="folder">Create folder</button>
    </div>
  `;

  let iframeLoaded = false;

  function loadPreview() {
    if (useImagePreview || redditHeadlines || amazonCategories || twitterTrending || gmailInbox) return;
    if (iframeLoaded) return;
    iframeLoaded = true;
    const iframe = overlay.querySelector(".shortcut-overlay-iframe");
    const fallback = overlay.querySelector(".shortcut-overlay-fallback");
    if (iframe) iframe.src = shortcut.url;
    let loadHandled = false;
    iframe?.addEventListener("load", () => {
      if (loadHandled) return;
      loadHandled = true;
      try {
        if (iframe.contentDocument && iframe.contentDocument.body) {
          const hasContent = iframe.contentDocument.body.innerHTML.trim().length > 0;
          if (!hasContent) fallback?.classList.remove("hidden");
        }
      } catch (_) {
        /* Cross-origin: assume iframe loaded */
      }
    });
    setTimeout(() => {
      if (!loadHandled) {
        loadHandled = true;
        fallback?.classList.remove("hidden");
      }
    }, 2500);
  }

  overlay.querySelectorAll("[data-fake-gmail-item]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      showToast("Preview only — click shortcut to open");
    });
  });
  overlay.querySelectorAll("[data-fake-reddit-post]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      showToast("Preview only — click shortcut to open");
    });
  });
  const tabGroupBtn = overlay.querySelector('[data-action="tab-group"]');
  const folderBtn = overlay.querySelector('[data-action="folder"]');
  if (tabGroupBtn) {
    tabGroupBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      showToast("Open in tab group");
    });
  }
  if (folderBtn) {
    folderBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      createFolderFromShortcut(shortcut);
    });
  }

  overlay._loadIframe = loadPreview;
  return overlay;
}

/**
 * Instagram: expand preview below shortcuts (no overlay)
 */
function setupShortcutExpandBehavior(wrapper, shortcut) {
  const panel = document.getElementById("shortcut-expanded-preview");
  if (!panel) return;

  let hideTimeout = null;
  const SHOW_DELAY = 400;
  const HIDE_DELAY = 300;
  let showTimeout = null;

  const INSTAGRAM_FAKE_POSTS = [
    { user: "travel_vibes", likes: "2.4K", caption: "Sunset at the beach 🌅" },
    { user: "foodie_daily", likes: "891", caption: "Best pasta in town" },
    { user: "design_studio", likes: "1.2K", caption: "New project preview ✨" },
  ];

  function getInstagramContent() {
    const colors = ["#833ab4", "#fd1d1d", "#fcb045"];
    const postsHtml = INSTAGRAM_FAKE_POSTS.map((post, i) => {
      const c = colors[i];
      return `
        <button type="button" class="shortcut-expanded-post" data-fake-post>
          <div class="shortcut-expanded-post-image" style="background:linear-gradient(135deg,${c},#405de6)"></div>
          <div class="shortcut-expanded-post-meta">
            <span class="shortcut-expanded-post-user">@${escapeHtml(post.user)}</span>
            <span class="shortcut-expanded-post-likes">${escapeHtml(post.likes)} likes</span>
            <span class="shortcut-expanded-post-caption">${escapeHtml(post.caption)}</span>
          </div>
        </button>
      `;
    }).join("");
    return `
      <div class="shortcut-expanded-preview-inner">
        <span class="shortcut-expanded-label">${escapeHtml(shortcut.title)}</span>
        <div class="shortcut-expanded-posts">${postsHtml}</div>
        <div class="shortcut-expanded-actions">
          <button type="button" class="shortcut-overlay-btn" data-action="tab-group">Open in tab group</button>
          <button type="button" class="shortcut-overlay-btn" data-action="folder">Create folder</button>
        </div>
      </div>
    `;
  }

  function show() {
    if (isDraggingShortcut) return;
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    if (showTimeout) return;
    showTimeout = setTimeout(() => {
      if (isDraggingShortcut) return;
      showTimeout = null;
      panel.innerHTML = getInstagramContent();
      panel.classList.add("visible");
      panel.setAttribute("aria-hidden", "false");

      panel.querySelectorAll("[data-fake-post]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          showToast("Preview only — click shortcut to open");
        });
      });
      const tabGroupBtn = panel.querySelector('[data-action="tab-group"]');
      const folderBtn = panel.querySelector('[data-action="folder"]');
      if (tabGroupBtn) tabGroupBtn.addEventListener("click", (e) => { e.preventDefault(); showToast("Open in tab group"); });
      if (folderBtn) folderBtn.addEventListener("click", (e) => { e.preventDefault(); createFolderFromShortcut(shortcut); });
    }, SHOW_DELAY);
  }

  function cancelShow() {
    if (showTimeout) {
      clearTimeout(showTimeout);
      showTimeout = null;
    }
  }

  function scheduleHide() {
    if (hideTimeout) return;
    hideTimeout = setTimeout(() => {
      panel.classList.remove("visible");
      panel.setAttribute("aria-hidden", "true");
      hideTimeout = null;
    }, HIDE_DELAY);
  }

  wrapper.addEventListener("mouseenter", () => show());
  wrapper.addEventListener("mouseleave", (e) => {
    if (!panel.contains(e.relatedTarget)) {
      cancelShow();
      scheduleHide();
    }
  });
  panel.addEventListener("mouseenter", () => {
    cancelShow();
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    panel.classList.add("visible");
  });
  panel.addEventListener("mouseleave", (e) => {
    if (!wrapper.contains(e.relatedTarget)) scheduleHide();
  });
}

/**
 * Setup hover overlay show/hide behavior
 */
function setupShortcutOverlayBehavior(wrapper, tile, overlay) {
  let hideTimeout = null;
  let showTimeout = null;
  const HIDE_DELAY = 200;
  const SHOW_DELAY = 600;

  function show() {
    if (isDraggingShortcut) return;
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    if (showTimeout) return;
    showTimeout = setTimeout(() => {
      if (isDraggingShortcut) return;
      showTimeout = null;
      overlay.classList.add("visible");
      positionOverlay(wrapper, overlay);
      if (typeof overlay._loadIframe === "function") overlay._loadIframe();
    }, SHOW_DELAY);
  }

  function cancelShow() {
    if (showTimeout) {
      clearTimeout(showTimeout);
      showTimeout = null;
    }
  }

  function scheduleHide() {
    if (hideTimeout) return;
    hideTimeout = setTimeout(() => {
      overlay.classList.remove("visible");
      hideTimeout = null;
    }, HIDE_DELAY);
  }

  function positionOverlay(wrapperEl, overlayEl) {
    const rect = wrapperEl.getBoundingClientRect();
    const overlayRect = overlayEl.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const gap = 8;
    const ow = overlayRect.width || 320;
    const oh = overlayRect.height || 260;

    let left = rect.left + rect.width / 2 - ow / 2;
    let top = rect.bottom + gap;

    if (left < gap) left = gap;
    if (left + ow > viewportW - gap) left = viewportW - ow - gap;
    if (top + oh > viewportH - gap) top = rect.top - oh - gap;

    overlayEl.style.left = `${left}px`;
    overlayEl.style.top = `${top}px`;
    overlayEl.style.right = "auto";
  }

  wrapper.addEventListener("mouseenter", () => show());
  overlay.addEventListener("mouseenter", () => {
    cancelShow();
    overlay.classList.add("visible");
    positionOverlay(wrapper, overlay);
    if (typeof overlay._loadIframe === "function") overlay._loadIframe();
  });
  wrapper.addEventListener("mouseleave", (e) => {
    if (!overlay.contains(e.relatedTarget)) {
      cancelShow();
      scheduleHide();
    }
  });
  overlay.addEventListener("mouseleave", (e) => {
    if (!wrapper.contains(e.relatedTarget)) scheduleHide();
  });

  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target) && !overlay.contains(e.target)) {
      overlay.classList.remove("visible");
    }
  });

  window.addEventListener("scroll", () => {
    if (overlay.classList.contains("visible")) {
      overlay.classList.remove("visible");
    }
  }, { capture: true });
}

/**
 * Show a simple toast notification
 */
function showToast(message) {
  const existing = document.getElementById("shortcut-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "shortcut-toast";
  toast.className = "shortcut-toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("visible"));
  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

/**
 * Create folder from shortcut: replace shortcut item with folder containing that shortcut
 */
function createFolderFromShortcut(shortcut) {
  const state = loadState();
  const items = [...getItems(state)];
  const shortcutIndex = items.findIndex((i) => i.type === "shortcut" && i.id === String(shortcut.id));
  if (shortcutIndex < 0) return;

  const folderId = nextFolderId(state);
  const folder = {
    id: folderId,
    title: shortcut.title,
    shortcutIds: [String(shortcut.id)],
  };

  const newState = {
    ...state,
    shortcuts: { ...getShortcuts(state) },
    folders: { ...getFolders(state), [folderId]: folder },
    items: items.map((item, i) =>
      i === shortcutIndex ? { type: "folder", id: folderId } : item
    ),
  };
  saveState(newState);
  renderShortcuts();
  showToast(`Created folder "${folder.title}"`);
}

/**
 * Create an empty folder and add it to the grid
 */
function createEmptyFolder() {
  const state = loadState();
  const folderId = nextFolderId(state);
  const folder = {
    id: folderId,
    title: "New folder",
    shortcutIds: [],
  };
  const newState = {
    ...state,
    folders: { ...getFolders(state), [folderId]: folder },
    items: [...getItems(state), { type: "folder", id: folderId }],
  };
  saveState(newState);
  renderShortcuts();
  showToast("Created folder");
}

/**
 * Remove shortcut from folder and add to top-level unpinned items right after the folder
 */
function removeShortcutFromFolder(folderId, shortcutId) {
  const state = loadState();
  const folders = getFolders(state);
  const items = getItems(state);
  const folder = folders[String(folderId)];
  if (!folder) return;

  const folderIdx = items.findIndex((i) => i.type === "folder" && i.id === String(folderId));
  if (folderIdx < 0) return;

  const newShortcutIds = (folder.shortcutIds || []).filter((id) => id !== String(shortcutId));
  const newItem = { type: "shortcut", id: String(shortcutId) };
  const newItems = [...items];

  if (newShortcutIds.length === 0) {
    newItems.splice(folderIdx, 1, newItem);
    const newFolders = { ...folders };
    delete newFolders[String(folderId)];
    saveState({ ...state, folders: newFolders, items: newItems });
    const panel = document.getElementById("folder-panel");
    if (panel?.dataset.folderId === String(folderId) && typeof panel._close === "function") {
      panel._close();
    }
  } else {
    const newFolders = {
      ...folders,
      [String(folderId)]: { ...folder, shortcutIds: newShortcutIds },
    };
    newItems.splice(folderIdx + 1, 0, newItem);
    saveState({ ...state, folders: newFolders, items: newItems });
  }
  renderShortcuts();
}

/**
 * Update folder title
 */
function updateFolderTitle(folderId, title) {
  const state = loadState();
  const folders = getFolders(state);
  const folder = folders[String(folderId)];
  if (!folder) return;

  const newFolders = {
    ...folders,
    [String(folderId)]: { ...folder, title: title.trim() || folder.title },
  };
  saveState({ ...state, folders: newFolders });
  renderShortcuts();
}

/**
 * Open folder panel (click on folder tile)
 */
function openFolderPopover(wrapper, folder, shortcutsMap) {
  const existing = document.getElementById("folder-panel");
  if (existing) {
    existing.remove();
    if (existing.dataset.folderId === folder.id) return;
  }

  const shortcutIds = folder.shortcutIds || [];
  const shortcuts = shortcutIds.map((id) => shortcutsMap[id]).filter(Boolean);

  const panel = document.createElement("div");
  panel.id = "folder-panel";
  panel.className = "folder-panel";
  panel.dataset.folderId = folder.id;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", `Folder: ${folder.title}`);

  const titleEl = document.createElement("div");
  titleEl.className = "folder-panel-title";
  titleEl.textContent = folder.title || "Folder";

  const listEl = document.createElement("div");
  listEl.className = "folder-panel-grid";

  shortcuts.forEach((s) => {
    const item = document.createElement("div");
    item.className = "folder-panel-item";
    item.dataset.shortcutId = String(s.id);
    item.draggable = true;
    item.innerHTML = `
      <div class="folder-panel-item-icon">
        <img src="${escapeHtml(s.faviconUrl || FALLBACK_FAVICON)}" alt="" class="folder-panel-favicon" onerror="this.src='${FALLBACK_FAVICON}'" draggable="false">
      </div>
      <span class="folder-panel-item-title">${escapeHtml(s.title)}</span>
    `;
    item.addEventListener("dragstart", (e) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", `folder-item:${JSON.stringify({ shortcutId: s.id, folderId: folder.id })}`);
      e.dataTransfer.setData("application/x-folder-item", "1");
      item.classList.add("folder-panel-item-dragging");
    });
    item.addEventListener("dragend", () => {
      item.classList.remove("folder-panel-item-dragging");
      document.querySelector(".shortcuts-grid")?.classList.remove("shortcuts-grid--drop-target");
    });
    const link = item.querySelector(".folder-panel-item-icon");
    link.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.open(s.url, "_blank");
    });
    item.querySelector(".folder-panel-item-title").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.open(s.url, "_blank");
    });
    listEl.appendChild(item);
  });

  panel.appendChild(titleEl);
  panel.appendChild(listEl);

  document.body.appendChild(panel);

  const rect = wrapper.getBoundingClientRect();
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  const gap = 16;
  let left = rect.left;
  let top = rect.bottom + gap;
  if (left + 320 > viewportW - gap) left = viewportW - 320 - gap;
  if (left < gap) left = gap;
  if (top + 300 > viewportH - gap) top = rect.top - 300 - gap;
  if (top < gap) top = gap;
  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;

  const close = () => {
    panel.remove();
    document.removeEventListener("click", close);
    document.removeEventListener("keydown", handleEsc);
  };

  const handleEsc = (e) => {
    if (e.key === "Escape") close();
  };

  function makeTitleEditable(containerEl) {
    const currentTitle = containerEl.textContent;
    const input = document.createElement("input");
    input.type = "text";
    input.className = "folder-panel-title-input";
    input.value = currentTitle;
    input.placeholder = "Folder name";
    containerEl.replaceWith(input);
    input.focus();
    input.select();

    const save = () => {
      const title = input.value.trim();
      updateFolderTitle(folder.id, title || "Folder");
      const newTitle = document.createElement("div");
      newTitle.className = "folder-panel-title";
      newTitle.textContent = title || "Folder";
      input.replaceWith(newTitle);
      newTitle.addEventListener("click", () => makeTitleEditable(newTitle));
    };

    input.addEventListener("blur", save);
    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        input.blur();
      }
    });
  }

  titleEl.addEventListener("click", () => makeTitleEditable(titleEl));

  panel._close = close;
  panel.addEventListener("click", (e) => e.stopPropagation());
  requestAnimationFrame(() => {
    document.addEventListener("click", close);
    document.addEventListener("keydown", handleEsc);
  });
}

function refreshFolderPanel(panel, folderId) {
  const state = loadState();
  const folder = getFolders(state)[String(folderId)];
  const shortcutsMap = getShortcuts(state);
  if (!folder) {
    if (typeof panel._close === "function") panel._close();
    return;
  }
  const shortcutIds = folder.shortcutIds || [];
  const shortcuts = shortcutIds.map((id) => shortcutsMap[id]).filter(Boolean);

  const listEl = panel.querySelector(".folder-panel-grid");
  listEl.innerHTML = "";
  shortcuts.forEach((s) => {
    const item = document.createElement("div");
    item.className = "folder-panel-item";
    item.dataset.shortcutId = String(s.id);
    item.draggable = true;
    item.innerHTML = `
      <div class="folder-panel-item-icon">
        <img src="${escapeHtml(s.faviconUrl || FALLBACK_FAVICON)}" alt="" class="folder-panel-favicon" onerror="this.src='${FALLBACK_FAVICON}'" draggable="false">
      </div>
      <span class="folder-panel-item-title">${escapeHtml(s.title)}</span>
    `;
    const folder = getFolders(loadState())[String(folderId)];
    if (folder) {
      item.addEventListener("dragstart", (e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", `folder-item:${JSON.stringify({ shortcutId: s.id, folderId })}`);
        e.dataTransfer.setData("application/x-folder-item", "1");
        item.classList.add("folder-panel-item-dragging");
      });
      item.addEventListener("dragend", () => {
        item.classList.remove("folder-panel-item-dragging");
        document.querySelector(".shortcuts-grid")?.classList.remove("shortcuts-grid--drop-target");
      });
    }
    item.querySelector(".folder-panel-item-icon").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.open(s.url, "_blank");
    });
    item.querySelector(".folder-panel-item-title").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.open(s.url, "_blank");
    });
    listEl.appendChild(item);
  });

  if (shortcuts.length === 0 && typeof panel._close === "function") {
    panel._close();
  }
}

/**
 * Check if shortcut is Gmail (for demo interaction)
 */
function isGmailShortcut(shortcut) {
  try {
    const u = new URL(shortcut.url);
    return u.hostname.includes("mail.google.com") || u.hostname.includes("gmail.com");
  } catch (_) {
    return false;
  }
}

/**
 * Mark shortcut as read (clear updates), persist to localStorage
 */
function markShortcutAsRead(shortcutId) {
  const state = loadState();
  const shortcuts = getShortcuts(state);
  const s = shortcuts[String(shortcutId)];
  if (!s) return;
  const newShortcuts = { ...shortcuts, [String(shortcutId)]: { ...s, hasUpdates: false, updateCount: 0 } };
  saveState({ ...state, shortcuts: newShortcuts });
}

/**
 * Remove shortcut from items and optionally from folders
 */
function removeShortcut(shortcutId) {
  const state = loadState();
  const sid = String(shortcutId);
  const newItems = getItems(state).filter((i) => !(i.type === "shortcut" && i.id === sid));
  const newFolders = { ...getFolders(state) };
  const removedFolderIds = [];
  for (const fid of Object.keys(newFolders)) {
    const remaining = (newFolders[fid].shortcutIds || []).filter((id) => id !== sid);
    if (remaining.length === 0) {
      delete newFolders[fid];
      removedFolderIds.push(fid);
      newItems.splice(newItems.findIndex((i) => i.type === "folder" && i.id === fid), 1);
    } else {
      newFolders[fid] = { ...newFolders[fid], shortcutIds: remaining };
    }
  }
  const newShortcuts = { ...getShortcuts(state) };
  delete newShortcuts[sid];
  saveState({ ...state, shortcuts: newShortcuts, folders: newFolders, items: newItems });
  const panel = document.getElementById("folder-panel");
  if (panel && removedFolderIds.includes(panel.dataset.folderId) && typeof panel._close === "function") {
    panel._close();
  }
  renderShortcuts();
}

/**
 * Toggle context menu for a shortcut tile
 */
function toggleContextMenu(wrapper, shortcut) {
  const existing = document.getElementById("shortcut-context-menu");
  if (existing) {
    existing.remove();
    if (existing.dataset.shortcutId === String(shortcut.id)) return;
  }

  const menu = document.createElement("div");
  menu.id = "shortcut-context-menu";
  menu.className = "shortcut-context-menu";
  menu.dataset.shortcutId = String(shortcut.id);

  const items = [
    { label: "Open in new tab", action: () => { window.open(shortcut.url, "_blank"); } },
    { label: "Open in tab group", action: () => { console.log("Open in tab group:", shortcut.url); showToast("Open in tab group"); } },
    { label: shortcut.pinned ? "Unpin" : "Pin", action: () => { togglePin(shortcut.id); } },
    { label: "Edit", action: () => openEditShortcutModal(shortcut) },
    { label: "Remove", action: () => { removeShortcut(shortcut.id); showToast("Shortcut removed"); } },
  ];

  if (shortcut.hasUpdates) {
    items.splice(1, 0, { label: "Mark as read", action: () => { markShortcutAsRead(shortcut.id); renderShortcuts(); showToast("Marked as read"); } });
  }

  items.forEach(({ label, action }) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "shortcut-context-menu-item";
    btn.textContent = label;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      action();
      menu.remove();
    });
    menu.appendChild(btn);
  });

  document.body.appendChild(menu);

  const iconWrapper = wrapper.querySelector(".shortcut-icon-wrapper");
  const rect = iconWrapper.getBoundingClientRect();
  menu.style.left = `${rect.right}px`;
  menu.style.top = `${rect.top}px`;
  menu.style.transform = "translateX(-100%)";

  const close = () => {
    menu.remove();
    document.removeEventListener("click", close);
  };

  requestAnimationFrame(() => document.addEventListener("click", close));
}

/**
 * Toggle pin state: pin moves to end of pinned, unpin moves to start of unpinned
 */
function togglePin(shortcutId) {
  const state = loadState();
  const shortcuts = getShortcuts(state);
  const folders = getFolders(state);
  const items = getItems(state);
  const shortcut = shortcuts[String(shortcutId)];
  if (!shortcut || shortcut.sponsored) return;

  const itemIdx = items.findIndex((i) => i.type === "shortcut" && i.id === String(shortcutId));
  if (itemIdx < 0) return;

  const updatedShortcut = { ...shortcut, pinned: !shortcut.pinned };
  const newShortcuts = { ...shortcuts, [String(shortcutId)]: updatedShortcut };

  const newItems = items.filter((_, i) => i !== itemIdx);
  const firstUnpinnedIdx = newItems.findIndex((i) => {
    if (i.type === "folder") return true;
    const s = shortcuts[i.id];
    return s && !s.sponsored && !s.pinned;
  });
  let lastPinnedIdx = -1;
  for (let i = newItems.length - 1; i >= 0; i--) {
    const it = newItems[i];
    if (it.type === "shortcut") {
      const s = shortcuts[it.id];
      if (s && !s.sponsored && s.pinned) {
        lastPinnedIdx = i;
        break;
      }
    }
  }

  const insertIdx = updatedShortcut.pinned
    ? (lastPinnedIdx >= 0 ? lastPinnedIdx + 1 : firstUnpinnedIdx >= 0 ? firstUnpinnedIdx : newItems.length)
    : (firstUnpinnedIdx >= 0 ? firstUnpinnedIdx : newItems.length);

  newItems.splice(insertIdx, 0, { type: "shortcut", id: String(shortcutId) });
  saveState({ ...state, shortcuts: newShortcuts, items: newItems });
  renderShortcuts();
}

/**
 * Get visible items for rendering (shortcuts + folders from items array)
 */
function getVisibleItems(state) {
  const shortcuts = getShortcuts(state);
  const folders = getFolders(state);
  const items = getItems(state);

  return items.map((item, itemIndex) => {
    if (item.type === "shortcut") {
      const shortcut = shortcuts[item.id];
      if (!shortcut) return null;
      const area = shortcut.sponsored ? "sponsored" : shortcut.pinned ? "pinned" : "unpinned";
      return { type: "shortcut", shortcut, area, itemIndex };
    }
    if (item.type === "folder") {
      const folder = folders[item.id];
      if (!folder) return null;
      return { type: "folder", folder, area: "unpinned", itemIndex };
    }
    return null;
  }).filter(Boolean);
}

/**
 * Generate unique id for new shortcuts
 */
function nextShortcutId(state) {
  const ids = new Set(Object.keys(getShortcuts(state)));
  let n = 1;
  while (ids.has(String(n))) n++;
  return n;
}

/**
 * Generate unique id for new folders
 */
function nextFolderId(state) {
  const ids = new Set(Object.keys(getFolders(state)));
  let n = 1;
  while (ids.has(`f${n}`)) n++;
  return `f${n}`;
}

/**
 * Extract domain from URL for favicon
 */
function hashToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 50%, 60%)`;
}

function getDomainFromUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    return u.hostname.replace(/^www\./, "");
  } catch (_) {
    return "example.com";
  }
}

/**
 * Renders the shortcuts section (items: shortcuts + folders)
 */
function renderShortcuts() {
  const state = loadState();
  const shortcuts = getShortcuts(state);
  const visibleItems = getVisibleItems(state);
  const grid = document.getElementById("shortcuts-grid");
  const section = document.getElementById("shortcuts-section");

  if (!grid) return;

  const maxShow = getMaxShortcutsToShow();
  const isExpanded = shortcutsExpanded;
  // Sponsored shortcuts count toward max tiles (they occupy slots in the row)
  const itemsToRender = isExpanded ? visibleItems : visibleItems.slice(0, maxShow);
  const hasMore = visibleItems.length > itemsToRender.length;

  grid.innerHTML = "";
  grid.className = "shortcuts-grid shortcuts-layout" + (isExpanded ? " shortcuts-layout--expanded" : "");
  if (section) section.toggleAttribute("data-shortcuts-expanded", isExpanded);
  const expandedPanel = document.getElementById("shortcut-expanded-preview");
  if (expandedPanel) {
    expandedPanel.classList.remove("visible");
    expandedPanel.setAttribute("aria-hidden", "true");
  }

  itemsToRender.forEach((item) => {
    if (item.type === "shortcut") {
      const tile = renderShortcutTile(item.shortcut, {
        showSponsoredLabel: item.area === "sponsored",
        showPinButton: item.area === "pinned",
        draggable: item.area !== "sponsored",
        area: item.area,
        indexInArea: 0,
        itemIndex: item.itemIndex,
      });
      grid.appendChild(tile);
    } else if (item.type === "folder") {
      const tile = renderFolderTile(item.folder, shortcuts, { itemIndex: item.itemIndex });
      grid.appendChild(tile);
    }
  });

  const existingArea = grid.querySelector(".add-shortcut-area");
  existingArea?.remove();

  const area = document.createElement("div");
  area.className = "add-shortcut-area";

  const settingsBtn = document.createElement("button");
  settingsBtn.type = "button";
  settingsBtn.className = "add-shortcut-btn add-shortcut-settings-btn";
  settingsBtn.setAttribute("aria-label", "Settings");
  settingsBtn.setAttribute("title", "Settings");
  settingsBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>';
  settingsBtn.addEventListener("click", () => openCustomizationPanel());

  const addWrapper = document.createElement("div");
  addWrapper.className = "add-shortcut-wrapper";
  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "add-shortcut-btn";
  addButton.setAttribute("aria-label", "Add shortcut");
  addButton.textContent = "+";
  addButton.setAttribute("data-area", "unpinned");
  addButton.setAttribute("data-index", String(getItems(state).length));
  addButton.addEventListener("click", (e) => {
    e.preventDefault();
    openAddShortcutModal();
  });
  addWrapper.appendChild(addButton);

  area.append(addWrapper, settingsBtn);
  grid.appendChild(area);

  section?.querySelectorAll(".shortcuts-show-more-wrapper").forEach((el) => el.remove());
  if (hasMore) {
    const showMoreWrapper = document.createElement("div");
    showMoreWrapper.className = "shortcuts-show-more-wrapper";
    const showMoreBtn = document.createElement("button");
    showMoreBtn.type = "button";
    showMoreBtn.className = "shortcuts-show-more-btn";
    showMoreBtn.textContent = "See all";
    showMoreBtn.addEventListener("click", () => {
      shortcutsExpanded = true;
      renderShortcuts();
    });
    showMoreWrapper.appendChild(showMoreBtn);
    section?.appendChild(showMoreWrapper);
  }

  requestAnimationFrame(() => positionAddButtonAfterLastItem());
}

function positionAddButtonAfterLastItem() {
  const grid = document.getElementById("shortcuts-grid");
  const addArea = grid?.querySelector(".add-shortcut-area");
  if (!grid || !addArea) return;

  const items = Array.from(grid.children).filter(
    (el) => el.classList.contains("shortcut-tile-wrapper") || el.classList.contains("folder-tile-wrapper")
  );
  const gap = parseFloat(getComputedStyle(grid).gap) || 16;

  if (items.length === 0) {
    addArea.style.left = "0";
    addArea.style.top = "0";
    return;
  }

  const isList = getTileSize() === "list";
  if (isList) return; /* List uses grid flow, add area is in-flow */

  const lastItem = items[items.length - 1];
  const gridRect = grid.getBoundingClientRect();
  const lastRect = lastItem.getBoundingClientRect();

  addArea.style.left = lastRect.right - gridRect.left + gap + "px";
  addArea.style.top = lastRect.top - gridRect.top + "px";
}

/**
 * Open add shortcut modal
 */
function openAddShortcutModal() {
  const overlay = document.getElementById("add-shortcut-overlay");
  if (overlay) return;

  const state = loadState();
  const overlayEl = document.createElement("div");
  overlayEl.id = "add-shortcut-overlay";
  overlayEl.className = "add-shortcut-overlay";
  overlayEl.innerHTML = `
    <div class="add-shortcut-modal" role="dialog" aria-labelledby="add-shortcut-title" aria-modal="true">
      <h2 id="add-shortcut-title" class="add-shortcut-modal-title">Add shortcut</h2>
      <form class="add-shortcut-form" id="add-shortcut-form">
        <label for="add-shortcut-title-input">Title</label>
        <input type="text" id="add-shortcut-title-input" name="title" required placeholder="e.g. Google">
        <label for="add-shortcut-url-input">URL</label>
        <input type="url" id="add-shortcut-url-input" name="url" required placeholder="https://example.com">
        <div class="add-shortcut-modal-actions">
          <button type="button" class="add-shortcut-cancel-btn">Cancel</button>
          <button type="submit" class="add-shortcut-save-btn">Save</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlayEl);

  const form = overlayEl.querySelector("#add-shortcut-form");
  const cancelBtn = overlayEl.querySelector(".add-shortcut-cancel-btn");
  const titleInput = overlayEl.querySelector("#add-shortcut-title-input");

  const close = () => {
    overlayEl.remove();
    document.removeEventListener("keydown", handleKeydown);
  };

  const handleKeydown = (e) => {
    if (e.key === "Escape") close();
  };

  overlayEl.addEventListener("click", (e) => {
    if (e.target === overlayEl) close();
  });

  overlayEl.querySelector(".add-shortcut-modal").addEventListener("click", (e) => e.stopPropagation());

  cancelBtn.addEventListener("click", close);
  document.addEventListener("keydown", handleKeydown);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = form.querySelector("#add-shortcut-title-input").value.trim();
    const url = form.querySelector("#add-shortcut-url-input").value.trim();
    if (!title || !url) return;

    const state = loadState();
    const id = nextShortcutId(state);
    const newShortcut = {
      id,
      title,
      url: url.startsWith("http") ? url : `https://${url}`,
      faviconUrl: faviconUrl(getDomainFromUrl(url)),
      sponsored: false,
      pinned: false,
      hasUpdates: false,
      updateCount: 0,
      lastVisited: null,
    };

    const newShortcuts = { ...getShortcuts(state), [String(id)]: newShortcut };
    const newItems = [...getItems(state), { type: "shortcut", id: String(id) }];
    saveState({ ...state, shortcuts: newShortcuts, items: newItems });
    close();
    renderShortcuts();
  });

  requestAnimationFrame(() => {
    overlayEl.classList.add("add-shortcut-overlay--visible");
    titleInput.focus();
  });
}

/**
 * Open edit shortcut modal
 */
function openEditShortcutModal(shortcut) {
  const overlayId = "edit-shortcut-overlay";
  const existing = document.getElementById(overlayId);
  if (existing) return;

  const overlayEl = document.createElement("div");
  overlayEl.id = overlayId;
  overlayEl.className = "add-shortcut-overlay";
  overlayEl.innerHTML = `
    <div class="add-shortcut-modal" role="dialog" aria-labelledby="edit-shortcut-title" aria-modal="true">
      <h2 id="edit-shortcut-title" class="add-shortcut-modal-title">Edit shortcut</h2>
      <form class="add-shortcut-form" id="edit-shortcut-form">
        <label for="edit-shortcut-title-input">Title</label>
        <input type="text" id="edit-shortcut-title-input" name="title" required placeholder="e.g. Google">
        <label for="edit-shortcut-url-input">URL</label>
        <input type="url" id="edit-shortcut-url-input" name="url" required placeholder="https://example.com">
        <div class="add-shortcut-modal-actions">
          <button type="button" class="add-shortcut-cancel-btn">Cancel</button>
          <button type="submit" class="add-shortcut-save-btn">Save</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlayEl);

  const form = overlayEl.querySelector("#edit-shortcut-form");
  const cancelBtn = overlayEl.querySelector(".add-shortcut-cancel-btn");
  const titleInput = overlayEl.querySelector("#edit-shortcut-title-input");
  const urlInput = overlayEl.querySelector("#edit-shortcut-url-input");

  titleInput.value = shortcut.title;
  urlInput.value = shortcut.url;

  const close = () => {
    overlayEl.remove();
    document.removeEventListener("keydown", handleKeydown);
  };

  const handleKeydown = (e) => {
    if (e.key === "Escape") close();
  };

  overlayEl.addEventListener("click", (e) => {
    if (e.target === overlayEl) close();
  });

  overlayEl.querySelector(".add-shortcut-modal").addEventListener("click", (e) => e.stopPropagation());

  cancelBtn.addEventListener("click", close);
  document.addEventListener("keydown", handleKeydown);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = form.querySelector("#edit-shortcut-title-input").value.trim();
    const url = form.querySelector("#edit-shortcut-url-input").value.trim();
    if (!title || !url) return;

    const state = loadState();
    const sid = String(shortcut.id);
    const s = getShortcuts(state)[sid];
    if (!s) return;
    const newShortcuts = {
      ...getShortcuts(state),
      [sid]: {
        ...s,
        title,
        url: url.startsWith("http") ? url : `https://${url}`,
        faviconUrl: faviconUrl(getDomainFromUrl(url)),
      },
    };
    saveState({ ...state, shortcuts: newShortcuts });
    close();
    renderShortcuts();
  });

  requestAnimationFrame(() => {
    overlayEl.classList.add("add-shortcut-overlay--visible");
    titleInput.focus();
  });
}

/**
 * Apply a drag-drop reorder within items array; updates pinned state when crossing areas
 */
function applyMove(state, { draggedId, sourceItemIndex, targetItemIndex, targetArea }) {
  const items = [...getItems(state)];
  const shortcuts = getShortcuts(state);
  const item = items[sourceItemIndex];
  if (!item || item.type !== "shortcut" || item.id !== String(draggedId)) return state;

  const shortcut = shortcuts[item.id];
  if (!shortcut || shortcut.sponsored) return state;

  const targetPinned = targetArea === "pinned";
  const newShortcuts = targetPinned !== shortcut.pinned
    ? { ...shortcuts, [item.id]: { ...shortcut, pinned: targetPinned } }
    : shortcuts;

  items.splice(sourceItemIndex, 1);
  const insertIdx = sourceItemIndex < targetItemIndex ? targetItemIndex - 1 : targetItemIndex;
  items.splice(Math.max(0, insertIdx), 0, item);
  return { ...state, shortcuts: newShortcuts, items };
}

/**
 * Create folder from two shortcuts when one is dropped on the other
 */
function createFolderFromDrop(state, draggedId, targetId) {
  const sid = String(draggedId);
  const tid = String(targetId);
  if (sid === tid) return state;

  const shortcuts = getShortcuts(state);
  const dragged = shortcuts[sid];
  const target = shortcuts[tid];
  if (!dragged || !target || dragged.sponsored || target.sponsored) return state;

  const items = [...getItems(state)];
  const targetIdx = items.findIndex((i) => i.type === "shortcut" && i.id === tid);
  if (targetIdx < 0) return state;

  const folderId = nextFolderId(state);
  const folder = {
    id: folderId,
    title: target.title,
    shortcutIds: [tid, sid],
  };

  const newItems = items
    .filter((i) => !(i.type === "shortcut" && i.id === sid))
    .map((item, i) => (i === targetIdx ? { type: "folder", id: folderId } : item));

  return {
    ...state,
    folders: { ...getFolders(state), [folderId]: folder },
    items: newItems,
  };
}

/**
 * Add shortcut to folder (remove from items, add to folder.shortcutIds)
 */
function addShortcutToFolder(state, shortcutId, folderId) {
  const sid = String(shortcutId);
  const fid = String(folderId);
  const folder = getFolders(state)[fid];
  if (!folder) return state;

  const newItems = getItems(state).filter((i) => !(i.type === "shortcut" && i.id === sid));
  const newFolders = {
    ...getFolders(state),
    [fid]: {
      ...folder,
      shortcutIds: [...(folder.shortcutIds || []), sid],
    },
  };
  return { ...state, items: newItems, folders: newFolders };
}

/**
 * Setup drag-and-drop for shortcuts grid (reorder + drop on folder)
 */
function setupDragAndDrop(grid) {
  const indicator = document.getElementById("shortcuts-drop-indicator");

  let dragState = null;
  let lastDragOverTarget = null;
  let lastInsertBefore = true;
  let lastShortcutDropAction = "reorder"; /* "reorder" | "folder" */

  function hideIndicator() {
    if (indicator) {
      indicator.classList.remove("visible");
      indicator.style.left = "";
      indicator.style.top = "";
      indicator.style.height = "";
    }
  }

  function clearDropTargets() {
    document.querySelectorAll(".shortcut-tile.drop-target, .folder-tile.drop-target, .add-shortcut-btn.drop-target").forEach((el) =>
      el.classList.remove("drop-target")
    );
  }

  function showIndicator(container, tile, insertBefore) {
    if (!indicator || !container || !tile) return;
    const containerRect = container.getBoundingClientRect();
    const tileRect = tile.getBoundingClientRect();
    const barWidth = 4;
    const offset = insertBefore ? -barWidth / 2 : tileRect.width - barWidth / 2;
    indicator.style.left = tileRect.left - containerRect.left + offset + "px";
    indicator.style.top = tileRect.top - containerRect.top + "px";
    indicator.style.height = tileRect.height + "px";
    indicator.classList.add("visible");
  }

  function updatePinnedAreaOverlay() {
    const container = grid?.parentElement;
    const existing = document.getElementById("pinned-area-overlay");
    if (existing) existing.remove();
    if (!container || !dragState) return;

    const pinnedTiles = Array.from(grid.querySelectorAll('.shortcut-tile:not(.folder-tile)[data-area="pinned"]'));
    if (pinnedTiles.length === 0) return;

    const containerRect = container.getBoundingClientRect();
    let minL = Infinity, minT = Infinity, maxR = -Infinity, maxB = -Infinity;
    pinnedTiles.forEach((el) => {
      const r = el.getBoundingClientRect();
      minL = Math.min(minL, r.left);
      minT = Math.min(minT, r.top);
      maxR = Math.max(maxR, r.right);
      maxB = Math.max(maxB, r.bottom);
    });
    const pad = 8;
    const overlay = document.createElement("div");
    overlay.id = "pinned-area-overlay";
    overlay.className = "pinned-area-overlay";
    overlay.innerHTML = `
      <span class="pinned-area-overlay-label">
        <span class="pinned-area-overlay-icon">${'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>'}</span>
        <span>Pinned Area</span>
      </span>
    `;
    overlay.style.left = (minL - containerRect.left - pad) + "px";
    overlay.style.top = (minT - containerRect.top - pad) + "px";
    overlay.style.width = (maxR - minL + pad * 2) + "px";
    overlay.style.height = (maxB - minT + pad * 2) + "px";
    overlay.style.pointerEvents = "none";
    container.appendChild(overlay);
  }

  function removePinnedAreaOverlay() {
    document.getElementById("pinned-area-overlay")?.remove();
  }

  function handleDragStart(e) {
    if (e.target.closest(".shortcut-pin-btn, .shortcut-context-btn")) return;
    const tile = e.target.closest(".shortcut-tile:not(.folder-tile)");
    if (!tile || !tile.draggable) return;
    const id = tile.getAttribute("data-id");
    const area = tile.getAttribute("data-area");
    const itemIndex = tile.getAttribute("data-item-index");
    if (!id || area === "sponsored") return;
    isDraggingShortcut = true;
    document.querySelectorAll(".shortcut-hover-overlay.visible").forEach((el) => el.classList.remove("visible"));
    dragState = { id, area, sourceItemIndex: parseInt(itemIndex || "0", 10) };
    tile.classList.add("dragging");
    updatePinnedAreaOverlay();
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const isFolderItemDrag = e.dataTransfer.types.includes("application/x-folder-item");

    if (isFolderItemDrag) {
      grid.classList.add("shortcuts-grid--drop-target");
      clearDropTargets();
      hideIndicator();
      return;
    }

    if (!dragState) return;

    const addBtn = e.target.closest(".add-shortcut-btn");
    const folderTile = e.target.closest(".folder-tile[data-drop-target='folder']");
    const shortcutTile = e.target.closest(".shortcut-tile:not(.folder-tile)");
    if (shortcutTile?.classList.contains("dragging")) return;

    clearDropTargets();

    if (folderTile) {
      folderTile.classList.add("drop-target");
      lastDragOverTarget = folderTile;
      hideIndicator();
      return;
    }

    if (shortcutTile) {
      const targetId = shortcutTile.getAttribute("data-id");
      if (targetId && targetId !== dragState.id) {
        const targetArea = shortcutTile.getAttribute("data-area");
        if (targetArea === "sponsored") return;
        shortcutTile.classList.add("drop-target");
        lastDragOverTarget = shortcutTile;
        const rect = shortcutTile.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width;
        if (relX < 0.33) {
          lastShortcutDropAction = "reorder";
          lastInsertBefore = true;
          showIndicator(grid?.parentElement, shortcutTile, true);
        } else if (relX > 0.67) {
          lastShortcutDropAction = "reorder";
          lastInsertBefore = false;
          showIndicator(grid?.parentElement, shortcutTile, false);
        } else {
          lastShortcutDropAction = "folder";
          hideIndicator();
        }
        return;
      }
    }

    const target = addBtn || shortcutTile;
    if (!target) return;

    const shortcut = shortcutTile;
    const targetArea = shortcut ? shortcut.getAttribute("data-area") : "unpinned";
    if (targetArea === "sponsored") return;

    target.classList.add("drop-target");
    lastDragOverTarget = target;
    const rect = target.getBoundingClientRect();
    lastInsertBefore = addBtn ? true : e.clientX < rect.left + rect.width / 2;
    const targetItemIndex = addBtn
      ? getItems(loadState()).length
      : parseInt((shortcut || target).getAttribute("data-item-index") || "0", 10);
    const container = grid?.parentElement;
    showIndicator(container, target, lastInsertBefore);
  }

  function handleDrop(e) {
    e.preventDefault();

    const el = document.elementFromPoint(e.clientX, e.clientY);
    const root = (el && grid.contains(el)) ? el : e.target;
    const resolveTarget = (sel) => root.closest(sel) || lastDragOverTarget?.closest(sel);

    const folderItemData = (() => {
      try {
        const raw = e.dataTransfer.getData("text/plain");
        if (raw.startsWith("folder-item:")) return JSON.parse(raw.slice(12));
        return null;
      } catch (_) {
        return null;
      }
    })();

    if (folderItemData) {
      removeShortcutFromFolder(folderItemData.folderId, folderItemData.shortcutId);
      const panel = document.getElementById("folder-panel");
      if (panel && panel.dataset.folderId === folderItemData.folderId) {
        refreshFolderPanel(panel, folderItemData.folderId);
      }
      grid.classList.remove("shortcuts-grid--drop-target");
      removePinnedAreaOverlay();
      showToast("Removed from folder");
      return;
    }

    if (!dragState) return;

    const folderTile = resolveTarget(".folder-tile[data-drop-target='folder']");
    const addBtn = resolveTarget(".add-shortcut-btn");
    const shortcutTile = resolveTarget(".shortcut-tile:not(.folder-tile)");

    if (folderTile) {
      const folderId = folderTile.getAttribute("data-id");
      const state = loadState();
      const next = addShortcutToFolder(state, dragState.id, folderId);
      saveState(next);
      renderShortcuts();
      clearDropTargets();
      hideIndicator();
      removePinnedAreaOverlay();
      dragState = null;
      return;
    }

    if (shortcutTile) {
      const targetId = shortcutTile.getAttribute("data-id");
      if (targetId && targetId !== dragState.id) {
        if (lastShortcutDropAction === "folder") {
          const state = loadState();
          const next = createFolderFromDrop(state, dragState.id, targetId);
          if (next !== state) {
            saveState(next);
            renderShortcuts();
            showToast("Created folder");
          }
        } else {
          const targetItemIndex = parseInt(shortcutTile.getAttribute("data-item-index") || "0", 10);
          const effectiveTargetIndex = lastInsertBefore ? targetItemIndex : targetItemIndex + 1;
          const targetArea = shortcutTile.getAttribute("data-area");
          const state = loadState();
          const next = applyMove(state, {
            draggedId: dragState.id,
            sourceItemIndex: dragState.sourceItemIndex,
            targetItemIndex: effectiveTargetIndex,
            targetArea,
          });
          saveState(next);
          renderShortcuts();
        }
        clearDropTargets();
        hideIndicator();
        removePinnedAreaOverlay();
        dragState = null;
        return;
      }
    }

    const target = addBtn || shortcutTile;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const insertBefore = addBtn ? true : e.clientX < rect.left + rect.width / 2;
    const targetItemIndex = addBtn
      ? getItems(loadState()).length
      : parseInt(shortcutTile?.getAttribute("data-item-index") || "0", 10);
    const effectiveTargetIndex = insertBefore ? targetItemIndex : targetItemIndex + 1;
    const targetArea = shortcutTile ? shortcutTile.getAttribute("data-area") : "unpinned";

    const state = loadState();
    const next = applyMove(state, {
      draggedId: dragState.id,
      sourceItemIndex: dragState.sourceItemIndex,
      targetItemIndex: effectiveTargetIndex,
      targetArea,
    });
    saveState(next);
    renderShortcuts();
    clearDropTargets();
    hideIndicator();
    removePinnedAreaOverlay();
    dragState = null;
  }

  function handleDragLeave(e) {
    if (!e.relatedTarget || !grid.contains(e.relatedTarget)) {
      clearDropTargets();
      hideIndicator();
      removePinnedAreaOverlay();
      grid.classList.remove("shortcuts-grid--drop-target");
    }
  }

  function handleDragEnd(e) {
    clearDropTargets();
    hideIndicator();
    removePinnedAreaOverlay();
    grid.classList.remove("shortcuts-grid--drop-target");
    e.target.closest(".shortcut-tile")?.classList.remove("dragging");
    dragState = null;
    lastDragOverTarget = null;
    lastInsertBefore = true;
    lastShortcutDropAction = "reorder";
    isDraggingShortcut = false;
  }

  if (grid) {
    grid.addEventListener("dragstart", handleDragStart);
    grid.addEventListener("dragover", handleDragOver);
    grid.addEventListener("drop", handleDrop);
    grid.addEventListener("dragleave", handleDragLeave);
    grid.addEventListener("dragend", handleDragEnd);
  }
}

/** Random image URL - Unsplash Source (https://source.unsplash.com) */
function getContentCardImageUrl(width, height, seed) {
  return `https://source.unsplash.com/random/${width}x${height}?sig=${seed}`;
}

/**
 * Renders a single content card
 */
function renderContentCard(card) {
  const el = document.createElement("article");
  el.className = "content-card" + (card.size ? ` content-card--${card.size}` : "");
  el.setAttribute("data-id", card.id);
  const snippetHtml = card.size === "big" ? `<p class="content-card-snippet">${escapeHtml(card.snippet)}</p>` : "";
  const imgW = card.size === "big" ? 400 : card.size === "small" ? 130 : 300;
  const imgH = card.size === "big" ? 300 : card.size === "small" ? 130 : 200;
  const imgUrl = getContentCardImageUrl(imgW, imgH, card.id);
  el.innerHTML = `
    <div class="content-card-thumbnail"></div>
    <div class="content-card-body">
      <h3 class="content-card-title">${escapeHtml(card.title)}</h3>
      ${snippetHtml}
    </div>
  `;
  const thumb = el.querySelector(".content-card-thumbnail");
  const img = document.createElement("img");
  img.src = imgUrl;
  img.alt = "";
  img.loading = "lazy";
  img.onerror = () => {
    img.src = `https://picsum.photos/seed/${card.id}/${imgW}/${imgH}`;
    img.onerror = () => { img.style.display = "none"; };
  };
  thumb.appendChild(img);
  return el;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Renders a stack of 2 small cards (takes 1 grid column)
 */
function renderSmallCardsStack(cards) {
  const wrapper = document.createElement("div");
  wrapper.className = "content-cards-small-stack";
  cards.forEach((card) => wrapper.appendChild(renderContentCard(card)));
  return wrapper;
}

/**
 * Builds full rows from cards using templates (a), (b), (c).
 * Each row fills 4 columns: a=big+2small+default, b=4default, c=2small+2default+2small
 */
function buildContentRows(cards) {
  const big = cards.filter((c) => c.size === "big");
  const def = cards.filter((c) => c.size === "default");
  const small = cards.filter((c) => c.size === "small");

  const rows = [];
  const templateOrder = ["a", "b", "c"];

  function canFill(t) {
    const req = CONTENT_ROW_TEMPLATES[t];
    return big.length >= req.big && def.length >= req.default && small.length >= req.small;
  }

  function consume(t) {
    const req = CONTENT_ROW_TEMPLATES[t];
    const rowBig = req.big ? big.splice(0, req.big) : [];
    const rowDef = req.default ? def.splice(0, req.default) : [];
    const rowSmall = req.small ? small.splice(0, req.small) : [];
    return { type: t, big: rowBig, default: rowDef, small: rowSmall };
  }

  let filled;
  do {
    filled = false;
    for (const t of templateOrder) {
      if (canFill(t)) {
        rows.push(consume(t));
        filled = true;
        break;
      }
    }
  } while (filled);

  return rows;
}

/**
 * Renders grid items for a row based on template type
 */
function renderRowItems(row) {
  const items = [];
  if (row.type === "a") {
    if (row.big[0]) items.push(renderContentCard(row.big[0]));
    if (row.small.length >= 2) items.push(renderSmallCardsStack(row.small.slice(0, 2)));
    if (row.default[0]) items.push(renderContentCard(row.default[0]));
  } else if (row.type === "b") {
    row.default.forEach((c) => items.push(renderContentCard(c)));
  } else if (row.type === "c") {
    if (row.small.length >= 2) items.push(renderSmallCardsStack(row.small.slice(0, 2)));
    row.default.forEach((c) => items.push(renderContentCard(c)));
    if (row.small.length >= 4) items.push(renderSmallCardsStack(row.small.slice(2, 4)));
  }
  return items;
}

/**
 * Renders the content cards section with topic headers and full rows only
 */
function renderContentCards() {
  const container = document.getElementById("content-cards");
  if (!container) return;

  const cardsByTopic = {};
  MOCK_CONTENT_CARDS.forEach((card) => {
    const topic = card.topic || "For you";
    if (!cardsByTopic[topic]) cardsByTopic[topic] = [];
    cardsByTopic[topic].push(card);
  });

  Object.entries(cardsByTopic).forEach(([topic, cards]) => {
    const rows = buildContentRows([...cards]);
    if (rows.length === 0) return;

    const block = document.createElement("div");
    block.className = "content-cards-block";
    const header = document.createElement("h2");
    header.className = "content-section-topic";
    header.textContent = topic;
    block.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "content-cards-grid";

    rows.forEach((row) => {
      renderRowItems(row).forEach((el) => grid.appendChild(el));
    });

    block.appendChild(grid);
    container.appendChild(block);
  });
}

/* ===== Resume your tasks (History / Tabs / Bookmarks) ===== */
const RESUME_MOCK_FALLBACK = {
  history: [
    { id: "h1", title: "GitHub - Pull requests", url: "https://github.com/pulls", domain: "github.com", faviconUrl: "https://www.google.com/s2/favicons?domain=github.com&sz=32", visitedAt: "2025-03-03T10:30:00Z" },
    { id: "h2", title: "Gmail - Inbox", url: "https://mail.google.com", domain: "mail.google.com", faviconUrl: "https://www.google.com/s2/favicons?domain=mail.google.com&sz=32", visitedAt: "2025-03-03T09:15:00Z" },
    { id: "h3", title: "MDN Web Docs - JavaScript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", domain: "developer.mozilla.org", faviconUrl: "https://www.google.com/s2/favicons?domain=developer.mozilla.org&sz=32", visitedAt: "2025-03-03T08:45:00Z" },
  ],
  tabs: [
    { id: "t1", title: "Cursor - AI Code Editor", url: "https://cursor.com", domain: "cursor.com", faviconUrl: "https://www.google.com/s2/favicons?domain=cursor.com&sz=32" },
    { id: "t2", title: "Stack Overflow - Questions", url: "https://stackoverflow.com/questions", domain: "stackoverflow.com", faviconUrl: "https://www.google.com/s2/favicons?domain=stackoverflow.com&sz=32" },
  ],
  bookmarks: [
    { id: "b1", title: "Project Dashboard", url: "https://app.example.com/dashboard", domain: "app.example.com", faviconUrl: "https://www.google.com/s2/favicons?domain=example.com&sz=32", visitCount: 42 },
    { id: "b2", title: "Design System", url: "https://design.example.com", domain: "design.example.com", faviconUrl: "https://www.google.com/s2/favicons?domain=example.com&sz=32", visitCount: 28 },
  ],
};

const RESUME_FALLBACK_FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect fill='%237c3aed' width='32' height='32' rx='6'/%3E%3Ctext x='16' y='21' font-size='14' fill='white' text-anchor='middle' font-family='sans-serif'%3E%3F%3C/text%3E%3C/svg%3E";

function formatResumeTime(iso) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const diffM = Math.floor(diffMs / 60000);
    if (diffM < 60) return `${diffM}m ago`;
    const diffH = Math.floor(diffM / 60);
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD}d ago`;
  } catch (_) {
    return "";
  }
}

function renderResumeItem(item, source) {
  const card = document.createElement("a");
  card.href = item.url;
  card.target = "_blank";
  card.rel = "noopener noreferrer";
  card.className = "resume-card";
  card.setAttribute("data-id", item.id);
  const favicon = item.faviconUrl || RESUME_FALLBACK_FAVICON;
  const meta = source === "history" && item.visitedAt
    ? formatResumeTime(item.visitedAt)
    : source === "bookmarks" && item.visitCount != null
      ? `${item.visitCount} visits`
      : item.domain || "";
  const img = document.createElement("img");
  img.className = "resume-card-favicon";
  img.src = favicon;
  img.alt = "";
  img.onerror = () => { img.src = RESUME_FALLBACK_FAVICON; };
  const body = document.createElement("div");
  body.className = "resume-card-body";
  body.innerHTML = `<span class="resume-card-title">${escapeHtml(item.title)}</span><span class="resume-card-meta">${escapeHtml(meta)}</span>`;
  card.append(img, body);
  return card;
}

function renderResumePanel(panelEl, items, source) {
  panelEl.innerHTML = "";
  if (!items || items.length === 0) {
    panelEl.innerHTML = '<p class="resume-empty">No items</p>';
    return;
  }
  const list = document.createElement("div");
  list.className = "resume-cards-list resume-cards-list--two-cols";
  items.forEach((item) => {
    list.appendChild(renderResumeItem(item, source));
  });
  panelEl.appendChild(list);
}

function initResumeSection() {
  const section = document.getElementById("resume-section");
  if (!section) return;

  if (!ENABLE_RESUME) {
    section.hidden = true;
    return;
  }

  function renderAllPanels(data) {
    renderResumePanel(document.getElementById("resume-panel-history"), data.history || [], "history");
    renderResumePanel(document.getElementById("resume-panel-tabs"), data.tabs || [], "tabs");
    renderResumePanel(document.getElementById("resume-panel-bookmarks"), data.bookmarks || [], "bookmarks");
  }

  renderAllPanels(RESUME_MOCK_FALLBACK);

  fetch("resume_mock.json")
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (data && (data.history || data.tabs || data.bookmarks)) renderAllPanels(data);
    })
    .catch(() => {});

  const tabs = section.querySelectorAll(".resume-tab");
  const panels = section.querySelectorAll(".resume-panel");
  const titleEl = section.querySelector(".resume-section-title");

  function setTitleFromTab(tab) {
    if (titleEl && tab) {
      const label = tab.getAttribute("aria-label") || tab.dataset.source;
      titleEl.textContent = label ? label.charAt(0).toUpperCase() + label.slice(1) : "Resume your tasks";
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const source = tab.dataset.source;
      tabs.forEach((t) => {
        t.classList.remove("resume-tab--active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("resume-tab--active");
      tab.setAttribute("aria-selected", "true");

      setTitleFromTab(tab);

      panels.forEach((p) => {
        p.classList.remove("resume-panel--active");
        p.hidden = true;
      });
      const panel = document.getElementById(`resume-panel-${source}`);
      if (panel) {
        panel.classList.add("resume-panel--active");
        panel.hidden = false;
      }
    });
  });

  const activeTab = section.querySelector(".resume-tab--active");
  if (activeTab) setTitleFromTab(activeTab);

  section.hidden = !getShowResume();

  section.querySelector(".resume-tabs")?.addEventListener("keydown", (e) => {
    const idx = Array.from(tabs).findIndex((t) => t === document.activeElement);
    if (e.key === "ArrowRight" && idx >= 0 && idx < tabs.length - 1) {
      e.preventDefault();
      tabs[idx + 1].focus();
    } else if (e.key === "ArrowLeft" && idx > 0) {
      e.preventDefault();
      tabs[idx - 1].focus();
    }
  });
}

/**
 * Setup customization panel (tile size, show labels)
 */
function openCustomizationPanel() {
  const overlay = document.getElementById("customization-panel-overlay");
  const panel = document.getElementById("customization-panel");
  if (!overlay || !panel) return;
  const view = getTileView();
  const viewRadio = panel.querySelector(`input[name="tileView"][value="${view}"]`);
  if (viewRadio) viewRadio.checked = true;
  const slider = document.getElementById("grid-size-slider");
  if (slider) slider.value = getGridSize();
  const gridSizeField = document.getElementById("grid-size-field");
  if (gridSizeField) gridSizeField.hidden = view === "list";
  const labelsEl = document.getElementById("show-labels-toggle");
  if (labelsEl) {
    labelsEl.disabled = view === "list";
    labelsEl.checked = view === "list" ? true : localStorage.getItem(SHOW_LABELS_KEY) !== "false";
  }
  const showShortcutsEl = document.getElementById("show-shortcuts-toggle");
  if (showShortcutsEl) showShortcutsEl.checked = getShowShortcuts();
  const showResumeEl = document.getElementById("show-resume-toggle");
  const showResumeField = document.getElementById("show-resume-field");
  if (showResumeEl) showResumeEl.checked = getShowResume();
  if (showResumeField) showResumeField.hidden = !ENABLE_RESUME;
  const rowsSelect = document.getElementById("shortcuts-rows-select");
  if (rowsSelect) {
    const rows = getShortcutsRows();
    rowsSelect.value = String(rows);
  }
  const shortcutsRowsField = document.getElementById("shortcuts-rows-field");
  if (shortcutsRowsField) shortcutsRowsField.hidden = !getShowShortcuts();
  overlay.classList.add("customization-panel-overlay--visible");
  panel.classList.add("customization-panel--visible");
  overlay.setAttribute("aria-hidden", "false");
}

function setupCustomizationPanel() {
  const overlay = document.getElementById("customization-panel-overlay");
  const panel = document.getElementById("customization-panel");
  const closeBtn = document.getElementById("customization-panel-close");
  const gridSizeField = document.getElementById("grid-size-field");
  const customizeFab = document.getElementById("customize-fab");

  customizeFab?.addEventListener("click", openCustomizationPanel);

  function close() {
    overlay?.classList.remove("customization-panel-overlay--visible");
    panel?.classList.remove("customization-panel--visible");
    overlay?.setAttribute("aria-hidden", "true");
  }

  closeBtn?.addEventListener("click", close);
  overlay?.addEventListener("click", close);

  panel?.querySelectorAll('input[name="tileView"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      setTileView(e.target.value);
      if (gridSizeField) gridSizeField.hidden = e.target.value === "list";
      const labelsEl = document.getElementById("show-labels-toggle");
      if (labelsEl) {
        labelsEl.disabled = e.target.value === "list";
        if (e.target.value === "list") labelsEl.checked = true;
        else labelsEl.checked = localStorage.getItem(SHOW_LABELS_KEY) !== "false";
      }
      applyCustomization();
      renderShortcuts();
    });
  });

  const slider = document.getElementById("grid-size-slider");
  slider?.addEventListener("input", (e) => {
    setGridSize(parseInt(e.target.value, 10));
    applyCustomization();
    renderShortcuts();
  });

  const labelsToggle = document.getElementById("show-labels-toggle");
  labelsToggle?.addEventListener("change", (e) => {
    setShowLabels(e.target.checked);
    applyCustomization();
    renderShortcuts();
  });

  const showShortcutsToggle = document.getElementById("show-shortcuts-toggle");
  const shortcutsRowsField = document.getElementById("shortcuts-rows-field");
  showShortcutsToggle?.addEventListener("change", (e) => {
    setShowShortcuts(e.target.checked);
    if (shortcutsRowsField) shortcutsRowsField.hidden = !e.target.checked;
    applyCustomization();
    renderShortcuts();
  });

  const rowsSelect = document.getElementById("shortcuts-rows-select");
  rowsSelect?.addEventListener("change", (e) => {
    const v = parseInt(e.target.value, 10);
    setShortcutsRows(v);
    shortcutsExpanded = false;
    applyCustomization();
    renderShortcuts();
  });

  const showResumeToggle = document.getElementById("show-resume-toggle");
  showResumeToggle?.addEventListener("change", (e) => {
    setShowResume(e.target.checked);
    const section = document.getElementById("resume-section");
    if (section) section.hidden = !e.target.checked;
  });

  document.getElementById("change-wallpaper-btn")?.addEventListener("click", () => showToast("Coming soon"));
  document.getElementById("manage-topics-btn")?.addEventListener("click", () => showToast("Coming soon"));
  document.getElementById("show-widgets-toggle")?.addEventListener("change", (e) => {
    e.target.checked = false;
    showToast("Coming soon");
  });
  document.getElementById("show-stories-toggle")?.addEventListener("change", (e) => {
    e.target.checked = true;
    showToast("Coming soon");
  });
}

/**
 * Initialize the app
 */
function init() {
  const state = loadState();
  if (!localStorage.getItem(STORAGE_KEY)) {
    saveState(state);
  }
  applyCustomization();
  renderShortcuts();
  if (ENABLE_RESUME) initResumeSection();
  renderContentCards();
  setupDragAndDrop(document.getElementById("shortcuts-grid"));
  setupCustomizationPanel();

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(positionAddButtonAfterLastItem, 100);
  });
}

init();
