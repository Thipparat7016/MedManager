import { safeStorage } from './storage';
import { supabase } from './supabase';
import { userService } from './userService';
import { activityService } from './activityService';
import { DoctorAppointment } from '../utils/types';

export interface FavoriteDoctor {
  id: string;
  name: string;
  department: string;
  hospital: string;
}

export const appointmentService = {
  async getAppointments(): Promise<DoctorAppointment[]> {
    await userService.purgeMockCacheIfNeeded();
    const { userKey, userUUID } = await userService.getCurrentUserScope();
    if (!userKey) {
      return [];
    }
    const storageKey = `med_appointments_${userKey}`;

    if (supabase && userUUID) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('user_id', userUUID)
          .order('appointment_date', { ascending: true });

        if (!error && data) {
          const mapped = data
            .filter(
              (d: any) => d.doctor_name !== '__MED_LIST_SYNC__' && d.status !== '__SYNC__'
            )
            .map((d: any) => ({
              id: d.id,
              doctorName: d.doctor_name,
              department: d.department || '',
              hospital: d.hospital || '',
              date: d.appointment_date,
              time: d.appointment_time,
              details: d.details || '',
              status: d.status || 'confirmed',
            }));
          await safeStorage.setItem(storageKey, JSON.stringify(mapped));
          return mapped;
        }
      } catch {}
    }

    const local = await safeStorage.getItem(storageKey);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            a =>
              !['apt-1', 'apt-2', 'apt-3'].includes(a.id) &&
              a.doctorName !== '__MED_LIST_SYNC__' &&
              a.status !== '__SYNC__'
          );
        }
      } catch {}
    }

    return [];
  },

  async addAppointment(appointment: Omit<DoctorAppointment, 'id'>): Promise<DoctorAppointment> {
    const { userKey, userUUID } = await userService.getCurrentUserScope();
    const newApt: DoctorAppointment = {
      ...appointment,
      id: `apt-${Date.now()}`,
    };

    if (!userKey) {
      return newApt;
    }
    const storageKey = `med_appointments_${userKey}`;

    if (supabase && userUUID) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .insert([
            {
              user_id: userUUID,
              doctor_name: appointment.doctorName,
              department: appointment.department,
              hospital: appointment.hospital,
              appointment_date: appointment.date,
              appointment_time: appointment.time,
              details: appointment.details,
              status: appointment.status,
            },
          ])
          .select();

        if (!error && data && data.length > 0) {
          newApt.id = data[0].id;
        }
      } catch {}
    }

    const appointments = await appointmentService.getAppointments();
    const exists = appointments.some(a => a.id === newApt.id);
    const updated = exists ? appointments : [newApt, ...appointments];
    await safeStorage.setItem(storageKey, JSON.stringify(updated));

    await activityService.logActivity(
      `เพิ่มนัดหมายแพทย์: ${appointment.doctorName}`,
      `${appointment.hospital} (${appointment.date} ${appointment.time})`
    );
    return newApt;
  },

  async updateAppointment(appointment: DoctorAppointment): Promise<DoctorAppointment> {
    const { userKey, userUUID } = await userService.getCurrentUserScope();
    if (!userKey) {
      return appointment;
    }
    const storageKey = `med_appointments_${userKey}`;

    if (supabase && userUUID && !appointment.id.startsWith('apt-')) {
      try {
        await supabase
          .from('appointments')
          .update({
            doctor_name: appointment.doctorName,
            department: appointment.department,
            hospital: appointment.hospital,
            appointment_date: appointment.date,
            appointment_time: appointment.time,
            details: appointment.details,
            status: appointment.status,
          })
          .eq('id', appointment.id)
          .eq('user_id', userUUID);
      } catch (e) {
        console.warn('Supabase update appointment error:', e);
      }
    }

    const appointments = await appointmentService.getAppointments();
    const updated = appointments.map(a => (a.id === appointment.id ? appointment : a));
    await safeStorage.setItem(storageKey, JSON.stringify(updated));

    await activityService.logActivity(
      `แก้ไขนัดหมายแพทย์: ${appointment.doctorName}`,
      `${appointment.hospital} (${appointment.date} ${appointment.time})`
    );
    return appointment;
  },

  async deleteAppointment(id: string): Promise<boolean> {
    const { userKey, userUUID } = await userService.getCurrentUserScope();
    if (!userKey) {
      return false;
    }
    const storageKey = `med_appointments_${userKey}`;

    if (supabase && userUUID) {
      try {
        await supabase
          .from('appointments')
          .delete()
          .eq('id', id)
          .eq('user_id', userUUID);
      } catch {}
    }
    const appointments = await appointmentService.getAppointments();
    const updated = appointments.filter(a => a.id !== id);
    await safeStorage.setItem(storageKey, JSON.stringify(updated));
    return true;
  },

  async getFavoriteDoctors(favStorageKey: string | null): Promise<FavoriteDoctor[]> {
    if (!favStorageKey) return [];
    try {
      const stored = await safeStorage.getItem(favStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load favorite doctors:', e);
    }
    return [];
  },

  async saveFavoriteDoctors(
    favStorageKey: string | null,
    doctors: FavoriteDoctor[]
  ): Promise<void> {
    if (!favStorageKey) return;
    try {
      await safeStorage.setItem(favStorageKey, JSON.stringify(doctors));
    } catch (e) {
      console.warn('Failed to save favorite doctors:', e);
    }
  },
};
