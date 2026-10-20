// Le jeton de session est conservé dans localStorage, comme dans le cours.
// L'accès au stockage peut échouer (navigation privée, stockage bloqué) : la session
// devient alors simplement non persistante.

const TOKEN_KEY = "gesta.token";

export const loadToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const saveToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Session conservée en mémoire uniquement.
  }
};

export const clearToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Rien à effacer.
  }
};
