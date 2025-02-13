import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './RevenueChart.css';

const RevenueChart = () => {
  const [timeRange, setTimeRange] = useState('week'); 
  

  const weekData = [
    { date: 'T2', revenue: 4500000, orders: 120 },
    { date: 'T3', revenue: 5200000, orders: 145 },
    { date: 'T4', revenue: 4800000, orders: 130 },
    { date: 'T5', revenue: 6100000, orders: 160 },
    { date: 'T6', revenue: 5800000, orders: 155 },
    { date: 'T7', revenue: 7200000, orders: 190 },
    { date: 'CN', revenue: 6500000, orders: 170 }
  ];

  const monthData = [

  ];

  const yearData = [

  ];

  const getData = () => {
    switch (timeRange) {
      case 'week':
        return weekData;
      case 'month':
        return monthData;
      case 'year':
        return yearData;
      default:
        return weekData;
    }
  };

  const formatRevenue = (value) => {
    return `${(value / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="revenue-chart">
      <div className="chart-header">
        <h3>Biểu đồ doanh thu</h3>
        <div className="chart-controls">
          <button
            className={`btn-range ${timeRange === 'week' ? 'active' : ''}`}
            onClick={() => setTimeRange('week')}
          >
            Tuần
          </button>
          <button
            className={`btn-range ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            Tháng
          </button>
          <button
            className={`btn-range ${timeRange === 'year' ? 'active' : ''}`}
            onClick={() => setTimeRange('year')}
          >
            Năm
          </button>
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={getData()} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis 
              yAxisId="left" 
              tickFormatter={formatRevenue}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              tickFormatter={(value) => `${value} đơn`}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'revenue') return formatRevenue(value);
                return `${value} đơn`;
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              name="Doanh thu"
              stroke="#0d6efd"
              activeDot={{ r: 8 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              name="Số đơn"
              stroke="#198754"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;