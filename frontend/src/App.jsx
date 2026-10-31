import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Plans from './pages/Plans'
import Templates from './pages/Templates'
import Discounts from './pages/Discounts'
import Taxes from './pages/Taxes'
import Team from './pages/Team'
import Subscriptions from './pages/Subscriptions'
import SubscriptionForm from './pages/SubscriptionForm'
import SubscriptionDetail from './pages/SubscriptionDetail'
import Invoices from './pages/Invoices'
import InvoiceDetail from './pages/InvoiceDetail'
import Payments from './pages/Payments'
import PortalSubscriptions from './pages/portal/PortalSubscriptions'
import PortalInvoices from './pages/portal/PortalInvoices'

export default function App() {
  const { user, isStaff } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={user && !isStaff ? <Navigate to="/portal" replace /> : <ProtectedRoute staffOnly><Dashboard /></ProtectedRoute>} />
        <Route path="subscriptions" element={<ProtectedRoute staffOnly><Subscriptions /></ProtectedRoute>} />
        <Route path="subscriptions/new" element={<ProtectedRoute staffOnly><SubscriptionForm /></ProtectedRoute>} />
        <Route path="subscriptions/:id" element={<ProtectedRoute staffOnly><SubscriptionDetail /></ProtectedRoute>} />
        <Route path="subscriptions/:id/edit" element={<ProtectedRoute staffOnly><SubscriptionForm /></ProtectedRoute>} />
        <Route path="invoices" element={<ProtectedRoute staffOnly><Invoices /></ProtectedRoute>} />
        <Route path="invoices/:id" element={<ProtectedRoute staffOnly><InvoiceDetail /></ProtectedRoute>} />
        <Route path="payments" element={<ProtectedRoute staffOnly><Payments /></ProtectedRoute>} />
        <Route path="products" element={<ProtectedRoute staffOnly><Products /></ProtectedRoute>} />
        <Route path="plans" element={<ProtectedRoute staffOnly><Plans /></ProtectedRoute>} />
        <Route path="templates" element={<ProtectedRoute staffOnly><Templates /></ProtectedRoute>} />
        <Route path="discounts" element={<ProtectedRoute staffOnly><Discounts /></ProtectedRoute>} />
        <Route path="taxes" element={<ProtectedRoute staffOnly><Taxes /></ProtectedRoute>} />
        <Route path="team" element={<ProtectedRoute adminOnly><Team /></ProtectedRoute>} />
        <Route path="portal" element={<ProtectedRoute customerOnly><PortalSubscriptions /></ProtectedRoute>} />
        <Route path="portal/invoices" element={<ProtectedRoute customerOnly><PortalInvoices /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
