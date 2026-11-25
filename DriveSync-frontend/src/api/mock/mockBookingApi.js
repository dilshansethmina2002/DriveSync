// =============================================================
//  MOCK versions of Member 2's Booking & Catalog reads
//  (only used when VITE_USE_MOCK=true)
// =============================================================
import { buildMockBookings, mockCatalogVehicles } from './mockData';
import { delay, clone } from './mockUtils';

export const getBookingsForUser = async (userId) => {
  await delay();
  return { success: true, data: clone(buildMockBookings(userId)) };
};

export const getCatalogVehicles = async () => {
  await delay();
  return { success: true, data: clone(mockCatalogVehicles) };
};
