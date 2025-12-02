// Email validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// List of disposable email domains (subset - backend has full list)
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "tempmail.com",
  "temp-mail.org",
  "guerrillamail.com",
  "guerrillamail.org",
  "mailinator.com",
  "10minutemail.com",
  "throwaway.email",
  "fakeinbox.com",
  "trashmail.com",
  "mailnesia.com",
  "tempail.com",
  "dispostable.com",
  "yopmail.com",
  "sharklasers.com",
  "getnada.com",
  "maildrop.cc",
  "mohmal.com",
  "tempmailo.com",
  "emailondeck.com",
  "tempr.email",
  "throwawaymail.com",
  "mintemail.com",
  "mailcatch.com",
  "33mail.com",
  "spam4.me",
  "spamgourmet.com",
  "mytrashmail.com",
  "mt2009.com",
  "thankyou2010.com",
  "trash2009.com",
  "mt2014.com",
  "trashymail.com",
  "discard.email",
  "discardmail.com",
  "spambog.com",
  "spambog.de",
  "spamavert.com",
  "tempomail.fr",
  "jetable.org",
  "kasmail.com",
  "spamfree24.org",
  "grr.la",
  "guerrillamailblock.com",
  "pokemail.net",
  "spam.la",
  "mailexpire.com",
  "tempinbox.com",
  "anonymbox.com",
  "binkmail.com",
  "safetymail.info",
  "mailmoat.com",
  "mailnull.com",
  "e4ward.com",
  "spamex.com",
  "getonemail.com",
  "mailscrap.com",
  "mailzilla.com",
  "soodonims.com",
  "1chuan.com",
  "126.com",
  "163.com",
  "1zhuan.com",
  "21cn.com",
  "5gramos.com",
  "aaaw45e.com",
  "email-fake.com",
  "guerrillamail.net",
  "guerrillamail.biz",
  "guerrillamailblock.com",
]);

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: "Email is required" };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }

  const domain = email.split("@")[1]?.toLowerCase();
  if (domain && DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: "Temporary/disposable emails are not allowed",
    };
  }

  return { isValid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }

  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters" };
  }

  return { isValid: true };
}

export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
} {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const score = Object.values(requirements).filter(Boolean).length;

  return {
    isValid: requirements.length, // Minimum requirement
    score,
    requirements,
  };
}

export function validateName(name: string): ValidationResult {
  if (!name) {
    return { isValid: false, error: "Name is required" };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: "Name must be at least 2 characters" };
  }

  if (name.length > 100) {
    return { isValid: false, error: "Name is too long" };
  }

  return { isValid: true };
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): ValidationResult {
  if (!confirmPassword) {
    return { isValid: false, error: "Please confirm your password" };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match" };
  }

  return { isValid: true };
}
