// =============================================================
//  Form validation helpers (same rules as the backend, so users
//  see problems immediately instead of after a failed request)
// =============================================================

export const isMongoId = (value) => /^[a-f\d]{24}$/i.test(String(value || '').trim());
export const isRegistrationNumber = (value) => /^[A-Za-z0-9\- ]{2,20}$/.test(String(value || '').trim());
// Compare "YYYY-MM-DD" strings against today's LOCAL date (no time-zone surprises)
const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const isNotFutureDay = (value) => !value || String(value) <= localToday();
export const isFutureDay = (value) => !value || String(value) > localToday();

export const isMoney =(value) => /^\d+(\.\d{1,2})?$/.test(String(value)) && Number(value) > 0;

/**
 * Run a set of rules and return { field: "message" } for every failure.
 * Usage:
 *   validate(values, {
 *     amount: [[(v) => v !== '', 'Amount is required'], [isMoney, 'Enter a valid amount']],
 *   })
 */
export const validate = (values, rules) => {
  const errors = {};
  Object.entries(rules).forEach(([field, checks]) => {
    for (const [check, message] of checks) {
      if (!check(values[field], values)) {
        errors[field] = message;
        break; // show only the first problem for each field
      }
    }
  });
  return errors;
};

export const required = (message = 'This field is required') => [
  (v) => v !== undefined && v !== null && String(v).trim() !== '',
  message,
];
