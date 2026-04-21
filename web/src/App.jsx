import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
// Layouts
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
// Public Pages
import HomePage from './pages/public/HomePage'
import EventsPage from './pages/public/EventsPage'
import EventDetailPage from './pages/public/EventDetailPage'
import InfluencersPage from './pages/public/InfluencersPage'
import InfluencerProfilePage from './pages/public/InfluencerProfilePage'
import LoginPage from './pages/auth/LoginPage'
import AuthCallback from './pages/auth/AuthCallback'
// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminEvents from './pages/admin/Events'
import AdminEventForm from './pages/admin/EventForm'
import AdminInfluencers from './pages/admin/Influencers'
import AdminApplications from './pages/admin/Applications'
import AdminCategories from './pages/admin/Categories'
import AdminSettings from './pages/admin/Settings'
// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }
  return children
}
function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/influencers" element={<InfluencersPage />} />
        <Route path="/influencers/:id" element={<InfluencerProfilePage />} />
      </Route>
      {/* Auth Routes */}
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="events/new" element={<AdminEventForm />} />
        <Route path="events/:id/edit" element={<AdminEventForm />} />
        <Route path="influencers" element={<AdminInfluencers />} />
        <Route path="applications" element={<AdminApplications />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
export default App
