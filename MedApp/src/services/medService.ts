export type {
  Medication,
  DrugFoodInteraction,
  ScheduleItem,
  SideEffectLog,
  DoctorAppointment,
  AppNotification,
  UserProfile,
} from '../utils/types';

export {
  formatHospitalName,
  formatDepartmentName,
  toUserStorageKey,
  hasValidPhone,
} from '../utils/formatUtils';

export {
  getLocalDateString,
  parseLocalDateString,
  parseFlexibleDate,
  getMedicationCreatedDateTime,
  getMedicationStartDate,
  getMedicationEndDate,
} from '../utils/dateUtils';

export {
  getMedicationDurationMode,
  extractCustomDaysFromMedication,
  isMedicationScheduledForDate,
  buildScheduleForDateSync,
  isScheduleTakenOnTime,
} from '../utils/scheduleUtils';

export { getMedicationStockStatus } from '../utils/stockUtils';

import { userService } from './userService';
import { authService } from './authService';
import { syncService } from './syncService';
import { medicationService } from './medicationService';
import { interactionService } from './interactionService';
import { scheduleService } from './scheduleService';
import { appointmentService } from './appointmentService';
import { sideEffectService } from './sideEffectService';
import { activityService } from './activityService';

export const medService = {
  ...userService,
  ...authService,
  ...syncService,
  ...medicationService,
  ...interactionService,
  ...scheduleService,
  ...appointmentService,
  ...sideEffectService,
  ...activityService,
};
