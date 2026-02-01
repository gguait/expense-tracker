import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const Budget = ({ userId }) => {
  const [budget, setBudget] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [tempBudget, setTempBudget] = useState('');

  // Cargar presupuesto guardado
  useEffect(() => {
    const loadBudget = async () => {
      if (!userId) return;
      
      try {
        const budgetDoc = await getDoc(doc(db, 'users', userId, 'settings', 'budget'));
        if (budgetDoc.exists()) {
          setBudget(budgetDoc.data().amount || 0);
        }
      } catch (error) {
        console.error('Error al cargar presupuesto:', error);
      }
    };

    loadBudget();
  }, [userId]);

  // Cargar gastos del mes actual
  useEffect(() => {
    if (!userId) return;

    const q = query(collection(db, 'users', userId, 'expenses'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const expensesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filtrar solo GASTOS (no ingresos) del mes actual
      const now = new Date();
      const monthExpenses = expensesData.filter(expense => {
        if (!expense.date) return false;
        const expenseDate = expense.date.toDate();
        const isCurrentMonth = expenseDate.getMonth() === now.getMonth() && 
                              expenseDate.getFullYear() === now.getFullYear();
        const isExpense = (expense.type || 'expense') === 'expense';
        return isCurrentMonth && isExpense;
      });

      setExpenses(monthExpenses);
    });

    return () => unsubscribe();
  }, [userId]);

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = budget - totalSpent;
  const percentage = budget > 0 ? (totalSpent / budget) * 100 : 0;

  const handleSaveBudget = async () => {
    const newBudget = parseFloat(tempBudget);
    
    if (isNaN(newBudget) || newBudget < 0) {
      alert('Por favor introduce un presupuesto válido');
      return;
    }

    try {
      await setDoc(doc(db, 'users', userId, 'settings', 'budget'), {
        amount: newBudget,
        updatedAt: new Date()
      });
      
      setBudget(newBudget);
      setIsEditing(false);
      setTempBudget('');
    } catch (error) {
      console.error('Error al guardar presupuesto:', error);
      alert('Error al guardar el presupuesto');
    }
  };

  const getStatusClass = () => {
    if (percentage >= 100) return 'danger';
    if (percentage >= 80) return 'warning';
    return 'safe';
  };

  const getStatusMessage = () => {
    if (percentage >= 100) return '¡Has superado tu presupuesto!';
    if (percentage >= 90) return '¡Cuidado! Estás cerca del límite';
    if (percentage >= 80) return 'Vas por buen camino, pero controla el gasto';
    return 'Todo bajo control';
  };

  if (!budget && !isEditing) {
    return (
      <div className="budget-container budget-empty">
        <div className="budget-icon">🎯</div>
        <h3>Establece tu presupuesto mensual</h3>
        <p>Define cuánto quieres gastar al mes y te ayudaremos a controlarlo</p>
        <button 
          className="btn-set-budget"
          onClick={() => {
            setIsEditing(true);
            setTempBudget(budget.toString());
          }}
        >
          Establecer Presupuesto
        </button>
      </div>
    );
  }

  return (
    <div className={`budget-container ${getStatusClass()}`}>
      <div className="budget-header">
        <h2>💰 Presupuesto Mensual</h2>
        {!isEditing && (
          <button 
            className="btn-edit-budget"
            onClick={() => {
              setIsEditing(true);
              setTempBudget(budget.toString());
            }}
          >
            ✏️ Editar
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="budget-edit">
          <div className="input-group">
            <input
              type="number"
              step="0.01"
              value={tempBudget}
              onChange={(e) => setTempBudget(e.target.value)}
              placeholder="Ej: 1000"
              autoFocus
            />
            <span className="currency">€</span>
          </div>
          <div className="button-group">
            <button onClick={handleSaveBudget} className="btn-save">
              Guardar
            </button>
            <button 
              onClick={() => {
                setIsEditing(false);
                setTempBudget('');
              }} 
              className="btn-cancel"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="budget-summary">
            <div className="budget-item">
              <span className="label">Presupuesto</span>
              <span className="value">{budget.toFixed(2)}€</span>
            </div>
            <div className="budget-item">
              <span className="label">Gastado</span>
              <span className="value spent">{totalSpent.toFixed(2)}€</span>
            </div>
            <div className="budget-item">
              <span className="label">Disponible</span>
              <span className={`value ${remaining < 0 ? 'negative' : 'positive'}`}>
                {remaining.toFixed(2)}€
              </span>
            </div>
          </div>

          <div className="progress-bar-container">
            <div 
              className="progress-bar"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          
          <div className="budget-status">
            <span className="percentage">{percentage.toFixed(0)}%</span>
            <span className="status-message">{getStatusMessage()}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default Budget;