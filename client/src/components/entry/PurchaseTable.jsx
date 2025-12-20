import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import DataTableBase from '../DataTableBase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons'; // Import Pen icon

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
          {/* Edit Button */}
          <button className="btn btn-primary btn-sm" onClick={() => handleEdit(row, 'purchase')}>
            <FontAwesomeIcon icon={faPen} />
          </button>
          {/* Delete Button */}
          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.purchase_id)}>
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      ),
      button: true,
      width: '120px' // Increased width for 2 buttons
    },
  ];

  return (
    <>
      <div className="row mb-3">
        <div className="col-md-4">
          <select className="form-select" value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)}>
            <option value="">{t('select.supplier')}</option>
            {supplierOptions.map((name, i) => <option key={i} value={name}>{name}</option>)}
          </select>
        </div>
        <div className="col-md-4">
          <select className="form-select" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
            <option value="">{t('select.product')}</option>
            {productOptions.map((name, i) => <option key={i} value={name}>{name}</option>)}
          </select>
        </div>
        <div className="col-md-4 d-flex align-items-end">
          <button className="btn btn-secondary w-100" onClick={() => { setSelectedSupplier(''); setSelectedProduct(''); }}>
            {t('clear')}
          </button>
        </div>
      </div>
      <DataTableBase columns={columns} data={filteredData} t={t} />
    </>
  );
};

export default PurchaseTable;