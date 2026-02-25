import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { updatePurchaseEntry, updateSalesEntry } from '../../api/entryAPI';

const EntryUpdateModal = ({ show, onHide, type, editData, onSuccess }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    id: '',
    quantity: '',
    unit: '',
    price: ''
  });

  useEffect(() => {
    console.log("Received editData:", editData);
    if (editData) {
      setFormData({
        id: editData.id,
        quantity: editData.quantity,
        unit: editData.unit,
        price: editData.price
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    
    const payload = {
      id: formData.id,
      quantity: formData.quantity,
      unit: formData.unit,
      price: formData.price
    };

    if (type === 'purchase') {
      await updatePurchaseEntry(payload);
    } else {
      await updateSalesEntry(payload);
    }

    onSuccess();
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('update')} {type === 'purchase' ? t('purchase') : t('sales')} {t('entry')}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>{t('quantity')}</Form.Label>
                <Form.Control
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            {/* <Col md={4}>
              <Form.Group>
                <Form.Label>{t('unit')}</Form.Label>
                <Form.Select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="படி">படி</option>
                  <option value="pie">pieces</option>
                </Form.Select>
              </Form.Group>
            </Col> */}

            <Col md={5}>
              <Form.Group>
                <Form.Label>{t('price')}</Form.Label>
                <Form.Control
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={3} className="d-flex align-items-end">
              <label className="text-muted">
                {t(formData?.unit || "")}
              </label>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>{t('close')}</Button>
        <Button variant="primary" onClick={handleSubmit}>{t('update')}</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EntryUpdateModal;
