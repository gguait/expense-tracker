import { useState } from 'react';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import ExpenseStats from '../components/ExpenseStats';
import Budget from '../components/Budget';

const Home = () => {
  const userId = 'demo-user';
  const [editingExpense, setEditingExpense] = useState(null);

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  return (
    <div className="container">
      <header>
        <h1>💰 Control de Gastos</h1>
        <p>Gestiona tus finanzas personales</p>
      </header>

      <main>
        {/* Presupuesto */}
        <div className="budget-section">
          <Budget userId={userId} />
        </div>

        {/* Formulario y Lista */}
        <div className="grid">
          <ExpenseForm 
            userId={userId} 
            editingExpense={editingExpense}
            onCancelEdit={handleCancelEdit}
          />
          <ExpenseList 
            userId={userId}
            onEdit={handleEdit}
          />
        </div>

        {/* Estadísticas */}
        <div className="stats-section">
          <ExpenseStats userId={userId} />
        </div>
      </main>
    </div>
  );
};

export default Home;