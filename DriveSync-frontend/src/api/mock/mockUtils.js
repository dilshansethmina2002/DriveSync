// =============================================================
//  MOCK MODE helpers  (only used when VITE_USE_MOCK=true)
//  This data lives in browser memory. It is NOT from the backend,
//  and it resets when the page is reloaded.
// =============================================================

/** Pretend to wait for the network so loading spinners can be seen */
export const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

/** Throw an error shaped like an Axios error so pages handle it the same way */
export const mockError = (status, message) => {
  const error = new Error(message);
  error.isMock = true;
  error.response = { status, data: { success: false, message } };
  throw error;
};

export const paginate = (items, params = {}) => {
  const page = Math.max(Number(params.page) || 1, 1);
  const limit = Math.min(Number(params.limit) || 10, 100);
  const total = items.length;
  return {
    data: items.slice((page - 1) * limit, page * limit),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

const hex = (length) => Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
export const objectId = () => hex(24);
export const upperHex = (length = 8) => hex(length).toUpperCase();
export const datePart = (date = new Date()) => date.toISOString().slice(0, 10).replace(/-/g, '');

export const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
export const daysAhead = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

export const clone = (value) => JSON.parse(JSON.stringify(value));
