import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { fetchSuppliers } from '../../api/supplierAPI';
import { fetchCustomers } from '../../api/customerAPI';
import { fetchProducts } from '../../api/productAPI';
import { createPurchaseEntryBulk, createSalesEntryBulk } from '../../api/entryAPI'; // Updated Import
import { SearchableSelect } from './SearchableSelect';

const EntryModal = ({ type, show, onHide, onSubmit, date }) => {
  const { t } = useTranslation();

  // 1. Header Data (Customer & Date)
  const [headerData, setHeaderData] = useState({
    customer_supplier_code: '',
    date: date
  });

  // 2. Rows Data (Array of Products)
  const [rows, setRows] = useState([
    { product_code: '', quality: '', unit: '', price: '', price_total: 0 }
  ]);

  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  // Update date when prop changes
  useEffect(() => {
    setHeaderData(prev => ({ ...prev, date: date }));
  }, [date]);

  useEffect(() => {
    async function fetchForModel() {
      try {
        const suppliers_data = await fetchSuppliers();
        const customers_data = await fetchCustomers();
        const products_data = await fetchProducts();
        setSuppliers(Array.isArray(suppliers_data) ? suppliers_data : Object.values(suppliers_data || {}));
        setCustomers(Array.isArray(customers_data) ? customers_data : Object.values(customers_data || {}));
        setProducts(Array.isArray(products_data) ? products_data : Object.values(products_data || {}));
      } catch (error) {
        console.error("Error fetching modal data", error);
      }
    }
    if (show) {
      fetchForModel();
    }
  }, [show]);

  // --- Helper Functions ---

  const getCachedData = (custCode, prodCode) => {
    if (!custCode || !prodCode) return null;
    try {
      const cached = localStorage.getItem(`entry_cache_${type}_${custCode}_${prodCode}`);
      return cached ? JSON.parse(cached) : null;
    } catch (e) { return null; }
  };

  const setCachedData = (custCode, prodCode, data) => {
    if (!custCode || !prodCode) return;
    localStorage.setItem(`entry_cache_${type}_${custCode}_${prodCode}`, JSON.stringify(data));
  };

  // --- Form Handlers ---

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeaderData(prev => ({ ...prev, [name]: value }));
  };

  // Add a new empty row
  const addRow = () => {
    setRows([...rows, { product_code: '', quality: '', unit: '', price: '', price_total: 0 }]);
  };

  // Remove a row
  const removeRow = (index) => {
    if (rows.length > 1) {
      const newRows = rows.filter((_, i) => i !== index);
      setRows(newRows);
    }
  };

  // Handle changes inside the table rows
  const handleRowChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;

    // Special logic when Product changes
    if (field === 'product_code') {
      const product = products.find(p => p.code.toString() === value.toString());
      if (product) {
        // Check cache first
        const cached = getCachedData(headerData.customer_supplier_code, value);
        if (cached) {
          newRows[index].price = cached.price;
          newRows[index].unit = cached.unit || product.product_unit || 'kg';
        } else {
          // Use product defaults
          newRows[index].price = product.product_price || product.price || '';
          newRows[index].unit = product.product_unit || product.unit || 'kg';
        }
      }
    }

    // Recalculate Total for this row
    if (field === 'quality' || field === 'price' || field === 'unit' || field === 'product_code') {
      const qty = parseFloat(newRows[index].quality) || 0;
      let price = parseFloat(newRows[index].price) || 0;
      const unit = newRows[index].unit;

      // Find default unit for conversion logic
      const product = products.find(p => p.code.toString() === newRows[index].product_code.toString());
      const default_unit = product ? (product.product_unit || product.unit || 'kg') : 'kg';

      // Conversion Logic (Kg <-> g)
      if (unit !== default_unit) {
        if (unit === 'kg' && default_unit === 'g') price = price * 1000;
        else if (unit === 'g' && default_unit === 'kg') price = price / 1000;
      }

      newRows[index].price_total = (qty * price).toFixed(2);
    }

    setRows(newRows);
  };

  // Calculate Grand Total
  const grandTotal = rows.reduce((acc, row) => acc + (parseFloat(row.price_total) || 0), 0).toFixed(2);

  const handleSubmit = async () => {
    // Validation
    if (!headerData.customer_supplier_code) {
      alert(t('Please select a customer/supplier'));
      return;
    }
    const validRows = rows.filter(r => r.product_code && r.quality && r.price);
    if (validRows.length === 0) {
      alert(t('Please add at least one valid product'));
      return;
    }

    const payload = {
      customer_supplier_code: headerData.customer_supplier_code,
      date: headerData.date,
      items: validRows
    };

    try {
      if (type === 'purchase') {
        await createPurchaseEntryBulk(payload);
      } else if (type === 'sales') {
        await createSalesEntryBulk(payload);
      }

      // Save Cache
      validRows.forEach(row => {
        setCachedData(headerData.customer_supplier_code, row.product_code, {
          price: row.price,
          unit: row.unit
        });
      });

      onSubmit(payload); // Refresh parent table

      // Reset Form
      setRows([{ product_code: '', quality: '', unit: '', price: '', price_total: 0 }]);
      onHide();

    } catch (e) {
      console.error("Submit Error", e);
      alert(t('messages.failedToSaveEntry'));
    }
  };

  const listOptions = type === 'purchase' ? suppliers : customers;
  const mappedListOptions = listOptions.map(item => ({
    code: item.code || item.customer_supplier_code,
    name: item.name || item.customer_supplier_name
  }));

  const mappedProducts = products.map(item => ({
    code: item.code || item.product_code,
    name: item.name || item.product_name
  }));

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>{t(`add ${type}`)} (Multiple)</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Header Section */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>{type === 'purchase' ? t('supplier') : t('customer')}</Form.Label>
              <SearchableSelect
                name="customer_supplier_code"
                value={headerData.customer_supplier_code}
                options={mappedListOptions}
                onChange={handleHeaderChange}
                placeholder={type === 'purchase' ? t('select.supplier') : t('select.customer')}
                autoFocus={true}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Label>Date</Form.Label>
            <Form.Control type="text" value={headerData.date} disabled />
          </Col>
        </Row>

        {/* Dynamic Rows Section */}
        <Table bordered hover size="sm">
          <thead>
            <tr>
              <th width="35%">{t('product')}</th>
              <th width="15%">{t('quantity')}</th>
              <th width="15%">{t('unit')}</th>
              <th width="15%">{t('price')}</th>
              <th width="15%">{t('total')}</th>
              <th width="5%">X</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>
                  <SearchableSelect
                    value={row.product_code}
                    options={mappedProducts}
                    onChange={(e) => handleRowChange(index, 'product_code', e.target.value)}
                    placeholder={t('select.product')}
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    value={row.quality}
                    onChange={(e) => handleRowChange(index, 'quality', e.target.value)}
                  />
                </td>
                <td>
                  <Form.Select
                    value={row.unit}
                    onChange={(e) => handleRowChange(index, 'unit', e.target.value)}
                  >
                    <option value="kg">{t('kg')}</option>
                    <option value="g">{t('g')}</option>
                    <option value="படி">{t('padi')}</option>
                    <option value="pie">{t('pieces')}</option>
                  </Form.Select>
                </td>
                <td>
                  <Form.Control
                    type="number"
                    value={row.price}
                    onChange={(e) => handleRowChange(index, 'price', e.target.value)}
                  />
                </td>
                <td>
                  <Form.Control type="text" value={row.price_total} readOnly />
                </td>
                <td>
                  <Button variant="danger" size="sm" onClick={() => removeRow(index)} disabled={rows.length === 1}>
                    <i className="fa fa-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Button variant="secondary" size="sm" onClick={addRow}>+ {t('Add Row')}</Button>

        <div className="d-flex justify-content-end mt-3">
          <h4>{t('Grand Total')}: {grandTotal}</h4>
        </div>

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>{t('close')}</Button>
        <Button variant="primary" onClick={handleSubmit}>{t('save')}</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EntryModal;