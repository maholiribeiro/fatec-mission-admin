import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, ApiError, tokenStore } from '../api/client';

const AuthContext = createContext(null);

/**
 * Sessão do painel. Só administradores entram: estudantes que tentarem o login
 * recebem uma mensagem clara e o token NÃO é guardado.
 */
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(Boolean(tokenStore.get()));

  const logout = useCallback(() => {
    tokenStore.set(null);
    setUsuario(null);
  }, []);

  // Restaura a sessão salva (e confere se ainda é administrador)
  useEffect(() => {
    if (!tokenStore.get()) return;
    api
      .perfil()
      .then((p) => (p.role === 'administrador' ? setUsuario(p) : logout()))
      .catch(logout)
      .finally(() => setCarregando(false));
  }, [logout]);

  useEffect(() => {
    window.addEventListener('fma:unauthorized', logout);
    return () => window.removeEventListener('fma:unauthorized', logout);
  }, [logout]);

  const login = useCallback(async (email, senha) => {
    const r = await api.login(email, senha);
    if (r.usuario.role !== 'administrador') {
      throw new ApiError(403, 'Acesso restrito a administradores. Estudantes devem usar o aplicativo Fatec Mission.');
    }
    tokenStore.set(r.token);
    setUsuario(r.usuario);
  }, []);

  const value = useMemo(() => ({ usuario, carregando, login, logout }), [usuario, carregando, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
