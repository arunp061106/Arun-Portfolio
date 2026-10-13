// Simple in-memory cache with TTL (Time To Live in ms)
const store = new Map();

function get(key) {
  const item = store.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    store.delete(key);
    return null;
  }
  return item.data;
}

function set(key, data, ttlMs = 15 * 60 * 1000) {
  store.set(key, {
    data,
    expiresAt: Date.now() + ttlMs
  });
}

function getOrFallback(key) {
  const item = store.get(key);
  return item ? item.data : null;
}

module.exports = {
  get,
  set,
  getOrFallback
};
