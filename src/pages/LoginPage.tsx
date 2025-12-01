import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import '../styles/auth.css';

export default function LoginPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const isLogin = searchParams.get('mode') !== 'signup';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      if (isLogin) {
        if (!email || !password) {
          throw new Error('Please enter email and password.');
        }
        await login({ email, password });
        navigate('/dashboard');
      } else {
        if (!fullName || !email || !password || !confirmPassword) {
          throw new Error('Please fill in all fields.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        await register({ fullName, email, password });
        navigate('/dashboard');
      }
    } catch (error: any) {
      setMessage(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <motion.div
        className="auth-header"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h1
          className="auth-title"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Trello Clone
        </motion.h1>
        <motion.p
          className="auth-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          Organize your projects with ease
        </motion.p>
      </motion.div>
      <div className="auth-card">
        <div className="auth-tabs">
          <button
            onClick={() => {
              setSearchParams({});
              setMessage('');
            }}
            className={`auth-tab ${isLogin ? 'auth-tab-active' : 'auth-tab-inactive'}`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setSearchParams({ mode: 'signup' });
              setMessage('');
            }}
            className={`auth-tab ${!isLogin ? 'auth-tab-active' : 'auth-tab-inactive'}`}
          >
            Sign Up
          </button>
        </div>
        <h2 className="auth-form-title">
          {isLogin ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="auth-form-subtitle">
          {isLogin
            ? 'Enter your credentials to access your boards'
            : 'Sign up to start organizing your projects'}
        </p>
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="auth-form-group">
              <label className="auth-label">Full Name</label>
              <input
                type="text"
                className="auth-input"
                placeholder="Enter your full name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}
          <div className="auth-form-group">
            <label className="auth-label">Email</label>
            <input
              type="email"
              className="auth-input"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="auth-form-group">
            <label className="auth-label">Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {!isLogin && (
            <div className="auth-form-group">
              <label className="auth-label">Confirm Password</label>
              <input
                type="password"
                className="auth-input"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}
          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>
        {message && <p className="auth-message" style={{ color: message.includes('success') ? 'green' : 'red' }}>{message}</p>}
      </div>
    </div>
  );
}