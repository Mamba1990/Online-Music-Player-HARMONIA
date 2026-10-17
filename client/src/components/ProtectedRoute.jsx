import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) =>
  localStorage.getItem('token') ? children : <Navigate to="/login" replace />

export default ProtectedRoute