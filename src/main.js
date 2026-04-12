// ─────────────────────────────────────────────
//  main.js  –  application entry point
// ─────────────────────────────────────────────
import { createApp } from 'vue';
import App from './App.vue';

// Global styles (order matters)
import './styles/variables.css';
import './styles/base.css';
import './styles/components.css';

createApp(App).mount('#app');
