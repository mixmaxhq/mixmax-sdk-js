// Like Underscore lite.

export function once(func) {
  let called = false, result;
  return function(...args) {
    if (!called) {
      called = true;
      result = func.apply(this, args);
      func = null;
    }
    return result;
  };
}
