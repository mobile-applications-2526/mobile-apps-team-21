export const validateLogin = (email: string, password: string): string | null => {
  if (!email.trim()) return 'Email is required';
  if (!password) return 'Password is required';
  return null;
};

export const validateRegister = (fields: {
  firstName: string;
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
}): string | null => {
  if (!fields.firstName.trim()) return 'First name is required';
  if (!fields.name.trim()) return 'Last name is required';
  if (!fields.email.trim()) return 'Email is required';
  if (!fields.phoneNumber.trim()) return 'Phone number is required';
  if (!fields.password) return 'Password is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(fields.email.trim())) return 'Please enter a valid email address';
  return null;
};

export const mapLoginError = (message?: string): string => {
  if (!message) return 'Login failed';
  if (message.includes('Invalid credentials') || message.includes('401') || message.includes('403')) return 'Invalid email or password';
  if (message.includes('Network')) return 'Network error. Check your internet connection';
  return message;
};

export const mapRegisterError = (message?: string): string => {
  if (!message) return 'Registration failed';
  if (message.includes('already exists') || message.includes('duplicate')) return 'This email is already registered';
  if (message.includes('Invalid')) return 'Invalid data. Please check your input';
  if (message.includes('Network')) return 'Network error. Check your internet connection';
  if (message.includes('400') || message.includes('Bad Request')) return 'Invalid data. Please check your input';
  return message;
};