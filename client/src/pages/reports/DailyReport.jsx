import React, { useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { useTranslation } from 'react-i18next';
import { fetchDailyReportData } from '../../api/reportAPI';

const DailyReport = () => {
  const { t } = useTranslation();
  const componentRef = useRef();
  const { type } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const date = queryParams.get('date');
  const cusSupCode = queryParams.get('cus_sup_code');
  const [reportData, setReportData] = React.useState([]);
  const [tamilDate, setTamilDate] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchDailyReportData(type, date, cusSupCode);
        setReportData(data.customers);
        setTamilDate(data.tamilDate);
      } catch (error) {
        console.error('Failed to load report data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [type, date, cusSupCode]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `${type}_report_${date}`,
  });

  if (loading) return <div>{t('loading')}</div>;

  return (
    <div className="p-2">
      <button onClick={handlePrint} className="btn btn-primary mb-3">
        {t('print')}
      </button>

      <div ref={componentRef} style={{ fontSize: '10px' }}>
        <style>{`
          @page { size: A4 portrait; margin: 0; }
          @media print {
            body { -webkit-print-color-adjust: exact; }
            .page-break { page-break-after: always; }
          }
        `}</style>

        <div className="d-flex justify-content-center flex-wrap">
          {reportData.map((customer, index) => (
            <CustomerReport
              key={index}
              customer={customer}
              type={type}
              date={date}
              tamilDate={tamilDate}
              billNo={index + 1}
              t={t}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const CustomerReport = ({ customer, type, date, tamilDate, billNo, t }) => {
  const isPurchase = type === 'purchase';
  const classPrimary = isPurchase ? "col-6" : "col-12";
  const classSecondary = isPurchase ? "col-6" : "col-4";

  return (
    <div className={`${classPrimary} mb-1 mt-1 pe-0`}>
      <div className={`row border border-dark ${billNo % 2 === 1 ? "me-1" : "ms-1"}`}>
        <div className="col-12 border-bottom border-dark">
          <div className="row text-center">
            <h5>{t('ganthimathi')}</h5>
            <small>{t('full_address')}</small>
            <small>{t('phone_no')}</small>
          </div>
        </div>

        <div className="col-12">
          <div className="row">
            <div className="col-7 fw-bold" style={{ fontSize: '12px' }}>
              {customer.customer_supplier_name}
            </div>
            <div className="col-5">
              {customer.customer_supplier_contact_no}
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="row">
            <div className="col-7"></div>
            <div className="col-5">{date}</div>
          </div>
        </div>

        <div className="col-12">
          <div className="row">
            <div className="col-7">
              {t('billing no')} - {billNo}
            </div>
            <div className="col-5">
              {tamilDate?.tamil_month_name_ta} - {tamilDate?.tamil_date}
            </div>
          </div>
        </div>

        <div className="col-12 p-0" style={{ height: isPurchase ? '209px' : '358px' }}>
          <ItemsTable items={customer.items} type={type} t={t} />
        </div>

        <ReportSummary customer={customer} type={type} t={t}
          classPrimary={classPrimary} classSecondary={classSecondary} />
      </div>
    </div>
  );
};

const ItemsTable = ({ items, type, t }) => (
  <table className="table table-bordered border-dark text-center w-100"
    style={{ borderLeft: 0, borderRight: 0 }}>
    <thead>
      <tr>
        <th style={{ borderLeft: 0 }}>{t('no')}</th>
        <th>{t('items')}</th>
        <th>{t('quantity')}</th>
        <th>{t('price')}</th>
        <th style={{ borderRight: 0 }}>{t('total')}</th>
      </tr>
    </thead>
    <tbody>
      {items.map((item, idx) => (
        <tr key={idx} className="fw-bold" style={{ fontSize: '12px' }}>
          <td style={{ borderLeft: 0 }}>{idx + 1}</td>
          <td>{item.product_name}</td>
          <td>{item.quality}</td>
          <td>{item.rate}</td>
          <td style={{ borderRight: 0 }}>{item.total}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const ReportSummary = ({ customer, type, t, classPrimary, classSecondary }) => {
  const total = customer.items.reduce((sum, item) => sum + item.total, 0);
  const isPurchase = type === 'purchase';

  return (
    <>
      <div className={`${classPrimary} d-flex justify-content-end fw-bold border-top border-dark`}
        style={{ fontSize: '12px' }}>
        <div className={`${classSecondary} d-flex justify-content-end`}>
          {t('total')}
        </div>
        <div className={`${classSecondary} d-flex justify-content-end`}>
          {total.toFixed(2)}
        </div>
      </div>

      <div className={`${classPrimary} d-flex justify-content-end fw-bold`}
        style={{ fontSize: '12px' }}>
        <div className={`${classSecondary} d-flex justify-content-end`}>
          {isPurchase ? t('Commission') : t('prepaid')}
        </div>
        <div className={`${classSecondary} d-flex justify-content-end`}>
          {isPurchase
            ? (total * (customer.supplier_commission / 100)).toFixed(2)
            : customer.prepaid.toFixed(2)}
        </div>
      </div>

      <div className={`${classPrimary} d-flex justify-content-end fw-bold`}
        style={{ fontSize: '12px' }}>
        <div className={`${classSecondary} d-flex justify-content-end`}>
          {isPurchase ? t('today debit') : t('today credit')}
        </div>
        <div className={`${classSecondary} d-flex justify-content-end`}>
          {customer.todayAmount.toFixed(2)}
        </div>
      </div>

      <div className={`${classPrimary} d-flex justify-content-end fw-bold`}
        style={{ fontSize: '12px' }}>
        <div className={`${classSecondary} d-flex justify-content-end`}>
          {isPurchase ? t('total') : t('total outstanding')}
        </div>
        <div className={`${classSecondary} d-flex justify-content-end`}>
          {isPurchase
            ? (total - (total * (customer.supplier_commission / 100))).toFixed(2)
            : (customer.prepaid + total - customer.todayAmount).toFixed(2)}
        </div>
      </div>
    </>
  );
};

export default DailyReport;