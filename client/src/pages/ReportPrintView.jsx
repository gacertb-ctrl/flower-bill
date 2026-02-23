import React, { useEffect, useState, useMemo } from 'react';
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

    // 1. Configuration based on Report Type
    const CONFIG = useMemo(() => {
        const isSales = type === 'sales';
        return {
            itemsLimit: isSales ? 15 : 10, // Sales: 10 rows, Purchase: 15 rows
            billsPerPage: isSales ? 4 : 6,  // Sales: 4 per A4, Purchase: 6 per A4
            boxHeight: isSales ? '450px' : '330px',
            tableHeight: isSales ? '300px' : '220px'
        };
    }, [type]);

    const chunk = (arr, size) => {
        if (!Array.isArray(arr)) return [];
        return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
    };
    const safeData = Array.isArray(data) ? data : [];

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
                            }, 1500);
                        }
                    } 
                    setLoading(false);
                }
            } catch (error) {
                if (isMounted) {
                    console.error("Print Data Fetch Error:", error);
                    setLoading(false);
                }
            }
        };
        fetchData();

        return () => {
            isMounted = false;
        };
    }, [searchParams]);

    // 2. Data Flattening Logic (Handles multi-slot bills)
    const printSlots = useMemo(() => {
        const slots = [];
        data.forEach((customer) => {
            const items = Array.isArray(customer.items) ? customer.items : [];
            const itemChunks = [];

            // Split items into chunks based on limit
            for (let i = 0; i < items.length; i += CONFIG.itemsLimit) {
                itemChunks.push(items.slice(i, i + CONFIG.itemsLimit));
            }

            if (itemChunks.length === 0) itemChunks.push([]);

            itemChunks.forEach((chunk, index) => {
                slots.push({
                    ...customer,
                    displayItems: chunk,
                    isFirstPage: index === 0,
                    isLastPage: index === itemChunks.length - 1,
                    pageLabel: `(${index + 1}/${itemChunks.length})`,
                    hasMultiplePages: itemChunks.length > 1
                });
            });
        });
        return slots;
    }, [data, CONFIG]);

    // 3. Page Grouping
    const pageGroups = useMemo(() => {
        const groups = [];
        for (let i = 0; i < printSlots.length; i += CONFIG.billsPerPage) {
            groups.push(printSlots.slice(i, i + CONFIG.billsPerPage));
        }
        return groups;
    }, [printSlots, CONFIG]);

    if (loading) return <div className="p-5 text-center">{t('loading')}...</div>;

    // RENDER: Daily Report (Sittai)
    if (period === 'date') {

        return (
            <div className="print-body">
                <style>{`
                    @media print {
                        @page { size: A4 portrait; margin: 0; }
                        .page-break { page-break-after: always; }
                    }
                    .bill-box { 
                        border: 1px solid #000; 
                        height: ${CONFIG.boxHeight}; 
                        margin-bottom: 5px;
                        display: flex;
                        flex-direction: column;
                    }
                    .items-area { flex-grow: 1; overflow: hidden; }
                    .table-tight td, .table-tight th { 
                        padding: 1px 4px !important; 
                        font-size: 10px; 
                        border-color: #000 !important; 
                    }
                    .shop-header h5 { margin-bottom: 0; font-weight: bold; }
                    .shop-header small { font-size: 8px; }
                `}</style>
                {pageGroups.map((group, gIdx) => (
                    <div key={gIdx} className="page-break p-3 container-fluid">
                        <div className="row g-2">
                            {group.map((slot, sIdx) => {
                                console.log("Rendering Slot:", slot);
                                const isOdd = (sIdx + 1) % 2 !== 0;
                                const totalAmount = slot.items?.reduce((acc, item) => acc + parseFloat(item.total || 0), 0) || 0;
                                const outstanding = ((parseFloat(slot.prev_debit || 0) - parseFloat(slot.prev_credit || 0)) + totalAmount) - parseFloat(slot.today_pay || 0);

                                return (
                                    <div key={sIdx} className="col-6">
                                        <div className={`bill-box p-1 ${isOdd ? "me-1" : "ms-1"}`}>
                                            {/* Shop Identity */}
                                            <div className="shop-header text-center border-bottom border-dark pb-1">
                                                <h5>{t('ganthimathi')}</h5>
                                                <small>{t('full_address')} | {t('phone_no')}</small>
                                            </div>

                                            {/* Customer Header */}
                                            <div className="row g-0 py-1 border-bottom border-dark" style={{ fontSize: '9px' }}>
                                                <div className="col-7 ps-1">
                                                    <div className="fw-bold">{slot.customer_supplier_name} {slot.hasMultiplePages && slot.pageLabel}</div>
                                                    <div>{(type === 'purchase') ? t('purchase_bill') : t('sales_bill')}</div>
                                                </div>
                                                <div className="col-5 text-end pe-1">
                                                    <div>{searchParams.get('date')}</div>
                                                    <div className="fw-bold">{slot.tamil_date?.tamil_month_name_ta} - {slot.tamil_date?.tamil_date}</div>
                                                </div>
                                            </div>

                                            {/* Table Area */}
                                            <div className="items-area">
                                                <table className="table table-borderless table-tight mb-0 h-100">
                                                    <thead>
                                                        <tr className="bg-light text-center border-bottom border-dark">
                                                            <th className="border-end" width="10%">{t('no')}</th>
                                                            <th className="border-end" width="45%">{t('items')}</th>
                                                            <th className="border-end" width="15%">{t('quantity')}</th>
                                                            <th className="border-end" width="15%">{t('amount')}</th>
                                                            <th className="" width="15%">{t('total')}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {slot.displayItems.map((item, iIdx) => (
                                                            <tr key={iIdx}>
                                                                <td className="text-center border-end">{iIdx + 1}</td>
                                                                <td className="border-end">{item.product_name}</td>
                                                                <td className="text-center border-end">{item.quality}</td>
                                                                <td className="text-end border-end">{item.rate}</td>
                                                                <td className="text-end fw-bold">{item.total}</td>
                                                            </tr>
                                                        ))}
                                                        {/* Filler rows to maintain height */}
                                                        {[...Array(CONFIG.itemsLimit - slot.displayItems.length)].map((_, i) => (
                                                            <tr key={`f-${i}`} style={{ height: '22px' }}>
                                                                <td className="border-end"></td>
                                                                <td className="border-end"></td>
                                                                <td className="border-end"></td>
                                                                <td className="border-end"></td>
                                                                <td className=""></td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Footer Logic */}
                                            <div className="mt-auto border-top border-dark pt-1 px-1" style={{ fontSize: '10px' }}>
                                                {!slot.isLastPage ? (
                                                    <div className="text-center text-muted small fw-bold py-2">--- {t('Continued')} ---</div>
                                                ) : (
                                                    <div className="row g-0">
                                                        <div className="col-7 text-end pe-2 fw-bold">{t('total')}</div>
                                                        <div className="col-5 text-end fw-bold border-bottom">₹{totalAmount.toFixed(2)}</div>

                                                        {type === 'sales' && (
                                                            <>
                                                                <div className="col-7 text-end pe-2">{t('prev_balance')}</div>
                                                                <div className="col-5 text-end">₹{(parseFloat(slot.prev_debit || 0) - parseFloat(slot.prev_credit || 0)).toFixed(2)}</div>
                                                                <div className="col-7 text-end pe-2">{t('today credit')}</div>
                                                                <div className="col-5 text-end">₹{slot.today_pay || 0}</div>
                                                                <div className="col-7 text-end pe-2 fw-bold bg-light">{t('closing_balance')}</div>
                                                                <div className="col-5 text-end fw-bold bg-light">₹{outstanding.toFixed(2)}</div>
                                                            </>
                                                        )}
                                                        {type === 'purchase' && (
                                                            <>
                                                                <div className="col-7 text-end pe-2">{t('today debit')}</div>
                                                                <div className="col-5 text-end">₹{slot.today_pay || 0}</div>
                                                                <div className="col-7 text-end pe-2">{t('Commission')}</div>
                                                                <div className="col-5 text-end">₹{((totalAmount * (slot.supplier_commission || 0)) / 100).toFixed(2)}</div>
                                                                <div className="col-7 text-end pe-2 fw-bold bg-light">{t('total')}</div>
                                                                <div className="col-5 text-end fw-bold bg-light">₹{(totalAmount - ((totalAmount * (slot.supplier_commission || 0)) / 100)).toFixed(2)}</div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
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
                                                <table className="table table-borderless table-bordless border-dark text-center mb-0" style={{ borderLeft: 0, borderRight: 0 }}>
                                                    <thead>
                                                        <tr>
                                                            <th className='border border-dark' style={{ borderLeft: 0 }}>{t('date')}</th>
                                                            <th className='border border-dark'>{t('tamil')}</th>
                                                            <th className='border border-dark'>{t('credit')}</th>
                                                            <th className='border border-dark' style={{ borderRight: 0 }}>{t('debit')}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr style={{ borderTop: 0, borderLeft: 0 }}>
                                                            <td className='border-end border-dark' style={{ borderLeft: 0 }}>{t('prepaid')}</td>
                                                            <td className='border-end border-dark'></td>
                                                            <td className='border-end border-dark'></td>
                                                            <td style={{ borderRight: 0 }}>{prevDebit}</td>
                                                        </tr>

                                                        {customer.date_ranges && Array.isArray(customer.date_ranges) && customer.date_ranges.map((d, i) => {
                                                            const dayDebit = Array.isArray(customer.daily_debits) ? (customer.daily_debits.find(x => x.debit_date === d.date)?.amount || 0) : 0;
                                                            const dayCredit = Array.isArray(customer.daily_credits) ? (customer.daily_credits.find(x => x.credit_date === d.date)?.amount || 0) : 0;
                                                            creditTotal += parseFloat(dayCredit);
                                                            debitTotal += parseFloat(dayDebit);

                                                            return (
                                                                <tr key={i} style={{ borderLeft: 0 }}>
                                                                    <td className='border-end border-dark' style={{ borderLeft: 0 }}>{d.date ? new Date(d.date).toISOString().split('T')[0] : ''}</td>
                                                                    <td className='border-end border-dark'>{d.tamil_date}</td>
                                                                    <td className='border-end border-dark'>{dayCredit || 0}</td>
                                                                    <td style={{ borderRight: 0 }}>{dayDebit || 0}</td>
                                                                </tr>
                                                            )
                                                        })}

                                                        <tr style={{ borderTop: '1px solid black', borderLeft: 0 }}>
                                                            <td colSpan="2" className="text-start border-end border-dark" style={{ borderLeft: 0 }}>{t('this month total')}</td>
                                                            <td className='border-end border-dark'>{creditTotal.toFixed(2)}</td>
                                                            <td style={{ borderRight: 0 }}>{debitTotal.toFixed(2)}</td>
                                                        </tr>

                                                        {type === 'purchase' && (
                                                            <>
                                                                <tr style={{ borderTop: '1px solid black', borderLeft: 0 }}>
                                                                    <td colSpan="2" className="text-start border-end border-dark" style={{ borderLeft: 0 }}>{t('Commission')}</td>
                                                                    <td className='border-end border-dark'>{(creditTotal * (customer.supplier_commission || 0) / 100).toFixed(2)}</td>
                                                                    <td style={{ borderRight: 0 }}></td>
                                                                </tr>
                                                                <tr style={{ borderTop: '1px solid black', borderLeft: 0 }}>
                                                                    <td colSpan="2" className="text-start border-end border-dark" style={{ borderLeft: 0 }}>{t('total')}</td>
                                                                    <td className='border-end border-dark'>{(creditTotal - (creditTotal * (customer.supplier_commission || 0) / 100)).toFixed(2)}</td>
                                                                    <td style={{ borderRight: 0 }}>{(debitTotal + prevDebit).toFixed(2)}</td>
                                                                </tr>
                                                            </>
                                                        )}
                                                        <tr style={{ borderTop: '1px solid black', borderLeft: 0 }}>
                                                            <td colSpan="2" className="text-start border-end border-dark" style={{ borderLeft: 0 }}>{t('closing_balance')}</td>
                                                            {console.log((creditTotal - (creditTotal * (customer.supplier_commission || 0) / 100)).toFixed(2) - (debitTotal + prevDebit))}
                                                            
                                                            {(creditTotal - (creditTotal * (customer.supplier_commission || 0) / 100)).toFixed(2) - (debitTotal + prevDebit) > 0 ? (
                                                              <>
                                                                <td className='border-end border-dark'>{((creditTotal - (creditTotal * (customer.supplier_commission || 0) / 100)).toFixed(2) - (debitTotal + prevDebit)).toFixed(2)}</td>
                                                                <td style={{ borderRight: 0 }}></td>
                                                              </>
                                                            ) : (
                                                              <>
                                                                <td className='border-end border-dark'></td>
                                                                <td style={{ borderRight: 0 }}>{Math.abs((debitTotal + prevDebit) - (creditTotal - (creditTotal * (customer.supplier_commission || 0) / 100))).toFixed(2)}</td>
                                                              </>
                                                            )}
                                                        </tr>
                                                        <tr style={{ borderTop: '1px solid black', borderLeft: 0 }}>
                                                            <td colSpan="2" className="text-start border-end border-dark" style={{ borderLeft: 0 }}>{t('overdraft')}</td>
                                                            {((debitTotal + prevDebit) - (creditTotal - (creditTotal * (customer.supplier_commission || 0) / 100))) < 0 ?
                                                                <td></td> :
                                                                <>
                                                                    <td className='border-end border-dark'></td>
                                                                    <td style={{ borderRight: 0 }}>{Math.abs((debitTotal + prevDebit) - (creditTotal - (creditTotal * (customer.supplier_commission || 0) / 100))).toFixed(2)}</td>
                                                                </>
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