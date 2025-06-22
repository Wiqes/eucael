export const MESSAGES = {
  LOGIN_SUCCESS: {
    severity: 'success',
    summary: 'Login Successful',
    detail: 'Welcome!',
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
  },
  OTP_REQUEST_FAILED: {
    severity: 'error',
    summary: 'OTP Request Failed',
    detail: 'Failed to send One-Time Password. Email already exists.',
  },
  OTP_IS_REQUIRED: {
    severity: 'error',
    summary: 'One-Time Password Required',
    detail: 'Please enter the One-Time Password sent to your email.',
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
};
