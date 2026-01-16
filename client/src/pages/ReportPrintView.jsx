import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPrintDetails } from '../api/reportAPI';
import '../styles/bootstrap.min.css';

const ReportPrintView = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const period = searchParams.get('period');
    const type = searchParams.get('type');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                const params = Object.fromEntries([...searchParams]);
                const apiParams = {
                    period_type: params.period,
                    report_type: params.type,
                    date: params.date,
                    month: params.month,
                    year: params.year,
                    code: params.code
                };
                const result = await getPrintDetails(apiParams);

                if (isMounted) {
                    if (Array.isArray(result)) {
                        setData(result);
                        if (result.length > 0) {
                            setTimeout(() => {
                                if (isMounted) window.print();
                            }, 1000);
                        }
                    } else {
                        console.error("API Response Error: Expected array but got", result);
                        setData([]);
                    }
                    setLoading(false);
                }
            } catch (error) {
                if (isMounted) {
                    console.error("Error fetching print data", error);
                    setData([]);
                    setLoading(false);
                }
            }
        };
        fetchData();

        return () => {
            isMounted = false;
        };
    }, [searchParams]);

    if (loading) return <div>{t('loading') || "Loading Report..."}</div>;

    const chunk = (arr, size) => {
        if (!Array.isArray(arr)) return [];
        return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
    };

    const safeData = Array.isArray(data) ? data : [];

    // RENDER: Daily Report (Sittai)
    if (period === 'date') {
        const chunkSize = type === 'sales' ? 4 : 6;
        const pageGroups = chunk(safeData, chunkSize);

        return (
            <div className="print-body pt-2 px-3" style={{ fontSize: '10px' }}>
                <style>{`
                    @media print {
                        html, body { width: 210mm; min-height: 297mm; }
                        .page { margin: 2px; page-break-after: always; width: 100%; }
                        @page { size: A4 portrait; margin: 0; }
                    }
                    .table-bordered { border: 1px solid #000 !important; }
                    .table-bordered td, .table-bordered th { border: 1px solid #000; }
                `}</style>
                {pageGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="page row">
                        {group.map((customer, i) => {
                            const billNo = (groupIndex * chunkSize) + i + 1;
                            const isOdd = billNo % 2 !== 0;
                            const items = Array.isArray(customer.items) ? customer.items : [];
                            const totalAmount = items.reduce((acc, item) => acc + parseFloat(item.total || 0), 0);
                            const outstanding = ((parseFloat(customer.prev_debit || 0) - parseFloat(customer.prev_credit || 0)) + totalAmount) - parseFloat(customer.today_pay || 0);

                            return (
                                <div key={i} className={`col-6 mb-1 mt-1`}>
                                    <div className={`row border border-dark ${isOdd ? "me-1" : "ms-1"}`}>
                                        {/* Header */}
                                        <div className="col-12" style={{ borderBottom: '1px solid black' }}>
                                            <div className="row text-center">
                                                <h5>{t('ganthimathi')}</h5>
                                                <small>{t('full_address')}</small>
                                                <small>{t('phone_no')}</small>
                                            </div>
                                        </div>

                                        {/* Customer Info */}
                                        <div className="row fw-bold" style={{ fontSize: '10px' }}>
                                            <div className="col-7">
                                                <div className="col-12 fw-bold" style={{ fontSize: '12px' }}>{customer.customer_supplier_name}</div>
                                                <div className="col-12">{t('billing no')} - {billNo}</div>
                                            </div>
                                            <div className="col-5">
                                                <div className="col-12">{customer.customer_supplier_contact_no}</div>
                                                <div className="col-12">{searchParams.get('date')}</div>
                                                <div className="col-12">{customer.tamil_date?.tamil_month_name_ta} - {customer.tamil_date?.tamil_date}</div>
                                            </div>
                                        </div>

                                        {/* Items Table */}
                                        <div className="col-12 p-0" style={{ height: type === 'sales' ? "358px" : "209px" }}>
                                            <table className="table table-striped table-borderless text-center mb-0" style={{ height: type === 'sales' ? "358px" : "209px" }}>
                                                <thead className="border-bottom border-top border-dark">
                                                    <tr>
                                                        <th className="py-0 border-end border-dark" style={{ borderLeft: 0 }}>{t('no')}</th>
                                                        <th className="py-0 border-end border-dark">{t('items')}</th>
                                                        <th className="py-0 border-end border-dark">{t('quantity')}</th>
                                                        <th className="py-0 border-end border-dark">{t('price')}</th>
                                                        <th className="py-0" style={{ borderRight: 0 }}>{t('total')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {items.map((item, idx) => (
                                                        <tr key={idx} className="fw-bold" style={{ fontSize: '12px', border: 0 }}>
                                                            <td className="py-0 border-end border-dark" style={{ borderLeft: 0 }}>{idx + 1}</td>
                                                            <td className="py-0 border-end border-dark">{item.product_name}</td>
                                                            <td className="py-0 border-end border-dark">{item.quality}</td>
                                                            <td className="py-0 border-end border-dark">{item.rate}</td>
                                                            <td className="py-0" style={{ borderRight: 0 }}>{item.total}</td>
                                                        </tr>
                                                    ))}
                                                    <tr style={{ border: 0, height: '100%' }}>
                                                        <td className='py-0 border-end border-dark'></td>
                                                        <td className='py-0 border-end border-dark'></td>
                                                        <td className='py-0 border-end border-dark'></td>
                                                        <td className='py-0 border-end border-dark'></td>
                                                        <td style={{ borderRight: 0 }}></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Footer Totals */}
                                        <div className="col-12 fw-bold" style={{ borderTop: '1px solid black', fontSize: '12px' }}>
                                            <div className="row justify-content-end">
                                                <div className="col-4 text-end">{t('total')}</div>
                                                <div className="col-4 text-end">{totalAmount.toFixed(2)}</div>
                                            </div>
                                        </div>
                                        {type === 'sales' ?
                                        <div className="col-12 fw-bold" style={{ fontSize: '12px' }}>
                                            <div className="row justify-content-end">
                                                <div className="col-4 text-end">{t('prepaid')}</div>
                                                <div className="col-4 text-end">{(parseFloat(customer.prev_debit || 0) - parseFloat(customer.prev_credit || 0)).toFixed(2)}</div>
                                            </div>
                                        </div>
                                        : ''}
                                        <div className="col-12 fw-bold" style={{ fontSize: '12px' }}>
                                            <div className="row justify-content-end">
                                                <div className="col-4 text-end">{type === 'sales' ? t('today credit') : t('today debit')}</div>
                                                <div className="col-4 text-end">{parseFloat(customer.today_pay || 0).toFixed(2)}</div>
                                            </div>
                                        </div>
                                        {type === 'sales' ?
                                        <div className="col-12 fw-bold mb-1" style={{ fontSize: '12px' }}>
                                            <div className="row justify-content-end">
                                                <div className="col-4 text-end">{t('reports.totalOutstanding')}</div>
                                                <div className="col-4 text-end">{outstanding.toFixed(2)}</div>
                                            </div>
                                        </div>
                                        : ''}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        );
    }

    // RENDER: Monthly Report (Patta)
    if (period === 'month') {
        const pageGroups = chunk(safeData, 2);

        return (
            <div className="fw-bold" style={{ fontSize: '12px' }}>
                <style>{`
                    @media print {
                        html, body { width: 210mm; min-height: 297mm; }
                        .page { margin: 2px; page-break-after: always; width: 100%; display: flex; flex-wrap: wrap; }
                        @page { size: A4 portrait; margin: 0; }
                    }
                    td { padding: 0px !important; }
                `}</style>
                <div>
                    {pageGroups.map((group, groupIndex) => (
                        <div key={groupIndex} className="page row d-flex justify-content-center">
                            {group.map((customer, idx) => {
                                const billNo = (groupIndex * 2) + idx + 1;
                                let creditTotal = 0;
                                let debitTotal = 0;
                                const prevDebit = parseFloat(customer.opening_balance || 0);

                                return (
                                    <div key={idx} className="col-6 mt-3 mb-1">
                                        <div className="row border border-dark mx-3">
                                            <div className="col-12" style={{ borderBottom: '1px solid black' }}>
                                                <div className="row text-center">
                                                    <div className="col-4">
                                                        <img src="/logo192.png" height="50" width="50" alt="Logo" style={{ opacity: 0.5 }} />
                                                    </div>
                                                    <div className="col-8">
                                                        <h4>{t('ganthimathi')}</h4>
                                                        <small>{t('full_address')}</small><br />
                                                        <small>{t('phone_no')}</small>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-6">
                                                    <div className="row">{t('patta no')} - {billNo}</div>
                                                    <div className="row">{customer.customer_supplier_name}</div>
                                                    <div className="row">{customer.customer_supplier_contact_no}</div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="row"><div className="col-12">{customer.date_ranges[0]?.tamil_month_name_ta} - {searchParams.get('year')}</div></div>
                                                </div>
                                            </div>

                                            <div className="col-12 p-0">
                                                <table className="table table-bordered table-bordless border-dark text-center mb-0" style={{ borderLeft: 0, borderRight: 0 }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ borderLeft: 0 }}>{t('date')}</th>
                                                            <th>{t('tamil')}</th>
                                                            <th>{t('credit')}</th>
                                                            <th style={{ borderRight: 0 }}>{t('debit')}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr style={{ borderTop: 0, borderLeft: 0 }}>
                                                            <td style={{ borderLeft: 0 }}>{t('prepaid')}</td>
                                                            <td></td>
                                                            <td></td>
                                                            <td style={{ borderRight: 0 }}>{prevDebit}</td>
                                                        </tr>

                                                        {customer.date_ranges && Array.isArray(customer.date_ranges) && customer.date_ranges.map((d, i) => {
                                                            const dayDebit = Array.isArray(customer.daily_debits) ? (customer.daily_debits.find(x => x.debit_date === d.date)?.amount || 0) : 0;
                                                            const dayCredit = Array.isArray(customer.daily_credits) ? (customer.daily_credits.find(x => x.credit_date === d.date)?.amount || 0) : 0;
                                                            creditTotal += parseFloat(dayCredit);
                                                            debitTotal += parseFloat(dayDebit);

                                                            return (
                                                                <tr key={i} style={{ borderLeft: 0 }}>
                                                                    <td style={{ borderLeft: 0 }}>{d.date ? new Date(d.date).toISOString().split('T')[0] : ''}</td>
                                                                    <td>{d.tamil_date}</td>
                                                                    <td>{dayCredit || 0}</td>
                                                                    <td style={{ borderRight: 0 }}>{dayDebit || 0}</td>
                                                                </tr>
                                                            )
                                                        })}

                                                        <tr style={{ borderTop: '1px solid black', borderLeft: 0 }}>
                                                            <td colSpan="2" className="text-start" style={{ borderLeft: 0 }}>{t('this month total')}</td>
                                                            <td>{creditTotal.toFixed(2)}</td>
                                                            <td style={{ borderRight: 0 }}>{debitTotal.toFixed(2)}</td>
                                                        </tr>

                                                        {type === 'purchase' && (
                                                            <>
                                                                <tr style={{ borderTop: '1px solid black', borderLeft: 0 }}>
                                                                    <td colSpan="2" className="text-start" style={{ borderLeft: 0 }}>{t('Commission')}</td>
                                                                    <td>{(creditTotal * (customer.supplier_commission || 0) / 100).toFixed(2)}</td>
                                                                    <td style={{ borderRight: 0 }}></td>
                                                                </tr>
                                                                <tr style={{ borderTop: '1px solid black', borderLeft: 0 }}>
                                                                    <td colSpan="2" className="text-start" style={{ borderLeft: 0 }}>{t('total')}</td>
                                                                    <td>{(creditTotal - (creditTotal * (customer.supplier_commission || 0) / 100)).toFixed(2)}</td>
                                                                    <td style={{ borderRight: 0 }}>{(debitTotal + prevDebit).toFixed(2)}</td>
                                                                </tr>
                                                            </>
                                                        )}
                                                        <tr>
                                                            <td colSpan="2" className="text-start" style={{ borderLeft: 0 }}>{t('closing_balance')}</td>
                                                            {((debitTotal + prevDebit) - creditTotal) >= 0 ?
                                                                <td></td> :
                                                                <td>{Math.abs((debitTotal + prevDebit) - creditTotal).toFixed(2)}</td>
                                                            }
                                                        </tr>
                                                        <tr>
                                                            <td colSpan="2" className="text-start" style={{ borderLeft: 0 }}>{t('overdraft')}</td>
                                                            {((debitTotal + prevDebit) - creditTotal) < 0 ?
                                                                <td></td> :
                                                                <td style={{ borderRight: 0 }}>{Math.abs((debitTotal + prevDebit) - creditTotal).toFixed(2)}</td>
                                                            }
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return <div>{t('invalidParameters') || "Invalid Parameters"}</div>;
};

export default ReportPrintView;