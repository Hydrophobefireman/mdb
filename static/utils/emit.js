import assign from "@hydrophobefireman/j-utils/@build-modern/src/modules/Object/assign";
import entries from "@hydrophobefireman/j-utils/@build-modern/src/modules/Object/entries";
import FakeSet from "@hydrophobefireman/j-utils/@build-modern/src/modules/es6/loose/Set/index";
import { getKeyStore } from "./respCache";
const store = getKeyStore("preference-storage");
const preferences = {};
const defaultOptions = {
  useIndexedDB: true,
  useJsObjectOverMaps: true,
  visibleInGlobalScope: false
};
const ALL_PREFS = [];
export class PreferenceManager {
  constructor(options) {
    this._options = assign({}, defaultOptions);
    assign(this._options, options || {});
    /**
     * @type {{[key:string]:FakeSet<(newVal:string,oldVal:string)=>any>}}
     */
    this._listeners = {};
    if (this._options.useIndexedDB) {
      this.__initialUpdatePromise = this._setupInitialIDBPromise();
      this.__initialUpdatePromise.then(
        () => (
          (this.__initialUpdatePromise = null),
          this._emitEventToListeners(ALL_PREFS)
        )
      );
    }
  }
  async _setupInitialIDBPromise() {
    const keyArray = await store.keys();
    const _prefs = {};
    await Promise.all(
      keyArray.map(async x => {
        _prefs[x] = await store.get(x);
      })
    );
    assign(preferences, _prefs);
    return true;
  }
  /**
   *
   * @param {string} pref
   * @param {(newVal:string,oldVal:string)=>any} listener
   */
  addPrefListener(pref, listener) {
    const listenerSet = this._listeners[pref];
    if (listenerSet) {
      listenerSet.add(listener);
    } else {
      this._listeners[pref] = new FakeSet([listener]);
    }
  }
  removePrefListener(pref, listener) {
    const listenerSet = this._listeners[pref];
    if (listenerSet) {
      return listenerSet.delete(listener);
    }
    return true;
  }
  _emitEventToListeners(prefName, value) {
    if (prefName !== ALL_PREFS) {
      const oldVal = preferences[prefName];
      const listenerSet =
        this._listeners[prefName] ||
        (this._listeners[prefName] = new FakeSet());
      listenerSet.forEach(s => s(value, oldVal));
    } else {
      entries(preferences).forEach(([x, y]) =>
        this._emitEventToListeners(x, y)
      );
    }
  }
  setPrefs(prefName, value) {
    preferences[prefName] = value;
    this._emitEventToListeners(prefName, value);
    if (this._options.useIndexedDB) {
      this._savePreferencesToIndexedDB();
    }
  }
  getPrefs(prefName) {
    if (this.__initialUpdatePromise != null) {
      console.warn("Data Might Be Stale");
    }
    return preferences[prefName];
  }
  _savePreferencesToIndexedDB() {
    for (const [k, v] of entries(preferences)) {
      store.set(k, v);
    }
  }
}

const preferenceManager = new PreferenceManager();
export default preferenceManager;
