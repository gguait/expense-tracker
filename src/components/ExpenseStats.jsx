import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ExpenseStats = ({ userId }) => {
  const [expenses, setExpenses] = useState([]);
  const [timeFilter, setTimeFilter] = useState('all'); // all, month, week

  useEffect(() => {
    if (!userId) return;

    const q = query(collection(db, 'users', userId, 'expenses'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const expensesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExpenses(expensesData);
    });

    return () => unsubscribe();
  }, [userId]);

  const getCategoryColor = (category) => {
    const colors = {
      ocio: '#9b59b6',
      comida: '#e74c3c',
      transporte: '#3498db',
      compras: '#f39c12',
      servicios: '#1abc9c',
      otros: '#95a5a6'
    };
    return colors[category] || '#95a5a6';
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

  const filterExpensesByTime = (expenses) => {
    if (timeFilter === 'all') return expenses;

    const now = new Date();
    const filtered = expenses.filter(expense => {
      if (!expense.date) return false;
      const expenseDate = expense.date.toDate();
      
      if (timeFilter === 'month') {
        return expenseDate.getMonth() === now.getMonth() && 
               expenseDate.getFullYear() === now.getFullYear();
      }
      
      if (timeFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return expenseDate >= weekAgo;
      }
      
      return true;
    });

    return filtered;
  };

  const filteredExpenses = filterExpensesByTime(expenses);

  // Agrupar gastos por categoría
  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    const category = expense.category || 'otros';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += expense.amount;
    return acc;
  }, {});

  // Convertir a array para el gráfico
  const chartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    categoryKey: category,
    amount: parseFloat(amount.toFixed(2)),
    emoji: getCategoryEmoji(category)
  })).sort((a, b) => b.amount - a.amount);

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const getTimeFilterLabel = () => {
    if (timeFilter === 'month') return 'este mes';
    if (timeFilter === 'week') return 'esta semana';
    return 'total';
  };

  return (
    <div className="expense-stats">
      <div className="stats-header">
        <h2>📊 Estadísticas</h2>
        <div className="time-filter">
          <button 
            className={timeFilter === 'all' ? 'active' : ''}
            onClick={() => setTimeFilter('all')}
          >
            Todo
          </button>
          <button 
            className={timeFilter === 'month' ? 'active' : ''}
            onClick={() => setTimeFilter('month')}
          >
            Mes
          </button>
          <button 
            className={timeFilter === 'week' ? 'active' : ''}
            onClick={() => setTimeFilter('week')}
          >
            Semana
          </button>
        </div>
      </div>

      <div className="total-stat">
        <div className="stat-label">Gasto {getTimeFilterLabel()}</div>
        <div className="stat-value">{totalAmount.toFixed(2)}€</div>
      </div>

      {chartData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value) => `${value}€`}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #ccc',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getCategoryColor(entry.categoryKey)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="category-breakdown">
            {chartData.map(item => (
              <div key={item.categoryKey} className="category-item">
                <div className="category-info">
                  <span className="category-emoji">{item.emoji}</span>
                  <span className="category-name">{item.category}</span>
                </div>
                <div className="category-stats">
                  <span className="category-amount">{item.amount.toFixed(2)}€</span>
                  <span className="category-percentage">
                    ({((item.amount / totalAmount) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="no-data">
          No hay gastos para mostrar en este período
        </div>
      )}
    </div>
  );
};

export default ExpenseStats;