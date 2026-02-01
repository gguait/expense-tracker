import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ExpenseList = ({ userId }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'users', userId, 'expenses'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const expensesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExpenses(expensesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Fecha no disponible';
    const date = timestamp.toDate();
    return format(date, "d 'de' MMMM, yyyy", { locale: es });
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      ocio: '🎮',
      comida: '🍔',
      transporte: '🚗',
      compras: '🛍️',
      servicios: '💡',
      otros: '📦'
    };
    return emojis[category] || '📦';
  };

  if (loading) {
    return <div>Cargando gastos...</div>;
  }

  if (expenses.length === 0) {
    return <div className="no-expenses">No tienes gastos registrados aún</div>;
  }

  const totalGastos = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="expense-list">
      <h2>Mis Gastos</h2>
      <div className="total">
        <strong>Total gastado:</strong> {totalGastos.toFixed(2)}€
      </div>
      
      <div className="expenses">
        {expenses.map(expense => (
          <div key={expense.id} className="expense-item">
            <div className="expense-icon">
              {getCategoryEmoji(expense.category)}
            </div>
            <div className="expense-details">
              <div className="expense-description">{expense.description}</div>
              <div className="expense-date">{formatDate(expense.date)}</div>
            </div>
            <div className="expense-amount">
              {expense.amount.toFixed(2)}€
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;
