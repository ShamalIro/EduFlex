/**
 * Validation Utilities for EduFlex Forms
 * Contains reusable validation functions and input handlers
 */

// ============= VALIDATION PATTERNS =============

/**
 * Email validation pattern
 * Allows: letters, numbers, @, . only
 */
export const EMAIL_PATTERN = /^[a-zA-Z0-9@.]+$/;

/**
 * Name validation pattern
 * Allows: letters, spaces, dots only
 */
export const NAME_PATTERN = /^[a-zA-Z\s.]+$/;

/**
 * Phone validation pattern
 * Allows: exactly 10 digits
 */
export const PHONE_PATTERN = /^[0-9]{10}$/;

/**
 * Positive integer pattern
 * Allows: only digits (no -, +, e, E, .)
 */
export const POSITIVE_INT_PATTERN = /^[0-9]+$/;


// ============= VALIDATION FUNCTIONS =============

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9.]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Validate name (letters, spaces, dots only)
 * @param {string} name
 * @returns {boolean}
 */
export const isValidName = (name) => {
  return NAME_PATTERN.test(name);
};

/**
 * Validate phone number (exactly 10 digits)
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  return PHONE_PATTERN.test(phone);
};

/**
 * Validate positive integer
 * @param {string} value
 * @returns {boolean}
 */
export const isPositiveInteger = (value) => {
  return POSITIVE_INT_PATTERN.test(value) && parseInt(value) > 0;
};

/**
 * Check if date/time is in the future
 * @param {string} dateTimeStr - ISO date string or datetime-local value
 * @returns {boolean}
 */
export const isFutureDateTime = (dateTimeStr) => {
  const dateTime = new Date(dateTimeStr);
  const now = new Date();
  return dateTime > now;
};

/**
 * Get minimum datetime string for datetime-local input (current time)
 * @returns {string} - Format: YYYY-MM-DDTHH:MM
 */
export const getMinDateTime = () => {
  const now = new Date();
  return now.toISOString().slice(0, 16);
};


// ============= INPUT HANDLERS =============

/**
 * Create handler for positive integer input
 * Prevents -, +, e, E, . characters
 * @param {function} setValue - State setter function
 * @param {number} maxValue - Optional maximum value
 * @returns {Object} - { onChange, onKeyDown }
 */
export const createPositiveIntegerHandlers = (setValue, maxValue = Infinity) => {
  return {
    onChange: (e) => {
      const value = e.target.value;
      if (value === '' || POSITIVE_INT_PATTERN.test(value)) {
        const numValue = parseInt(value) || 0;
        if (numValue <= maxValue) {
          setValue(value);
        }
      }
    },
    onKeyDown: (e) => {
      if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
        e.preventDefault();
      }
    }
  };
};

/**
 * Create handler for name input
 * Only allows letters, spaces, and dots
 * @param {function} setValue - State setter function
 * @returns {Object} - { onChange }
 */
export const createNameHandlers = (setValue) => {
  return {
    onChange: (e) => {
      const value = e.target.value;
      // Allow empty or valid name characters
      if (value === '' || NAME_PATTERN.test(value)) {
        setValue(value);
      }
    }
  };
};

/**
 * Create handler for email input
 * Only allows letters, numbers, @, and .
 * @param {function} setValue - State setter function
 * @returns {Object} - { onChange }
 */
export const createEmailHandlers = (setValue) => {
  return {
    onChange: (e) => {
      const value = e.target.value;
      // Allow empty or valid email characters
      if (value === '' || EMAIL_PATTERN.test(value)) {
        setValue(value);
      }
    }
  };
};

/**
 * Create handler for phone input
 * Only allows digits, max 10 characters
 * @param {function} setValue - State setter function
 * @returns {Object} - { onChange, onKeyDown }
 */
export const createPhoneHandlers = (setValue) => {
  return {
    onChange: (e) => {
      const value = e.target.value;
      // Only allow digits, max 10
      if (value === '' || (/^[0-9]*$/.test(value) && value.length <= 10)) {
        setValue(value);
      }
    },
    onKeyDown: (e) => {
      // Prevent non-digit characters except control keys
      if (!/[0-9]/.test(e.key) &&
          !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
        e.preventDefault();
      }
    }
  };
};


// ============= ERROR MESSAGES =============

export const ValidationMessages = {
  required: (field) => `${field} is required`,
  email: 'Please enter a valid email address',
  phone: 'Phone number must be exactly 10 digits',
  name: 'Name can only contain letters, spaces, and dots',
  positiveNumber: (field) => `${field} must be a positive number`,
  minValue: (field, min) => `${field} must be at least ${min}`,
  maxValue: (field, max) => `${field} cannot exceed ${max}`,
  futureDate: 'Date must be in the future',
  pastDate: 'Date cannot be in the past'
};

export default {
  isValidEmail,
  isValidName,
  isValidPhone,
  isPositiveInteger,
  isFutureDateTime,
  getMinDateTime,
  createPositiveIntegerHandlers,
  createNameHandlers,
  createEmailHandlers,
  createPhoneHandlers,
  ValidationMessages
};
