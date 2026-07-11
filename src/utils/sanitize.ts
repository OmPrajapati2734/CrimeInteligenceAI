/**
 * Sanitization and validation utilities for KSP Crime Intelligence OS
 * Focuses on preventing Cross-Site Scripting (XSS) and secure PII masking.
 */

/**
 * Escapes HTML characters to prevent rendering malicious scripts (XSS protection).
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Recursively sanitizes all string values within an object or array.
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return sanitizeInput(obj) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const sanitizedObj = {} as any;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitizedObj[key] = sanitizeObject((obj as any)[key]);
      }
    }
    return sanitizedObj as T;
  }

  return obj;
}

/**
 * Validates Aadhaar format (XXXX-XXXX-XXXX or XXXX-XXXX-8921).
 */
export function validateAadhaar(aadhaar: string): boolean {
  if (!aadhaar) return false;
  // Allowing mask format and normal format
  const pattern = /^\d{4}-([X\d]{4}|[X]{4})-\d{4}$/;
  return pattern.test(aadhaar);
}

/**
 * Validates phone format.
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  // Simple check for +91 prefix and digits/X mask
  const pattern = /^(\+91[\s-]?)?[6-9]\d{9}$|^(\+91[\s-]?)?[6-9][\d\sX]{9}$/;
  return pattern.test(phone);
}

/**
 * Masks PII values depending on the group type.
 */
export function maskPIIData(val: string, group: string): string {
  if (!val) return '';
  const valStr = String(val).trim();
  
  if (group === 'phone') {
    // Input: +91 98450 12345 or +91 98450 XXXXX -> Output: +91 98450 XXXXX
    if (valStr.includes('XXXXX')) return valStr;
    const parts = valStr.split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[1]} XXXXX`;
    }
    return valStr.substring(0, valStr.length - 5) + 'XXXXX';
  }
  
  if (group === 'aadhaar') {
    // Input: 1234-5678-9012 or 1234-XXXX-9012 -> Output: 1234-XXXX-9012
    const cleaned = valStr.replace(/\s+/g, '');
    const parts = cleaned.split('-');
    if (parts.length === 3) {
      return `${parts[0]}-XXXX-${parts[2]}`;
    }
    if (cleaned.length >= 12) {
      return `${cleaned.substring(0, 4)}-XXXX-${cleaned.substring(8, 12)}`;
    }
    return 'XXXX-XXXX-XXXX';
  }
  
  if (group === 'address' || group === 'location') {
    // Output: City/Region name, precise street/house number masked
    if (valStr.includes('PS') || valStr.includes('City') || valStr.includes('District')) {
      return valStr;
    }
    const match = valStr.match(/(Bengaluru|Mysuru|Mangaluru|Udupi|Karkala|Hubballi|Dharwad)/i);
    if (match) {
      return `Masked Residential, ${match[0]}`;
    }
    return 'Masked Location (Secured Site)';
  }

  if (group === 'financial' || group === 'account') {
    // Output: Masked Account Number
    if (valStr.length > 4) {
      return `XXXXXX${valStr.substring(valStr.length - 4)}`;
    }
    return 'XXXX-XXXX-XXXX-XXXX';
  }
  
  return valStr;
}
