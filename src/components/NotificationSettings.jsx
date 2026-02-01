import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

const NotificationSettings = ({ userId }) => {
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState('20:00'); // Hora por defecto: 8 PM
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState('default');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadSettings();
    checkNotificationPermission();
  }, [userId]);

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  };

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'users', userId, 'settings', 'notifications'));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setEnabled(data.enabled || false);
        setTime(data.time || '20:00');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Tu navegador no soporta notificaciones');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      toast.error('Has bloqueado las notificaciones. Actívalas en la configuración del navegador');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        toast.success('¡Notificaciones activadas!');
        return true;
      } else {
        toast.error('Permiso de notificaciones denegado');
        return false;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast.error('Error al solicitar permisos');
      return false;
    }
  };

  const handleToggle = async () => {
    const newEnabled = !enabled;

    if (newEnabled) {
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        return;
      }
    }

    try {
      await setDoc(doc(db, 'users', userId, 'settings', 'notifications'), {
        enabled: newEnabled,
        time: time,
        updatedAt: new Date()
      });
      
      setEnabled(newEnabled);
      
      if (newEnabled) {
        // Programar notificación de prueba
        scheduleTestNotification();
        toast.success(`Recordatorio diario activado para las ${time}`);
      } else {
        toast.success('Recordatorio desactivado');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error al guardar configuración');
    }
  };

  const handleTimeChange = async (newTime) => {
    setTime(newTime);
    
    if (enabled) {
      try {
        await setDoc(doc(db, 'users', userId, 'settings', 'notifications'), {
          enabled: true,
          time: newTime,
          updatedAt: new Date()
        });
        toast.success(`Hora actualizada: ${newTime}`);
      } catch (error) {
        console.error('Error updating time:', error);
        toast.error('Error al actualizar hora');
      }
    }
  };

  const scheduleTestNotification = () => {
    // Mostrar notificación de prueba inmediatamente
    if (Notification.permission === 'granted') {
      new Notification('💰 Control de Gastos', {
        body: '¡Recordatorio configurado! Recibirás una notificación diaria para registrar tus gastos.',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'test-notification',
      });
    }
  };

  const sendTestNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('💰 Recordatorio diario', {
        body: '¡No olvides registrar tus gastos de hoy!',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'daily-reminder',
        requireInteraction: false,
      });
      toast.success('Notificación de prueba enviada');
    } else {
      toast.error('No tienes permisos para notificaciones');
    }
  };

  if (loading) {
    return <div>Cargando configuración...</div>;
  }

  return (
    <div className="notification-settings">
      <div 
        className="settings-header collapsible" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="header-content">
          <h3>🔔 Recordatorio diario</h3>
          <p className="settings-description">
            {enabled ? `Activo - ${time}` : 'Recibe notificaciones diarias'}
          </p>
        </div>
        <div className={`collapse-icon ${isOpen ? 'open' : ''}`}>
          ▼
        </div>
      </div>

      <div className={`settings-content ${isOpen ? 'open' : ''}`}>
        <div className="setting-item">
          <div className="setting-info">
            <label htmlFor="notification-toggle">Activar recordatorio</label>
            <span className="setting-hint">
              {permission === 'denied' && '⚠️ Notificaciones bloqueadas'}
              {permission === 'default' && 'Se te pedirá permiso al activar'}
              {permission === 'granted' && enabled && '✓ Activo'}
            </span>
          </div>
          <label className="toggle-switch">
            <input
              id="notification-toggle"
              type="checkbox"
              checked={enabled}
              onChange={handleToggle}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {enabled && (
          <div className="setting-item">
            <div className="setting-info">
              <label htmlFor="notification-time">Hora del recordatorio</label>
              <span className="setting-hint">Elige cuándo quieres recibir el recordatorio</span>
            </div>
            <input
              id="notification-time"
              type="time"
              value={time}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="time-input"
            />
          </div>
        )}

        {enabled && permission === 'granted' && (
          <button onClick={sendTestNotification} className="btn-test-notification">
            Enviar notificación de prueba
          </button>
        )}

        <div className="notification-note">
          <p>💡 <strong>Nota:</strong> Las notificaciones solo funcionan cuando la app está abierta en segundo plano o cuando la PWA está instalada.</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;