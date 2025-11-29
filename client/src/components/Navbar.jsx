import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Navbar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { t } = useTranslation();

  const toggleNavbar = () => setIsCollapsed(!isCollapsed);
  const closeNavbar = () => setIsCollapsed(true);

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
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;