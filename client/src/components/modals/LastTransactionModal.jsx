import React from 'react';
import { Modal, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

const LastTransactionModal = ({ show, onHide, transactions, reportType }) => {
  const { t } = useTranslation();
  const formatDate = (dateString) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString.split('T')[0];

      return date.toLocaleDateString('en-CA'); // YYYY-MM-DD
    } catch (e) {
      return dateString.split('T')[0];
    }
  };

  const handleDownload = (customerCode = '', selectedDate) => {
    let url = `/print-report?period=date&type=${reportType}&date=${selectedDate}&code=${customerCode}`;

    // Open in new tab
    window.open(url, '_blank');
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
                <th>{t('action')}</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((transaction, index) => (
                  <tr key={index}>
                    <td>{formatDate(transaction.date) || transaction.date}</td>
                    <td>{transaction.total}</td>
                    <td>
                      <button
                        className="btn btn-info btn-sm me-1 text-white"
                        onClick={() => handleDownload(transaction.customer_supplier_code, formatDate(transaction.date))}
                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </button>
                    </td>
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
