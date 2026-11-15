import { authService } from './authService'
import { userService } from './userService'
import { medicationService } from './medicationService'
import { interactionService } from './interactionService'
import { adminProfileService } from './adminProfileService'
import { dashboardService } from './dashboardService'

export {
  authService,
  userService,
  medicationService,
  interactionService,
  adminProfileService,
  dashboardService
}

// Unified Data Service Facade (Pure Supabase)
export const dataService = {
  ...authService,
  ...userService,
  ...medicationService,
  ...interactionService,
  ...adminProfileService,
  ...dashboardService
}
