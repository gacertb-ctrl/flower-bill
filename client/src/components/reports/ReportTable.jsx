import React from 'react';
import { useTranslation } from 'react-i18next';

const ReportTable = ({ reportData, reportType, reportPeriod, loading }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t('loading')}</span>
        </div>
      </div>
    );
  }

  if (!reportData || reportData.length === 0) {
    return (
      <div className="alert alert-info text-center my-4">
        {t('reports.noData')}
      </div>
    );
  }

  // Calculate totals
  const totalDebit = reportData.reduce((sum, item) => sum + parseFloat(item.debit_amount || 0), 0);
  const totalCredit = reportData.reduce((sum, item) => sum + parseFloat(item.credit_amount || 0), 0);

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>{t('S.No')}</th>
            <th>
              {reportType === 'purchase'
                ? t('supplier')
                : t('customer')}
              {' '}{t('name')}
            </th>
            <th>
              {reportPeriod === 'month' && reportType === 'purchase'
                ? `${t('reports.totalOutstanding')}/${t('reports.totalDebit')}`
                : reportPeriod === 'month' && reportType === 'sales'
                  ? `${t('reports.totalDebit')}/${t('reports.totalOutstanding')}`
                  : reportPeriod === 'date' && reportType === 'purchase'
                    ? `${t('reports.todayCredit')}/${t('reports.todayDebit')}`
                    : `${t('reports.todayDebit')}/${t('reports.todayCredit')}`}
            </th>
          </tr>
        </thead>
        <tbody>
          {reportData.map((row, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{row.name}</td>
              <td className="text-end">
                {reportType === 'purchase'
                  ? `${parseFloat(row.credit_amount || 0).toFixed(2)} / ${parseFloat(row.debit_amount || 0).toFixed(2)}`
                  : `${parseFloat(row.debit_amount || 0).toFixed(2)} / ${parseFloat(row.credit_amount || 0).toFixed(2)}`}
              </td>
            </tr>
          ))}
          <tr className="table-info">
            <td colSpan="2" className="fw-bold">{t('reports.total')}</td>
            <td className="text-end fw-bold">
              {reportType === 'purchase'
                ? `${totalCredit.toFixed(2)} / ${totalDebit.toFixed(2)}`
                : `${totalDebit.toFixed(2)} / ${totalCredit.toFixed(2)}`}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;