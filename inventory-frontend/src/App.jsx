import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import Dashboard from './Pages/Dashboard';
import ArchivedProducts from './pages/ArchivedProducts';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/archived-products" element={<ArchivedProducts />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
