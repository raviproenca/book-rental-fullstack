import "@testing-library/jest-dom";

const storageMap = new Map<string, string>();

const localStorageMock: Storage = {
  get length() {
    return storageMap.size;
  },
  clear: () => {
    storageMap.clear();
  },
  getItem: (key) => (storageMap.has(key) ? storageMap.get(key)! : null),
  setItem: (key, value) => {
    storageMap.set(key, value);
  },
  removeItem: (key) => {
    storageMap.delete(key);
  },
  key: (index) => [...storageMap.keys()][index] ?? null,
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
