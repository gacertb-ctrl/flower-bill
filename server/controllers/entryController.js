exports.purchaseEntry = async (req, res) => {
    const pur_details = req.body;
    try {
        // req.session.entry_date = pur_details.date;
        const [productRows] = await req.conn.execute("SELECT product_unit FROM product WHERE product_code = ?", [pur_details.product_code]);
        
        const pro_price_total_rounded = Math.round(pur_details.price_total);

        const purchaseSql = "INSERT INTO purchase(product_code, customer_supplier_code, purchase_quality, purchase_rate, purchase_total, purchase_date, purchase_unit, user_id, organization_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const purchaseValues = [pur_details.product_code, pur_details.customer_supplier_code, pur_details.quality, pur_details.price, pro_price_total_rounded, pur_details.date, pur_details.unit, req.user.id, req.user.organization_id];
        await req.conn.execute(purchaseSql, purchaseValues);
        
        const [creditChkRows] = await req.conn.execute("SELECT credit_id, credit_amount FROM credit WHERE customer_supplier_code = ? AND credit_date = ? AND organization_id = ?", [pur_details.customer_supplier_code, pur_details.date, req.user.organization_id]);

        if (creditChkRows.length > 0) {
            const total = creditChkRows[0].credit_amount + pro_price_total_rounded;
            const creditUpdateSql = "UPDATE credit SET credit_amount = ? WHERE credit_id = ?";
            await req.conn.execute(creditUpdateSql, [total, creditChkRows[0].credit_id]);
            
        } else {
            const creditInsertSql = "INSERT INTO credit(customer_supplier_code, credit_amount, credit_date, organization_id) VALUES (?, ?, ?, ?)";
            await req.conn.execute(creditInsertSql, [pur_details.customer_supplier_code, pro_price_total_rounded, pur_details.date, req.user.organization_id]);
            
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

        const salesSql = "INSERT INTO sales(product_code, customer_supplier_code, sales_quality, sales_rate, sales_total, sales_date, sales_unit, user_id, organization_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const salesValues = [sale_details.product_code, sale_details.customer_supplier_code, sale_details.quality, sale_details.price, pro_price_total_rounded, sale_details.date, sale_details.unit, req.user.id, req.user.organization_id];
        await req.conn.execute(salesSql, salesValues);
        

        const [debitChkRows] = await req.conn.execute("SELECT debit_id, debit_amount FROM debit WHERE customer_supplier_code = ? AND debit_date = ? AND organization_id = ?", [sale_details.customer_supplier_code, sale_details.date, req.user.organization_id]);

        if (debitChkRows.length > 0) {
            const total = debitChkRows[0].debit_amount + pro_price_total_rounded;
            const debitUpdateSql = "UPDATE debit SET debit_amount = ? WHERE debit_id = ?";
            await req.conn.execute(debitUpdateSql, [total, debitChkRows[0].debit_id]);
            
        } else {
            const debitInsertSql = "INSERT INTO debit(customer_supplier_code, debit_amount, debit_date, organization_id) VALUES (?, ?, ?, ?)";
            await req.conn.execute(debitInsertSql, [sale_details.customer_supplier_code, pro_price_total_rounded, sale_details.date, req.user.organization_id]);
            
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

        const [creditChkRows] = await req.conn.execute("SELECT credit_id, credit_amount FROM credit WHERE customer_supplier_code = ? AND credit_date = ? AND organization_id = ?", [credit_details.credit_cus_code[0], credit_details.date, req.user.organization_id]);

        if (creditChkRows.length > 0) {
            const total = creditChkRows[0].credit_amount + credit_details.credit_amount;
            const creditUpdateSql = "UPDATE credit SET credit_amount = ? WHERE credit_id = ?";
            await req.conn.execute(creditUpdateSql, [total, creditChkRows[0].credit_id]);
            
        } else {
            const creditInsertSql = "INSERT INTO credit(customer_supplier_code, credit_amount, credit_date, organization_id) VALUES (?, ?, ?, ?)";
            await req.conn.execute(creditInsertSql, [credit_details.credit_cus_code[0], credit_details.credit_amount, credit_details.date, req.user.organization_id]);
            
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

        const [debitChkRows] = await req.conn.execute("SELECT debit_id, debit_amount FROM debit WHERE customer_supplier_code = ? AND debit_date = ? AND organization_id = ?", [debit_details.debit_cus_code[0], debit_details.date, req.user.organization_id]);

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
            const debitInsertSql = "INSERT INTO debit(customer_supplier_code, debit_amount, debit_date, organization_id) VALUES (?, ?, ?, ?)";
            await req.conn.execute(debitInsertSql, [debit_details.debit_cus_code[0], debit_details.debit_amount, debit_details.date, req.user.organization_id]);

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

        const [debitChkRows] = await req.conn.execute("SELECT debit_id, debit_amount FROM debit WHERE customer_supplier_code = ? AND debit_date = ? AND organization_id = ?", [sales_details.customer_supplier_code, sales_details.sales_date, req.user.organization_id]);

        if (debitChkRows.length > 0) {
            const total = debitChkRows[0].debit_amount - sales_details.sales_total;
            const debitUpdateSql = "UPDATE debit SET debit_amount = ? WHERE debit_id = ?";
            await req.conn.execute(debitUpdateSql, [total, debitChkRows[0].debit_id]);
            
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
        const [purchase_details] = await req.conn.execute("SELECT * FROM purchase where purchase_id = ? AND organization_id = ?", [req.body.purchase_id, req.user.organization_id]);
        const purchase_detail = purchase_details[0]

        const purchaseSql = "DELETE FROM `purchase` WHERE purchase_id = ?";
        await req.conn.execute(purchaseSql, [purchase_detail.purchase_id]);
        // No conn1 delete for purchase, following original PHP logic.

        const [creditChkRows] = await req.conn.execute("SELECT credit_id, credit_amount FROM credit WHERE customer_supplier_code = ? AND credit_date = ? AND organization_id = ?", [purchase_detail.customer_supplier_code, purchase_detail.purchase_date, req.user.organization_id]);

        if (creditChkRows.length > 0) {
            const total = creditChkRows[0].credit_amount - purchase_detail.purchase_total;
            const creditUpdateSql = "UPDATE credit SET credit_amount = ? WHERE credit_id = ?";
            await req.conn.execute(creditUpdateSql, [total, creditChkRows[0].credit_id]);
            
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
        WHERE pu.purchase_date = ? AND pu.organization_id = ?", [req.query.date, req.user.organization_id]);
        res.json(rows, req.user.organization_id);
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
        WHERE sa.sales_date = ? AND sa.organization_id = ?", [req.query.date, req.user.organization_id]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching sales entries:', error);
        res.status(500).send('Error fetching sales entries');
    }
};

// Update Purchase Entry
exports.updatePurchaseEntry = async (req, res) => {
    const { id, quantity, price } = req.body;

    try {
        // 1. Get the old entry to calculate stock difference
        const [oldEntry] = await req.conn.execute("SELECT purchase_quality, product_code FROM purchase WHERE purchase_id = ?", [id]);
        if (oldEntry.length === 0) return res.status(404).json({ error: "Entry not found" });

        const oldQuantity = oldEntry[0].purchase_quality;
        const newTotal = quantity * price;
        const quantityDiff = quantity - oldQuantity;

        // 2. Update the Purchase Entry
        await req.conn.execute(
            "UPDATE purchase SET purchase_quality = ?, purchase_rate = ?, purchase_total = ? WHERE purchase_id = ?",
            [quantity, price, newTotal, id]
        );

        // 3. Update Product Stock (Purchase increases stock, so add the difference)
        // If quantity increased (e.g. 10 to 12), diff is +2. Add 2 to stock.
        // If quantity decreased (e.g. 10 to 8), diff is -2. Subtract 2 from stock.
        await req.conn.execute(
            "UPDATE product SET product_quality = product_quality + ? WHERE product_code = ?",
            [quantityDiff, oldEntry[0].product_code]
        );

        res.status(200).json({ message: "Purchase entry updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update purchase entry" });
    }
};

// Update Sales Entry
exports.updateSalesEntry = async (req, res) => {
    const { id, quantity, price, product_code } = req.body;

    try {
        // 1. Get the old entry
        const [oldEntry] = await req.conn.execute("SELECT sales_quality, product_code FROM sales WHERE sales_id = ?", [id]);
        if (oldEntry.length === 0) return res.status(404).json({ error: "Entry not found" });

        const oldQuantity = oldEntry[0].sales_quality;
        const newTotal = quantity * price;
        const quantityDiff = quantity - oldQuantity;

        // 2. Update the Sales Entry
        await req.conn.execute(
            "UPDATE sales SET sales_quality = ?, sales_rate = ?, sales_total = ? WHERE sales_id = ?",
            [quantity, price, newTotal, id]
        );

        // 3. Update Product Stock (Sales decreases stock, so subtract the difference)
        // If quantity increased (e.g. 5 to 7), diff is +2. We sold MORE, so stock must go DOWN (-2).
        await req.conn.execute(
            "UPDATE product SET product_quality = product_quality - ? WHERE product_code = ?",
            [quantityDiff, oldEntry[0].product_code]
        );

        res.status(200).json({ message: "Sales entry updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update sales entry" });
    }
};

// BULK Purchase Entry (Multi-Product)
exports.purchaseEntryBulk = async (req, res) => {
    const { customer_supplier_code, date, items } = req.body; // items is an array of { product_code, quality, unit, price, total }

    // Validate we have items
    if (!items || items.length === 0) {
        return res.status(400).send('No items provided');
    }

    try {
        let grandTotal = 0;
        const userId = req.user.id;

        // 1. Loop through items and Insert into Purchase Table
        for (const item of items) {
            const pro_price_total_rounded = Math.round(item.price_total);
            grandTotal += pro_price_total_rounded;

            const purchaseSql = "INSERT INTO purchase(product_code, customer_supplier_code, purchase_quality, purchase_rate, purchase_total, purchase_date, purchase_unit, user_id, organization_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            const purchaseValues = [item.product_code, customer_supplier_code, item.quality, item.price, pro_price_total_rounded, date, item.unit, userId, req.user.organization_id];

            await req.conn.execute(purchaseSql, purchaseValues);

        }

        // 2. Update Credit Table ONCE with the Grand Total
        const [creditChkRows] = await req.conn.execute("SELECT credit_id, credit_amount FROM credit WHERE customer_supplier_code = ? AND credit_date = ? AND organization_id = ?", [customer_supplier_code, date, req.user.organization_id]);

        if (creditChkRows.length > 0) {
            const total = creditChkRows[0].credit_amount + grandTotal;
            const creditUpdateSql = "UPDATE credit SET credit_amount = ? WHERE credit_id = ?";
            await req.conn.execute(creditUpdateSql, [total, creditChkRows[0].credit_id]);
        } else {
            const creditInsertSql = "INSERT INTO credit(customer_supplier_code, credit_amount, credit_date, organization_id) VALUES (?, ?, ?, ?)";
            await req.conn.execute(creditInsertSql, [customer_supplier_code, grandTotal, date, req.user.organization_id]);
        }

        res.status(200).send('Bulk Purchase entry successful.');
    } catch (error) {
        console.error('Error in bulk purchase entry:', error);
        res.status(500).send('Error in bulk purchase entry.');
    }
};

// BULK Sales Entry (Multi-Product)
exports.salesEntryBulk = async (req, res) => {
    const { customer_supplier_code, date, items } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).send('No items provided');
    }

    try {
        let grandTotal = 0;
        const userId = req.user.id;

        // 1. Loop through items and Insert into Sales Table
        for (const item of items) {
            const pro_price_total_rounded = Math.round(item.price_total);
            grandTotal += pro_price_total_rounded;

            const salesSql = "INSERT INTO sales(product_code, customer_supplier_code, sales_quality, sales_rate, sales_total, sales_date, sales_unit, user_id, organization_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            const salesValues = [item.product_code, customer_supplier_code, item.quality, item.price, pro_price_total_rounded, date, item.unit, userId, req.user.organization_id];

            await req.conn.execute(salesSql, salesValues);
        }

        // 2. Update Debit Table ONCE with the Grand Total
        const [debitChkRows] = await req.conn.execute("SELECT debit_id, debit_amount FROM debit WHERE customer_supplier_code = ? AND debit_date = ? AND organization_id = ?", [customer_supplier_code, date, req.user.organization_id]);

        if (debitChkRows.length > 0) {
            const total = debitChkRows[0].debit_amount + grandTotal;
            const debitUpdateSql = "UPDATE debit SET debit_amount = ? WHERE debit_id = ?";
            await req.conn.execute(debitUpdateSql, [total, debitChkRows[0].debit_id]);
        } else {
            const debitInsertSql = "INSERT INTO debit(customer_supplier_code, debit_amount, debit_date, organization_id) VALUES (?, ?, ?, ?)";
            await req.conn.execute(debitInsertSql, [customer_supplier_code, grandTotal, date, req.user.organization_id]);
        }

        res.status(200).send('Bulk Sales entry successful.');
    } catch (error) {
        console.error('Error in bulk sales entry:', error);
        res.status(500).send('Error in bulk sales entry.');
    }
};

