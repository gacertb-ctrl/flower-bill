import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PurchaseTable from '../components/entry/PurchaseTable.jsx';
import SalesTable from '../components/entry/SalesTable.jsx';
import EntryModal from '../components/entry/EntryModal.jsx';
import { getAllPurchaseEntries, getAllSalesEntries, deletePurchaseEntry, deleteSalesEntry } from '../api/entryAPI';
import EntryUpdateModal from '../components/entry/EntryUpdateModal.jsx';

const EntryPage = () => {
  const { t } = useTranslation();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Modal State
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Data State
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);

  // Edit State
  const [editItem, setEditItem] = useState(null);

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

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Shortcut for Purchase (e.g., Alt + P)
      if (event.altKey && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        setShowPurchaseModal(true);
      }

      // Shortcut for Sales (e.g., Alt + S)
      if (event.altKey && event.key.toLowerCase() === 's') {
        event.preventDefault();
        setShowSalesModal(true);
      }

      // Option 2: Function Keys (F9 for Purchase, F8 for Sales like Tally)
      /* if (event.key === 'F9') {
         event.preventDefault();
         setShowPurchaseModal(true);
      }
      if (event.key === 'F8') {
         event.preventDefault();
         setShowSalesModal(true);
      } 
      */
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Empty dependency array means this runs once on mount

  // --- Purchase Handlers ---
  const handlePurchaseEdit = (row, type) => {
    // Map Table Row to Modal Form Format
    setEditItem({
      id: row.purchase_id,
      customer_supplier_code: row.customer_supplier_code || row.supplier_code, // Ensure your API returns this
      product_code: row.product_code,
      quantity: row.purchase_quality,
      price: row.purchase_rate,
      unit: row.unit,
      type: type
    });
    setShowUpdateModal(true);
  };

  const handlePurchaseSubmit = (data) => {
    setShowPurchaseModal(false);
    setEditItem(null); // Clear edit state
    loadData();
  };

  const handlePurchaseDelete = async (id) => {
    if (window.confirm(t('confirm.delete'))) {
      await deletePurchaseEntry({ purchase_id: id });
      loadData();
    }
  };

  // --- Sales Handlers ---
  const handleSalesEdit = (row) => {
    setEditItem({
      id: row.sales_id,
      customer_supplier_code: row.customer_supplier_code || row.customer_code,
      product_code: row.product_code,
      quantity: row.sales_quality,
      price: row.sales_rate,
      unit: row.unit
    });
    setShowUpdateModal(true);
  };

  const handleSalesSubmit = (data) => {
    setShowSalesModal(false);
    setEditItem(null);
    loadData();
  };

  const handleSalesDelete = async (id) => {
    if (window.confirm(t('confirm.delete'))) {
      await deleteSalesEntry({ sales_id: id });
      loadData();
    }
  };

  // Close Handlers (to reset edit state)
  const closePurchaseModal = () => { setShowPurchaseModal(false); setEditItem(null); };
  const closeSalesModal = () => { setShowSalesModal(false); setEditItem(null); };

  return (
    <div className="container-fluid mt-5 pt-4">
      <div className="row">
        <div className="col-12">
          {/* Date Picker */}
          <div className="row mb-3">
            <div className="col-md-3">
              <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div className="row">
            {/* Purchase Section */}
            <div className="col-md-6">
              <h3>{t('purchase')}</h3>
              <div className="mb-3">
                <button className="btn btn-primary me-2" onClick={() => { setEditItem(null); setShowPurchaseModal(true); }}>
                  {t('add purchase')} (Alt + P)
                </button>
              </div>
              <PurchaseTable
                data={purchases}
                handleDelete={handlePurchaseDelete}
                handleEdit={handlePurchaseEdit} // Pass Edit Handler
              />
            </div>

            {/* Sales Section */}
            <div className="col-md-6">
              <h3>{t('sales')}</h3>
              <div className="mb-3">
                <button className="btn btn-primary me-2" onClick={() => { setEditItem(null); setShowSalesModal(true); }}>
                  {t('add sales')} (Alt + S)
                </button>
              </div>
              <SalesTable
                data={sales}
                handleDelete={handleSalesDelete}
                handleEdit={handleSalesEdit} // Pass Edit Handler
              />
            </div>
          </div>
        </div>
      </div>

      <EntryModal
        key={`purchase-${date}`}
        type="purchase"
        show={showPurchaseModal}
        onHide={closePurchaseModal}
        onSubmit={handlePurchaseSubmit}
        date={date}
        editData={editItem} // Pass Edit Data
      />

      <EntryModal
        key={`sales-${date}`}
        type="sales"
        show={showSalesModal}
        onHide={closeSalesModal}
        onSubmit={handleSalesSubmit}
        date={date}
        editData={editItem} // Pass Edit Data
      />

      <EntryUpdateModal
        show={showUpdateModal}
        onHide={() => setShowUpdateModal(false)}
        type={editItem?.type}
        editData={editItem}
        onSuccess={loadData}
      />
    </div>
  );
};

export default EntryPage;