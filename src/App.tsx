import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CuponesPage from "./pages/CuponesPage";
import FormCuponPage from "./pages/FormCuponPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CuponesPage />} />
        <Route path="/crear" element={<FormCuponPage />} />
        <Route path="/editar/:id" element={<FormCuponPage />} />
      </Routes>
    </Router>
  );
}

export default App;
