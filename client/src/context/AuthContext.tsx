import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { User, AuthState } from '../utils/types';
import { authService } from '../services/authService';
import { clearAuth, setAuthToken, clearSessionStorage } from '../utils/auth';

// ─── Actions ──────────────────────────────────────────────────────────────────
type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_USER'; payload: User };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload.user, token: action.payload.token, isAuthenticated: true, loading: false };
    case 'LOGOUT':
      return { user: null, token: null, isAuthenticated: false, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

// ─── Context ──────────────────────────────────────────────────────────────────
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string, userRole?: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: localStorage.getItem('token') ?? localStorage.getItem('careergpt_token'),
    isAuthenticated: false,
    loading: true,
  });

  // Load user from token on mount
  useEffect(() => {
    const existingToken = localStorage.getItem('token') ?? localStorage.getItem('careergpt_token');
    if (existingToken && !localStorage.getItem('token')) {
      setAuthToken(existingToken);
    }

    const token = localStorage.getItem('token');
    if (token) {
      authService.getMe()
        .then((res) => {
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user: res.data.user, token } });
        })
        .catch(() => {
          clearAuth();
          dispatch({ type: 'LOGOUT' });
        });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (email: string, password: string) => {
    clearSessionStorage();
    const res = await authService.login({ email, password });
    setAuthToken(res.data.token);
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user: res.data.user, token: res.data.token } });
    return res.data.user;
  };

  const register = async (name: string, email: string, password: string, userRole?: string) => {
    clearSessionStorage(['just_signed_up']);
    const res = await authService.register({ name, email, password, userRole });
    setAuthToken(res.data.token);
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user: res.data.user, token: res.data.token } });
  };

  const logout = () => {
    clearAuth();
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (user: User) => dispatch({ type: 'UPDATE_USER', payload: user });

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
