import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import api from '../lib/api';

const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  // ── Initialize Auth Listener ────────────────
  initialize: () => {
    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          set({ session, isAuthenticated: true });
          get().syncUser(session);
        }
        set({ isLoading: false });
      }).catch(() => {
        set({ isLoading: false });
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, isAuthenticated: !!session });
        if (session) {
          get().syncUser(session);
        } else {
          set({ user: null, isAuthenticated: false });
        }
      });

      return () => subscription?.unsubscribe();
    } catch (err) {
      console.warn('Auth initialization failed (Supabase env vars may be missing):', err);
      set({ isLoading: false });
    }
  },

  // ── Sync user with backend ──────────────────
  syncUser: async (session) => {
    try {
      const response = await api.post('/auth/sync', {
        supabaseId: session.user.id,
        phone: session.user.phone,
        name: session.user.user_metadata?.name,
      });
      set({ user: response.data });
    } catch (err) {
      console.error('Failed to sync user:', err);
    }
  },

  // ── Send OTP ────────────────────────────────
  sendOtp: async (phone) => {
    // phone should already include +91 prefix
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) throw error;
  },

  // ── Verify OTP ──────────────────────────────
  verifyOtp: async (phone, otp) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    });
    if (error) throw error;
    return data;
  },

  // ── Logout ──────────────────────────────────
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
