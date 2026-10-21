// Ekran görüntüsü modu: örnek turnuva verisiyle çalışan bellek içi Firestore taklidi.
import { seed } from '../seed';

const store: Record<string, Record<string, any>> = seed();

type Ref = { kind: 'doc'; col: string; id: string } | { kind: 'col'; col: string; filters: any[] };
export const getFirestore = () => ({});
export const doc = (_db: unknown, col: string, id: string): Ref => ({ kind: 'doc', col, id });
export const collection = (_db: unknown, col: string): Ref => ({ kind: 'col', col, filters: [] });
export const where = (field: string, op: string, value: unknown) => ({ field, op, value });
export const orderBy = () => null;
export const query = (ref: any, ...filters: any[]) => ({ ...ref, filters: filters.filter(Boolean) });

const docSnap = (col: string, id: string) => ({
  id, exists: () => !!store[col]?.[id], data: () => store[col]?.[id],
});
const colSnap = (ref: any) => {
  const docs = Object.keys(store[ref.col] || {})
    .filter(id => ref.filters.every((f: any) => f.op === 'in' ? f.value.includes(store[ref.col][id][f.field]) : store[ref.col][id][f.field] === f.value))
    .map(id => docSnap(ref.col, id));
  return { docs, size: docs.length, empty: docs.length === 0, forEach: (fn: any) => docs.forEach(fn) };
};

export const getDoc = async (ref: any) => docSnap(ref.col, ref.id);
export const getDocs = async (ref: any) => colSnap(ref);
export const onSnapshot = (ref: any, cb: (s: any) => void) => {
  setTimeout(() => cb(ref.kind === 'doc' ? docSnap(ref.col, ref.id) : colSnap(ref)), 0);
  return () => {};
};
export const setDoc = async () => {};
export const updateDoc = async () => {};
export const deleteDoc = async () => {};
export const deleteField = () => null;
export const increment = (n: number) => n;
export const serverTimestamp = () => Timestamp.now();
export class Timestamp {
  constructor(public seconds: number, public nanoseconds = 0) {}
  static fromDate(d: Date) { return new Timestamp(Math.floor(d.getTime() / 1000)); }
  static now() { return Timestamp.fromDate(new Date()); }
  toDate() { return new Date(this.seconds * 1000); }
  toMillis() { return this.seconds * 1000; }
}
