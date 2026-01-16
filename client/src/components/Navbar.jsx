import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext'; // Import your AuthContext

function Navbar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth(); // Get user data

  const toggleNavbar = () => setIsCollapsed(!isCollapsed);
  const closeNavbar = () => setIsCollapsed(true);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  return (
    <nav className="navbar navbar-expand-lg bg-light fixed-top">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/" onClick={closeNavbar}>
          {t('appTitle') || "MyApp"}
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleNavbar}
          aria-controls="navbarNav"
          aria-expanded={!isCollapsed}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${!isCollapsed ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/customers" onClick={closeNavbar}>{t('customer')}</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/suppliers" onClick={closeNavbar}>{t('supplier')}</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/products" onClick={closeNavbar}>{t('product')}</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/entries" onClick={closeNavbar}>{t('entry')}</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/report" onClick={closeNavbar}>{t('report')}</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/stocks" onClick={closeNavbar}>{t('stocks')}</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/debit-credit" onClick={closeNavbar}>{t('debitCredit')}</Link>
            </li>
            {/* New Settings Link */}
            <li className="nav-item">
              <Link className="nav-link" to="/settings">{t('settings')}</Link>
            </li>

            {/* Admin Only Link */}
            {user && user.role === 'admin' && (
              <li className="nav-item">
                <Link className="nav-link" to="/users">{t('manage_users')}</Link>
              </li>
            )}
          </ul>
          {/* Language Switch */}
          <div className="d-flex align-items-center me-3">
            <button
              className={`btn btn-sm me-1 ${i18n.language === 'en' ? 'btn-dark' : 'btn-outline-dark'
                }`}
              onClick={() => changeLanguage('en')}
            >
              EN
            </button>

            <button
              className={`btn btn-sm ${i18n.language === 'ta' ? 'btn-dark' : 'btn-outline-dark'
                }`}
              onClick={() => changeLanguage('ta')}
            >
              TA
            </button>
          </div>
          <button className="btn btn-outline-dark" onClick={logout}>{t('logout')}</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;