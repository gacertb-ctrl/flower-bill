import React, { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { updateDebitEntry, updateCreditEntry } from '../../api/debitCreditAPI';

const DebitCreditUpdateModal = ({ show, onHide, type, editData, onSuccess }) => {
    const { t } = useTranslation();
    const [amount, setAmount] = useState('');

    useEffect(() => {
        if (editData) {
            setAmount(editData.amount);
        }
    }, [editData]);

    const handleSubmit = async () => {
        const payload = {
            id: editData.id,
            amount
        };

        if (type === 'debit') {
            await updateDebitEntry(payload);
        } else {
            await updateCreditEntry(payload);
        }

        onSuccess();
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{t('update amount')}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form.Group>
                    <Form.Label>{t('amount')}</Form.Label>
                    <Form.Control
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </Form.Group>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>{t('close')}</Button>
                <Button variant="primary" onClick={handleSubmit}>{t('update')}</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DebitCreditUpdateModal;
