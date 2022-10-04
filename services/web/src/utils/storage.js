function storageAvailable(type) {
  try {
    const storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
}

const storageMap = new Map();

class Storage {
  getItem(key) {
    const stringKey = String(key);
    if (storageMap.has(key)) {
      return String(storageMap.get(stringKey));
    }
    return null;
  }

  setItem(key, val) {
    storageMap.set(String(key), String(val));
  }

  removeItem(key) {
    storageMap.delete(key);
  }

  clear() {
    storageMap.clear();
  }

  key(i) {
    if (arguments.length === 0) {
      throw new TypeError(
        "Failed to execute 'key' on 'Storage': 1 argument required, but only 0 present."
      ); // this is a TypeError implemented on Chrome, Firefox throws Not enough arguments to Storage.key.
    }
    const arr = Array.from(storageMap.keys());
    return arr[i];
  }

  get length() {
    return storageMap.size;
  }
}

function getInMemoryStorage() {
  const instance = new Storage();

  const handler = {
    set: function (target, key, value) {
      return target.setItem(key, value);
    },
    get: function (target, key) {
      // eslint-disable-next-line no-prototype-builtins
      if (Storage.prototype.hasOwnProperty(key)) {
        return target[key];
      }
      if (storageMap.has(key)) {
        return target.getItem(key);
      }
    },
  };

  return new Proxy(instance, handler);
}

export function getStorage(type = 'localStorage') {
  if (storageAvailable(type)) {
    return window[type];
  }
  return getInMemoryStorage();
}
