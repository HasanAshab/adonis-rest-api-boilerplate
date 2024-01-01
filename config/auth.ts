export const loginAttemptThrottle = {
  enabled: true,
  key: 'login_{{ email }}_{{ ip }}',
  maxFailedAttempts: 5,
  duration: '1 min',
  blockDuration: '1 hour',
}