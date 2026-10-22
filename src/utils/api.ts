import { auth } from '../firebase';

/** /api uçlarına oturum açmış kullanıcının Firebase kimlik jetonuyla istek atar. */
export const authFetch = async (url: string, init: RequestInit = {}): Promise<Response> => {
  const token = await auth.currentUser?.getIdToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(url, { ...init, headers });
};
