import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ExpenseList = ({ userId, onEdit }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'expenses', 'income'

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'users', userId, 'expenses'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(transactionsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleDelete = async (transactionId, type) => {
    const confirmMessage = type === 'income' 
      ? '¿Seguro que quieres eliminar este ingreso?' 
      : '¿Seguro que quieres eliminar este gasto?';
      
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', userId, 'expenses', transactionId));
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Fecha no disponible';
    const date = timestamp.toDate();
    return format(date, "d 'de' MMMM, yyyy", { locale: es });
  };

  const getCategoryEmoji = (category, type) => {
    if (type === 'income') {
      const incomeEmojis = {
        salario: '💼',
        freelance: '💻',
        inversiones: '📈',
        otros: '💵'
      };
      return incomeEmojis[category] || '💵';
    }
    
    const expenseEmojis = {
      ocio: '🎮',
      comida: '🍔',
      transporte: '🚗',
      compras: '🛍️',
      servicios: '💡',
      otros: '📦'
    };
    return expenseEmojis[category] || '📦';
  };

  const filteredTransactions = transactions.filter(transaction => {
    const transactionType = transaction.type || 'expense';
    if (filter === 'all') return true;
    if (filter === 'expenses') return transactionType === 'expense';
    if (filter === 'income') return transactionType === 'income';
    return true;
  });

  const totalIncome = transactions
    .filter(t => (t.type || 'expense') === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => (t.type || 'expense') === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = totalIncome - totalExpenses;

  if (loading) {
    return <div>Cargando transacciones...</div>;
  }

  return (
    <div className="expense-list">
      <h2>Mis Transacciones</h2>
      
      {/* Resumen de balance */}
      <div className="balance-summary">
        <div className="balance-item income">
          <span className="label">Ingresos</span>
          <span className="value">+{totalIncome.toFixed(2)}€</span>
        </div>
        <div className="balance-item expense">
          <span className="label">Gastos</span>
          <span className="value">-{totalExpenses.toFixed(2)}€</span>
        </div>
        <div className={`balance-item total ${balance >= 0 ? 'positive' : 'negative'}`}>
          <span className="label">Balance</span>
          <span className="value">{balance.toFixed(2)}€</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="transaction-filters">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Todas
        </button>
        <button 
          className={filter === 'expenses' ? 'active' : ''}
          onClick={() => setFilter('expenses')}
        >
          Gastos
        </button>
        <button 
          className={filter === 'income' ? 'active' : ''}
          onClick={() => setFilter('income')}
        >
          Ingresos
        </button>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="no-expenses">
          No tienes {filter === 'all' ? 'transacciones' : filter === 'expenses' ? 'gastos' : 'ingresos'} registrados
        </div>
      ) : (
        <div className="expenses">
          {filteredTransactions.map(transaction => {
            const transactionType = transaction.type || 'expense';
            return (
              <div 
                key={transaction.id} 
                className={`expense-item ${transactionType}`}
              >
                <div className="expense-icon">
                  {getCategoryEmoji(transaction.category, transactionType)}
                </div>
                <div className="expense-details">
                  <div className="expense-description">{transaction.description}</div>
                  <div className="expense-date">{formatDate(transaction.date)}</div>
                </div>
                <div className={`expense-amount ${transactionType}`}>
                  {transactionType === 'income' ? '+' : '-'}{transaction.amount.toFixed(2)}€
                </div>
                <div className="expense-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => onEdit(transaction)}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(transaction.id, transactionType)}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExpenseList;