import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './config/firebase';
import Home from './pages/Home';
import Login from './pages/Login';
import './styles/App.css';
import './styles/theme.css';
import { Toaster } from 'react-hot-toast';
import ConfirmDialog from './components/ConfirmDialog';
import { useTheme } from './hooks/useTheme';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">💰</div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app-wrapper">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '10px',
            padding: '16px',
          },
          success: {
            duration: 2000,
            iconTheme: {
              primary: '#1abc9c',
              secondary: '#fff',
            },
          },
          error: {
            duration: 3000,
            iconTheme: {
              primary: '#e74c3c',
              secondary: '#fff',
            },
          },
        }}
      />
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Cerrar sesión"
        message="¿Estás seguro de que quieres cerrar sesión?"
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
        type="warning"
      />
      <div className="user-bar">
        <div className="user-info">
          <img 
            src={user.photoURL} 
            alt={user.displayName}
            className="user-avatar"
          />
          <span className="user-name">{user.displayName}</span>
        </div>
        <div className="user-actions">
          <button onClick={toggleTheme} className="btn-theme" title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button onClick={handleLogout} className="btn-logout">
            Cerrar sesión
          </button>
        </div>
      </div>
      <Home userId={user.uid} />
    </div>
  );
}

export default App;