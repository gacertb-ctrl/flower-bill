import React, { useState, useEffect, useCallback } from 'react';
import Table from '../components/Table';
import CustomerSupplierModal from '../components/modals/CustomerSupplierModal';
import LastTransactionModal from '../components/modals/LastTransactionModal';
import { useTranslation } from 'react-i18next';
import { fetchSuppliers, createSupplier, updateSupplier, getLastSupplierTransactions, deleteSupplier } from '../api/supplierAPI';

const SupplierPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [supplierData, setSupplierData] = useState([]);
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);

  const page = 'supplier';

  const fetchData = useCallback(async () => {
    try {
      const data = await fetchSuppliers();
      setSupplierData(data);
    } catch (error) {
      console.error("Error fetching supplier data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (formData) => {
    try {
      let response;
      if (editData) {
        response = await updateSupplier(formData);
      } else {
        response = await createSupplier(formData);
      }

      if (!response.data) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedSuppliers = await fetchSuppliers();
      setSupplierData(updatedSuppliers);

      setShowModal(false);
      setEditData(null);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const loadLastTransaction = async (id) => {
    try {
      const response = await getLastSupplierTransactions(id);
      if (!response.data) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setTransactions(response.data);
    } catch (error) {
      console.error('Error loading last transaction:', error);
    }
  };

  const deleteSupplierdata = async (id) => {
    try {
      const confirmed = window.confirm(t('confirm.delete'));
      if (confirmed) {
        await deleteSupplier(id);
        fetchData()
        alert(t('messages.salesDeleted')); // Ensure this key exists or update to 'messages.supplierDeleted'
      }
      const updatedSuppliers = await fetchSuppliers();
      setSupplierData(updatedSuppliers);
    } catch (error) {
      console.error('Error deleting supplier:', error);
    }
  };

  return (
    <div className="container-fluid mt-5 pt-4">
      <div className="row mb-3">
        <div className="col-md-2 offset-md-10 text-center">
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditData(null);
              setShowModal(true);
            }}
          >
            {t(`${page}.add`)}
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <Table
            page={page}
            data={supplierData}
            setShowModal={setShowModal}
            setEditData={setEditData}
            loadLastTransaction={loadLastTransaction}
            deleteData={deleteSupplierdata}
          />
        </div>
      </div>

      <CustomerSupplierModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditData(null);
        }}
        type={page}
        mode={editData ? 'update' : 'add'}
        initialData={editData}
        onSubmit={handleSubmit}
      // t={t} removed, Modal uses hook internally
      />

      <LastTransactionModal
        page={page}
        transactions={transactions}
        show={transactions.length > 0}
        onHide={() => setTransactions([])}
      />
    </div>
  );
};

export default SupplierPage;