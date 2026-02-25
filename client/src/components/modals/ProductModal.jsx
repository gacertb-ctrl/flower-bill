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
        product_code: "",
        product_name: "",
        product_quality: "",
        product_unit: "",
        product_price: ""
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
            product_code: initialData?.product_code || initialData?.code || '',
            product_name: initialData?.product_name || initialData?.name || '',
            product_quality: initialData?.product_quality || initialData?.quality || '',
            product_unit: initialData?.product_unit || initialData?.unit || '',
            product_price: initialData?.product_price || initialData?.price || ''
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
                            id="product_code"
                            placeholder={t('product.code')}
                            value={formData.product_code}
                            onChange={handleChange}
                            required
                            disabled={mode === 'update'}
                        />
                    </div>
                    <div className="col-md-6">
                        <input
                            type="text"
                            className="form-control"
                            id="product_name"
                            placeholder={t('product.name')}
                            value={formData.product_name}
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
                            value={formData.product_quality}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-md-3 mt-3">
                        <select
                            className="form-select"
                            name="product_unit"
                            value={formData.product_unit}
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
                            value={formData.product_price}
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