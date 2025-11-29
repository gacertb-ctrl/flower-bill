import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import DataTableBase from '../DataTableBase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';

const SalesTable = ({ data, handleDelete }) => {
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
    { name: t('total'), selector: row => (row.sales_total || 0).toFixed(2), sortable: true },
    {
      name: t('action'),
      cell: (row) => (
        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.sales_id)}>
          <FontAwesomeIcon icon={faTrash} />
        </button>
      ),
      button: true,
    },
  ];

  return (
    <>
      {/* Filters Section */}
      <div className="row mb-3">
        <div className="col-md-4">
          <select
            className="form-select"
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
          >
            <option value="">{t('select.customer') || "All Customers"}</option>
            {customerOptions.map((name, i) => (
              <option key={i} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="">{t('select.product') || "All Products"}</option>
            {productOptions.map((name, i) => (
              <option key={i} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4 d-flex align-items-end">
          <button
            className="btn btn-secondary w-100"
            onClick={() => { setSelectedCustomer(''); setSelectedProduct(''); }}
          >
            {t('clear') || "Clear Filters"}
          </button>
        </div>
      </div>

      {/* Table Section */}
      <DataTableBase columns={columns} data={filteredData} t={t} />
    </>
  );
};

export default SalesTable;