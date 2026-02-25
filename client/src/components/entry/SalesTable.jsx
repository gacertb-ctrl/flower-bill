import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import DataTableBase from '../DataTableBase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { updateSalesEntry } from '../../api/entryAPI';

const SalesTable = ({ data, handleDelete, handleEdit }) => {
  const { t } = useTranslation();
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');

  // 1. Extract Unique Lists
  const customerOptions = useMemo(() => {
    return [...new Set(data.map(item => item.customer_supplier_name))].sort();
  }, [data]);

  const productOptions = useMemo(() => {
    return [...new Set(data.map(item => item.product_name))].sort();
  }, [data]);

  // 2. Filter Data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchCustomer = selectedCustomer ? item.customer_supplier_name === selectedCustomer : true;
      const matchProduct = selectedProduct ? item.product_name === selectedProduct : true;
      return matchCustomer && matchProduct;
    });
  }, [data, selectedCustomer, selectedProduct]);

  // 3. Define Columns
  const columns = [
    { name: t('S.No'), selector: (row, index) => index + 1, width: '70px', sortable: true },
    { name: t('customer.name'), selector: row => row.customer_supplier_name, sortable: true },
    { name: t('product.name'), selector: row => row.product_name, sortable: true },
    { name: t('price'), selector: row => (row.sales_rate || 0).toFixed(2), sortable: true },
    { name: t('quantity'), selector: row => (row.sales_quality || 0).toFixed(2), sortable: true },
    { name: t('unit'), selector: row => t(row.sales_unit), sortable: true },
    { name: t('total'), selector: row => (row.sales_total || 0).toFixed(2), sortable: true },
    {
      name: t('action'),
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="btn btn-soft-primary rounded-circle border-0" onClick={() => handleEdit(row)}>
            <FontAwesomeIcon icon={faPen} size="xs" />
          </button>
          <button className="btn btn-soft-danger rounded-circle border-0" onClick={() => handleDelete(row.sales_id)}>
            <FontAwesomeIcon icon={faTrash} size="xs" />
          </button>
        </div>
      ),
      button: true,
    },
  ];

  const clearFilters = () => {
    setSelectedCustomer(''); // or setSelectedSupplier('') for PurchaseTable
    setSelectedProduct('');
  };

  return (
    <>
      {/* Filters Section */}
      <div className="filter-bar bg-light p-3 rounded-4 mb-3 d-flex gap-2">
        <div className="flex-grow-1">
          <select className="form-select border-0 shadow-xs" value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
            <option value="">{t('all')} {t('customer')}</option>
            {customerOptions.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <div className="flex-grow-1">
          <select className="form-select border-0 shadow-xs" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
            <option value="">{t('all')} {t('product')}</option>
            {productOptions.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-white shadow-xs" onClick={clearFilters}><FontAwesomeIcon icon={faRotateLeft} /></button>
      </div>

      {/* Table Section */}
      <DataTableBase columns={columns} data={filteredData} t={t} />
    </>
  );
};

export default SalesTable;