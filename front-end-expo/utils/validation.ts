export const validateLogin = (email: string, password: string): string | null => {
  if (!email.trim()) return 'E-mail is verplicht';
  if (!password) return 'Wachtwoord is verplicht';
  return null;
};

export const validateRegister = (fields: {
  firstName: string;
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
}): string | null => {
  if (!fields.firstName.trim()) return 'Voornaam is verplicht';
  if (!fields.name.trim()) return 'Naam is verplicht';
  if (!fields.email.trim()) return 'E-mail is verplicht';
  if (!fields.phoneNumber.trim()) return 'Telefoonnummer is verplicht';
  if (!fields.password) return 'Wachtwoord is verplicht';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(fields.email.trim())) return 'Voer een geldig e-mailadres in';
  return null;
};

export const mapLoginError = (message?: string): string => {
  if (!message) return 'Inloggen mislukt';
  if (message.includes('Invalid credentials') || message.includes('401') || message.includes('403')) return 'Ongeldige e-mail of wachtwoord';
  if (message.includes('Network')) return 'Netwerkfout. Controleer je internetverbinding';
  return message;
};

export const mapRegisterError = (message?: string): string => {
  if (!message) return 'Registreren mislukt';
  if (message.includes('already exists') || message.includes('duplicate')) return 'Dit e-mailadres is al geregistreerd';
  if (message.includes('Invalid')) return 'Ongeldige gegevens. Controleer je invoer';
  if (message.includes('Network')) return 'Netwerkfout. Controleer je internetverbinding';
  if (message.includes('400') || message.includes('Bad Request')) return 'Ongeldige gegevens. Controleer je invoer';
  return message;
};