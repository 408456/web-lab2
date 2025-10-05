import { AppController } from './controllers/appController.js';

// Точка входа приложения
document.addEventListener('DOMContentLoaded', () => {
  const app = new AppController(document.body);
  app.init();

  // Восстановление темы
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') document.body.classList.add('dark-theme');

  // Предзагрузка иконок (для ускорения)
  const icons = [
    './img/icons/done.png',
    './img/icons/nodone.png',
    './img/icons/star.png',
    './img/icons/favourite.png',
    './img/icons/edit.png',
    './img/icons/backet.png',
  ];
  icons.forEach(src => {
    const img = new Image();
    img.src = src;
    img.loading = 'lazy';
  });
});
