import { supabase } from './supabase';
import { userService } from './userService';

export const activityService = {
  async logActivity(activity: string, details: string) {
    if (!supabase) return;
    try {
      const user = await userService.getUserProfile();
      const timeStr = `${new Date().getHours().toString().padStart(2, '0')}:${new Date()
        .getMinutes()
        .toString()
        .padStart(2, '0')} น.`;
      await supabase.from('activity_logs').insert({
        time: timeStr,
        user_name: user?.name || 'ผู้ใช้งาน MedApp',
        activity,
        details,
      });
    } catch (e) {
      console.warn('Failed to log activity to Supabase activity_logs:', e);
    }
  },
};
