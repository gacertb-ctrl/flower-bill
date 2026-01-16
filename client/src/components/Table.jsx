import React from 'react';
import { useTranslation } from 'react-i18next';
import DataTableBase from './DataTableBase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const Table = ({ page, data, setShowModal, setEditData, loadLastTransaction, deleteData }) => {
  const { t } = useTranslation();
  const { user } = useAuth();


  const handleEdit = (row) => {
    setEditData(row);
    setShowModal(true);
  };

  // Define Columns based on the Page Type
  const getColumns = () => {
    const commonActions = {
      name: t('action'),
      cell: (row) => (

        <div className="d-flex">
          <button
            className="btn btn-primary btn-sm me-1"
            title={t('edit')}
            onClick={() => handleEdit(row)}
          >
            <FontAwesomeIcon icon={faPen} />
          </button>
          <button
            className="btn btn-info btn-sm me-1 text-white"
            title={t('last transaction')}
            onClick={() => loadLastTransaction(page === 'product' ? page : row.code, row.customer_supplier_id)}
          >
            <FontAwesomeIcon icon={faClockRotateLeft} />
          </button>
          {page !== 'product' && user.role === 'admin' && (
            <button
              className="btn btn-danger btn-sm"
              title={t('confirm.delete')}
              onClick={() => deleteData(row.code)}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          )}
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: '150px'
    };

    switch (page) {
      case 'customer':
        return [
          { name: t('S.No'), selector: (row, index) => index + 1, width: '70px', sortable: true },
          { name: t('customer.code'), selector: row => row.code, sortable: true },
          { name: t('customer.name'), selector: row => row.name, sortable: true },
          { name: t('customer.contact no'), selector: row => row.contact, sortable: true },
          { name: t('customer.address'), selector: row => row.address, sortable: true, wrap: true },
          { 
            name: t('total outstanding'), 
            selector: row => (parseFloat(row.debit_amount || 0) - parseFloat(row.credit_amount || 0)).toFixed(2), 
            sortable: true 
          },
          commonActions
        ];

      case 'supplier':
        return [
          { name: t('S.No'), selector: (row, index) => index + 1, width: '70px', sortable: true },
          { name: t('supplier.code'), selector: row => row.code, sortable: true },
          { name: t('supplier.name'), selector: row => row.name, sortable: true },
          { name: t('supplier.contact no'), selector: row => row.contact, sortable: true },
          { name: t('supplier.address'), selector: row => row.address, sortable: true, wrap: true },
          { name: t('Commission'), selector: row => row.commission, sortable: true },
          { 
            name: `${t('total outstanding')} / ${t('total debit')}`, 
            selector: row => {
              const debit = parseFloat(row.debit_amount || 0);
              const credit = parseFloat(row.credit_amount || 0);
              if (debit > credit) return `0 / ${(debit - credit).toFixed(2)}`;
              if (debit < credit) return `${(credit - debit).toFixed(2)} / 0`;
              return '0 / 0';
            },
            sortable: true
          },
          commonActions
        ];

      case 'product':
        return [
          { name: t('product.code'), selector: row => row.code, sortable: true },
          { name: t('product.name'), selector: row => row.name, sortable: true },
          { name: t('product.price'), selector: row => row.price, sortable: true },
          { name: t('product.quality'), selector: row => row.quality, sortable: true },
          { name: t('product.unit'), selector: row => row.unit, sortable: true },
          commonActions
        ];

      case 'stocks':
        return [
          { name: t('S.No'), selector: (row, index) => index + 1, width: '70px', sortable: true },
          { name: t('product.name'), selector: row => row.product_name, sortable: true },
          { name: t('total.purchase.quantity'), selector: row => Number(row.total_purchase_quality).toFixed(2), sortable: true },
          { name: t('total.sales.quantity'), selector: row => Number(row.total_sales_quality).toFixed(2), sortable: true },
          { 
            name: t('quantity'), 
            selector: row => Number(row.total_purchase_quality - row.total_sales_quality).toFixed(2), 
            sortable: true,
            // Conditional styling: Highlight low stock in red
            conditionalCellStyles: [
              {
                when: row => (row.total_purchase_quality - row.total_sales_quality) <= 0,
                style: { color: 'red', fontWeight: 'bold' },
              },
            ]
          },
        ];

      default:
        return [];
    }
  };

  if (!data || data.length === 0) {
    return <div className="alert alert-info">{t('noDataAvailable')}</div>;
  }

  return (
    <DataTableBase
      columns={getColumns()}
      data={data}
      t={t}
    />
  );
};

export default Table;