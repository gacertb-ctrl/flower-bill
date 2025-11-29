import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Select from 'react-select';
import { useTranslation } from 'react-i18next';

const TransactionModal = ({
    show,
    onHide,
    type,
    onSubmit,
    options,
    entityType
}) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        entity: null,
        product: null,
        quality: '',
        unit: '',
        price: '',
        total: ''
    });

    useEffect(() => {
        if (formData.quality && formData.price && formData.unit) {
            calculateTotal();
        }
    }, [formData.quality, formData.price, formData.unit]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleSelectChange = (name, selectedOption) => {
        setFormData({ ...formData, [name]: selectedOption });
    };

    const calculateTotal = () => {
        const quality = parseFloat(formData.quality) || 0;
        const price = parseFloat(formData.price) || 0;
        setFormData({ ...formData, total: (quality * price).toFixed(2) });
    };

    const handleSubmit = () => {
        onSubmit({
            entityCode: formData.entity.value,
            productCode: formData.product.value,
            quality: formData.quality,
            unit: formData.unit,
            price: formData.price,
            total: formData.total
        });
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    {t(`add ${type}`)}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="row justify-content-md-center">
                    <div className="col-md-6 mb-3">
                        <Select
                            options={options.entities}
                            onChange={(selected) => handleSelectChange('entity', selected)}
                            placeholder={t(`select.${entityType?.toLowerCase()}`) || t('selectPlaceholder')}
                            isSearchable
                        />
                    </div>
                    <div className="col-md-6 mb-3">
                        <Select
                            options={options.products}
                            onChange={(selected) => handleSelectChange('product', selected)}
                            placeholder={t('select.product')}
                            isSearchable
                        />
                    </div>
                    <div className="col-md-3">
                        <input
                            type="text"
                            className="form-control"
                            id="quality"
                            placeholder={`${t(type)} ${t('quantity')}`}
                            value={formData.quality}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-md-3">
                        <select
                            className="form-select"
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                        >
                            <option value="">{t('select.unit')}</option>
                            <option value="kg">{t('kg')}</option>
                            <option value="g">{t('g')}</option>
                            <option value="படி">{t('padi')}</option>
                            <option value="pie">{t('pieces')}</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                        <input
                            type="text"
                            className="form-control"
                            id="price"
                            placeholder={`${t(type)} ${t('price')}`}
                            value={formData.price}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-md-3">
                        <input
                            type="text"
                            className="form-control"
                            id="total"
                            placeholder={t('total')}
                            value={formData.total}
                            readOnly
                        />
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleSubmit}>
                    {t(`add ${type}`)}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default TransactionModal;