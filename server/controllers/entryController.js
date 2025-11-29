exports.purchaseEntry = async (req, res) => {
    const pur_details = req.body;
    try {
        // req.session.entry_date = pur_details.date;
        console.log(req.user)
        const [productRows] = await req.conn.execute("SELECT product_unit FROM product WHERE product_code = ?", [pur_details.product_code]);
        
        const pro_price_total_rounded = Math.round(pur_details.price_total);

        const purchaseSql = "INSERT INTO purchase(product_code, customer_supplier_code, purchase_quality, purchase_rate, purchase_total, purchase_date, purchase_unit, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const purchaseValues = [pur_details.product_code, pur_details.customer_supplier_code, pur_details.quality, pur_details.price, pro_price_total_rounded, pur_details.date, pur_details.unit, req.user.id];
        await req.conn.execute(purchaseSql, purchaseValues);
        try {
            await req.conn1.execute(purchaseSql.replace('INSERT INTO ', 'INSERT INTO kanthimathi_'), purchaseValues);
        } catch (th) {
            console.error(th);
        }

        const [creditChkRows] = await req.conn.execute("SELECT credit_id, credit_amount FROM credit WHERE customer_supplier_code = ? AND credit_date = ?", [pur_details.customer_supplier_code, pur_details.date]);

        if (creditChkRows.length > 0) {
            const total = creditChkRows[0].credit_amount + pro_price_total_rounded;
            const creditUpdateSql = "UPDATE credit SET credit_amount = ? WHERE credit_id = ?";
            await req.conn.execute(creditUpdateSql, [total, creditChkRows[0].credit_id]);
            try {
                await req.conn1.execute(creditUpdateSql.replace('UPDATE ', 'UPDATE kanthimathi_'), [total, creditChkRows[0].credit_id]);
            } catch (th) {
                console.error(th);
            }
        } else {
            const creditInsertSql = "INSERT INTO credit(customer_supplier_code, credit_amount, credit_date) VALUES (?, ?, ?)";
            await req.conn.execute(creditInsertSql, [pur_details.customer_supplier_code, pro_price_total_rounded, pur_details.date]);
            try {
                await req.conn1.execute(creditInsertSql.replace('INSERT INTO ', 'INSERT INTO kanthimathi_'), [pur_details.customer_supplier_code, pro_price_total_rounded, pur_details.date]);
            } catch (th) {
                console.error(th);
            }
        }

        res.status(200).send('Purchase entry successful.');
    } catch (error) {
        console.error('Error in purchase entry:', error);
        res.status(500).send('Error in purchase entry.');
    }
};

exports.salesEntry = async (req, res) => {
    const sale_details = req.body;
    try {

        const [productRows] = await req.conn.execute("SELECT product_unit FROM product WHERE product_code = ?", [sale_details.product_code]);

        const pro_price_total_rounded = Math.round(sale_details.price_total);

        const salesSql = "INSERT INTO sales(product_code, customer_supplier_code, sales_quality, sales_rate, sales_total, sales_date, sales_unit, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const salesValues = [sale_details.product_code, sale_details.customer_supplier_code, sale_details.quality, sale_details.price, pro_price_total_rounded, sale_details.date, sale_details.unit, req.user.id];
        await req.conn.execute(salesSql, salesValues);
        try {
            await req.conn1.execute(salesSql.replace('INSERT INTO ', 'INSERT INTO kanthimathi_'), salesValues);
        } catch (th) {
            console.error(th);
        }

        const [debitChkRows] = await req.conn.execute("SELECT debit_id, debit_amount FROM debit WHERE customer_supplier_code = ? AND debit_date = ?", [sale_details.customer_supplier_code, sale_details.date]);

        if (debitChkRows.length > 0) {
            const total = debitChkRows[0].debit_amount + pro_price_total_rounded;
            const debitUpdateSql = "UPDATE debit SET debit_amount = ? WHERE debit_id = ?";
            await req.conn.execute(debitUpdateSql, [total, debitChkRows[0].debit_id]);
            try {
                await req.conn1.execute(debitUpdateSql.replace('UPDATE ', 'UPDATE kanthimathi_'), [total, debitChkRows[0].debit_id]);
            } catch (th) {
                console.error(th);
            }
        } else {
            const debitInsertSql = "INSERT INTO debit(customer_supplier_code, debit_amount, debit_date) VALUES (?, ?, ?)";
            await req.conn.execute(debitInsertSql, [sale_details.customer_supplier_code, pro_price_total_rounded, sale_details.date]);
            try {
                await req.conn1.execute(debitInsertSql.replace('INSERT INTO ', 'INSERT INTO kanthimathi_'), [sale_details.customer_supplier_code, pro_price_total_rounded, sale_details.date]);
            } catch (th) {
                console.error(th);
            }
        }

        res.status(200).send('Sales entry successful.');
    } catch (error) {
        console.error('Error in sales entry:', error);
        res.status(500).send('Error in sales entry.');
    }
};

exports.creditEntry = async (req, res) => {
    const credit_details = req.body;
    try {
        req.session.entry_date = credit_details.date;

        const [creditChkRows] = await req.conn.execute("SELECT credit_id, credit_amount FROM credit WHERE customer_supplier_code = ? AND credit_date = ?", [credit_details.credit_cus_code[0], credit_details.date]);

        if (creditChkRows.length > 0) {
            const total = creditChkRows[0].credit_amount + credit_details.credit_amount;
            const creditUpdateSql = "UPDATE credit SET credit_amount = ? WHERE credit_id = ?";
            await req.conn.execute(creditUpdateSql, [total, creditChkRows[0].credit_id]);
            try {
                await req.conn1.execute(creditUpdateSql.replace('UPDATE ', 'UPDATE kanthimathi_'), [total, creditChkRows[0].credit_id]);
            } catch (th) {
                console.error(th);
            }
        } else {
            const creditInsertSql = "INSERT INTO credit(customer_supplier_code, credit_amount, credit_date) VALUES (?, ?, ?)";
            await req.conn.execute(creditInsertSql, [credit_details.credit_cus_code[0], credit_details.credit_amount, credit_details.date]);
            try {
                await req.conn1.execute(creditInsertSql.replace('INSERT INTO ', 'INSERT INTO kanthimathi_'), [credit_details.credit_cus_code[0], credit_details.credit_amount, credit_details.date]);
            } catch (th) {
                console.error(th);
            }
        }
        res.status(200).send('Credit entry successful.');
    } catch (error) {
        console.error('Error in credit entry:', error);
        res.status(500).send('Error in credit entry.');
    }
};

exports.debitEntry = async (req, res) => {
    const debit_details = req.body;
    try {
        req.session.entry_date = debit_details.date;

        const [debitChkRows] = await req.conn.execute("SELECT debit_id, debit_amount FROM debit WHERE customer_supplier_code = ? AND debit_date = ?", [debit_details.debit_cus_code[0], debit_details.date]);

        if (debitChkRows.length > 0) {
            const total = debitChkRows[0].debit_amount + debit_details.debit_amount;
            const debitUpdateSql = "UPDATE debit SET debit_amount = ? WHERE debit_id = ?";
            await req.conn.execute(debitUpdateSql, [total, debitChkRows[0].debit_id]);
            try {
                await req.conn1.execute(debitUpdateSql.replace('UPDATE ', 'UPDATE kanthimathi_'), [total, debitChkRows[0].debit_id]);
            } catch (th) {
                console.error(th);
            }
        } else {
            const debitInsertSql = "INSERT INTO debit(customer_supplier_code, debit_amount, debit_date) VALUES (?, ?, ?)";
            await req.conn.execute(debitInsertSql, [debit_details.debit_cus_code[0], debit_details.debit_amount, debit_details.date]);
            try {
                await req.conn1.execute(debitInsertSql.replace('INSERT INTO ', 'INSERT INTO kanthimathi_'), [debit_details.debit_cus_code[0], debit_details.debit_amount, debit_details.date]);
            } catch (th) {
                console.error(th);
            }
        }
        res.status(200).send('Debit entry successful.');
    } catch (error) {
        console.error('Error in debit entry:', error);
        res.status(500).send('Error in debit entry.');
    }
};

exports.deleteSales = async (req, res) => {
    // const sales_details = req.body;
    try {
        const [sale_details] = await req.conn.execute("SELECT * FROM sales WHERE sales_id = ?", [req.body.sales_id]);
        const sales_details = sale_details[0]
        
        const salesSql = "DELETE FROM `sales` WHERE sales_id = ?";
        await req.conn.execute(salesSql, [sales_details.sales_id]);
        // No conn1 delete for sales, following original PHP logic.

        const [debitChkRows] = await req.conn.execute("SELECT debit_id, debit_amount FROM debit WHERE customer_supplier_code = ? AND debit_date = ?", [sales_details.customer_supplier_code, sales_details.sales_date]);

        if (debitChkRows.length > 0) {
            const total = debitChkRows[0].debit_amount - sales_details.sales_total;
            const debitUpdateSql = "UPDATE debit SET debit_amount = ? WHERE debit_id = ?";
            await req.conn.execute(debitUpdateSql, [total, debitChkRows[0].debit_id]);
            try {
                await req.conn1.execute(debitUpdateSql.replace('UPDATE ', 'UPDATE kanthimathi_'), [total, debitChkRows[0].debit_id]);
            } catch (th) {
                console.error(th);
            }
        }
        res.status(200).send(global.lang['sales deleted']);
    } catch (error) {
        console.error('Error deleting sales:', error);
        res.status(500).send('Error deleting sales.');
    }
};

exports.deletePurchase = async (req, res) => {
    // const purchase_details = req.body;
    try {
        const [purchase_details] = await req.conn.execute("SELECT * FROM purchase where purchase_id = ?", [req.body.purchase_id]);
        const purchase_detail = purchase_details[0]

        const purchaseSql = "DELETE FROM `purchase` WHERE purchase_id = ?";
        await req.conn.execute(purchaseSql, [purchase_detail.purchase_id]);
        // No conn1 delete for purchase, following original PHP logic.

        const [creditChkRows] = await req.conn.execute("SELECT credit_id, credit_amount FROM credit WHERE customer_supplier_code = ? AND credit_date = ?", [purchase_detail.customer_supplier_code, purchase_detail.purchase_date]);

        if (creditChkRows.length > 0) {
            const total = creditChkRows[0].credit_amount - purchase_detail.purchase_total;
            const creditUpdateSql = "UPDATE credit SET credit_amount = ? WHERE credit_id = ?";
            await req.conn.execute(creditUpdateSql, [total, creditChkRows[0].credit_id]);
            try {
                await req.conn1.execute(creditUpdateSql.replace('UPDATE ', 'UPDATE kanthimathi_'), [total, creditChkRows[0].credit_id]);
            } catch (th) {
                console.error(th);
            }
        }
        res.status(200).send(global.lang['purchase deleted']);
    } catch (error) {
        console.error('Error deleting purchase:', error);
        res.status(500).send('Error deleting purchase.');
    }
};

exports.deleteCredit = async (req, res) => {
    const credit_details = req.body;
    try {
        const creditSql = "DELETE FROM `credit` WHERE credit_id = ?";
        await req.conn.execute(creditSql, [credit_details.credit_id]);
        res.status(200).send(global.lang['credit deleted']);
    } catch (error) {
        console.error('Error deleting credit:', error);
        res.status(500).send('Error deleting credit.');
    }
};

exports.deleteDebit = async (req, res) => {
    const debit_details = req.body;
    try {
        const debitSql = "DELETE FROM `debit` WHERE debit_id = ?";
        await req.conn.execute(debitSql, [debit_details.debit_id]);
        res.status(200).send(global.lang['debit deleted']);
    } catch (error) {
        console.error('Error deleting debit:', error);
        res.status(500).send('Error deleting debit.');
    }
};

exports.setDate = (req, res) => {
    const { date } = req.body;
    req.session.entry_date = date;
    res.status(200).send('Entry date set successfully.');
};

exports.getAllPurchaseEntries = async (req, res) => {
    try {
        const [rows] = await req.conn.execute("SELECT * FROM purchase pu \
        INNER JOIN customer_supplier cs ON cs.customer_supplier_code = pu.customer_supplier_code \
        INNER JOIN product pr ON pr.product_code = pu.product_code \
        WHERE pu.purchase_date = ?", [req.query.date]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching purchase entries:', error);
        res.status(500).send('Error fetching purchase entries');
    }
};

exports.getAllSalesEntries = async (req, res) => {
    try {
        const [rows] = await req.conn.execute("SELECT * FROM sales sa \
        INNER JOIN customer_supplier cs ON cs.customer_supplier_code = sa.customer_supplier_code \
        INNER JOIN product pr ON pr.product_code = sa.product_code \
        WHERE sa.sales_date = ?", [req.query.date]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching sales entries:', error);
        res.status(500).send('Error fetching sales entries');
    }
};

exports.getAllCreditEntries = async (req, res) => {
    try {
        const [rows] = await req.conn.execute("SELECT * FROM `credit` WHERE credit_date = ?", [req.query.date]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching credit entries:', error);
        res.status(500).send('Error fetching credit entries');
    }
};

exports.getAllDebitEntries = async (req, res) => {
    try {
        const [rows] = await req.conn.execute("SELECT * FROM `debit` WHERE debit_date = ?", [req.query.date]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching debit entries:', error);
        res.status(500).send('Error fetching debit entries');
    }
};