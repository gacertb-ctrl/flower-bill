import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getDebitEntries, getCreditEntries, deleteDebitEntry, deleteCreditEntry } from '../api/debitCreditAPI';
import DebitCreditModal from '../components/entry/DebitCreditModal.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faPen } from '@fortawesome/free-solid-svg-icons';
import DebitCreditUpdateModal from '../components/entry/DebitCreditUpdateModal.jsx';

const DebitCreditPage = () => {
    const { t } = useTranslation();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [debitEntries, setDebitEntries] = useState([]);
    const [creditEntries, setCreditEntries] = useState([]);

    const [showDebitModal, setShowDebitModal] = useState(false);
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [editItem, setEditItem] = useState(null); // Track item being edited
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updateType, setUpdateType] = useState(null);

    const loadData = useCallback(async () => {
        try {
            const debits = await getDebitEntries(date);
            const credits = await getCreditEntries(date);
            setDebitEntries(debits || []);
            setCreditEntries(credits || []);
        } catch (error) {
            console.error("Error loading data", error);
        }
    }, [date]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleDelete = async (type, id) => {
        if (window.confirm(t('confirm.deleteEntry'))) {
            try {
                if (type === 'debit') await deleteDebitEntry(id);
                else await deleteCreditEntry(id);
                loadData();
            } catch (error) {
                console.error("Error deleting entry", error);
            }
        }
    };

    const handleEdit = (type, row) => {
        setEditItem({
            id: type === 'debit' ? row.debit_id : row.credit_id,
            customer_supplier_code: row.customer_supplier_code || row.code, // Ensure code is here
            amount: type === 'debit' ? row.debit_amount : row.credit_amount
        });
        if (type === 'debit') setUpdateType("debit");
        else setUpdateType("credit");

        setShowUpdateModal(true);
    };

    const closeModal = () => {
        setShowDebitModal(false);
        setShowCreditModal(false);
        setEditItem(null);
    };

    return (
        <div className="container-fluid mt-5 pt-4">
            <div className="row mb-3">
                <div className="col-md-3">
                    <label className="form-label fw-bold">{t('date')}</label>
                    <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
            </div>

            <div className="row">
                {/* Debit Column */}
                <div className="col-12 col-md-6 mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="text-primary">{t('purchaseDebit')}</h4>
                        <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowDebitModal(true); }}>
                            <FontAwesomeIcon icon={faPlus} /> {t('addDebit')}
                        </button>
                    </div>
                    <div className="table-responsive" style={{ height: '400px', border: '1px solid #dee2e6' }}>
                        <table className="table table-striped table-hover mb-0">
                            <thead className="sticky-top bg-light">
                                <tr>
                                    <th>{t('S.No')}</th>
                                    <th>{t('supplier.name')}</th>
                                    <th>{t('amount')}</th>
                                    <th>{t('action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {debitEntries.length > 0 ? (
                                    debitEntries.map((row, index) => (
                                        <tr key={row.debit_id}>
                                            <td>{index + 1}</td>
                                            <td>{row.customer_supplier_name}</td>
                                            <td>{row.debit_amount}</td>
                                            <td>
                                                <button className="btn btn-primary btn-sm me-2" onClick={() => handleEdit('debit', row)}>
                                                    <FontAwesomeIcon icon={faPen} />
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete('debit', row.debit_id)}>
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="4" className="text-center">{t('noEntriesFound')}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Credit Column */}
                <div className="col-12 col-md-6 mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="text-success">{t('salesCredit')}</h4>
                        <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowCreditModal(true); }}>
                            <FontAwesomeIcon icon={faPlus} /> {t('addCredit')}
                        </button>
                    </div>
                    <div className="table-responsive" style={{ height: '400px', border: '1px solid #dee2e6' }}>
                        <table className="table table-striped table-hover mb-0">
                            <thead className="sticky-top bg-light">
                                <tr>
                                    <th>{t('S.No')}</th>
                                    <th>{t('customer.name')}</th>
                                    <th>{t('amount')}</th>
                                    <th>{t('action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {creditEntries.length > 0 ? (
                                    creditEntries.map((row, index) => (
                                        <tr key={row.credit_id}>
                                            <td>{index + 1}</td>
                                            <td>{row.customer_supplier_name}</td>
                                            <td>{row.credit_amount}</td>
                                            <td>
                                                <button className="btn btn-primary btn-sm me-2" onClick={() => handleEdit('credit', row)}>
                                                    <FontAwesomeIcon icon={faPen} />
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete('credit', row.credit_id)}>
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="4" className="text-center">{t('noEntriesFound')}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <DebitCreditModal
                type="debit"
                show={showDebitModal}
                onHide={closeModal}
                onSubmit={loadData}
                date={date}
                editData={editItem}
            />

            <DebitCreditModal
                type="credit"
                show={showCreditModal}
                onHide={closeModal}
                onSubmit={loadData}
                date={date}
                editData={editItem}
            />

            <DebitCreditUpdateModal
                show={showUpdateModal}
                onHide={() => setShowUpdateModal(false)}
                type={updateType}
                editData={editItem}
                onSuccess={loadData}
            />

        </div>
    );
};

export default DebitCreditPage;