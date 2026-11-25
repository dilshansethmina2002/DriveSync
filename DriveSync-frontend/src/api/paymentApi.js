// =============================================================
//  Payment Service API (Member 3)  ->  Gateway /api/payments  ->  :5004
//  Every function returns the JSON body: { success, data, pagination? }
//  When VITE_USE_MOCK=true the same functions use sample data instead.
// =============================================================
import httpClient from './httpClient';
import { USE_MOCK } from '../config/appConfig';
import * as mock from './mock/mockPaymentApi';

const BASE = '/api/payments';
const body = (promise) => promise.then((res) => res.data);

// Remove empty filters so the URL stays clean (?status=&type= -> nothing)
const clean = (params = {}) => Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null));

export const createPayment = (payload) => (USE_MOCK ? mock.createPayment(payload) : body(httpClient.post(BASE, payload)));

export const getPayment = (paymentId) => (USE_MOCK ? mock.getPayment(paymentId) : body(httpClient.get(`${BASE}/${paymentId}`)));

export const getReceipt = (paymentId) => (USE_MOCK ? mock.getReceipt(paymentId) : body(httpClient.get(`${BASE}/${paymentId}/receipt`)));

export const listPayments = (params) => (USE_MOCK ? mock.listPayments(clean(params)) : body(httpClient.get(BASE, { params: clean(params) })));

export const getPaymentsByBooking = (bookingId, params) =>
  USE_MOCK ? mock.listPayments({ ...clean(params), bookingId }) : body(httpClient.get(`${BASE}/booking/${bookingId}`, { params: clean(params) }));

export const getBookingSummary = (bookingId) =>
  USE_MOCK ? mock.getBookingSummary(bookingId) : body(httpClient.get(`${BASE}/booking/${bookingId}/summary`));

export const getPaymentsByCustomer = (customerId, params) =>
  USE_MOCK
    ? mock.listPayments({ ...clean(params), customerId })
    : body(httpClient.get(`${BASE}/customer/${customerId}`, { params: clean(params) }));

export const getPaymentStats = () => (USE_MOCK ? mock.getPaymentStats() : body(httpClient.get(`${BASE}/stats`)));

export const updatePaymentStatus = (paymentId, payload) =>
  USE_MOCK ? mock.updatePaymentStatus(paymentId, payload) : body(httpClient.patch(`${BASE}/${paymentId}/status`, payload));

export const refundPayment = (paymentId, payload) =>
  USE_MOCK ? mock.refundPayment(paymentId, payload) : body(httpClient.post(`${BASE}/${paymentId}/refund`, payload));
