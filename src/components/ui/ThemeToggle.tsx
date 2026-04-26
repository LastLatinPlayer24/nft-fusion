import React from 'react';

const ThemeToggle: React.FC = () => {
  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <button onClick={toggleTheme} className="p-2 bg-gray-200 dark:bg-gray-700 rounded">
      Cambiar Tema
    </button>
  );
};

export default ThemeToggle;