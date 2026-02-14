import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css'; // Import custom styles for the navbar

function Navbar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation(); // To highlight the active link

  const toggleNavbar = () => setIsCollapsed(!isCollapsed);
  const closeNavbar = () => setIsCollapsed(true);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  // Helper to check if a link is active
  const isActive = (path) => location.pathname === path ? 'active-link' : '';

  return (
    <nav className="navbar navbar-expand-lg sticky-top shadow-sm custom-navbar">
      <div className="container">
        <Link className="navbar-brand fw-bold text-primary" to="/" onClick={closeNavbar}>
          <i className="bi bi-box-seam me-2"></i>{t('appTitle') || "InventoryPro"}
        </Link>

        {user && (
          <button
            className="navbar-toggler border-0"
            type="button"
            onClick={toggleNavbar}
            aria-expanded={!isCollapsed}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        )}

        {user && (
          <div className={`collapse navbar-collapse ${!isCollapsed ? 'show' : ''}`}>
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
              {[
                { path: '/customers', label: 'customer' },
                { path: '/suppliers', label: 'supplier' },
                { path: '/products', label: 'product' },
                { path: '/entries', label: 'entry' },
                { path: '/report', label: 'report' },
                { path: '/stocks', label: 'stocks' },
                { path: '/debit-credit', label: 'debitCredit' },
                { path: '/settings', label: 'settings' },
              ].map((item) => (
                <li className="nav-item" key={item.path}>
                  <Link
                    className={`nav-link px-1 mx-1 hover-underline ${isActive(item.path)}`}
                    to={item.path}
                    onClick={closeNavbar}
                  >
                    {t(item.label)}
                  </Link>
                </li>
              ))}

              {user.role === 'admin' && (
                <li className="nav-item">
                  <Link className={`nav-link px-3 mx-1 admin-link ${isActive('/users')}`} to="/users" onClick={closeNavbar}>
                    {t('manage_users')}
                  </Link>
                </li>
              )}
            </ul>

            <div className="d-flex align-items-center gap-2">
              {/* Language Toggle Group */}
              <div className="btn-group btn-group-sm me-2" role="group">
                <button
                  className={`btn ${i18n.language === 'en' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => changeLanguage('en')}
                >
                  EN
                </button>
                <button
                  className={`btn ${i18n.language === 'ta' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => changeLanguage('ta')}
                >
                  TA
                </button>
              </div>

              <button className="btn btn-danger btn-sm px-3 rounded-pill" onClick={logout}>
                {t('logout')}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;