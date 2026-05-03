const getKey = (key, month) => {
  return month ? `${key}_${month}` : key;
};

export const storage = {
  get(key, month = null) {
    const data = localStorage.getItem(getKey(key, month));
    return data ? JSON.parse(data) : null;
  },

  set(key, value, month = null) {
    localStorage.setItem(getKey(key, month), JSON.stringify(value));
  },

  remove(key, month = null) {
    localStorage.removeItem(getKey(key, month));
  }
};