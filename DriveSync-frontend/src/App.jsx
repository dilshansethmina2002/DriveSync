import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import VehicleCatalog from './pages/VehicleCatalog';
// import MyBookings from './pages/MyBookings';
// import AdminInventory from './pages/AdminInventory';

function App() {
  return (
    <Routes>
      {/* <Route path="/" element={<Navigate to="/catalog" replace />} /> */}
      <Route path="/catalog" element={<VehicleCatalog />} />
      {/* <Route path="/bookings" element={<MyBookings />} />
      <Route path="/admin/inventory" element={<AdminInventory />} /> */}
    </Routes>
  );
}

export default App;