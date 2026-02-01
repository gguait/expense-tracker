import { useState } from 'react';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';

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
      </main>
    </div>
  );
};

export default Home;