import React from 'react';
import { BrowserRouter as Router, Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import CuponesPage from "./pages/CuponesPage";
import FormCuponPage from "./pages/FormCuponPage";
import Layout from './components/Layout';
import FacturaLogoPage from './pages/FacturaLogoPage';

function App() {
  return (
     <BrowserRouter>
      <Routes>
        {/* Rutas que SI usan Layout */}
        <Route element={<Layout  />}>
          {/* index: redirige al módulo principal */}
          <Route index element={<Navigate to="/admin/cupon" replace />} />
          <Route path="/admin/cupon" element={<CuponesPage />} />
          <Route path="/admin/logo/factura" element={<FacturaLogoPage />} />
        </Route>

        {/* Rutas que NO usan Layout */}
        <Route path="/admin/cupon/form" element={<FormCuponPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
