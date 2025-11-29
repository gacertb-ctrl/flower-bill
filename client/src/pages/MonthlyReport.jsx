import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { useTranslation } from 'react-i18next';
import { fetchMonthlyReportData } from '../../api/reportAPI';

const MonthlyReport = () => {
  const { t } = useTranslation();
  const { month, year } = useParams();
  const componentRef = useRef();
  const [reportData, setReportData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchMonthlyReportData(month, year);
        setReportData(data.suppliers);
      } catch (error) {
        console.error('Failed to load report data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [month, year]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `monthly_report_${month}_${year}`,
  });

  if (loading) return <div>{t('loading')}</div>;

  return (
    <div className="p-2">
      <button onClick={handlePrint} className="btn btn-primary mb-3">
        {t('print')}
      </button>

      <div ref={componentRef} className="fw-bold" style={{ fontSize: '12px' }}>
        <style>{`
          @page { size: A4 portrait; margin: 0; }
          .page-break { page-break-after: always; }
        `}</style>

        <div className="d-flex justify-content-center flex-wrap">
          {reportData.map((supplier, index) => (
            <SupplierReport
              key={index}
              supplier={supplier}
              month={month}
              year={year}
              billNo={index + 1}
              t={t}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const SupplierReport = ({ supplier, month, year, billNo, t }) => {
  return (
    <div className="col-6 mt-3 mb-1">
      <div className="row border border-dark mx-3">
        <div className="col-12 border-bottom border-dark">
          <div className="row text-center">
            <div className="col-4">
              <img src="/images/amman.jpg" height={100} width={100} alt="Amman" />
            </div>
            <div className="col-8">
              <h4>{t('ganthimathi')}</h4>
              <div className="col-12">
                <small>{t('full_address')}</small>
              </div>
              <div className="col-12">
                <small>{t('phone_no')}</small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="row">
            <div className="col-7">
              {t('patta no')} - {billNo}
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="row">
            <div className="col-7">
              {supplier.customer_supplier_name}
            </div>
            <div className="col-5">
              {supplier.customer_supplier_contact_no}
            </div>
          </div>
        </div>

        <div className="col-12">
          <MonthlySummary supplier={supplier} month={month} year={year} t={t} />
        </div>
      </div>
    </div>
  );
};

const MonthlySummary = ({ supplier, month, year, t }) => {
  // Implement the monthly summary table
  return (
    <div className="p-0">
      <table className="table table-bordered border-dark text-center mb-0 w-100">
        <thead>
          <tr>
            <th style={{ borderLeft: 0 }}>{t('date')}</th>
            <th>{t('tamil')}</th>
            <th>{t('credit')}</th>
            <th style={{ borderRight: 0 }}>{t('debit')}</th>
          </tr>
        </thead>
        <tbody>
          {/* Rows for each date */}
          <tr>
            <td colSpan={2} className="text-start">{t('this month total')}</td>
            <td>0.00</td>
            <td style={{ borderRight: 0 }}>0.00</td>
          </tr>
          {/* Additional summary rows */}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlyReport;