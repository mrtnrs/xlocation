const STORAGE_KEY = 'xglobeLocationCache';
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || !message.type) return;

  switch (message.type) {
    case 'globe:get-cache':
      handleGetCache(message.username).then(sendResponse);
      return true;
    case 'globe:set-cache':
      handleSetCache(message.username, message.entry).then(sendResponse);
      return true;
    case 'globe:clear-cache':
      handleClearCache().then(sendResponse);
      return true;
    default:
      break;
  }
});

async function handleGetCache(username) {
  if (!username) return { ok: false, reason: 'missing-username' };
  const store = await loadStore();
  const entry = store[username];
  if (!entry) return { ok: true, entry: null };

  if (Date.now() - entry.updatedAt > TTL_MS) {
    delete store[username];
    await saveStore(store);
    return { ok: true, entry: null };
  }

  return { ok: true, entry };
}

async function handleSetCache(username, entry) {
  if (!username || !entry) return { ok: false, reason: 'invalid-entry' };
  const store = await loadStore();
  store[username] = { ...entry, updatedAt: entry.updatedAt ?? Date.now() };
  await saveStore(store);
  return { ok: true };
}

async function handleClearCache() {
  await chrome.storage.local.set({ [STORAGE_KEY]: {} });
  return { ok: true };
}

async function loadStore() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] ?? {};
}

async function saveStore(store) {
  await chrome.storage.local.set({ [STORAGE_KEY]: store });
}
