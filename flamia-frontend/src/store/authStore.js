import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import api from '../lib/api';

const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  loading: true,

  // ── Initialize Auth Listener ────────────────
  init: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        get().syncUser(session);
      }
      set({ session, loading: false });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session });
      if (session) {
        get().syncUser(session);
      } else {
        set({ user: null });
      }
    });

    return () => subscription?.unsubscribe();
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
    const { error } = await supabase.auth.signInWithOtp({
      phone: `+91${phone}`,
    });
    if (error) throw error;
  },

  // ── Verify OTP ──────────────────────────────
  verifyOtp: async (phone, otp) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token: otp,
      type: 'sms',
    });
    if (error) throw error;
    return data;
  },

  // ── Logout ──────────────────────────────────
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  // ── Computed ────────────────────────────────
  isAuthenticated: () => !!get().session,
  isAdmin: () => get().user?.role === 'ADMIN',
}));

export default useAuthStore;
