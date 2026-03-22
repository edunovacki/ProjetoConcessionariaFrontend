import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validarEmail } from '../utils/validations';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Usando o contexto
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!email || !senha) {
      setErro('Preencha todos os campos');
      return;
    }

    if (!validarEmail(email)) {
      setErro('Digite um email válido (ex: nome@email.com)');
      return;
    }

    setCarregando(true);

    try {
      // Simulando uma requisição à API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulando validação de credenciais
      if (email === 'admin@concessionaria.com' && senha === '123456') {
        // Usando o contexto para fazer login
        const tokenSimulado = 'fake-jwt-token-123456';
        const userData = {
          id: 1,
          nome: 'Administrador',
          email: email
        };
        
        login(tokenSimulado, userData);
        navigate('/dashboard');
      } else {
        setErro('Email ou senha inválidos');
      }
    } catch (error) {
      setErro('Erro ao fazer login. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Sistema Concessionária</h1>
        <h2 style={styles.subtitle}>Login</h2>
        
        {erro && <div style={styles.erro}>{erro}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="seu@email.com"
              disabled={carregando}
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Senha:</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={styles.input}
              placeholder="********"
              disabled={carregando}
            />
          </div>
          
          <button 
            type="submit" 
            style={styles.button}
            disabled={carregando}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
          
          <p style={styles.linkContainer}>
            Não tem uma conta? <Link to="/cadastro" style={styles.link}>Cadastre-se</Link>
          </p>
        </form>
        
        <p style={styles.info}>
          Credenciais de teste: admin@concessionaria.com / 123456
        </p>
      </div>
    </div>
  );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
    },
    card: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
    },
    title: {
        fontSize: '24px',
        color: '#333',
        marginBottom: '8px',
        textAlign: 'center' as const
    },
    subtitle: {
        fontSize: '18px',
        color: '#666',
        marginBottom: '24px',
        textAlign: 'center' as const
    },
    form: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '16px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px'
    },
    label: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#333'
    },
    input: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px'
    },
    button: {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '12px',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: 'pointer',
        marginTop: '8px'
    },
    erro: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '16px',
        border: '1px solid #f5c6cb'
    },
    info: {
        marginTop: '20px',
        fontSize: '12px',
        color: '#666',
        textAlign: 'center' as const
    },
    linkContainer: {
        marginTop: '16px',
        textAlign: 'center' as const,
        fontSize: '14px'
    },
    link: {
        color: '#007bff',
        textDecoration: 'none',
        fontWeight: 'bold'
    }
};

export default Login;