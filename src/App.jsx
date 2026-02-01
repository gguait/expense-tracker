import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './config/firebase';
import Home from './pages/Home';
import Login from './pages/Login';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (window.confirm('¿Seguro que quieres cerrar sesión?')) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-screen" aria-busy="true" role="status">
        <div className="loading-inner">
          <svg className="loading-spinner" viewBox="0 0 50 50" aria-hidden="true">
            <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="4" />
          </svg>
          <div className="loading-brand">Control de Gastos</div>
          <p className="sr-only">Cargando…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app-wrapper">
      <div className="user-bar">
        <div className="user-info">
          <img 
            src={user.photoURL} 
            alt={user.displayName}
            className="user-avatar"
          />
          <span className="user-name">{user.displayName}</span>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Cerrar sesión
        </button>
      </div>
      <Home userId={user.uid} />
    </div>
  );
}

export default App;