export interface ValidationError {
  field: string;
  message: string;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  // Accept phone numbers in various formats
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function validateAddress(address: string): boolean {
  return address.trim().length >= 5;
}

export function validateCustomerName(name: string): boolean {
  return name.trim().length >= 2;
}

export function validateCheckoutForm(data: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  address: string;
  deliveryMethod: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!validateCustomerName(data.customerName)) {
    errors.push({
      field: 'customerName',
      message: 'Имя должно быть не менее 2 символов',
    });
  }

  if (!validateEmail(data.customerEmail)) {
    errors.push({
      field: 'customerEmail',
      message: 'Пожалуйста, введите корректный email адрес',
    });
  }

  if (!validatePhone(data.customerPhone)) {
    errors.push({
      field: 'customerPhone',
      message: 'Пожалуйста, введите корректный номер телефона',
    });
  }

  if (!data.city.trim()) {
    errors.push({
      field: 'city',
      message: 'Пожалуйста, выберите город',
    });
  }

  if (data.deliveryMethod === 'home' && !validateAddress(data.address)) {
    errors.push({
      field: 'address',
      message: 'Пожалуйста, введите корректный адрес (не менее 5 символов)',
    });
  }

  return errors;
}
