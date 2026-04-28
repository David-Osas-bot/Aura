import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import ProfileView from './pages/ProfileView';
import Messages from './pages/Messages';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';

function PrivateRoute({ children }) {
  const { user, userData, loading } = useAuth();
  if (loading) return <div className="loader">Loading…</div>;
  if (!user) return <Navigate to="/login" />;
  if (!userData?.paid) return <Navigate to="/onboarding" />;
  if (!userData?.profileComplete) return <Navigate to="/onboarding" />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/profile/:id" element={<PrivateRoute><ProfileView /></PrivateRoute>} />
          <Route path="/messages/:id" element={<PrivateRoute><Messages /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}