import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createCustomer } from '../../api/customerAPI';

const CustomerForm = ({ onSubmitSuccess }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await createCustomer(formData);
      onSubmitSuccess();
    } catch (error) {
      console.error('Failed to create customer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">{t('name') || "Name"}</label>
        <input
          type="text"
          name="name"
          className="form-control"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">{t('email') || "Email"}</label>
        <input
          type="email"
          name="email"
          className="form-control"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">{t('phone') || "Phone"}</label>
        <input
          type="text"
          name="phone"
          className="form-control"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">{t('address') || "Address"}</label>
        <input
          type="text"
          name="address"
          className="form-control"
          value={formData.address}
          onChange={handleChange}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={submitting}
      >
        {submitting ? (t('saving') || 'Saving...') : (t('save_customer') || 'Save Customer')}
      </button>
    </form>
  );
};

export default CustomerForm;