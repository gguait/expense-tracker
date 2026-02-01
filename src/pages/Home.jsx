import { useState } from 'react';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';

const Home = () => {
  // Por ahora usamos un ID de usuario hardcodeado
  // Más adelante implementaremos autenticación real
  const userId = 'demo-user';

  return (
    <div className="container">
      <header>
        <h1>💰 Control de Gastos</h1>
        <p>Gestiona tus finanzas personales</p>
      </header>

      <main>
        <div className="grid">
          <ExpenseForm userId={userId} />
          <ExpenseList userId={userId} />
        </div>
      </main>
    </div>
  );
};

export default Home;
