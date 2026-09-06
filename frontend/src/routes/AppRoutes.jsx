import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from '../pages/Home/Home'
import Login from '../pages/Auth/Login'
import Register from '../pages/Auth/Register'
import JoinQueue from '../pages/Queue/JoinQueue'
import QueueStatus from '../pages/Queue/QueueStatus'
import MyQueues from '../pages/Queue/MyQueues'
import StaffDashboard from '../pages/Dashboard/StaffDashboard'
import ServiceCenter from '../pages/ServiceCenter/ServiceCenter'
import ServiceCenterManagement from '../pages/ServiceCenter/ServiceCenterManagement.jsx'
import AdminDashboard from '../pages/Dashboard/AdminDashboard'

import ProtectedRoute from './ProtectedRoute'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/service-centers/:centerId"
          element={<ServiceCenter />}
        />

        <Route
          path="/queue/join/:serviceId"
          element={<JoinQueue />}
        />

        <Route
          path="/queue/status"
          element={<QueueStatus />}
        />

        <Route
          path="/my-queues"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <MyQueues />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['STAFF']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/service-centers/:centerId"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ServiceCenterManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />


        <Route
          path="/queue/join-by-queue/:queueId"
          element={<JoinQueue />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes