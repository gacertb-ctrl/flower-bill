import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Table, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash, faMoon, faUser, faBoxOpen,
  faCalendarCheck, faIndianRupeeSign, faPlus,
  faAddressCard, faLayerGroup, faShoppingCart, faArrowUpRightFromSquare
} from '@fortawesome/free-solid-svg-icons';

import { fetchSuppliers } from '../../api/supplierAPI';
import { fetchCustomers } from '../../api/customerAPI';
import { fetchProducts } from '../../api/productAPI';
import { createPurchaseEntryBulk, createSalesEntryBulk } from '../../api/entryAPI';
import { SearchableSelect } from './SearchableSelect';
import "../../styles/custom.css";

const EntryModal = ({ type, show, onHide, onSubmit, date, tamilDateInfo }) => {
  const { t } = useTranslation();

  // Mode: 'account' (One Person -> Many Products) or 'product' (One Product -> Many People)
  const [viewMode, setViewMode] = useState('account');
  const [loading, setLoading] = useState(false);

  const [headerData, setHeaderData] = useState({
    code: '',
    date: date
  });

  const [rows, setRows] = useState([
    { row_code: '', quality: '', unit: '', price: '', price_total: 0 }
  ]);

  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  // Theme configuration based on Entry Type
  const isPurchase = type === 'purchase';
  const themeColor = isPurchase ? '#4f46e5' : '#10b981'; // Blue for Purchase, Green for Sales
  const softBg = isPurchase ? '#eef2ff' : '#ecfdf5';

  useEffect(() => { setHeaderData(prev => ({ ...prev, date: date })); }, [date]);

  useEffect(() => {
    async function fetchForModel() {
      try {
        const [s, c, p] = await Promise.all([fetchSuppliers(), fetchCustomers(), fetchProducts()]);
        setSuppliers(Array.isArray(s) ? s : Object.values(s || {}));
        setCustomers(Array.isArray(c) ? c : Object.values(c || {}));
        setProducts(Array.isArray(p) ? p : Object.values(p || {}));
      } catch (e) { console.error("Fetch Error", e); }
    }
    if (show) fetchForModel();
  }, [show]);

  const personList = isPurchase ? suppliers : customers;
  const mappedPeople = personList.map(item => ({ code: item.code || item.customer_supplier_code, name: item.name || item.customer_supplier_name }));
  const mappedProducts = products.map(item => ({ code: item.code || item.product_code, name: item.name || item.product_name }));

  const addRow = () => setRows([...rows, { row_code: '', quality: '', unit: '', price: '', price_total: 0 }]);
  const removeRow = (index) => rows.length > 1 && setRows(rows.filter((_, i) => i !== index));
  
  const getCachedData = (custCode, prodCode) => {
    if (!custCode || !prodCode) return null;
    try {
      const cached = localStorage.getItem(`entry_cache_${type}_${custCode}_${prodCode}`);
      return cached ? JSON.parse(cached) : null;
    } catch (e) { return null; }
  };

  const handleRowChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    
    if (field === 'row_code') {
      // Find the product reference based on the current view mode
      const productRef = viewMode === 'account'
        ? products.find(p => p.code.toString() === value.toString()) // By Account: row_code IS the product
        : products.find(p => p.code.toString() === headerData.code.toString()); // By Product: header code IS the product
      console.log("Product Reference Found:", productRef);
      if (productRef) {
        // Auto-fill price and unit from product master
        newRows[index].unit = productRef.unit || 'kg';
        newRows[index].price = productRef.product_price || productRef.price || '';
      }
    }

    // Recalculate Line Total
    if (['quality', 'price', 'unit', 'row_code'].includes(field)) {
      const qty = parseFloat(newRows[index].quality) || 0;
      const prc = parseFloat(newRows[index].price) || 0;
      console.log(`Calculating Total for Row ${index}: Qty=${qty}, Price=${prc}`);
      const productRef = viewMode === 'account' ? products.find(p => p.code.toString() === newRows[index].row_code.toString()) : products.find(p => p.code.toString() === headerData.code.toString());
      if (productRef.unit && newRows[index].unit && productRef.unit !== newRows[index].unit) {
        // Simple unit conversion logic (expand as needed)
        if (productRef.unit === 'kg' && newRows[index].unit === 'g') {
          newRows[index].price_total = qty * (prc / 1000).toFixed(2);
        } else if (productRef.unit === 'g' && newRows[index].unit === 'kg') {
          newRows[index].price_total = qty * (prc * 1000).toFixed(2);
        }
      }
      else{
        newRows[index].price_total = (qty * prc).toFixed(2);
      }
    }
    setRows(newRows);
  };

  const grandTotal = rows.reduce((acc, row) => acc + (parseFloat(row.price_total) || 0), 0).toFixed(2);

  const handleSubmit = async () => {
    if (!headerData.code) return alert(t('Please make a selection in the header'));
    const validRows = rows.filter(r => r.row_code && r.quality);
    if (validRows.length === 0) return alert(t('Please add at least one valid item'));

    setLoading(true);
    const payload = { date: headerData.date, viewMode, headerCode: headerData.code, items: validRows };

    try {
      isPurchase ? await createPurchaseEntryBulk(payload) : await createSalesEntryBulk(payload);
      onSubmit();
      onHide();
      setRows([{ row_code: '', quality: '', unit: '', price: '', price_total: 0 }]);
      setHeaderData({ ...headerData, code: '' });
    } catch (e) { alert(t('Error saving entries')); }
    finally { setLoading(false); }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered contentClassName="rounded-4 border-0 shadow-lg overflow-hidden">
      {/* Dynamic Colored Header */}
      <Modal.Header closeButton className="border-0 px-4 pt-4 text-white" style={{ backgroundColor: themeColor }}>
        <Modal.Title className="fw-bold d-flex align-items-center">
          <FontAwesomeIcon icon={isPurchase ? faShoppingCart : faArrowUpRightFromSquare} className="me-3" />
          {t(`${type} creation`)}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4 bg-light">
        {/* VIEW MODE SWITCHER */}
        <div className="d-flex justify-content-center mb-4">
          <div className="bg-white p-1 rounded-pill shadow-sm d-inline-flex border">
            <Button
              variant={viewMode === 'account' ? (isPurchase ? 'primary' : 'success') : 'light'}
              className="rounded-pill px-4 fw-bold border-0"
              onClick={() => setViewMode('account')}
              size="sm"
            >
              <FontAwesomeIcon icon={faUser} className="me-2" /> {t(`${isPurchase ? 'supplier' : 'customer'}`)}
            </Button>
            <Button
              variant={viewMode === 'product' ? (isPurchase ? 'primary' : 'success') : 'light'}
              className="rounded-pill px-4 fw-bold border-0"
              onClick={() => setViewMode('product')}
              size="sm"
            >
              <FontAwesomeIcon icon={faBoxOpen} className="me-2" /> {t('product')}
            </Button>
          </div>
        </div>

        {/* HEADER INFORMATION CARD */}
        <div className="bg-white p-4 rounded-4 shadow-sm border-0 mb-4">
          <Row className="g-3 align-items-center">
            <Col md={5}>
              <Form.Label className="small text-muted fw-bold mb-2">
                <FontAwesomeIcon icon={viewMode === 'account' ? faAddressCard : faLayerGroup} className="me-2 text-secondary" />
                {viewMode === 'account' ? (isPurchase ? t('select.supplier') : t('select.customer')) : t('select.product')}
              </Form.Label>
              <SearchableSelect
                value={headerData.code}
                options={viewMode === 'account' ? mappedPeople : mappedProducts}
                onChange={(e) => setHeaderData({ ...headerData, code: e.target.value })}
              />
            </Col>

            <Col md={4}>
              <div className="p-3 rounded-3 border d-flex align-items-center h-100" style={{ backgroundColor: '#fffdf5' }}>
                <div className="bg-warning text-white p-2 rounded-2 me-3 shadow-sm">
                  <FontAwesomeIcon icon={faMoon} />
                </div>
                <div>
                  <small className="text-muted d-block fw-bold" style={{ fontSize: '0.7rem' }}>{t('tamil')} {t('date')}</small>
                  <span className="fw-bold text-dark">{tamilDateInfo.tamil_month_name_ta} {tamilDateInfo.tamil_date}</span>
                </div>
              </div>
            </Col>

            <Col md={3}>
              <div className="p-3 rounded-3 border d-flex align-items-center h-100 bg-white">
                <div className="p-2 rounded-2 me-3 shadow-sm" style={{ backgroundColor: softBg, color: themeColor }}>
                  <FontAwesomeIcon icon={faCalendarCheck} />
                </div>
                <div>
                  <small className="text-muted d-block fw-bold" style={{ fontSize: '0.7rem' }}>{t('calender')} {t('date')}</small>
                  <span className="fw-bold text-dark">{headerData.date}</span>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* DATA ENTRY TABLE */}
        <div className="bg-white rounded-4 shadow-sm border overflow-visible">
          <Table hover responsive className="align-middle mb-0">
            <thead className="text-white" style={{ backgroundColor: '#334155' }}>
              <tr>
                <th className="py-3 ps-4" >
                  {viewMode === 'account' ? t('product.add') : isPurchase ? t('supplier.add') : t('customer.add')}
                </th>
                <th className="py-3 text-center">{t('quantity')}</th>
                <th className="py-3 text-center" style={{ width: '15%' }}>{t('price')}</th>
                <th className="py-3 text-center pe-4">{t('total')}</th>
                <th className="py-3 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td className="ps-4 w-25">
                    <SearchableSelect
                      value={row.row_code}
                      options={viewMode === 'account' ? mappedProducts : mappedPeople}
                      onChange={(e) => handleRowChange(index, 'row_code', e.target.value)}
                    />
                  </td>
                  <td className="text-center w-25">
                    {/* Unit Change Option Added back as a Select inside InputGroup */}
                    <InputGroup size="sm">
                      <Form.Control
                        type="number"
                        className="text-center fw-bold w-50"
                        placeholder="0"
                        value={row.quality}
                        onChange={(e) => handleRowChange(index, 'quality', e.target.value)}
                      />
                      <Form.Select
                        className='w-50'
                        style={{fontSize: '10px' }}
                        value={row.unit}
                        onChange={(e) => handleRowChange(index, 'unit', e.target.value)}
                      >
                        <option value="kg">{t('kg')}</option>
                        <option value="g">{t('g')}</option>
                        <option value="படி">{t('padi')}</option>
                        <option value="pie">{t('pieces')}</option>
                      </Form.Select>
                    </InputGroup>
                  </td>
                  <td className="text-center w-25 px-4">
                    <InputGroup size="sm">
                      <InputGroup.Text className="bg-light">
                        <FontAwesomeIcon icon={faIndianRupeeSign} size="xs" />
                      </InputGroup.Text>
                      <Form.Control
                        type="number"
                        className="text-end fw-bold"
                        placeholder="0.00"
                        value={row.price}
                        onChange={(e) => handleRowChange(index, 'price', e.target.value)}
                      />
                    </InputGroup>
                  </td>
                  <td className="text-center fw-bold text-dark pe-4">
                    ₹{row.price_total}
                  </td>
                  <td className="text-center">
                    <Button variant="link" className="text-danger p-0" onClick={() => removeRow(index)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="p-3 bg-light border-top">
            <Button
              variant="outline-secondary"
              size="sm"
              className="rounded-pill border-dashed px-4 fw-bold"
              onClick={addRow}
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" /> {t('Add Another Item')}
            </Button>
          </div>
        </div>

      </Modal.Body>

      <Modal.Footer className="bg-light border-0 px-4 pb-4">
        <Button variant="link" onClick={onHide} className="text-muted fw-bold text-decoration-none">
          {t('Cancel')}
        </Button>
        <Button
          variant={isPurchase ? 'primary' : 'success'}
          className="px-5 rounded-pill shadow fw-bold py-2"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? t('Saving...') : <><FontAwesomeIcon icon={faCalendarCheck} className="me-2" /> {t('Save Entries')}</>}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EntryModal;