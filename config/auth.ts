export const loginAttemptThrottle = {
  enabled: true,
  maxFailedAttempts: 5,
  duration: '1 min',
  blockDuration: '1 hour',
}