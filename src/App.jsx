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