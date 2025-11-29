import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getReportSummary, getTamilMonths } from '../api/reportAPI.jsx';

const ReportPage = () => {
    const { t } = useTranslation();
    const [period, setPeriod] = useState('');
    const [reportType, setReportType] = useState('');
    const [tamilMonths, setTamilMonths] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        const fetchMonths = async () => {
            try {
                const data = await getTamilMonths();
                setTamilMonths(data);
            } catch (e) {
                console.error("Failed to load months", e);
            }
        };
        fetchMonths();
    }, []);

    const loadReportTable = async () => {
        if (!period || !reportType) return;

        const params = {
            period_type: period,
            report_type: reportType,
            month: selectedMonth,
            year: selectedYear,
            date: selectedDate
        };

        try {
            const data = await getReportSummary(params);
            setTableData(data);
        } catch (e) {
            console.error("Failed to load table", e);
        }
    };

    useEffect(() => {
        if (period === 'month' && (!selectedMonth || !selectedYear)) return;
        if (period === 'date' && !selectedDate) return;
        loadReportTable();
    }, [period, reportType, selectedMonth, selectedYear, selectedDate]);

    const handleDownload = (customerCode = '') => {
        let url = `/print-report?period=${period}&type=${reportType}`;
        if (period === 'month') url += `&month=${selectedMonth}&year=${selectedYear}`;
        else url += `&date=${selectedDate}`;

        if (customerCode) url += `&code=${customerCode}`;

        // Open in new tab
        window.open(url, '_blank');
    };

    return (
        <div className="container mt-5 pt-4">
            <div className="col-12">
                <div className="row mb-5">
                    <div className="col-4 col-sm-4 col-md-4 col-lg-2 col-xl-2">
                        <select className="form-control" value={period} onChange={(e) => { setPeriod(e.target.value); setTableData([]); }}>
                            <option value="" disabled>{t('reports.period')}</option>
                            <option value="month">{t('reports.patta')}</option>
                            <option value="date">{t('reports.sittai')}</option>
                        </select>
                    </div>

                    {period === 'month' && (
                        <div className="col-10 row fade-in">
                            <div className="col-4">
                                <select className="form-control" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                                    <option value="">{t('reports.type')}</option>
                                    <option value="purchase">{t('purchase')}</option>
                                    <option value="sales">{t('sales')}</option>
                                </select>
                            </div>
                            <div className="col-4">
                                <select className="form-control" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                                    <option value="">{t('reports.selectMonth')}</option>
                                    {tamilMonths.map((m, i) => (
                                        <option key={i} value={m.tamil_month_name_en}>{m.tamil_month_name_ta}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-4">
                                <input type="number" className="form-control" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} />
                            </div>
                        </div>
                    )}

                    {period === 'date' && (
                        <div className="col-10 row fade-in">
                            <div className="col-4">
                                <select className="form-control" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                                    <option value="">{t('reports.type')}</option>
                                    <option value="purchase">{t('purchase')}</option>
                                    <option value="sales">{t('sales')}</option>
                                </select>
                            </div>
                            <div className="col-4">
                                <input type="date" className="form-control" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                            </div>
                        </div>
                    )}
                </div>

                {tableData.length > 0 && (
                    <div className="row mb-3">
                        <div className="col-12 text-end">
                            <button className="btn btn-primary" onClick={() => handleDownload()}>
                                <i className="fa-solid fa-download"></i> {t('reports.downloadAll')}
                            </button>
                        </div>
                    </div>
                )}

                <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                        <thead>
                            <tr>
                                <th>{t('S.No')}</th>
                                <th>{reportType === 'purchase' ? t('supplier.name') : t('customer.name')}</th>
                                <th>
                                    {reportType === 'purchase' ? t('reports.creditDebit') : t('reports.debitCredit')}
                                </th>
                                <th>{t('action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((row, index) => {
                                let displayAmt = "";
                                if (reportType === 'purchase') {
                                    displayAmt = `${row.credit_amount} / ${row.debit_amount}`;
                                } else {
                                    displayAmt = `${row.debit_amount} / ${row.credit_amount}`;
                                }

                                return (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{row.customer_supplier_name}</td>
                                        <td>{displayAmt}</td>
                                        <td>
                                            <button className="btn btn-primary btn-sm" onClick={() => handleDownload(row.customer_supplier_code)}>
                                                <i className="fa-solid fa-download"></i>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="fw-bold">
                                <td colSpan="2" className="text-end">{t('reports.total')}:</td>
                                <td>
                                    {reportType === 'purchase' ? (
                                        <>
                                            {tableData.reduce((acc, curr) => acc + parseFloat(curr.credit_amount || 0), 0).toFixed(2)}
                                            {" / "}
                                            {tableData.reduce((acc, curr) => acc + parseFloat(curr.debit_amount || 0), 0).toFixed(2)}
                                        </>
                                    ) : (
                                        <>
                                            {tableData.reduce((acc, curr) => acc + parseFloat(curr.debit_amount || 0), 0).toFixed(2)}
                                            {" / "}
                                            {tableData.reduce((acc, curr) => acc + parseFloat(curr.credit_amount || 0), 0).toFixed(2)}
                                        </>
                                    )}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportPage;