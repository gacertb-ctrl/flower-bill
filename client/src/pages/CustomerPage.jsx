import React, { useState, useCallback, useEffect } from 'react';
import Table from '../components/Table';
import CustomerSupplierModal from '../components/modals/CustomerSupplierModal';
import LastTransactionModal from '../components/modals/LastTransactionModal';
import { useTranslation } from 'react-i18next';
import { fetchCustomers, createCustomer, updateCustomer, getLastCustomerTransactions, deleteCustomer } from '../api/customerAPI';

const CustomerPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [customerData, setCustomerData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const { t } = useTranslation();
  const page = 'customer';

  const fetchData = useCallback(async () => {
    try {
      const data = await fetchCustomers();
      setCustomerData(data);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (formData) => {
    try {
      let response;
      if (editData) {
        response = await updateCustomer(formData);
      } else {
        response = await createCustomer(formData);
      }

      if (!response.data) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedCustomers = await fetchCustomers();
      setCustomerData(updatedCustomers);

      setShowModal(false);
      setEditData(null);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };


  const loadLastTransaction = async (id) => {
    try {
      const data = { cus_sup_code: id }
      const response = await getLastCustomerTransactions(data);
      if (!response.data) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setTransactions(response.data);
    } catch (error) {
      console.error('Error loading last transaction:', error);
    }
  };

  const deleteCustomerdata = async (id) => {
    try {
      const confirmed = window.confirm(t('confirm.delete'));
      if (confirmed) {
        await deleteCustomer(id);
        fetchData()
        alert(t('messages.salesDeleted')); // Ensure this key exists or change to 'messages.customerDeleted'
      }
      const updatedCustomers = await fetchCustomers();
      setCustomerData(updatedCustomers);
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
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
                data={customerData}
                setShowModal={setShowModal}
                setEditData={setEditData}
                loadLastTransaction={loadLastTransaction}
                deleteData={deleteCustomerdata}
              />
            </div>
          </div>
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
      // t={t} removed, Modal uses hook
      />

      <LastTransactionModal show={transactions.length > 0} onHide={() => setTransactions([])} transactions={transactions} />
    </div>
  );
};

export default CustomerPage;