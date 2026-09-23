import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './Pages/login';
import Register from './Pages/register';
import Map from './Pages/map';
import Profil from './Pages/profil';
import ImagePage from './Pages/image';

const isTokenValid = (token) => {
  if (!token) return false;

  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return false;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));

    if (!payload.exp) return true;

    return Date.now() < payload.exp * 1000;
  } catch (error) {
    console.error('Token invalide :', error);
    return false;
  }
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token || !isTokenValid(token)) {
    localStorage.removeItem('token');
    return <Navigate to="/login_check" replace />;
  }

  return children;
};

function App() {
  const token = localStorage.getItem('token');
  const isLoggedIn = isTokenValid(token);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login_check" replace />} />

        <Route
          path="/login_check"
          element={isLoggedIn ? <Navigate to="/map" replace /> : <Login />}
        />

        <Route
          path="/register"
          element={isLoggedIn ? <Navigate to="/map" replace /> : <Register />}
        />

        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <Map />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profil"
          element={
            <ProtectedRoute>
              <Profil />
            </ProtectedRoute>
          }
        />

        <Route
          path="/image"
          element={
            <ProtectedRoute>
              <ImagePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
