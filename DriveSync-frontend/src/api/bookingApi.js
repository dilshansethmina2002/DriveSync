// =============================================================
//  Read-only calls to Member 2's services (through the gateway).
//  Member 3's pages only READ bookings / catalog vehicles to fill
//  the checkout and vehicle forms - we never change their data here.
//
//  Booking Service:  GET /api/bookings?userId=<id>  -> { success, data: [booking] }
//  Catalog Service:  GET /api/catalog               -> { success, data: [vehicle] }
// =============================================================
import httpClient from './httpClient';
import { USE_MOCK } from '../config/appConfig';
import * as mock from './mock/mockBookingApi';

export const getBookingsForUser = (userId) =>
  USE_MOCK ? mock.getBookingsForUser(userId) : httpClient.get('/api/bookings', { params: { userId } }).then((res) => res.data);

export const getCatalogVehicles = () => (USE_MOCK ? mock.getCatalogVehicles() : httpClient.get('/api/catalog').then((res) => res.data));
