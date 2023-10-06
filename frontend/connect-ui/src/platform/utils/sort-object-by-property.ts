export function sortCollectionByValue<T>(coll: T[], prop: keyof T): T[] {
  const compare = (a: T, b: T): number => (a[prop] as any).localeCompare(b[prop] as any);

  return coll.sort(compare);
}