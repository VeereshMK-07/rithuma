export function getUserKey(uid, key) {
  return `rithuma_${uid}_${key}`;
}

export function saveUserData(uid, key, value) {
  localStorage.setItem(
    getUserKey(uid, key),
    JSON.stringify(value)
  );
}

export function loadUserData(uid, key) {
  const data = localStorage.getItem(getUserKey(uid, key));
  return data ? JSON.parse(data) : null;
}

export function removeUserData(uid, key) {
  localStorage.removeItem(getUserKey(uid, key));
}
