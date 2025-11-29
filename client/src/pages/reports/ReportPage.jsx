import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchReportData, downloadReport, downloadAllReports, fetchTamilMonths } from '../../api/reportAPI';
import ReportPeriodSelector from '../../components/reports/ReportPeriodSelector.jsx';
import ReportTable from '../../components/reports/ReportTable';

const ReportPage = () => {
  const { t } = useTranslation();
  const [reportPeriod, setReportPeriod] = useState('');
  const [reportType, setReportType] = useState('purchase');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState([]);
  const [tamilMonths, setTamilMonths] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTamilMonths = async () => {
      try {
        const months = await fetchTamilMonths();
        setTamilMonths(months);
      } catch (error) {
        console.error('Error loading Tamil months:', error);
      }
    };

    loadTamilMonths();
  }, []);

  const loadReportTable = async () => {
    if (!reportPeriod) return;

    setLoading(true);
    try {
      const data = await fetchReportData({
        periodType: reportPeriod,
        reportType,
        month,
        year,
        startDate,
        endDate
      });
      setReportData(data);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      await downloadReport({
        reportPeriod,
        reportType,
        month,
        year,
        startDate,
        endDate
      });
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const handleDownloadAll = async () => {
    try {
      await downloadAllReports({
        reportPeriod,
        reportType,
        month,
        year,
        startDate,
        endDate
      });
    } catch (error) {
      console.error('Error downloading all reports:', error);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">{t('reports.title')}</h3>
        </div>
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="form-group">
                <label>{t('reports.period')}</label>
                <select
                  className="form-control"
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value)}
                >
                  <option value="">{t('reports.selectPeriod')}</option>
                  <option value="month">{t('reports.monthly')}</option>
                  <option value="date">{t('reports.dateRange')}</option>
                </select>
              </div>
            </div>

            <ReportPeriodSelector
              reportPeriod={reportPeriod}
              reportType={reportType}
              setReportType={setReportType}
              month={month}
              setMonth={setMonth}
              year={year}
              setYear={setYear}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              tamilMonths={tamilMonths}
            />

            {reportPeriod && (
              <div className="col-md-3 d-flex align-items-end">
                <div className="d-grid gap-2 w-100">
                  <button
                    className="btn btn-primary"
                    onClick={loadReportTable}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {t('loading')}
                      </>
                    ) : t('reports.load')}
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={handleDownload}
                    disabled={loading || reportData.length === 0}
                  >
                    {t('reports.download')}
                  </button>
                  <button
                    className="btn btn-info"
                    onClick={handleDownloadAll}
                    disabled={loading || reportData.length === 0}
                  >
                    {t('reports.downloadAll')}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="row">
            <div className="col-12">
              <ReportTable
                reportData={reportData}
                reportType={reportType}
                reportPeriod={reportPeriod}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;