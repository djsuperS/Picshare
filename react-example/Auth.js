import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

const Auth = () => {
  const navigate = useNavigate();
  
  // State voor login formulier
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State voor registratie formulier
  const [username, setUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI state
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Functie voor inloggen
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validatie
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }
    
    setLoading(true);
    try {
      const { success, data } = await api.auth.login({
        email: email,
        password: password
      });
      
      if (success) {
        // Sla token op en navigeer naar albums pagina
        api.auth.setToken(data.token);
        setSuccess('Login successful!');
        
        // Korte vertraging voor gebruiker om melding te zien
        setTimeout(() => {
          navigate('/albums');
        }, 1000);
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Functie voor registreren
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validatie
    if (!username.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      setError('All fields are required');
      return;
    }
    
    if (registerPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (registerPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    try {
      const { success, data } = await api.auth.register({
        username: username,
        email: registerEmail,
        password: registerPassword
      });
      
      if (success) {
        setSuccess('Registration successful! Please login with your new account.');
        
        // Velden resetten en naar login gaan
        setUsername('');
        setRegisterEmail('');
        setRegisterPassword('');
        setConfirmPassword('');
        
        // Na korte vertraging naar login
        setTimeout(() => {
          setIsLogin(true);
          setSuccess(null);
        }, 2000);
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Tussen login en registratie wisselen
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccess(null);
  };
  
  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="logo-container">
          <h1>Picshare</h1>
          <p className="tagline">Share your moments with friends and family</p>
        </div>
        
        {/* Tabs voor login/registratie */}
        <div className="auth-tabs">
          <button 
            className={`tab-button ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={`tab-button ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>
        
        {/* Fout- en succesmeldingen */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        {/* Login formulier */}
        {isLogin ? (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            
            <p className="switch-auth">
              Don't have an account? 
              <button 
                type="button"
                className="text-button"
                onClick={toggleAuthMode}
              >
                Register here
              </button>
            </p>
          </form>
        ) : (
          /* Registratie formulier */
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="registerEmail">Email</label>
              <input
                type="email"
                id="registerEmail"
                placeholder="your@email.com"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="registerPassword">Password</label>
              <input
                type="password"
                id="registerPassword"
                placeholder="Min 8 characters"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
            
            <p className="switch-auth">
              Already have an account? 
              <button 
                type="button"
                className="text-button"
                onClick={toggleAuthMode}
              >
                Login here
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth; 