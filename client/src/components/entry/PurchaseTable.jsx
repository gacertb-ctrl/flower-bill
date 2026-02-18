import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import DataTableBase from '../DataTableBase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen, faRotateLeft } from '@fortawesome/free-solid-svg-icons'; // Import Pen icon

const PurchaseTable = ({ data, handleDelete, handleEdit }) => {
  const { t } = useTranslation();
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');

  // 1. Extract Unique Lists
  const supplierOptions = useMemo(() => {
    return [...new Set(data.map(item => item.customer_supplier_name))].sort();
  }, [data]);

  const productOptions = useMemo(() => {
    return [...new Set(data.map(item => item.product_name))].sort();
  }, [data]);

  // 2. Filter Data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSupplier = selectedSupplier ? item.customer_supplier_name === selectedSupplier : true;
      const matchProduct = selectedProduct ? item.product_name === selectedProduct : true;
      return matchSupplier && matchProduct;
    });
  }, [data, selectedSupplier, selectedProduct]);

  // 3. Define Columns
  const columns = [
    { name: t('S.No'), selector: (row, index) => index + 1, width: '70px', sortable: true },
    { name: t('supplier.name'), selector: row => row.customer_supplier_name, sortable: true },
    { name: t('product.name'), selector: row => row.product_name, sortable: true },
    { name: t('price'), selector: row => (row.purchase_rate || 0).toFixed(2), sortable: true },
    { name: t('quantity'), selector: row => (row.purchase_quality || 0).toFixed(2), sortable: true },
    { name: t('total'), selector: row => (row.purchase_total || 0).toFixed(2), sortable: true },
    {
      name: t('action'),
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="btn btn-soft-primary rounded-circle border-0" onClick={() => handleEdit(row)}>
            <FontAwesomeIcon icon={faPen} size="xs" />
          </button>
          <button className="btn btn-soft-danger rounded-circle border-0" onClick={() => handleDelete(row.purchase_id)}>
            <FontAwesomeIcon icon={faTrash} size="xs" />
          </button>
        </div>
      ),
      button: true,
      width: '120px' // Increased width for 2 buttons
    },
  ];

  const clearFilters = () => {
    setSelectedSupplier(''); // or setSelectedSupplier('') for PurchaseTable
    setSelectedProduct('');
  };

  return (
    <>
      <div className="filter-bar bg-light p-3 rounded-4 mb-3 d-flex gap-2">
        <div className="flex-grow-1">
          <select className="form-select border-0 shadow-xs" value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)}>
            <option value="">{t('all')} {t('supplier')}</option>
            {supplierOptions.map(name => (
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
      <DataTableBase columns={columns} data={filteredData} t={t} />
    </>
  );
};

export default PurchaseTable;