// Utilities for namespacing localStorage keys by current user
export function getCurrentUserId() {
  try {
    const u = localStorage.getItem("schedease_current_user");
    return u || null;
  } catch (e) {
    return null;
  }
}

export function setCurrentUserId(id) {
  try {
    if (id == null) {
      localStorage.removeItem("schedease_current_user");
    } else {
      localStorage.setItem("schedease_current_user", String(id));
    }
  } catch (e) {
    // ignore
  }
}

export function userKey(baseKey) {
  const id = getCurrentUserId();
  return id ? `${baseKey}::${id}` : `${baseKey}::guest`;
}

// Simple users store helpers (for demo/local auth)
const USERS_KEY = "schedease_users";
export function loadUsers() {
  try {
    const s = localStorage.getItem(USERS_KEY);
    return s ? JSON.parse(s) : [];
  } catch (e) {
    return [];
  }
}
export function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users || []));
  } catch (e) {}
}
