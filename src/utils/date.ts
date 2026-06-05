/**
 * Timezone-safe registration closure check utility
 * 
 * Deadline: June 6, 2026, 23:59:59 Turkey Standard Time (UTC+3)
 */
export const checkRegistrationClosed = (status?: string): boolean => {
  // 1. Time-based automatic closure: 2026-06-06 23:59:59 UTC+3
  const deadline = new Date('2026-06-06T23:59:59+03:00').getTime();
  const dateClosed = Date.now() > deadline;

  // 2. Status-based closure: if tournament is active or completed, registration is closed.
  const statusClosed = status === 'active' || status === 'completed';

  return dateClosed || statusClosed;
};

/**
 * Safely parse any deadline structure into absolute milliseconds.
 * Protects components from crashing if manual Firestore edits are made.
 */
export const parseDeadline = (deadline: any): number => {
  if (!deadline) return 0;
  
  // 1. If it's a Firestore Timestamp instance (or has a toDate method)
  if (typeof deadline.toDate === 'function') {
    return deadline.toDate().getTime();
  }
  
  // 2. If it is a Firestore Timestamp representation object but not instantiated
  if (typeof deadline.seconds === 'number') {
    return deadline.seconds * 1000;
  }
  
  // 3. Fallback to normal Date parsing for strings/numbers
  const parsed = new Date(deadline).getTime();
  return isNaN(parsed) ? 0 : parsed;
};
