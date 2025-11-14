export const validateIndianPhone = (phoneNumber) => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(cleaned);
};

export const formatPhoneNumber = (phoneNumber) => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.length === 10 && !phoneNumber.startsWith('+')) {
    return '+91' + cleaned;
  }
  return phoneNumber.startsWith('+91') ? phoneNumber : '+91' + cleaned;
};

export const maskPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.length >= 10) {
    return `+91 XXXXX${cleaned.slice(-5)}`;
  }
  return phoneNumber;
};
