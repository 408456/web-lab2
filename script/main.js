import { AppController } from './controllers/appController.js';

document.addEventListener('DOMContentLoaded', () => {
  const app = new AppController(document.body);
  app.init();

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') document.body.classList.add('dark-theme');

  [
    './img/icons/done.png',
    './img/icons/nodone.png',
    './img/icons/star.png',
    './img/icons/favourite.png',
    './img/icons/favicon.png',
    './img/icons/edit.png',
    './img/icons/backet.png',
    './img/light.png',
    './img/dark.png'
  ].forEach(src => {
    const i = new Image();
    i.src = src;
    i.loading = 'lazy';
  });
});
