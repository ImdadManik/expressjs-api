function safeStringify(obj) {
    const cache = new Set();
    const result = JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          return;
        }
        cache.add(value);
      }
      return value;
    }, 2);
    cache.clear();
    return result;
  }
  
  module.exports = { safeStringify };
  