const TWEET_SELECTOR = 'article[data-testid="tweet"]';
const USERNAME_SELECTOR = '[data-testid="User-Name"] a[href^="/"]';
const AVATAR_SELECTOR = 'div[data-testid="Tweet-User-Avatar"], [data-testid="UserAvatar-Container"]';
const PAGE_MESSAGE_TYPE = 'xglobe:fetch-location';
const PAGE_RESPONSE_TYPE = 'xglobe:location-response';

// Keep network usage gentle: cap concurrent profile fetches and respect
// server-side rate limits.
const MAX_PARALLEL_FETCHES = 3;

const memoryCache = new Map();
const pendingLookups = new Map();
const pageRequests = new Map();
let rateLimitUntil = 0;

let mutationObserver = null;
let pageScriptInjected = false;
let globalTooltip = null;
let tooltipScrollBound = false;
let lastProfilePath = null;
let inFlightFetches = 0;
const pendingFetchQueue = [];

ready(() => {
  injectPageScript();
  observeTimeline();
  scanTweets();
  scanProfileHeader();
  window.addEventListener('message', handlePageMessage);
});

function ready(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}

function injectPageScript() {
  if (pageScriptInjected) return;
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('pageScript.js');
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
  pageScriptInjected = true;
}

function observeTimeline() {
  if (mutationObserver) return;
  mutationObserver = new MutationObserver((mutations) => {
    if (mutations.some((m) => m.addedNodes.length)) {
      queueMicrotask(() => {
        scanTweets();
        scanProfileHeader();
      });
    }
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });
}

function ensureGlobalTooltip() {
  if (globalTooltip && document.body.contains(globalTooltip)) return globalTooltip;
  let el = document.getElementById('xglobe-tooltip-portal');
  if (!el) {
    el = document.createElement('div');
    el.id = 'xglobe-tooltip-portal';
    document.body.appendChild(el);
  }
  globalTooltip = el;

  if (!tooltipScrollBound) {
    window.addEventListener(
      'scroll',
      () => {
        if (globalTooltip) {
          globalTooltip.style.opacity = '0';
        }
      },
      { passive: true }
    );
    tooltipScrollBound = true;
  }

  return globalTooltip;
}

function attachTooltip(markerElement, text) {
  if (!markerElement) return;
  if (markerElement.dataset.xglobeTooltipBound === '1') return;
  markerElement.dataset.xglobeTooltipBound = '1';

  const tooltip = ensureGlobalTooltip();

  const show = () => {
    const rect = markerElement.getBoundingClientRect();
    tooltip.textContent = text || '';
    const tooltipHeight = tooltip.offsetHeight || 0;
    const x = rect.right + 10;
    const y = rect.top + rect.height / 2 - tooltipHeight / 2;
    tooltip.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    tooltip.style.opacity = '1';
  };

  const hide = () => {
    tooltip.style.opacity = '0';
  };

  markerElement.addEventListener('mouseenter', show);
  markerElement.addEventListener('mouseleave', hide);
}

function isStatusPermalink() {
  const path = window.location?.pathname || '';
  return /^\/[^/]+\/status\/\d+/.test(path);
}

function getProfileUsernameFromPath() {
  const path = window.location?.pathname || '';
  const segments = path.split('/').filter(Boolean);
  if (!segments.length) return null;
  const seg = segments[0].toLowerCase();
  const reserved = new Set(['home', 'explore', 'notifications', 'messages', 'i', 'settings', 'search']);
  if (reserved.has(seg)) return null;
  return decodeURIComponent(segments[0]);
}

function isProfilePage() {
  return Boolean(getProfileUsernameFromPath());
}

function scanTweets() {
  const tweets = document.querySelectorAll(TWEET_SELECTOR);
  const statusView = isStatusPermalink();
  tweets.forEach((tweet, index) => {
    if (tweet.dataset.xglobeBound === '1') return;
    const username = extractUsername(tweet);
    if (!username) return;

    // If the next tweet has the same author, treat this as a self-reply chain
    // and only render the globe on the last tweet in the consecutive run.
    const next = tweets[index + 1];
    if (next) {
      const nextUsername = extractUsername(next);
      if (nextUsername && nextUsername === username) {
        return;
      }
    }

    const isMain = statusView && index === 0;
    tweet.dataset.xglobeLayout = isMain ? 'inline-name' : 'avatar';

    tweet.dataset.xglobeBound = '1';
    tweet.dataset.xglobeUsername = username;
    ensureSlot(tweet);
    ensureLocation(username).then((entry) => entry && render(username, entry));
  });

  if (isProfilePage()) {
    scanProfileHeader();
  }
}

function extractUsername(tweet) {
  const anchor = tweet.querySelector(USERNAME_SELECTOR);
  if (!anchor) return null;
  const href = anchor.getAttribute('href') || '';
  const match = href.match(/^\/([^\/?]+)/);
  return match ? match[1] : null;
}

function ensureSlot(tweet) {
  const layout = tweet.dataset.xglobeLayout || 'avatar';
  const nameContainer = tweet.querySelector('[data-testid="User-Name"]');
  const avatar =
    tweet.querySelector('div[data-testid="Tweet-User-Avatar"]') ||
    tweet.querySelector(AVATAR_SELECTOR);
  const host = layout === 'inline-name' && nameContainer ? nameContainer : avatar || tweet;
  if (!host.classList.contains('xglobe-with-marker')) {
    host.classList.add('xglobe-with-marker');
  }
  let slot = host.querySelector('.xglobe-marker-slot');
  if (!slot) {
    slot = document.createElement('div');
    slot.className =
      'xglobe-marker-slot' + (layout === 'inline-name' ? ' xglobe-marker-slot--inline' : '');
    host.appendChild(slot);
  } else if (layout === 'inline-name' && !slot.classList.contains('xglobe-marker-slot--inline')) {
    slot.classList.add('xglobe-marker-slot--inline');
  }
  return slot;
}

function scanProfileHeader() {
  const username = getProfileUsernameFromPath();
  if (!username) return;

  const nameContainer = document.querySelector('[data-testid="UserName"]');
  if (!nameContainer) return;

  // Use the inner name row (the flex row with the display name & badges) as
  // the anchor for the inline globe, so it sits on the same horizontal line
  // and isn't affected by wrapping of the wider UserName container.
  const host = nameContainer.querySelector('div[dir="ltr"]') || nameContainer;
  if (!host.classList.contains('xglobe-with-marker')) {
    host.classList.add('xglobe-with-marker');
  }

  let slot = host.querySelector('.xglobe-marker-slot');
  if (!slot) {
    slot = document.createElement('div');
    slot.className = 'xglobe-marker-slot xglobe-marker-slot--inline';
    host.appendChild(slot);
  } else if (!slot.classList.contains('xglobe-marker-slot--inline')) {
    slot.classList.add('xglobe-marker-slot--inline');
  }

  const currentPath = window.location?.pathname || '';
  // If we've already rendered a marker for this profile path, don't rerun
  // the location lookup or canvas render on subsequent mutations.
  if (lastProfilePath === currentPath && slot.querySelector('.xglobe-marker')) {
    return;
  }
  lastProfilePath = currentPath;

  ensureLocation(username).then((entry) => {
    if (!entry) return;
    const accent = extractAccentColor(document);
    window.XGlobeRenderer?.render(slot, entry, {
      size: 40,
      accent,
    });
    const marker = slot.querySelector('.xglobe-marker');
    if (marker) {
      attachTooltip(marker, entry.location || '');
    }
  });
}

function ensureLocation(username) {
  if (memoryCache.has(username)) {
    return Promise.resolve(memoryCache.get(username));
  }

  if (pendingLookups.has(username)) {
    return pendingLookups.get(username);
  }

  if (Date.now() < rateLimitUntil) {
    return Promise.resolve(null);
  }

  const promise = getCached(username)
    .then((entry) => entry || enqueueFetch(username))
    .then((entry) => {
      if (entry) memoryCache.set(username, entry);
      return entry;
    })
    .finally(() => pendingLookups.delete(username));

  pendingLookups.set(username, promise);
  return promise;
}

function enqueueFetch(username) {
  // If we are currently rate-limited, do not enqueue more work.
  if (Date.now() < rateLimitUntil) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    pendingFetchQueue.push({ username, resolve });
    pumpFetchQueue();
  });
}

function pumpFetchQueue() {
  if (inFlightFetches >= MAX_PARALLEL_FETCHES) return;

  // If we hit a rate limit, drop all queued work quickly without issuing
  // any additional network calls. This keeps CPU use low and avoids timers.
  if (Date.now() < rateLimitUntil) {
    while (pendingFetchQueue.length) {
      const { resolve } = pendingFetchQueue.shift();
      resolve(null);
    }
    return;
  }

  const next = pendingFetchQueue.shift();
  if (!next) return;

  inFlightFetches += 1;
  fetchViaPage(next.username)
    .then(next.resolve)
    .finally(() => {
      inFlightFetches -= 1;
      if (pendingFetchQueue.length) {
        queueMicrotask(pumpFetchQueue);
      }
    });
}

function getCached(username) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'globe:get-cache', username }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn('xglobe cache error', chrome.runtime.lastError);
        resolve(null);
        return;
      }
      const entry = response?.entry ?? null;
      if (!entry || !entry.location || !window.XGlobeCountryDB?.resolveLocation) {
        resolve(entry);
        return;
      }

      // Re-resolve cached entry location so that any fixes to the
      // country/region database (e.g. "Europe", "East Asia & Pacific")
      // are applied even to older cache data.
      const resolved = window.XGlobeCountryDB.resolveLocation(entry.location) || null;
      const isCountry = resolved?.type === 'country';
      const iso2 = resolved?.iso2 || null;

      resolve({
        ...entry,
        centroid: isCountry ? { lat: resolved.lat, lon: resolved.lon } : null,
        continent: resolved?.continent || null,
        iso2,
        regionOnly: resolved?.type === 'region',
      });
    });
  });
}

function fetchViaPage(username) {
  const requestId = `${username}:${Date.now()}:${Math.random().toString(36).slice(2, 7)}`;

  const promise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pageRequests.delete(requestId);
      reject(new Error('page-timeout'));
    }, 10000);

    pageRequests.set(requestId, { resolve, reject, timeout, username });

    window.postMessage(
      {
        source: 'xglobe-content',
        type: PAGE_MESSAGE_TYPE,
        username,
        requestId,
      },
      '*'
    );
  })
    .then((raw) => {
      if (!raw?.location) return null;
      const entry = enhanceEntry(raw);
      chrome.runtime.sendMessage({ type: 'globe:set-cache', username, entry }, () => void 0);
      return entry;
    })
    .catch((error) => {
      if (error?.rateLimited) {
        rateLimitUntil = Date.now() + (error.retryAfterMs || 60000);
      }
      console.debug('xglobe fetch fail', username, error);
      return null;
    });

  return promise;
}

function handlePageMessage(event) {
  if (event.source !== window) return;
  const data = event.data;
  if (!data || data.type !== PAGE_RESPONSE_TYPE) return;

  const record = pageRequests.get(data.requestId);
  if (!record) return;
  pageRequests.delete(data.requestId);
  clearTimeout(record.timeout);

  if (!data.ok) {
    record.reject?.(new Error(data.error || 'page-error'));
  } else {
    record.resolve?.(data.entry || null);
  }
}

function enhanceEntry(raw) {
  const location = raw.location?.trim() || null;
  const accountCode = raw.accountCountryCode?.toLowerCase() || null;
  const resolved = window.XGlobeCountryDB?.resolveLocation(location) || null;
  const isCountry = resolved?.type === 'country';
  const iso2 = resolved?.iso2 || null;

  let vpnLikely = Boolean(raw.vpnLikely);
  if (accountCode) {
    if (iso2) {
      vpnLikely ||= accountCode !== iso2.toLowerCase();
    } else {
      vpnLikely = true;
    }
  }

  return {
    location,
    vpnLikely,
    centroid: isCountry ? { lat: resolved.lat, lon: resolved.lon } : null,
    continent: resolved?.continent || null,
    iso2,
    regionOnly: resolved?.type === 'region',
  };
}

function render(username, entry) {
  document
    .querySelectorAll(`${TWEET_SELECTOR}[data-xglobe-username="${CSS.escape(username)}"]`)
    .forEach((tweet) => {
      const slot = ensureSlot(tweet);
      const accent = extractAccentColor(tweet);
      window.XGlobeRenderer?.render(slot, entry, {
        size: markerSize(tweet),
        accent,
      });

      const marker = slot.querySelector('.xglobe-marker');
      if (marker) {
        attachTooltip(marker, entry?.location || '');
      }
    });
}

function extractAccentColor(root) {
  const scope = root || document;
  const nameEl =
    scope.querySelector('[data-testid="User-Name"] span') ||
    scope.querySelector('[data-testid="UserName"] span');
  if (!nameEl) return '#1d9bf0';
  const computed = getComputedStyle(nameEl);
  return computed?.color || '#1d9bf0';
}

function markerSize(tweet) {
  const avatar = tweet.querySelector('div[data-testid="Tweet-User-Avatar"] img') || tweet.querySelector('img[alt*="Avatar"]');
  if (!avatar) return 48;
  const rect = avatar.getBoundingClientRect();
  return rect.height ? Math.round(rect.height) : 48;
}
