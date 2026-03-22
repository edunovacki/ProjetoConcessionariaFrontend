import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import Login from '../pages/Login';
import Cadastro from '../pages/Cadastro';
import Clientes from '../pages/Clientes';
import ClienteForm from '../pages/ClienteForm';
import Dashboard from '../pages/Dashboard';
import Veiculos from '../pages/Veiculos';
import VeiculoForm from '../pages/VeiculoForm';
import Orcamentos from '../pages/Orcamentos';
import OrcamentoForm from '../pages/OrcamentoForm';

const Perfil = () => <div>Meu Perfil</div>;

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          
          {/* Rotas protegidas com Layout */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/clientes" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Clientes />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/clientes/novo" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ClienteForm />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/clientes/editar/:id" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ClienteForm />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/veiculos" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Veiculos />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/veiculos/novo" 
            element={
              <ProtectedRoute>
                <Layout>
                  <VeiculoForm />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/veiculos/editar/:id" 
            element={
              <ProtectedRoute>
                <Layout>
                  <VeiculoForm />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orcamentos" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Orcamentos />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orcamentos/novo" 
            element={
              <ProtectedRoute>
                <Layout>
                  <OrcamentoForm />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orcamentos/editar/:id" 
            element={
              <ProtectedRoute>
                <Layout>
                  <OrcamentoForm />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/perfil" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Perfil />
                </Layout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;