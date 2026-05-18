import { create } from 'zustand';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  loading: true,
  login: (token, user) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    set({ token, user, loading: false });
  },
  logout: () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    set({ token: null, user: null, loading: false });
  },
  setLoading: (loading) => set({ loading }),
  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ loading: false });
      return;
    }
    
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    try {
      const res = await axios.get('http://localhost:5000/api/auth/me');
      set({ user: res.data, loading: false });
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      set({ user: null, token: null, loading: false });
    }
  }
}));
