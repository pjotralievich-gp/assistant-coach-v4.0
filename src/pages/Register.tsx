import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './auth.css';
import { supabase } from '../supabaseClient';

const COUNTRIES = ['Kazakhstan', 'USA', 'Germany', 'France', 'Japan', 'ROW'];
const SPORTS = ['Short Track', 'Speed Skating', 'Boxing', 'Ski', 'Football', 'Other'];

type Role = 'coach' | 'athlete' | 'specialist';

function genTeamCode(len = 4) {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = () =>
    Array.from({ length: len }, () => A[Math.floor(Math.random() * A.length)]).join('');
  return `${part()}-${part()}`;
}

export default function Register() {
  const nav = useNavigate();

  const [role, setRole] = useState<Role>('coach');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [country, setCountry] = useState('Kazakhstan');
  const [sport, setSport] = useState('Short Track');
  const [teamCode, setTeamCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  const onGen = () => {
    if (role === 'coach') setTeamCode(genTeamCode());
  };

  const handleSubmit = async () => {
    if (!fullName || !email || !pw) {
      alert('Please fill all required fields');
      return;
    }
    if (pw !== pw2) {
      alert('Passwords do not match');
      return;
    }

    try {
      setBusy(true);
      let code = teamCode.trim();

      // === COACH ===
      if (role === 'coach') {
        if (!code) code = genTeamCode();

        const { data: exists } = await supabase
          .from('teams')
          .select('id')
          .eq('team_code', code)
          .maybeSingle();

        if (!exists) {
          const { error: tErr } = await supabase
            .from('teams')
            .insert({ coach_name: fullName, team_code: code, sport, country });
          if (tErr) throw tErr;
        }
      }

      // === ATHLETE / SPECIALIST ===
      if (role !== 'coach' && code) {
        const { data: team } = await supabase
          .from('teams')
          .select('id')
          .eq('team_code', code)
          .maybeSingle();

        if (!team) {
          alert('Team code not found');
          setBusy(false);
          return;
        }
      }

      // === Запись в USERS TABLE ===
      const { error: uErr } = await supabase.from('users').insert([
        {
          full_name: fullName,
          email: email,
          role: role.toLowerCase(),
          country,
          sport,
          team_code: code || null,
          password: pw, // для локального логина
          created_at: new Date().toISOString()
        },
      ]);
      if (uErr) throw uErr;

      // === Локальное сохранение ===
      const currentUser = {
        email,
        password: pw,
        name: fullName,
        role,
        sport,
        team_code: code || null,
        country
      };

      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      localStorage.setItem(`user:${email}`, JSON.stringify(currentUser));

      nav('/login');
    } catch (e: any) {
      alert('Registration error: ' + (e.message || e));
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade">
        <div className="brand-top">Assistant Coach</div>
        <h2 className="title">Create your account</h2>

        {/* ROLE SWITCH */}
        <div className="role-switch">
          <button className={role === 'coach' ? 'active' : ''} onClick={() => setRole('coach')}>
            Coach
          </button>
          <button className={role === 'athlete' ? 'active' : ''} onClick={() => setRole('athlete')}>
            Athlete
          </button>
          <button
            className={role === 'specialist' ? 'active' : ''}
            onClick={() => setRole('specialist')}
          >
            Specialist
          </button>
        </div>

        {/* FORM */}
        <div className="auth-form">
          <input
            className="input"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
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
              type={show1 ? 'text' : 'password'}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
            <button className="eye" onClick={() => setShow1(!show1)}>
              {show1 ? '🙈' : '👁'}
            </button>
          </div>

          <div className="pw-row">
            <input
              className="input"
              placeholder="Confirm password"
              type={show2 ? 'text' : 'password'}
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
            />
            <button className="eye" onClick={() => setShow2(!show2)}>
              {show2 ? '🙈' : '👁'}
            </button>
          </div>

          {/* TWO COLUMNS */}
          <div className="two-cols">
            <div>
              <label className="lbl">Country</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)}>
                {COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="lbl">Sport</label>
              <select value={sport} onChange={(e) => setSport(e.target.value)}>
                {SPORTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* TEAM CODE */}
          {role === 'coach' ? (
            <div className="team-row">
              <input
                className="input"
                placeholder="Team code"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value)}
              />
              <button className="secondary-btn" onClick={onGen}>
                Generate
              </button>
            </div>
          ) : (
            <input
              className="input"
              placeholder="Team code (optional)"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value)}
            />
          )}

          <button className="primary-btn" disabled={busy} onClick={handleSubmit}>
            {busy ? 'Creating...' : 'Create Account'}
          </button>

          <p className="small">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>

        <footer className="app-footer">© 2025 GP Innovation Company</footer>
      </div>
    </div>
  );
}
