import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';

import Recovery from './tabs/Recovery';
import PhysioAssistant from './tabs/PhysioAssistant';
import MedLab from './tabs/MedLab';
import Mind from './tabs/Mind';
import Wearables from './tabs/Wearables';

type Theme = 'dark' | 'light' | 'ocean';
type Lang = 'en' | 'ru';

const translations: Record<Lang, Record<string, string>> = {
  en: {
    appTitle: 'Assistant Coach',
    recovery: 'Recovery',
    physio: 'PhysioAssistant',
    medlab: 'MedLab',
    mind: 'Mind',
    wearables: 'Wearables',
    logout: 'Log Out',
    settings: 'Settings',
    sheetLabel: 'Google Sheet URL',
    theme: 'Theme',
    lang: 'Language',
    profile: 'Profile',
    dark: 'Dark',
    light: 'Light',
    ocean: 'Ocean',
    english: 'English',
    russian: 'Russian',
    save: 'Save',
  },
  ru: {
    appTitle: 'Assistant Coach',
    recovery: 'Восстановление',
    physio: 'Физио-ассистент',
    medlab: 'МедЛаб',
    mind: 'Психология',
    wearables: 'Носимые устройства',
    logout: 'Выйти',
    settings: 'Настройки',
    sheetLabel: 'Google Sheet URL',
    theme: 'Тема',
    lang: 'Язык',
    profile: 'Профиль',
    dark: 'Тёмная',
    light: 'Светлая',
    ocean: 'Океан',
    english: 'Английский',
    russian: 'Русский',
    save: 'Сохранить',
  },
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Recovery');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('uiTheme') as Theme | null;
    return stored === 'dark' || stored === 'light' || stored === 'ocean' ? stored : 'dark';
  });

  const [lang, setLang] = useState<Lang>(() => {
    const stored = localStorage.getItem('uiLang') as Lang | null;
    return stored === 'ru' || stored === 'en' ? stored : 'en';
  });

  const t = translations[lang];

  useEffect(() => {
    const u = localStorage.getItem('currentUser');
    if (!u) {
      navigate('/login');
    } else {
      setUser(JSON.parse(u));
    }
  }, [navigate]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('uiTheme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('uiLang', lang);
  }, [lang]);

  if (!user) return null;

  const logout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const handleSheetUrlChange = (value: string) => {
    const updated = { ...user, sheet_url: value };
    setUser(updated);
    localStorage.setItem('currentUser', JSON.stringify(updated));
  };

  return (
    <div className="dash-wrapper">
      {/* HEADER */}
      <div className="dash-header">
        <div className="dash-title">{t.appTitle}</div>
        <button className="burger-btn" onClick={() => setSettingsOpen(true)}>
          ☰
        </button>
      </div>

      {/* MAIN LAYOUT */}
      <div className="dash-main">
        {/* SIDEBAR */}
        <div className="dash-sidebar">
          <button
            className={activeTab === 'Recovery' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setActiveTab('Recovery')}
          >
            {t.recovery}
          </button>

          <button
            className={activeTab === 'PhysioAssistant' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setActiveTab('PhysioAssistant')}
          >
            {t.physio}
          </button>

          <button
            className={activeTab === 'MedLab' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setActiveTab('MedLab')}
          >
            {t.medlab}
          </button>

          <button
            className={activeTab === 'Mind' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setActiveTab('Mind')}
          >
            {t.mind}
          </button>

          <button
            className={activeTab === 'Wearables' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setActiveTab('Wearables')}
          >
            {t.wearables}
          </button>

          <button className="logout-btn" onClick={logout}>
            {t.logout}
          </button>
        </div>

        {/* CONTENT */}
        <div className="dash-content">
          {activeTab === 'Recovery' && <Recovery />}
          {activeTab === 'PhysioAssistant' && <PhysioAssistant />}
          {activeTab === 'MedLab' && <MedLab />}
          {activeTab === 'Mind' && <Mind />}
          {activeTab === 'Wearables' && <Wearables />}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="dash-footer">© 2025 GP Innovation Company</footer>

      {/* SETTINGS MODAL */}
      {settingsOpen && (
        <div className="settings-overlay" onClick={() => setSettingsOpen(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="settings-title">⚙ {t.settings}</h2>

            <div className="settings-section">
              <label className="settings-label">{t.sheetLabel}</label>
              <input
                type="text"
                className="settings-input"
                placeholder="https://docs.google.com/..."
                value={user.sheet_url || ''}
                onChange={(e) => handleSheetUrlChange(e.target.value)}
              />
            </div>

            <div className="settings-row">
              {/* THEME DROPDOWN */}
              <div>
                <div className="settings-label">{t.theme}</div>
                <select
                  className="settings-input"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as Theme)}
                >
                  <option value="dark">{t.dark}</option>
                  <option value="light">{t.light}</option>
                  <option value="ocean">{t.ocean}</option>
                </select>
              </div>

              {/* LANGUAGE SWITCH */}
              <div>
                <div className="settings-label">{t.lang}</div>
                <div className="switch-row">
                  <span className="switch-label">{t.english}</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={lang === 'ru'}
                      onChange={(e) => setLang(e.target.checked ? 'ru' : 'en')}
                    />
                    <span className="slider" />
                  </label>
                  <span className="switch-label">{t.russian}</span>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-label">{t.profile}</div>
              <div className="profile-box">
                <p><b>Name:</b> {user.name || '—'}</p>
                <p><b>Role:</b> {user.role}</p>
                <p><b>Email:</b> {user.email}</p>
              </div>
            </div>

            <button className="save-settings" onClick={() => setSettingsOpen(false)}>
              {t.save}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
