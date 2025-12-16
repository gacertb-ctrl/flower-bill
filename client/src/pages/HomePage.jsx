import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { fetchStocks } from '../api/stockAPI'; //
import { getAllSalesEntries, getAllPurchaseEntries } from '../api/entryAPI'; //

const HomePage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    barData: [],
    pieData: [],
    totals: { sales: 0, purchase: 0 }
  });

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const today = new Date();
        const dateString = today.toISOString().split('T')[0]; // Format YYYY-MM-DD

        // 1. Fetch Data in Parallel
        const [stocksData, salesData, purchaseData] = await Promise.all([
          fetchStocks(today),           // Get current stocks
          getAllSalesEntries(dateString), // Get today's sales
          getAllPurchaseEntries(dateString) // Get today's purchases
        ]);

        // 2. Process Data for Bar Chart (Product Wise: Stock vs Sales vs Purchase)
        // We create a map to aggregate counts by product name
        const productMap = {};

        // Process Stocks (Base)
        if (Array.isArray(stocksData)) {
          stocksData.forEach(item => {
            const name = item.productName || item.product_name || "Unknown";
            if (!productMap[name]) productMap[name] = { name, stock: 0, sales: 0, purchase: 0 };
            productMap[name].stock += Number(item.quantity || 0);
          });
        }

        // Process Sales (Add to map)
        if (Array.isArray(salesData)) {
          salesData.forEach(entry => {
            // Assuming entry has items array or product details. 
            // Adjust 'productName' based on your specific Sales Entry object structure
            const name = entry.productName || entry.product_name;
            if (name) {
              if (!productMap[name]) productMap[name] = { name, stock: 0, sales: 0, purchase: 0 };
              productMap[name].sales += Number(entry.quantity || 1);
            }
          });
        }

        // Process Purchases (Add to map)
        if (Array.isArray(purchaseData)) {
          purchaseData.forEach(entry => {
            const name = entry.productName || entry.product_name;
            if (name) {
              if (!productMap[name]) productMap[name] = { name, stock: 0, sales: 0, purchase: 0 };
              productMap[name].purchase += Number(entry.quantity || 1);
            }
          });
        }

        const barData = Object.values(productMap);

        // 3. Process Data for Pie Chart (Total Amounts)
        const totalSalesAmt = Array.isArray(salesData)
          ? salesData.reduce((acc, curr) => acc + Number(curr.totalAmount || curr.sales_total || 0), 0)
          : 0;

        const totalPurchaseAmt = Array.isArray(purchaseData)
          ? purchaseData.reduce((acc, curr) => acc + Number(curr.totalAmount || curr.purchase_total || 0), 0)
          : 0;

        const totalSales = salesData.length

        const totalPurchase = purchaseData.length;

        const pieData = [
          { name: 'Total Sales', value: totalSales },
          { name: 'Total Purchase', value: totalPurchase },
        ];

        setDashboardData({
          barData,
          pieData,
          totals: { sales: totalSalesAmt, purchase: totalPurchaseAmt }
        });

      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Format Current Date
  const currentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t('loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-5 p-4">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <h2 className="fw-bold text-primary">Dashboard</h2>
          <div className="text-end">
            <h5 className="mb-0 text-muted">{currentDate}</h5>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <div className="card shadow-sm border-start border-success border-5">
            <div className="card-body">
              <h5 className="card-title text-success">Total Sales (Today)</h5>
              <h3 className="fw-bold">₹ {dashboardData.totals.sales.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="card shadow-sm border-start border-warning border-5">
            <div className="card-body">
              <h5 className="card-title text-warning">Total Purchase (Today)</h5>
              <h3 className="fw-bold">₹ {dashboardData.totals.purchase.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="row">
        {/* Bar Chart: Stock vs Purchase vs Sales */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white fw-bold">
              Product Overview (Stock vs Sales vs Purchase)
            </div>
            <div className="card-body">
              <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={dashboardData.barData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="stock" fill="#8884d8" name="Current Stock" />
                    <Bar dataKey="purchase" fill="#82ca9d" name="Purchase Qty" />
                    <Bar dataKey="sales" fill="#ffc658" name="Sales Qty" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Pie Chart: Total Amount Comparison */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white fw-bold">
              Sales vs Purchase (Amount)
            </div>
            <div className="card-body d-flex justify-content-center align-items-center">
              <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={dashboardData.pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dashboardData.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#28a745' : '#ffc107'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹ ${value.toLocaleString()}`} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;