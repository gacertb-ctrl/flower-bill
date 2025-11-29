import React from 'react';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
  const { t } = useTranslation();
  return (
    <div className="modal fade" id="loader" tabIndex={-1} aria-hidden="true">
      <div className="modal-dialog modal-sm modal-dialog-centered">
        <div className="modal-content">
          <div className="spinner-border" style={{ width: '6rem', height: '6rem' }} role="status">
            <span className="visually-hidden">{t('loading')}</span>
            <span>{t('welcome') || "Welcome"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;