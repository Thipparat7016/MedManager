import { safeStorage } from './storage';
import { supabase } from './supabase';
import { UserProfile } from '../utils/types';
import { isValidUUID, toUserStorageKey } from '../utils/formatUtils';

export const userService = {
  async purgeMockCacheIfNeeded() {
    try {
      const isPurged = await safeStorage.getItem('med_mock_purged_v2');
      if (!isPurged) {
        await safeStorage.removeItem('med_user_medications');
        await safeStorage.removeItem('med_appointments');
        await safeStorage.removeItem('med_side_effects');
        await safeStorage.removeItem('med_user_profile');
        await safeStorage.setItem('med_mock_purged_v2', 'true');
      }
    } catch (e) {
      console.warn('Error purging mock cache:', e);
    }
  },

  async getCurrentUserScope(): Promise<{
    userKey: string | null;
    userUUID: string | null;
    user: UserProfile | null;
  }> {
    try {
      const stored = await safeStorage.getItem('med_user_profile');
      if (!stored) {
        return { userKey: null, userUUID: null, user: null };
      }

      const parsed: UserProfile = JSON.parse(stored);
      if (!parsed || !parsed.email || parsed.email === 'somchai@gmail.com') {
        return { userKey: null, userUUID: null, user: null };
      }

      const cleanEmail = parsed.email.trim().toLowerCase();
      const userKey = toUserStorageKey(cleanEmail);
      let userUUID = parsed.id && isValidUUID(parsed.id) ? parsed.id : null;

      if (!userUUID && supabase && cleanEmail) {
        try {
          const { data } = await supabase
            .from('app_users')
            .select('id, name, email, phone')
            .ilike('email', cleanEmail);
          const matchedUser = (data || []).find(
            (row: any) => String(row.email || '').trim().toLowerCase() === cleanEmail
          );
          if (matchedUser && isValidUUID(matchedUser.id)) {
            userUUID = matchedUser.id;
            parsed.id = matchedUser.id;
            if (matchedUser.name) parsed.name = matchedUser.name;
            if (matchedUser.phone !== undefined) {
              parsed.phone = matchedUser.phone || parsed.phone || '';
            }
            await safeStorage.setItem('med_user_profile', JSON.stringify(parsed));
          }
        } catch {}
      }

      return { userKey, userUUID, user: parsed };
    } catch {
      return { userKey: null, userUUID: null, user: null };
    }
  },

  async getUserPreferences(userKey: string | null): Promise<{
    avatarUrl?: string;
    notify30MinBefore: boolean;
    notifyFoodWarning: boolean;
    notifyAppointments: boolean;
    notifyLowStock: boolean;
  }> {
    const defaults = {
      avatarUrl: undefined as string | undefined,
      notify30MinBefore: true,
      notifyFoodWarning: true,
      notifyAppointments: true,
      notifyLowStock: false,
    };
    if (!userKey) return defaults;
    try {
      const raw = await safeStorage.getItem(`med_user_prefs_${userKey}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          avatarUrl: parsed.avatarUrl || undefined,
          notify30MinBefore: parsed.notify30MinBefore ?? true,
          notifyFoodWarning: parsed.notifyFoodWarning ?? true,
          notifyAppointments: parsed.notifyAppointments ?? true,
          notifyLowStock: parsed.notifyLowStock ?? false,
        };
      }
    } catch {}
    return defaults;
  },

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      // 1. Read stored session profile
      const stored = await safeStorage.getItem('med_user_profile');
      if (!stored) {
        return null; // Explicitly not logged in
      }

      const parsed: UserProfile = JSON.parse(stored);
      if (!parsed || !parsed.email || parsed.email === 'somchai@gmail.com') {
        return null;
      }

      const cleanEmail = parsed.email.trim().toLowerCase();
      const userKey = toUserStorageKey(cleanEmail);
      const prefs = await userService.getUserPreferences(userKey);
      if (!parsed.avatarUrl && prefs.avatarUrl) {
        parsed.avatarUrl = prefs.avatarUrl;
      }

      const cachedPass = await safeStorage.getItem(`med_user_pwd_${cleanEmail}`);
      if (cachedPass) {
        parsed.hasPassword = true;
      }

      // Ensure authenticated flag is synced
      await safeStorage.setItem('med_is_authenticated', 'true');

      // 2. Refresh profile details silently from Supabase if online (matched strictly by email)
      if (supabase && cleanEmail) {
        try {
          const { data, error } = await supabase
            .from('app_users')
            .select('*')
            .ilike('email', cleanEmail);

          const u = !error
            ? (data || []).find(
                (row: any) => String(row.email || '').trim().toLowerCase() === cleanEmail
              )
            : null;

          if (u) {
            parsed.id = u.id;
            parsed.name = u.name;
            parsed.phone = u.phone || parsed.phone || '';
            parsed.hasPassword = Boolean(
              (u.password !== undefined &&
                u.password !== null &&
                String(u.password).trim() !== '') ||
                cachedPass
            );
            await safeStorage.setItem('med_user_profile', JSON.stringify(parsed));
          }
        } catch (syncErr) {
          console.warn('Background profile sync notice:', syncErr);
        }
      }

      return parsed;
    } catch (e) {
      console.warn('Error fetching user profile:', e);
    }
    return null;
  },

  async updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const current = (await userService.getUserProfile()) || {
      id: `user-${Date.now()}`,
      name: '',
      email: '',
      phone: '',
      notify30MinBefore: true,
      notifyFoodWarning: true,
      notifyAppointments: true,
      notifyLowStock: false,
    };

    const updated = { ...current, ...profile };
    await safeStorage.setItem('med_user_profile', JSON.stringify(updated));

    const userKey = toUserStorageKey(updated.email);
    if (userKey) {
      await safeStorage.setItem(
        `med_user_prefs_${userKey}`,
        JSON.stringify({
          avatarUrl: updated.avatarUrl || undefined,
          notify30MinBefore: updated.notify30MinBefore,
          notifyFoodWarning: updated.notifyFoodWarning,
          notifyAppointments: updated.notifyAppointments,
          notifyLowStock: updated.notifyLowStock,
        })
      );
    }

    if (supabase && updated.email) {
      try {
        const cleanEmail = updated.email.trim().toLowerCase();

        // Update existing user in Supabase app_users
        const updatePayload: any = {
          status: 'Active',
        };
        if (updated.name) updatePayload.name = updated.name;
        if (updated.phone !== undefined) updatePayload.phone = updated.phone;

        let updateQuery = supabase.from('app_users').update(updatePayload);
        if (updated.id && isValidUUID(updated.id)) {
          updateQuery = updateQuery.eq('id', updated.id);
        } else {
          updateQuery = updateQuery.ilike('email', cleanEmail);
        }
        const { data: updatedData, error: updateErr } = await updateQuery.select();

        if (!updateErr && updatedData?.[0]) {
          updated.id = updatedData[0].id;
          updated.name = updatedData[0].name;
          updated.phone = updatedData[0].phone || updated.phone || '';
          await safeStorage.setItem('med_user_profile', JSON.stringify(updated));
        }
      } catch (e) {
        console.warn('Failed to update profile in Supabase app_users:', e);
      }
    }
    return updated;
  },
};
