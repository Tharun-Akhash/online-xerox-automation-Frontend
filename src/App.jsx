import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import XeroxAutomation from './components/XeroxAutomation';
import Home from './components/home';
import StudentLogin from './components/login';
import StudentRegister from './components/register';
import ShopkeeperLogin from './components/shlogin';
import ShopkeeperRegister from './components/shegister';
import PrintJobsManager from './components/PrintJobsManager';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect base path to home */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Public routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<StudentLogin />} />
        <Route path="/register" element={<StudentRegister />} />
        <Route path="/shoplogin" element={<ShopkeeperLogin />} />
        <Route path="/shopregister" element={<ShopkeeperRegister />} />

        {/* Student Dashboard */}
        <Route path="/xerox" element={<XeroxAutomation />} />

        {/* Shopkeeper Dashboard (after successful login) */}
        <Route path="/PrintJobsManager" element={<PrintJobsManager />} />

        {/* Fallback route (optional) */}
        <Route path="*" element={<div className="text-center p-10 text-red-500">404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
