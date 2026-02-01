import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const ExpenseForm = ({ userId, editingExpense, onCancelEdit }) => {
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

  // Cargar datos cuando hay un gasto para editar
  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount.toString());
      setDescription(editingExpense.description);
      setCategory(editingExpense.category);
    }
  }, [editingExpense]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || !description) {
      alert('Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      if (editingExpense) {
        // Actualizar gasto existente
        await updateDoc(doc(db, 'users', userId, 'expenses', editingExpense.id), {
          amount: parseFloat(amount),
          description,
          category,
          updatedAt: serverTimestamp()
        });
        alert('Gasto actualizado correctamente');
        onCancelEdit();
      } else {
        // Crear nuevo gasto
        await addDoc(collection(db, 'users', userId, 'expenses'), {
          amount: parseFloat(amount),
          description,
          category,
          date: serverTimestamp(),
          createdAt: serverTimestamp()
        });
        alert('Gasto añadido correctamente');
      }

      // Limpiar formulario
      setAmount('');
      setDescription('');
      setCategory('ocio');
      
    } catch (error) {
      console.error('Error al guardar gasto:', error);
      alert('Error al guardar el gasto');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setAmount('');
    setDescription('');
    setCategory('ocio');
    onCancelEdit();
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <h2>{editingExpense ? 'Editar Gasto' : 'Añadir Gasto'}</h2>
      
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

      <div className="form-buttons">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Guardando...' : editingExpense ? 'Actualizar' : 'Añadir Gasto'}
        </button>
        
        {editingExpense && (
          <button type="button" onClick={handleCancel} className="btn-secondary">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

export default ExpenseForm;