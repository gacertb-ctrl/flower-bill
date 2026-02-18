import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCalendarDays, faShoppingCart, faArrowUpRightFromSquare, faMoon } from '@fortawesome/free-solid-svg-icons';
import PurchaseTable from '../components/entry/PurchaseTable.jsx';
import SalesTable from '../components/entry/SalesTable.jsx';
import EntryModal from '../components/entry/EntryModal.jsx';
import EntryUpdateModal from '../components/entry/EntryUpdateModal.jsx';
import { getAllPurchaseEntries, getAllSalesEntries, deletePurchaseEntry, deleteSalesEntry, fetchTamilDate } from '../api/entryAPI';
import { useAuth } from '../context/AuthContext';

const EntryPage = () => {
  const { t } = useTranslation();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tamilDateInfo, setTamilDateInfo] = useState({ tamil_date: '', tamil_month_name_ta: '' });
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();

  // Modal State
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Data & Edit State
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [editItem, setEditItem] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [purchasesData, salesData] = await Promise.all([
        getAllPurchaseEntries(date),
        getAllSalesEntries(date)
      ]);
      setPurchases(purchasesData);
      setSales(salesData);
    } catch (error) { console.error('Error loading data:', error); }
  }, [date]);

  useEffect(() => {
    const getTamilInfo = async () => {
      try {
        const data = await fetchTamilDate(date);
        setTamilDateInfo(data);
      } catch (error) {
        setTamilDateInfo({ tamil_date: '', tamil_month_name_ta: '' });
      }
    };
    getTamilInfo();
  }, [date]); 

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F9') { e.preventDefault(); setShowPurchaseModal(true); }
      if (e.key === 'F8') { e.preventDefault(); setShowSalesModal(true); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => { setIsAdmin(user?.role === 'admin'); }, [user]);


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
      type: "purchase"
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
      unit: row.unit,
      type: "sales"
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
    <div className="container-fluid py-4" style={{ backgroundColor: '#f4f7fe', minHeight: '100vh' }}>
      {/* Top Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm border-0">
        <div>
          <h2 className="fw-bold text-dark mb-0">{t('Daily Entries')}</h2>
          <p className="text-muted small mb-0">{t('Manage your daily stock movement')}</p>
        </div>

        <div className="d-flex align-items-center gap-3">
          {/* Tamil Date Display Card */}
          {tamilDateInfo.tamil_date && (
            <div className="d-flex align-items-center bg-warning-soft px-3 py-2 rounded-3 border border-warning border-opacity-25" style={{ backgroundColor: '#fff9db' }}>
              <FontAwesomeIcon icon={faMoon} className="text-warning me-2" />
              <div>
                <span className="fw-bold text-dark d-block" style={{ fontSize: '0.9rem' }}>
                  {tamilDateInfo.tamil_month_name_ta} {tamilDateInfo.tamil_date}
                </span>
                <span className="text-muted" style={{ fontSize: '0.7rem' }}>தமிழ் தேதி</span>
              </div>
            </div>
          )}

          {/* Standard Date Picker */}
          <div className="d-flex align-items-center bg-light p-2 rounded-3 shadow-xs">
            <FontAwesomeIcon icon={faCalendarDays} className="text-primary me-2" />
            <input
              type="date"
              className="form-control form-control-sm border-0 bg-transparent fw-bold"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={!isAdmin}
            />
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Purchase Card */}
        <div className="col-xl-6">
          <div className="card border-0 rounded-4 shadow-sm overflow-hidden h-100">
            <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <div className="bg-primary-soft p-2 rounded-3 me-3 text-primary" style={{ backgroundColor: '#eef2ff' }}>
                  <FontAwesomeIcon icon={faShoppingCart} size="lg" />
                </div>
                <h4 className="fw-bold mb-0 text-primary-emphasis">{t('purchase')} {t('ledger')}</h4>
              </div>
              <button
                className="btn btn-primary rounded-pill px-3 shadow-sm btn-sm"
                onClick={() => { setEditItem(null); setShowPurchaseModal(true); }}
              >
                <FontAwesomeIcon icon={faPlus} className="me-2" /> {t('purchase')} <span className="badge bg-white text-primary ms-1">F9</span>
              </button>
            </div>
            <div className="card-body px-4">
              <PurchaseTable data={purchases} handleEdit={handlePurchaseEdit} handleDelete={handlePurchaseDelete} />
            </div>
          </div>
        </div>

        {/* Sales Card */}
        <div className="col-xl-6">
          <div className="card border-0 rounded-4 shadow-sm overflow-hidden h-100">
            <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <div className="bg-success-soft p-2 rounded-3 me-3 text-success" style={{ backgroundColor: '#ecfdf5' }}>
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} size="lg" />
                </div>
                <h4 className="fw-bold mb-0 text-success-emphasis">{t('sales')} {t('ledger')}</h4>
              </div>
              <button
                className="btn btn-success rounded-pill px-3 shadow-sm btn-sm"
                onClick={() => { setEditItem(null); setShowSalesModal(true); }}
              >
                <FontAwesomeIcon icon={faPlus} className="me-2" /> {t('sales')} <span className="badge bg-white text-success ms-1">F8</span>
              </button>
            </div>
            <div className="card-body px-4">
              <SalesTable data={sales} handleEdit={handleSalesEdit} handleDelete={handleSalesDelete} />
            </div>
          </div>
        </div>
      </div>

      {/* Modals remain similarly linked as before */}
      <EntryModal 
        type="purchase" 
        show={showPurchaseModal} 
        onHide={() => setShowPurchaseModal(false)} 
        onSubmit={handlePurchaseSubmit} 
        date={date}
        tamilDateInfo={tamilDateInfo}
        />

      <EntryModal 
        type="sales" 
        show={showSalesModal} 
        onHide={() => setShowSalesModal(false)} 
        onSubmit={handleSalesSubmit} 
        date={date}
        tamilDateInfo={tamilDateInfo} 
        />

      <EntryUpdateModal 
      show={showUpdateModal} 
      onHide={() => setShowUpdateModal(false)} 
      type={editItem?.type} 
      editData={editItem} 
      onSuccess={loadData} />
    </div>
  );
};

export default EntryPage;