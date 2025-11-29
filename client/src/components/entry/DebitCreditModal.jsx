import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { fetchSuppliers } from '../../api/supplierAPI';
import { fetchCustomers } from '../../api/customerAPI';
import { createDebitEntry, createCreditEntry } from '../../api/debitCreditAPI';
import { SearchableSelect } from './SearchableSelect';

const DebitCreditModal = ({ type, show, onHide, onSubmit, date }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        customer_supplier_code: '',
        amount: '',
        date: date
    });

    const [options, setOptions] = useState([]);

    // Update date when prop changes
    useEffect(() => {
        setFormData(prev => ({ ...prev, date: date }));
    }, [date]);

    useEffect(() => {
        if (show) {
            const loadOptions = async () => {
                try {
                    const data = type === 'debit' ? await fetchSuppliers() : await fetchCustomers();
                    // Normalize data structure for SearchableSelect
                    const list = Array.isArray(data) ? data : Object.values(data || {});
                    setOptions(list.map(item => ({
                        code: item.code || item.customer_supplier_code,
                        name: item.name || item.customer_supplier_name
                    })));
                } catch (error) {
                    console.error("Error loading options", error);
                }
            };
            loadOptions();
        }
    }, [show, type]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            if (type === 'debit') {
                await createDebitEntry(formData);
            } else {
                await createCreditEntry(formData);
            }
            onSubmit();
            // Reset form (keep date)
            setFormData({
                customer_supplier_code: '',
                amount: '',
                date: date
            });
            onHide();
        } catch (error) {
            console.error("Error saving entry", error);
            alert(t('messages.failedToSaveEntry'));
        }
    };

    // Determine titles and placeholders based on type
    const modalTitle = type === 'debit' ? t('addDebitTitle') : t('addCreditTitle');
    const labelText = type === 'debit' ? t('supplier') : t('customer');
    const selectPlaceholder = type === 'debit' ? t('select.supplier') : t('select.customer');

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{modalTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>{labelText}</Form.Label>
                        <SearchableSelect
                            name="customer_supplier_code"
                            value={formData.customer_supplier_code}
                            options={options}
                            onChange={handleChange}
                            placeholder={selectPlaceholder}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{t('amount')}</Form.Label>
                        <Form.Control
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            placeholder={t('enterAmount')}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>{t('close')}</Button>
                <Button variant="primary" onClick={handleSubmit}>{t('save')}</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DebitCreditModal;