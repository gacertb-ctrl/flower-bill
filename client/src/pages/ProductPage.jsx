import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import ProductModal from '../components/modals/ProductModal';
import { useTranslation } from 'react-i18next';
import { fetchProducts, createProduct, updateProduct } from '../api/productAPI';

const ProductPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [productData, setProductData] = useState([]);
  const { t } = useTranslation();
  const page = 'product';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchProducts();
        setProductData(data);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      let response;
      if (editData) {
        response = await updateProduct(formData);
      } else {
        response = await createProduct(formData);
      }

      if (!response.data) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedProducts = await fetchProducts();
      setProductData(updatedProducts);

      setShowModal(false);
      setEditData(null);
    } catch (error) {
      console.error('Error submitting product form:', error);
    }
  };

  return (
    <div className="container-fluid mt-5 pt-4">
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
                data={productData}
                setShowModal={setShowModal}
                setEditData={setEditData}
              />
            </div>
          </div>
        </div>
      </div>

      <ProductModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditData(null);
        }}
        mode={editData ? 'update' : 'add'}
        initialData={editData}
        onSubmit={handleSubmit}
      // t and lang props removed, Modal uses useTranslation internally
      />
    </div>
  );
};

export default ProductPage;