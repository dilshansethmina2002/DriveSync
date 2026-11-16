// =============================================================
//  Fleet Management Service API (Member 3)  ->  Gateway /api/fleet  ->  :5005
// =============================================================
import httpClient from './httpClient';
import { USE_MOCK } from '../config/appConfig';
import * as mock from './mock/mockFleetApi';

const BASE = '/api/fleet';
const body = (promise) => promise.then((res) => res.data);
const clean = (params = {}) => Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null));

// ---------- Dashboard ----------
export const getFleetStats = () => (USE_MOCK ? mock.getFleetStats() : body(httpClient.get(`${BASE}/stats`)));

// ---------- Vehicles ----------
export const listVehicles = (params) =>
  USE_MOCK ? mock.listVehicles(clean(params)) : body(httpClient.get(`${BASE}/vehicles`, { params: clean(params) }));

export const getVehicle = (vehicleId) => (USE_MOCK ? mock.getVehicle(vehicleId) : body(httpClient.get(`${BASE}/vehicles/${vehicleId}`)));

export const registerVehicle = (payload) => (USE_MOCK ? mock.registerVehicle(payload) : body(httpClient.post(`${BASE}/vehicles`, payload)));

export const updateVehicle = (vehicleId, payload) =>
  USE_MOCK ? mock.updateVehicle(vehicleId, payload) : body(httpClient.patch(`${BASE}/vehicles/${vehicleId}`, payload));

export const changeVehicleStatus = (vehicleId, status, reason) =>
  USE_MOCK
    ? mock.changeVehicleStatus(vehicleId, status, reason)
    : body(httpClient.patch(`${BASE}/vehicles/${vehicleId}/status`, { status, reason }));

export const returnVehicle = (vehicleId, payload) =>
  USE_MOCK ? mock.returnVehicle(vehicleId, payload) : body(httpClient.post(`${BASE}/vehicles/${vehicleId}/return`, payload));

// ---------- Maintenance ----------
export const recordMaintenance = (vehicleId, payload) =>
  USE_MOCK ? mock.recordMaintenance(vehicleId, payload) : body(httpClient.post(`${BASE}/vehicles/${vehicleId}/maintenance`, payload));

export const getVehicleMaintenance = (vehicleId, params) =>
  USE_MOCK
    ? mock.listMaintenance({ ...clean(params), vehicleId })
    : body(httpClient.get(`${BASE}/vehicles/${vehicleId}/maintenance`, { params: clean(params) }));

export const listMaintenance = (params) =>
  USE_MOCK ? mock.listMaintenance(clean(params)) : body(httpClient.get(`${BASE}/maintenance`, { params: clean(params) }));

export const completeMaintenance = (maintenanceId, payload) =>
  USE_MOCK ? mock.completeMaintenance(maintenanceId, payload) : body(httpClient.patch(`${BASE}/maintenance/${maintenanceId}/complete`, payload));
