import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { fetchSuppliers } from '../../api/supplierAPI';
import { fetchCustomers } from '../../api/customerAPI';
import { fetchProducts } from '../../api/productAPI';
import { createPurchaseEntry, createSalesEntry } from '../../api/entryAPI';
import { SearchableSelect } from './SearchableSelect';

const EntryModal = ({ type, show, onHide, onSubmit, date }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    customer_supplier_code: '',
    product_code: '',
    quality: '',
    unit: '',
    price: '',
    price_total: '',
    date: date
  });

  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [default_unit, setDefault_unit] = useState('');

  // Helper to manage Local Storage Cache
  const getCachedData = (custCode, prodCode) => {
    if (!custCode || !prodCode) return null;
    const key = `entry_cache_${type}_${custCode}_${prodCode}`;
    try {
      const cached = localStorage.getItem(key);
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  };

  const setCachedData = (custCode, prodCode, data) => {
    if (!custCode || !prodCode) return;
    const key = `entry_cache_${type}_${custCode}_${prodCode}`;
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Update date in form data when prop changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, date: date }));
  }, [date]);

  useEffect(() => {
    async function fetchForModel() {
      try {
        const suppliers_data = await fetchSuppliers();
        const customers_data = await fetchCustomers();
        const products_data = await fetchProducts();

        // Ensure we are working with arrays
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


  // Logic to load "Previous Data" from Local Storage OR Fallback to Product Defaults
  useEffect(() => {
    const autoFillData = () => {
      // 1. If we have both Customer and Product, check Local Storage history first
      if (formData.customer_supplier_code && formData.product_code) {
        const cached = getCachedData(formData.customer_supplier_code, formData.product_code);

        if (cached) {
          // Found local history for this combo, use it
          setFormData(prev => ({
            ...prev,
            price: cached.price,
            unit: cached.unit || prev.unit
          }));
          return;
        }
      }

      // 2. If no history (or just changed product), load Product Master Defaults
      if (formData.product_code) {
        const product_detail = products.find(p => p.code.toString() === formData.product_code.toString());
        if (product_detail) {
          const defaultPrice = product_detail.product_price || product_detail.price || '';
          const defaultUnit = product_detail.product_unit || product_detail.unit || 'kg';

          setFormData(prev => ({
            ...prev,
            // Only overwrite if price is empty to avoid overwriting user edits while they type
            // But since this effect runs on product_code change, it acts as an initializer
            price: defaultPrice,
            unit: defaultUnit
          }));
          setDefault_unit(defaultUnit);
        }
      }
    };

    autoFillData();
  }, [formData.customer_supplier_code, formData.product_code, products, type]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Trigger calculation when relevant fields change
  useEffect(() => {
    calculateTotal();
  }, [formData.quality, formData.price, formData.unit, default_unit]);

  const calculateTotal = () => {
    if (formData.quality && formData.price) {
      const quality = parseFloat(formData.quality);
      let price = parseFloat(formData.price);

      // Unit conversion logic
      if (formData.unit !== default_unit) {
        if (formData.unit === 'kg' && default_unit === 'g') {
          price = (parseFloat(formData.price) * 1000);
        } else if (formData.unit === 'g' && default_unit === 'kg') {
          price = (parseFloat(formData.price) / 1000);
        }
      }

      setFormData(prev => ({
        ...prev,
        price_total: (quality * price).toFixed(2)
      }));
    }
  };

  const handleSubmit = async () => {
    const payload = { ...formData, date: date };
    try {
      if (type === 'purchase') {
        await createPurchaseEntry(payload);
      } else if (type === 'sales') {
        await createSalesEntry(payload);
      }

      onSubmit(payload);

      // Save to Local Storage Cache for "Previous Data" feature
      setCachedData(formData.customer_supplier_code, formData.product_code, {
        price: formData.price,
        unit: formData.unit
      });

      setFormData(prev => ({
        ...prev,
        quality: '',
        price_total: ''
      }));

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
    name: item.name || item.product_name,
    ...item
  }));

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{t(`add ${type}`)}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  {type === 'purchase' ? t('supplier') : t('customer')}
                </Form.Label>
                <SearchableSelect
                  name="customer_supplier_code"
                  value={formData.customer_supplier_code}
                  options={mappedListOptions}
                  onChange={handleChange}
                  placeholder={type === 'purchase' ? t('select.supplier') : t('select.customer')}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>{t('product')}</Form.Label>
                <SearchableSelect
                  name="product_code"
                  value={formData.product_code}
                  options={mappedProducts}
                  onChange={handleChange}
                  placeholder={t('select.product')}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>{t('quantity')}</Form.Label>
                <Form.Control
                  type="text"
                  name="quality"
                  value={formData.quality}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label>{t('unit')}</Form.Label>
                <Form.Select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                >
                  <option value="">{t('select.unit')}</option>
                  <option value="kg">{t('kg')}</option>
                  <option value="g">{t('g')}</option>
                  <option value="படி">{t('padi')}</option>
                  <option value="pie">{t('pieces')}</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label>{t('price')}</Form.Label>
                <Form.Control
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label>{t('total')}</Form.Label>
                <Form.Control
                  type="text"
                  name="price_total"
                  value={formData.price_total}
                  readOnly
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {t('close')}
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {t('save')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EntryModal;