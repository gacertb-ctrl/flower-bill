function add_customer_supplier(type) {
    datas = {
        cus_sup_code: $('#cus_sup_code').val(),
        cus_sup_name: $('#cus_sup_name').val(),
        cus_sup_num: $('#cus_sup_num').val(),
        cus_sup_addr: $('#cus_sup_addr').val()
    }
    if (type == 'customer') {
        url = 'backend.php/add_cus';
    }
    else if (type == 'supplier') {
        url = 'backend.php/add_sup';
        datas.cus_sup_com = $('#cus_sup_com').val()
    }
    $.ajax({
        url: base_url + url,
        type: 'POST',
        data: JSON.stringify(datas),
        dataType: 'html',
        contentType: "application/x-www-form-urlencoded",
        cache: false,
        processData: false,
        success: function (data) {
            data = data.replace(/>\d$/, '>')
            $('#addcustomersupplier').modal('hide');
            $('#cus_sup_pro_detail_table').replaceWith(data);
        }
    });
}

function add_product(type) {
    datas = {
        pro_code: $('#pro_code').val(),
        pro_name: $('#pro_name').val(),
        pro_quality: $('#pro_quality').val(),
        pro_price: $('#pro_price').val(),
        pro_unit: $('#pro_unit').val()
    }
    $.ajax({
        url: base_url + 'backend.php/add_pro',
        type: 'POST',
        data: JSON.stringify(datas),
        dataType: 'html',
        contentType: "application/x-www-form-urlencoded",
        cache: false,
        processData: false,
        success: function (data) {
            data = data.replace(/\d$/, '')
            $('#addproduct').modal('hide');
            $('#pro_detail_table').replaceWith(data);
        }
    });
}

function update_cus_sup(page, cus_sup_code, cus_sup_name, cus_sup_num, cus_sup_addr, cus_sup_com) {
    if (page == 'update') {
        datas = {
            cus_sup_code: $('#update_cus_sup_code').val(),
            cus_sup_name: $('#update_cus_sup_name').val(),
            cus_sup_num: $('#update_cus_sup_num').val(),
            cus_sup_addr: $('#update_cus_sup_addr').val()
        }
        if (cus_sup_code == 'customer') {
            url = 'backend.php/update_cus';
        }
        else if (cus_sup_code == 'supplier') {
            url = 'backend.php/update_sup';
            datas.cus_sup_com = $('#update_cus_sup_com').val()
        }
        $.ajax({
            url: base_url + url,
            type: 'POST',
            data: JSON.stringify(datas),
            dataType: 'html',
            contentType: "application/x-www-form-urlencoded",
            cache: false,
            processData: false,
            success: function (data) {
                data = data.replace(/\>\n\d$/, '>')
                $('#Updatecustomersupplier').modal('hide');
                $('#cus_sup_pro_detail_table').replaceWith(data);
            }
        });
    }
    else {
        $('#update_cus_sup_code').val(cus_sup_code);
        $('#update_cus_sup_name').val(cus_sup_name);
        $('#update_cus_sup_num').val(cus_sup_num);
        $('#update_cus_sup_addr').val(cus_sup_addr);
        if (page == 'supplier') {
            $('#update_cus_sup_com').val(cus_sup_com);
        }
        $('#Updatecustomersupplier').modal('show');
    }

}

function update_pro(page, pro_code, pro_name, pro_price, pro_quality, pro_unit) {
    if (page == 'update') {
        datas = {
            pro_code: $('#update_pro_code').val(),
            pro_name: $('#update_pro_name').val(),
            pro_quality: $('#update_pro_quality').val(),
            pro_price: $('#update_pro_price').val(),
            pro_unit: $('#update_pro_unit').val()
        }
        $.ajax({
            url: base_url + 'backend.php/update_pro',
            type: 'POST',
            data: JSON.stringify(datas),
            dataType: 'html',
            contentType: "application/x-www-form-urlencoded",
            cache: false,
            processData: false,
            success: function (data) {
                data = data.replace(/\d$/, '')
                $('#Updateproduct').modal('hide');
                $('#pro_detail_table').replaceWith(data);
            }
        });
    }
    else {
        $('#update_pro_code').val(pro_code);
        $('#update_pro_name').val(pro_name);
        $('#update_pro_price').val(pro_price);
        $('#update_pro_quality').val(pro_quality);
        $('#update_pro_unit').val(pro_unit);
        $('#Updateproduct').modal('show');
    }
}

function purchase_entry() {
    datas = {
        purchase_cus_code: $('#purchase_cus_code').val(),
        purchase_pro_code: $('#purchase_pro_code').val(),
        pro_quality: $('#purchase_quality').val(),
        purchase_pro_unit: $('#purchase_pro_unit').val(),
        pro_price: $('#purchase_price').val(),
        pro_price_total: $('#purchase_price_total').val(),
        date: $('#datepicker').val()
    }
    sessionStorage.setItem("entry_date", $('#datepicker').val());
    $.ajax({
        url: base_url + 'backend.php/purchase_entry',
        type: 'POST',
        data: JSON.stringify(datas),
        dataType: 'html',
        contentType: "application/x-www-form-urlencoded",
        cache: false,
        processData: false,
        success: function (data) {
            data = data.replace(/\d$/, '')
            // window.location.reload();
        }
    });
}

function sales_entry() {
    datas = {
        sales_cus_code: $('#sales_cus_code').val(),
        sales_pro_code: $('#sales_pro_code').val(),
        pro_quality: $('#sales_quality').val(),
        sales_pro_unit: $('#sales_pro_unit').val(),
        pro_price: $('#sales_price').val(),
        pro_price_total: $('#sales_price_total').val(),
        date: $('#datepicker').val()
    }
    sessionStorage.setItem("entry_date", $('#datepicker').val());
    $.ajax({
        url: base_url + 'backend.php/sales_entry',
        type: 'POST',
        data: JSON.stringify(datas),
        dataType: 'html',
        contentType: "application/x-www-form-urlencoded",
        cache: false,
        processData: false,
        success: function (data) {
            data = data.replace(/\d$/, '')
            // window.location.reload();
        }
    });
}

// $('#datetimepicker4').datepicker();
url_path = window.location.pathname;
url_path = url_path.split('/');

if (url_path[url_path.length - 1] === 'entry.php') {
    $(document).ready(function () {
        
        $('#purchase_cus_code').select2({
            dropdownParent: "#purchase_entry",
            width: "100%",
            placeholder: 'Select Customer',
        });
        $('#purchase_pro_code').select2({
            dropdownParent: "#purchase_entry",
            width: "100%",
            placeholder: 'Select Product',
        }).on("select2:select", function (e) {
            $('#purchase_price').val($('#purchase_pro_code').select2().find(':selected').data('price'))
            $('#purchase_pro_unit').val($('#purchase_pro_code').select2().find(':selected').data('unit'))
        });
        $('#sales_cus_code').select2({
            dropdownParent: "#sales_entry",
            width: "100%",
            placeholder: 'Select Supplier'
        });
        $('#sales_pro_code').select2({
            dropdownParent: "#sales_entry",
            width: "100%",
            placeholder: 'Select Product',
        }).on("select2:select", function (e) {
            $('#sales_price').val($('#sales_pro_code').select2().find(':selected').data('price'))
            $('#sales_pro_unit').val($('#sales_pro_code').select2().find(':selected').data('unit'))
        });
        $('#debit_cus_code').select2({
            dropdownParent: "#debit_entry",
            width: "100%",
            placeholder: 'Select Customer',
        });
    $('#credit_cus_code').select2({
            dropdownParent: "#credit_entry",
            width: "100%",
            placeholder: 'Select Customer',
        });

    });

}
else if (url_path[url_path.length - 1] === 'home.php') 
{
    $(document).ready(function () {
        $('#loader').modal('show');
        setInterval(function () { $('#loader').modal('hide'); }, 1000);
    });
}

function quality_and_price_convter(type) {
    if (type == 'purchase') 
    {
        quality_id = '#purchase_quality'
        price_per_kg_id = '#purchase_price'
        price_per_kg_tot = '#purchase_price_total'
        cur_unit_id = '#purchase_pro_unit'
        default_unit_id = '#purchase_pro_code'
    }
    else if (type == 'sales') 
    {
        quality_id = '#sales_quality'
        price_per_kg_id = '#sales_price'
        price_per_kg_tot = '#sales_price_total'
        cur_unit_id = '#sales_pro_unit'
        default_unit_id = '#sales_pro_code'
    }

    quality = $(quality_id).val()
    price_per_kg = $(price_per_kg_id).val()
    cur_unit = $(cur_unit_id).val()
    default_unit = $(default_unit_id).select2().find(':selected').data('unit')
    if (cur_unit == default_unit) {
        $(price_per_kg_tot).val(quality * price_per_kg);
    }
    else 
    {
        $(price_per_kg_tot).val((quality / 1000) * price_per_kg);
    }
}

function credit_entry() {
    datas = {
        credit_cus_code: $('#credit_cus_code').val(),
        credit_amount: $('#credit_amount').val(),
        date: $('#datepicker').val()
    }
    $.ajax({
        url: base_url + 'backend.php/credit_entry',
        type: 'POST',
        data: JSON.stringify(datas),
        dataType: 'html',
        contentType: "application/x-www-form-urlencoded",
        cache: false,
        processData: false,
        success: function (data) {
            data = data.replace(/\d$/, '')
            // window.location.reload();
        }
    });
}

function debit_entry() {
    datas = {
        debit_cus_code: $('#debit_cus_code').val(),
        debit_amount: $('#debit_amount').val(),
        date: $('#datepicker').val()
    }
    $.ajax({
        url: base_url + 'backend.php/debit_entry',
        type: 'POST',
        data: JSON.stringify(datas),
        dataType: 'html',
        contentType: "application/x-www-form-urlencoded",
        cache: false,
        processData: false,
        success: function (data) {
            data = data.replace(/\d$/, '')
            // window.location.reload();
        }
    });
}

function report_period(type)
{
    if (type=='month')
    {
        $('#month_report').show();
        $('#date_report').hide();
    }
    else if (type=='date')
    {
        $('#date_report').show();
        $('#month_report').hide();
    }
    
    $('#submit_btn').show();
}

$('[data-toggle="datepicker_yr"]').datepicker({
    format:'yyyy',
    });

$('[data-toggle="datepicker"]').datepicker({
    format: 'yyyy-mm-dd',
    });

$('[data-toggle="datepicker"]').on('change', function (e) {
    // Update the value of the date input without reloading or making an AJAX call
    $.ajax({
        url: base_url + 'backend.php/set_date',
        type: 'POST',
        data: JSON.stringify({ date: $(this).val() }),
        dataType: 'html',
        contentType: "application/x-www-form-urlencoded",
        cache: false,
        processData: false,
        success: function (data) {
            data = data.replace(/\d$/, '')
            // window.location.reload();
        }
    })
});


$('[data-toggle="datepicker_yr"]').on('change', function (e) {
    load_report_table('month')
});

if (sessionStorage.getItem("entry_date"))
{
    $('[data-toggle="datepicker"]').val(sessionStorage.getItem("entry_date"));
}

function report_download()
{
    var report_period = $('#report_period').val();
    if (report_period == 'month')
    {
        datas = {'report_period':report_period, 'month':$('#tamil_month').val(),'year':$('#datepicker_yr').val(),"cus_code":""};
    }
    else if (report_period == 'date') 
    {
        // console.log($('#datepicker_start').val() , $('#datepicker_end').val())
        if ($('#datepicker_start').val() == $('#datepicker_end').val())
        {
            datas = {'report_period':report_period, 'report_type':$('#report_type').val(),'date':$('#datepicker_start').val(),"cus_code":""};
        }
        else
        {
            report_period = 'date_wise_month';
            datas = {'report_period':report_period, 'report_type':$('#report_type').val(),'date_start':$('#datepicker_start').val(),'date_end':$('#datepicker_end').val(),"cus_code":""};
        }
    }

    $.ajax({
        url: base_url + 'report_backend.php/download',
        type: 'POST',
        data: JSON.stringify(datas),
        dataType: 'html',
        contentType: "application/x-www-form-urlencoded",
        cache: false,
        processData: false,
        success: function (data) {
            window.open(data);
        }
    });
}

function load_report_table(period_type)
{
    if (period_type == 'month')
    {
        datas = {period_type:'month', 'month':$('#tamil_month').val(),'year':$('#datepicker_yr').val()}
    }
    else if (period_type == 'date')
    {
        datas = { 'period_type': period_type, 'report_type': $('#report_type').val(), 'date': $('#datepicker_start').val() };
    }
    $.ajax({
        url: base_url + 'report_backend.php/loadTable',
        type: 'POST',
        data: JSON.stringify(datas),
        dataType: 'html',
        contentType: "application/x-www-form-urlencoded",
        cache: false,
        processData: false,
        success: function (data) {
            data = data.replace(/\d$/, '')
            $('#report_detail_table').replaceWith(data);
            
        }
    });
}

function report_send_whatsapp()
{
    var period_type = $('#report_period').val();
    if (period_type == 'month')
    {
        datas = {period_type:'month', 'month':$('#tamil_month').val(),'year':$('#datepicker_yr').val()}
    }
    else if (period_type == 'date')
    {
        datas = { 'period_type': period_type, 'report_type': $('#report_type').val(), 'date': $('#datepicker').val() };
    }
    $.ajax({
        url: base_url + 'report_backend.php/sendWhatsapp',
        type: 'POST',
        data: JSON.stringify(datas),
        dataType: 'html',
        contentType: "application/x-www-form-urlencoded",
        cache: false,
        processData: false,
        success: function (data) {
            data = data.replace(/\d$/, '')
            $('#report_detail_table').replaceWith(data);
            
        }
    });
}

function login()
{
    username = $('#username').val();
    password = $('#userpass').val();
    if (username == '')
    {
        alert('பயனர் பெயரை உள்ளிடவும்');
    }
    else if (password == '')
    {
        alert('கடவுச்சொல்லை உள்ளிடவும்');
    }
    else
    {
        datas = { 'username': username, 'password': password }
        $.ajax({
            url: base_url + 'backend.php/login',
            type: 'POST',
            data: JSON.stringify(datas),
            dataType: 'html',
            contentType: "application/x-www-form-urlencoded",
            cache: false,
            processData: false,
            success: function (data) 
            {
                if (data.match("home.php"))
                {
                    window.location.href = data;
                }
                else
                {
                    alert(data);
                }
            }
        });
    }
}


function single_report_download(cus_code)
{
    var report_period = $('#report_period').val();
    if (report_period == 'month')
    {
        datas = {'report_period':report_period, 'month':$('#tamil_month').val(),'year':$('#datepicker_yr').val(),"cus_code":cus_code};
    }
    else if (report_period == 'date') 
    {
        if ($('#datepicker_start').val() == $('#datepicker_end').val())
        {
            datas = {'report_period':report_period, 'report_type':$('#report_type').val(),'date':$('#datepicker_start').val(),"cus_code":cus_code};
        }
        else
        {
            report_period = 'date_wise_month';
            datas = {'report_period':report_period, 'report_type':$('#report_type').val(),'date_start':$('#datepicker_start').val(),'date_end':$('#datepicker_end').val(),"cus_code":cus_code};
        }        
    }
    $.ajax({
        url: base_url + 'report_backend.php/download',
        type: 'POST',
        data: JSON.stringify(datas),
        dataType: 'html',
        contentType: "application/x-www-form-urlencoded",
        cache: false,
        processData: false,
        success: function (data) {
            window.open(data);
        }
    });
}

function delete_sales(sales_id, sales_total, customer_supplier_code, sales_date) {
    if (confirm("Are you sure delete") == true) {
        datas = { 'sales_id': sales_id, 'sales_total': sales_total, "customer_supplier_code": customer_supplier_code, "sales_date": sales_date }
        $.ajax({
            url: base_url + 'backend.php/delete_sales',
            type: 'POST',
            data: JSON.stringify(datas),
            dataType: 'html',
            contentType: "application/x-www-form-urlencoded",
            cache: false,
            processData: false,
            success: function (data) {
                // window.location.reload();
            }
        });
    }
}

function delete_purchase(purchase_id, purchase_total, customer_supplier_code, purchase_date) {
    if (confirm("Are you sure delete") == true) {
        datas = { 'purchase_id': purchase_id, 'purchase_total': purchase_total, "customer_supplier_code": customer_supplier_code, "purchase_date": purchase_date }
        $.ajax({
            url: base_url + 'backend.php/delete_purchase',
            type: 'POST',
            data: JSON.stringify(datas),
            dataType: 'html',
            contentType: "application/x-www-form-urlencoded",
            cache: false,
            processData: false,
            success: function (data) {
                // window.location.reload();
            }
        });
    }
}
