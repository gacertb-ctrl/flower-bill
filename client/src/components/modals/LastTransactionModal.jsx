import React from 'react';
import { Modal, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const LastTransactionModal = ({ show, onHide, transactions }) => {
  const { t } = useTranslation();
  const formatDate = (dateString) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      if (isNaN(date)) return dateString.split('T')[0];

      return date.toISOString().split('T')[0];
    } catch (e) {
      return dateString.split('T')[0];
    }
  };
  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{t('last transaction')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="table-responsive">
          <Table bordered striped hover>
            <thead>
              <tr>
                <th>{t('date')}</th>
                <th>{t('total')}</th>
                <th>{t('code')}</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((transaction, index) => (
                  <tr key={index}>
                    <td>{formatDate(transaction.date) || transaction.date}</td>
                    <td>{transaction.total}</td>
                    <td>{ }</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center">
                    {t('no transactions found')}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default LastTransactionModal;