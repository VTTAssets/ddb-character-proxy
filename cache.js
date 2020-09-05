const CONFIG = require("./config");

/**
 * Simple in-memory cache
 */
class Cache {
  constructor() {
    this.items = [];
  }

  exists(classId) {
    return this.items.find(cache => cache.classId === classId && !this.isExpired(cache.lastUpdate));
  }

  isExpired(timestamp) {
    return (new Date().valueOf() - timestamp) / (1000 * 60 * 60 * CONFIG.cache.expiration) >= 1;
  }

  add(classId, data) {
    console.log("Adding to the Cache (Class ID: " + classId + "): " + data.length + " spells.");

    const index = this.items.find(cache => cache.classId === classId);
    if (index) {
      console.log(" + Removing expired entry from cache");
      this.items = this.items.filter(cache => cache.classId !== classId);
    }

    this.items.push({
      classId: classId,
      lastUpdate: new Date().valueOf(),
      data: data,
    });
  }
}

module.exports = Cache;
