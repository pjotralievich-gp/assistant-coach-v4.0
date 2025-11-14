import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './auth.css';
import { supabase } from '../supabaseClient';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !pw) {
      alert('Enter email and password');
      return;
    }

    try {
      setLoading(true);

      // 1. Ищем пользователя по email
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.error(error);
        alert('Login error');
        return;
      }

      if (!user) {
        alert('Account not found. Please register.');
        return;
      }

      // 2. Проверяем пароль
      if (user.password !== pw) {
        alert('Wrong email or password');
        return;
      }

      // 3. Сохраняем профиль в localStorage
      localStorage.setItem(
        'currentUser',
        JSON.stringify({
          email: user.email,
          role: user.role,
          name: user.full_name,
          sport: user.sport,
          country: user.country,
          team_code: user.team_code,
        })
      );

      // 4. Также сохраняем role — важный момент
      localStorage.setItem('role', user.role);

      nav('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade">
        <div className="brand-top">Assistant Coach</div>
        <h2 className="title">Log in to your account</h2>

        <div className="auth-form">
          <input
            className="input"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="pw-row">
            <input
              className="input"
              placeholder="Password"
              type={show ? 'text' : 'password'}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
            <button
              className="eye"
              aria-label="toggle password"
              onClick={() => setShow((s) => !s)}
            >
              {show ? '🙈' : '👁'}
            </button>
          </div>

          <button className="primary-btn" onClick={onLogin} disabled={loading}>
            {loading ? 'Checking...' : 'Login'}
          </button>

          <p className="small">
            Don't have an account? <a href="/register">Register</a>
          </p>
        </div>

        <footer className="app-footer">© 2025 GP Innovation Company</footer>
      </div>
    </div>
  );
}
