import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const CustomerSupplierModal = ({
  show,
  onHide,
  type,
  mode,
  initialData,
  onSubmit
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    number: '',
    address: '',
    commission: type === 'supplier' ? '12.5' : ''
  });

  // Initialize form with data when editing
  useEffect(() => {
    if (mode === 'update' && initialData) {
      setFormData({
        code: initialData.code || '',
        name: initialData.name || '',
        number: initialData.contact || '',
        address: initialData.address || '',
        commission: initialData.commission || (type === 'supplier' ? '12.5' : '')
      });
    } else {
      // Reset form for new entry
      setFormData({
        code: '',
        name: '',
        number: '',
        address: '',
        commission: type === 'supplier' ? '12.5' : ''
      });
    }
  }, [mode, initialData, type]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      onSubmit(formData);
    } catch (error) {
      console.error('Error updating customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const actionText = mode === 'add' ? t('add') : t('update'); // Generic add/update keys

  return (
    <Modal show={show} onHide={onHide} centered size="xl" id="customerSupplierModal">
      <Modal.Header closeButton>
        <Modal.Title>
          {t(`${type}`)} {actionText}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row justify-content-md-center">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              id="code"
              placeholder={t(`${type}.code`)}
              value={formData.code}
              onChange={handleChange}
              required
              disabled={mode === 'update'}
            />
          </div>
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              id="name"
              placeholder={t(`${type}.name`)}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              id="number"
              placeholder={t(`${type}.contact no`)}
              value={formData.number}
              onChange={handleChange}
            />
          </div>

          {type === 'supplier' && (
            <div className="col-md-3 mt-3">
              <input
                type="text"
                className="form-control"
                id="commission"
                placeholder={t('Commission')}
                value={formData.commission}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="col-md-9 mt-3">
            <textarea
              className="form-control"
              id="address"
              rows={4}
              placeholder={t(`${type}.address`)}
              value={formData.address}
              onChange={handleChange}
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {t('close')}
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {t(`${type}`)} {actionText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CustomerSupplierModal;