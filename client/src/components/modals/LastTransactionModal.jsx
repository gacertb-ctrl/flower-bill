import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Form, Row, Col, Button, Badge, InputGroup } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faSearch, faCalendarAlt, faHistory, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import { getLastSupplierTransactions } from '../../api/supplierAPI';
import { getLastCustomerTransactions } from '../../api/customerAPI';

const LastTransactionModal = ({ show, onHide, transactions: initialTransactions, reportType }) => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);

  const getCode = () => initialTransactions.length > 0 ? initialTransactions[0].customer_supplier_code : '';

  useEffect(() => {
    setData(initialTransactions);
  }, [initialTransactions]);

  const handleFilter = async () => {
    const code = getCode();
    if (!code) return;
    setLoading(true);
    try {
      let response;
      if (reportType === 'supplier') {
        response = await getLastSupplierTransactions(code, fromDate, toDate);
      } else {
        response = await getLastCustomerTransactions({ cus_sup_code: code, fromDate, toDate });
      }
      setData(response.data);
    } catch (error) {
      console.error("Filter failed", error);
    } finally {
      setLoading(false);
    }
  };

  // Modern Table Custom Styles
  const customStyles = {
    header: { style: { minHeight: '56px' } },
    headRow: {
      style: {
        borderTopStyle: 'solid',
        borderTopWidth: '1px',
        borderTopColor: '#f2f2f2',
        backgroundColor: '#f8f9fa',
      },
    },
    headCells: {
      style: {
        fontWeight: 'bold',
        fontSize: '0.85rem',
        color: '#495057',
        textTransform: 'uppercase',
      },
    },
    cells: {
      style: {
        fontSize: '0.9rem',
        paddingTop: '12px',
        paddingBottom: '12px',
      },
    },
  };

  const columns = useMemo(() => [
    {
      name: t('date'),
      selector: row => row.date ? row.date.split('T')[0] : '',
      sortable: true,
      grow: 1,
    },
    {
      name: t('type'),
      sortable: true,
      grow: 1,
      cell: (row) => (
        <Badge
          pill
          className="px-3 py-2"
          bg={row.type === 'purchase' || row.type === 'sales' ? 'danger' : 'success'}
          style={{ fontSize: '0.75rem', minWidth: '80px' }}
        >
          <FontAwesomeIcon icon={faExchangeAlt} className="me-1" />
          {t(row.type).toUpperCase()}
        </Badge>
      ),
    },
    {
      name: t('total'),
      selector: row => parseFloat(row.total).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      sortable: true,
      right: true,
      grow: 1,
      style: { fontWeight: '600', color: '#2c3e50' }
    },
    {
      name: t('action'),
      center: true,
      cell: (row) => (
        <Button
          variant="outline-primary"
          size="sm"
          className="rounded-circle shadow-sm"
          onClick={() => window.open(`/print-report?period=date&type=${row.type}&code=${row.customer_supplier_code}&date=${row.date.split('T')[0]}`, '_blank')}
          style={{ width: '35px', height: '35px' }}
        >
          <FontAwesomeIcon icon={faDownload} />
        </Button>
      ),
      button: true,
    },
  ], [t]);

  return (
    <Modal show={show} onHide={onHide} centered size="lg" className="transaction-modal">
      <Modal.Header closeButton className="bg-primary text-white shadow-sm border-0">
        <Modal.Title className="fs-5 fw-bold">
          <FontAwesomeIcon icon={faHistory} className="me-2" />
          {t('transaction history')}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="bg-light px-4 py-4">
        {/* Filter Card */}
        <div className="bg-white p-3 rounded-4 shadow-sm mb-4 border-0">
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Label className="small fw-bold text-muted mb-2">
                <FontAwesomeIcon icon={faCalendarAlt} className="me-1" /> {t('from date')}
              </Form.Label>
              <Form.Control
                type="date"
                className="form-control-sm border-0 bg-light"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
              />
            </Col>
            <Col md={4}>
              <Form.Label className="small fw-bold text-muted mb-2">
                <FontAwesomeIcon icon={faCalendarAlt} className="me-1" /> {t('to date')}
              </Form.Label>
              <Form.Control
                type="date"
                className="form-control-sm border-0 bg-light"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
              />
            </Col>
            <Col md={4}>
              <Button
                variant="primary"
                className="w-100 fw-bold shadow-sm"
                onClick={handleFilter}
                disabled={loading}
              >
                {loading ? '...' : <><FontAwesomeIcon icon={faSearch} className="me-2" /> {t('filter')}</>}
              </Button>
            </Col>
          </Row>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-4 shadow-sm overflow-hidden border-0">
          <DataTable
            columns={columns}
            data={data}
            progressPending={loading}
            pagination
            paginationPerPage={5}
            paginationRowsPerPageOptions={[5, 10, 15]}
            highlightOnHover
            customStyles={customStyles}
            noDataComponent={
              <div className="p-5 text-center text-muted">
                <FontAwesomeIcon icon={faHistory} size="3x" className="mb-3 opacity-25" />
                <p>{t('no transactions found')}</p>
              </div>
            }
          />
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default LastTransactionModal;