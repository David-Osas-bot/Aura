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
  const { user, userData, loading, dataLoading } = useAuth();

  // Wait for BOTH auth AND firestore to finish loading
  if (loading || dataLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#08080f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.08)',
          borderTopColor: '#fff',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

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