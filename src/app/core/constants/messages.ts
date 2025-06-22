export const MESSAGES = {
  LOGIN_SUCCESS: {
    severity: 'success',
    summary: 'Login Successful',
    detail: 'Welcome!',
    life: 1000,
  },
  LOGIN_FAILED: {
    severity: 'error',
    summary: 'Login Failed',
    detail: 'Invalid credentials. Please try again.',
  },
  STORAGE_ERROR: {
    severity: 'error',
    summary: 'Storage Error',
    detail: 'Unable to save token. Please check your browser settings.',
  },
  OTP_SENT: {
    severity: 'success',
    summary: 'One-Time Password Sent',
    detail: 'An One-Time Password has been sent to your email.',
    life: 7000,
  },
  OTP_REQUEST_FAILED: {
    severity: 'error',
    summary: 'OTP Request Failed',
    detail: 'Failed to send One-Time Password. Email already exists.',
    life: 7000,
  },
  REGISTRATION_SUCCESS: {
    severity: 'success',
    summary: 'Registration Successful',
    detail: 'Please login.',
  },
  REGISTRATION_FAILED: {
    severity: 'error',
    summary: 'Registration Failed',
    detail: 'Invalid or expired OTP. Please try again.',
  },
  PASSWORD_MISMATCH: {
    severity: 'error',
    summary: 'Password Mismatch',
    detail: 'The password confirmation does not match. Please try again.',
  },
};
