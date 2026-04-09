// PATH: src/lib/email/index.ts
// Core
export { sendEmail, emailTemplate, infoBox } from './core'

// Booking emails (client-facing)
export { sendBookingConfirmation, sendBookingCancellation, sendBookingReminder, sendBookingRescheduled, sendBookingFollowup } from './booking'

// Owner emails
export { sendOwnerNotification, sendOwnerCancellation, sendOwnerDailySummary, sendWeeklyReport, sendMonthlyReport } from './owner'

// Admin emails
export { sendAdminNotification, sendSuperadminCronSummary, sendAdminChurnNotification } from './admin'

// Lifecycle emails
export { sendWelcomeEmail, sendTrialEnding, sendTrialExpired, sendSubscriptionCancelled, sendFarewellEmail, sendAccountDeleted } from './lifecycle'

// Billing emails
export { sendPaymentReceived, sendPaymentFailed, sendPlanUpgraded } from './billing'

// Engagement emails
export { sendTestEmail, sendTeamInvite, sendReviewRequest, sendPasswordChanged, sendWaitlistNotification } from './engagement'
