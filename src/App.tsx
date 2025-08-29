import React, { type JSX } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CuponesPage from "./pages/CuponesPage";
import FormCuponPage from "./pages/FormCuponPage";
import Layout from './components/Layout';
import FacturaLogoPage from './pages/FacturaLogoPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const estaLogueado = localStorage.getItem("logueado") === "true";

  // Función para proteger rutas
  const Protegida = (element: JSX.Element) => {
    return estaLogueado ? element : <Navigate to="/login" replace />;
  };

  return (
    <BrowserRouter>
      <Routes>
        
        <Route element={Protegida(<Layout />)}>
          <Route index element={<Navigate to="/admin/cupon" replace />} />
          <Route path="/admin/cupon" element={<CuponesPage />} />
          <Route path="/admin/logo/factura" element={<FacturaLogoPage />} />
        </Route>

        {/* Ruta protegida SIN layout */}
        <Route path="/admin/cupon/form" element={Protegida(<FormCuponPage />)} />

        {/* Ruta pública */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
