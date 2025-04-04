import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useLoadingBar } from '../../contexts/LoadingBarContext';
import axios from 'axios';
import API_BASE_URL from '../../constants/PAGE_URL';
import '../../App.css';

const Login = () => {
  const navigate = useNavigate();
  const { setIsLoadingBar } = useLoadingBar();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      setIsLoadingBar(true);
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        username,
        password
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        navigate('/feed');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setIsLoadingBar(false);
      setIsLoading(false);
    }
  };

  return (
    <div className={`register-container ${useDarkMode().effectiveMode === 'dark' ? 'dark' : ''}`}>
      <h1>Iniciar Sesión</h1>
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label htmlFor="username">Nombre:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button 
          type="submit" 
          className="register-button"
          disabled={isLoading}
        >
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>

        <p className="register-link">
          ¿No tienes cuenta?{' '}
          <span
            onClick={() => navigate('/register')}
            style={{ cursor: 'pointer', color: '#3d9bff' }}
          >
            Regístrate
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;