import React, { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // ← useLocation importado
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // ← VARIÁVEL LOCATION CRIADA AQUI

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <h2>Concessionária</h2>
        </div>
        
        <nav style={styles.nav}>
          <Link 
            to="/dashboard" 
            style={{
              ...styles.navLink,
              ...(location.pathname === '/dashboard' ? styles.navLinkActive : {}) // ← USANDO LOCATION
            }}
          >
            📊 Dashboard
          </Link>
          <Link 
            to="/clientes" 
            style={{
              ...styles.navLink,
              ...(location.pathname === '/clientes' ? styles.navLinkActive : {}) // ← USANDO LOCATION
            }}
          >
            👥 Clientes
          </Link>
          <Link 
            to="/veiculos" 
            style={{
              ...styles.navLink,
              ...(location.pathname === '/veiculos' ? styles.navLinkActive : {}) // ← USANDO LOCATION
            }}
          >
            🚗 Veículos
          </Link>
          <Link 
            to="/orcamentos" 
            style={{
              ...styles.navLink,
              ...(location.pathname === '/orcamentos' ? styles.navLinkActive : {}) // ← USANDO LOCATION
            }}
          >
            📝 Orçamentos
          </Link>
          <Link 
            to="/perfil" 
            style={{
              ...styles.navLink,
              ...(location.pathname === '/perfil' ? styles.navLinkActive : {}) // ← USANDO LOCATION
            }}
          >
            👤 Meu Perfil
          </Link>
        </nav>
        
        <div style={styles.userInfo}>
          <div style={styles.userName}>
            {user?.nome || 'Usuário'}
          </div>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Sair
          </button>
        </div>
      </aside>
      
      <main style={styles.main}>
        <header style={styles.header}>
          <h1>Bem-vindo, {user?.nome || 'Usuário'}!</h1>
        </header>
        <div style={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  },
  sidebar: {
    width: '250px',
    backgroundColor: '#2c3e50',
    color: 'white',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'fixed' as const,
    height: '100vh',
    overflowY: 'auto' as const
  },
  logo: {
    padding: '20px',
    borderBottom: '1px solid #34495e',
    textAlign: 'center' as const
  },
  nav: {
    flex: 1,
    padding: '20px 0',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px'
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    padding: '12px 20px',
    transition: 'background-color 0.3s',
    display: 'block'
  },
  navLinkActive: {
    backgroundColor: '#34495e',
    borderLeft: '4px solid #3498db'
  },
  userInfo: {
    padding: '20px',
    borderTop: '1px solid #34495e',
    textAlign: 'center' as const
  },
  userName: {
    marginBottom: '10px',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
    fontSize: '14px'
  },
  main: {
    flex: 1,
    marginLeft: '250px',
    padding: '20px'
  },
  header: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  content: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    minHeight: 'calc(100vh - 120px)'
  }
};

export default Layout;