import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const ExpenseForm = ({ userId }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('ocio');
  const [loading, setLoading] = useState(false);

  const categories = [
    'ocio',
    'comida',
    'transporte',
    'compras',
    'servicios',
    'otros'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || !description) {
      alert('Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, 'users', userId, 'expenses'), {
        amount: parseFloat(amount),
        description,
        category,
        date: serverTimestamp(),
        createdAt: serverTimestamp()
      });

      // Limpiar formulario
      setAmount('');
      setDescription('');
      setCategory('ocio');
      
      alert('Gasto añadido correctamente');
    } catch (error) {
      console.error('Error al añadir gasto:', error);
      alert('Error al añadir el gasto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <h2>Añadir Gasto</h2>
      
      <div>
        <label>Cantidad (€)</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>

      <div>
        <label>Descripción</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Cena con amigos"
          required
        />
      </div>

      <div>
        <label>Categoría</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Añadir Gasto'}
      </button>
    </form>
  );
};

export default ExpenseForm;
