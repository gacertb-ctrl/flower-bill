import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Table from '../components/Table';
import { fetchStocks } from '../api/stockAPI';

const StocksPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [stockData, setStockData] = useState([]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchStockData(date);
  };

  const fetchStockData = async (date) => {
    try {
      const data = await fetchStocks(date);
      setStockData(data);
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
  };

  // Fetch initial data with the current date
  React.useEffect(() => {
    fetchStockData(selectedDate);
  }, [selectedDate]);

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <div className="my-3"> {/* Added margin for spacing */}
            <DatePicker selected={selectedDate} onChange={handleDateChange} className="form-control" />
          </div>
          <div className="row">
            <div className="col-12">
              <Table page="stocks" data={stockData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StocksPage;