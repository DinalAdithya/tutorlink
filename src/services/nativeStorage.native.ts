import Storage from 'expo-sqlite/kv-store';

const nativeLocalStorage: Storage = {
  get length() {
    return Storage.getAllKeysSync().length;
  },
  clear() {
    Storage.clearSync();
  },
  getItem(key) {
    return Storage.getItemSync(key);
  },
  key(index) {
    return Storage.getAllKeysSync()[index] ?? null;
  },
  removeItem(key) {
    Storage.removeItemSync(key);
  },
  setItem(key, value) {
    Storage.setItemSync(key, value);
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: nativeLocalStorage,
});
