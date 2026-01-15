import './style.css';
import { createApp } from './app';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.getElementById('app');
  if (appElement) {
    createApp(appElement);
  }
});
