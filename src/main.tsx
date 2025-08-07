import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { PrimeReactProvider } from 'primereact/api'
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import './index.css'; // Aquí cargas Tailwind después

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrimeReactProvider>
    <App />
    </PrimeReactProvider>
  </StrictMode>,
)
