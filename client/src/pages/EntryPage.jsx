import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PurchaseTable from '../components/entry/PurchaseTable.jsx';
import SalesTable from '../components/entry/SalesTable.jsx';
import EntryModal from '../components/entry/EntryModal.jsx';
import { getAllPurchaseEntries, getAllSalesEntries, deletePurchaseEntry, deleteSalesEntry } from '../api/entryAPI';

const EntryPage = () => {
  const { t } = useTranslation();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const purchasesData = await getAllPurchaseEntries(date);
      const salesData = await getAllSalesEntries(date);
      setPurchases(purchasesData);
      setSales(salesData);
    } catch (error) {
      console.error('Error loading entry data:', error);
    }
  }, [date]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePurchaseSubmit = (data) => {
    setShowPurchaseModal(false);
    loadData();
  };

  const handleSalesSubmit = (data) => {
    setShowSalesModal(false);
    loadData();
  };

  const handlePurchaseDelete = async (id) => {
    try {
      const confirmed = window.confirm(t('confirm.delete'));
      if (confirmed) {
        await deletePurchaseEntry({ purchase_id: id });
        loadData();
        alert(t('messages.purchaseDeleted'));
      }
    } catch (error) {
      console.error('Error deleting purchase entry:', error);
    }
  };

  const handleSalesDelete = async (id) => {
    try {
      const confirmed = window.confirm(t('confirm.delete'));
      if (confirmed) {
        await deleteSalesEntry({ sales_id: id });
        loadData();
        alert(t('messages.salesDeleted'));
      }
    } catch (error) {
      console.error('Error deleting sales entry:', error);
    }
  }
  return (
    <div className="container-fluid mt-5 pt-4">
      <div className="row">
        <div className="col-12">
          <div className="row mb-3">
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <h3>{t('purchase')}</h3>
              <div className="mb-3">
                <button
                  className="btn btn-primary me-2"
                  onClick={() => setShowPurchaseModal(true)}
                >
                  {t('add purchase')}
                </button>
              </div>
              <PurchaseTable data={purchases} handleDelete={handlePurchaseDelete} />
              
            </div>

            <div className="col-md-6">
              <h3>{t('sales')}</h3>
              <div className="mb-3">
                <button
                  className="btn btn-primary me-2"
                  onClick={() => setShowSalesModal(true)}
                >
                  {t('add sales')}
                </button>
              </div>
              <SalesTable data={sales} handleDelete={handleSalesDelete} />
              
            </div>
          </div>
        </div>
      </div>

      <EntryModal
        key={`purchase-${date}`}
        type="purchase"
        show={showPurchaseModal}
        onHide={() => setShowPurchaseModal(false)}
        onSubmit={handlePurchaseSubmit}
        date={date}
      />

      <EntryModal
        key={`sales-${date}`}
        type="sales"
        show={showSalesModal}
        onHide={() => setShowSalesModal(false)}
        onSubmit={handleSalesSubmit}
        date={date}
      />
    </div>
  );
};

export default EntryPage;