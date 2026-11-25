// =============================================================
//  Pagination helpers
//  ?page=2&limit=10  ->  skip the first 10 records, return the next 10
// =============================================================
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100; // never let a client ask for millions of rows at once

export const getPagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const buildPaginationMeta = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});
