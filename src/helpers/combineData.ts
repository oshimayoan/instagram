export function combineData<Data extends Record<string, unknown>>(
  initialData: Array<Data>,
  newData: Array<Data>,
) {
  let ids = new Set(initialData.map((d) => d.id));
  let merged = initialData.concat(newData.filter((d) => !ids.has(d.id)));
  return merged;
}
