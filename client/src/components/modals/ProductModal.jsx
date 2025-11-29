import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const ProductModal = ({
    show,
    onHide,
    mode,
    onSubmit,
    initialData = null
}) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        quality: "",
        unit: "",
        price: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSelectChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        onSubmit(formData);
        onHide();
    };

    useEffect(() => {
        setFormData({
            code: initialData?.code || '',
            name: initialData?.name || '',
            quality: initialData?.quality || '',
            unit: initialData?.unit || '',
            price: initialData?.price || ''
        });
    }, [initialData]);

    const titleAction = mode === 'add' ? t('add') : t('update');

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    {t('product')} {titleAction}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="row justify-content-md-center">
                    <div className="col-md-6">
                        <input
                            type="text"
                            className="form-control"
                            id="code"
                            placeholder={t('product.code')}
                            value={formData.code}
                            onChange={handleChange}
                            required
                            disabled={mode === 'update'}
                        />
                    </div>
                    <div className="col-md-6">
                        <input
                            type="text"
                            className="form-control"
                            id="name"
                            placeholder={t('product.name')}
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col-md-3 mt-3">
                        <input
                            type="text"
                            className="form-control"
                            id="quality"
                            placeholder={t('product.quality')}
                            value={formData.quality}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-md-3 mt-3">
                        <select
                            className="form-select"
                            name="unit"
                            value={formData.unit}
                            onChange={handleSelectChange}
                        >
                            <option value="">{t('select.unit')}</option>
                            <option value="kg">{t('kg')}</option>
                            <option value="g">{t('g')}</option>
                            <option value="படி">{t('padi')}</option>
                            <option value="pie">{t('pieces')}</option>
                        </select>
                    </div>
                    <div className="col-md-6 mt-3">
                        <input
                            type="text"
                            className="form-control"
                            id="price"
                            placeholder={t('product.price')}
                            value={formData.price}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleSubmit}>
                    {t('product')} {titleAction}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ProductModal;