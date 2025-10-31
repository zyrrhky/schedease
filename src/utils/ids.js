let counters = {};
export function nextId(prefix = "id") {
  const n = (counters[prefix] = (counters[prefix] || 0) + 1);
  return `${prefix}_${n}`;
}
