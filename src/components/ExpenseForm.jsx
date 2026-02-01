import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const ExpenseForm = ({ userId, editingExpense, onCancelEdit }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('ocio');
  const [type, setType] = useState('expense'); // 'expense' o 'income'
  const [loading, setLoading] = useState(false);

  const expenseCategories = [
    'ocio',
    'comida',
    'transporte',
    'compras',
    'servicios',
    'otros'
  ];

  const incomeCategories = [
    'salario',
    'freelance',
    'inversiones',
    'otros'
  ];

  const categories = type === 'expense' ? expenseCategories : incomeCategories;

  // Cargar datos cuando hay un gasto/ingreso para editar
  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount.toString());
      setDescription(editingExpense.description);
      setCategory(editingExpense.category);
      setType(editingExpense.type || 'expense');
    }
  }, [editingExpense]);

  // Cuando cambia el tipo, resetear la categoría
  useEffect(() => {
    if (!editingExpense) {
      setCategory(type === 'expense' ? 'ocio' : 'salario');
    }
  }, [type, editingExpense]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || !description) {
      alert('Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      if (editingExpense) {
        // Actualizar entrada existente
        await updateDoc(doc(db, 'users', userId, 'expenses', editingExpense.id), {
          amount: parseFloat(amount),
          description,
          category,
          type,
          updatedAt: serverTimestamp()
        });
        alert(`${type === 'expense' ? 'Gasto' : 'Ingreso'} actualizado correctamente`);
        onCancelEdit();
      } else {
        // Crear nueva entrada
        await addDoc(collection(db, 'users', userId, 'expenses'), {
          amount: parseFloat(amount),
          description,
          category,
          type,
          date: serverTimestamp(),
          createdAt: serverTimestamp()
        });
        alert(`${type === 'expense' ? 'Gasto' : 'Ingreso'} añadido correctamente`);
      }

      // Limpiar formulario
      setAmount('');
      setDescription('');
      setCategory(type === 'expense' ? 'ocio' : 'salario');
      
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setAmount('');
    setDescription('');
    setCategory('ocio');
    setType('expense');
    onCancelEdit();
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <h2>{editingExpense ? 'Editar' : 'Añadir'} {type === 'expense' ? 'Gasto' : 'Ingreso'}</h2>
      
      {/* Selector de tipo */}
      <div className="type-selector">
        <button
          type="button"
          className={`type-btn ${type === 'expense' ? 'active expense' : ''}`}
          onClick={() => setType('expense')}
        >
          💸 Gasto
        </button>
        <button
          type="button"
          className={`type-btn ${type === 'income' ? 'active income' : ''}`}
          onClick={() => setType('income')}
        >
          💰 Ingreso
        </button>
      </div>

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
          placeholder={type === 'expense' ? 'Ej: Cena con amigos' : 'Ej: Salario mensual'}
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
          {loading ? 'Guardando...' : editingExpense ? 'Actualizar' : `Añadir ${type === 'expense' ? 'Gasto' : 'Ingreso'}`}
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