import React from 'react';
import { useTranslation } from 'react-i18next';

const ReportPeriodSelector = ({
  reportPeriod,
  reportType,
  setReportType,
  month,
  setMonth,
  year,
  setYear,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  tamilMonths
}) => {
  const { t } = useTranslation();

  if (!reportPeriod) return null;

  return (
    <>
      <div className="col-md-3">
        <div className="form-group">
          <label>{t('reports.type')}</label>
          <select
            className="form-control"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="purchase">{t('purchase')}</option>
            <option value="sales">{t('sales')}</option>
          </select>
        </div>
      </div>

      {reportPeriod === 'month' ? (
        <>
          <div className="col-md-3">
            <div className="form-group">
              <label>{t('reports.month')}</label>
              <select
                className="form-control"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                <option value="">{t('reports.selectMonth')}</option>
                {tamilMonths && tamilMonths.months.map((m) => (
                  <option key={m.name_en} value={m.name_en}>
                    {/* If you want to translate months dynamically later, use t(m.name_en) */}
                    {m.name_ta}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group">
              <label>{t('reports.year')}</label>
              <input
                type="number"
                className="form-control"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min="2000"
                max="2100"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="col-md-3">
            <div className="form-group">
              <label>{t('reports.startDate')}</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group">
              <label>{t('reports.endDate')}</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ReportPeriodSelector;