import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

const ExpenseForm = ({ userId, editingExpense, onCancelEdit }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('ocio');
  const [type, setType] = useState('expense'); // 'expense', 'income' o 'investment'
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

  const investmentCategories = [
    'acciones',
    'fondos',
    'criptomonedas',
    'inmuebles',
    'otros'
  ];

  const categories = type === 'expense' 
    ? expenseCategories 
    : type === 'income' 
    ? incomeCategories 
    : investmentCategories;

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
      if (type === 'expense') setCategory('ocio');
      else if (type === 'income') setCategory('salario');
      else if (type === 'investment') setCategory('acciones');
    }
  }, [type, editingExpense]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || !description) {
      toast.error('Por favor completa todos los campos');
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
        toast.success(`${type === 'expense' ? 'Gasto' : type === 'income' ? 'Ingreso' : 'Inversión'} actualizado`);
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
        toast.success(`${type === 'expense' ? 'Gasto' : type === 'income' ? 'Ingreso' : 'Inversión'} añadido`);
      }

      // Limpiar formulario
      setAmount('');
      setDescription('');
      setCategory(type === 'expense' ? 'ocio' : 'salario');
      
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('Error al guardar. Inténtalo de nuevo');
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
      <h2>
        {editingExpense ? 'Editar' : 'Añadir'}{' '}
        {type === 'expense' ? 'Gasto' : type === 'income' ? 'Ingreso' : 'Inversión'}
      </h2>
      
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
        <button
          type="button"
          className={`type-btn ${type === 'investment' ? 'active investment' : ''}`}
          onClick={() => setType('investment')}
        >
          📈 Inversión
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
          placeholder={
            type === 'expense' 
              ? 'Ej: Cena con amigos' 
              : type === 'income'
              ? 'Ej: Salario mensual'
              : 'Ej: Compra de acciones'
          }
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
          {loading 
            ? 'Guardando...' 
            : editingExpense 
            ? 'Actualizar' 
            : `Añadir ${type === 'expense' ? 'Gasto' : type === 'income' ? 'Ingreso' : 'Inversión'}`
          }
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