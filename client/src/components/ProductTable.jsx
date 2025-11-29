import React, { useState, useEffect } from 'react';
import ProductModal from '../components/modals/ProductModal';
import ProductTable from '../components/ProductTable';
import { useTranslation } from 'react-i18next';
import { fetchProducts, createProduct, updateProduct } from '../api/productAPI';

const ProductPage = () => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [productData, setProductData] = useState([]);
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

      // Refresh product data
      const updatedProducts = await fetchProducts();
      setProductData(updatedProducts);

      setShowModal(false);
      setEditData(null);
    } catch (error) {
      console.error('Error submitting product form:', error);
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
                {t('product.add')}
              </button>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <ProductTable
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
        initialData={editData}
        mode={editData ? 'update' : 'add'}
        onSubmit={handleSubmit}
      // t={t}  <-- NOT NEEDED, ProductModal uses useTranslation() internally now
      />
    </div>
  );
};

export default ProductPage;