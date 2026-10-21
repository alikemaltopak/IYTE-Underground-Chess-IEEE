// Ekran görüntüsü modu: ?user=0 ise oturum kapalı, aksi halde örnek oyuncu oturum açmış sayılır.
const loggedIn = new URLSearchParams(location.search).get('user') !== '0';
export const demoUser = { uid: 'p1', email: 'neon.raven@std.iyte.edu.tr', displayName: 'Neon Raven', photoURL: null };

export const getAuth = () => ({ currentUser: loggedIn ? demoUser : null });
export class GoogleAuthProvider {}
export const onAuthStateChanged = (_auth: unknown, cb: (u: unknown) => void) => {
  setTimeout(() => cb(loggedIn ? demoUser : null), 0);
  return () => {};
};
const noop = async () => {};
export const signInWithEmailAndPassword = noop;
export const createUserWithEmailAndPassword = noop;
export const signInWithPopup = noop;
export const signOut = noop;
export type User = typeof demoUser;
