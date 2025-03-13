import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Radio } from "antd";
import "./RevenueChart.css";

const RevenueChart = ({
  data = [],
  onTimeRangeChange,
  selectedTimeRange = "week",
}) => {
  // Format số tiền thành định dạng tiền tệ
  const formatCurrency = (value) => {
    if (!value && value !== 0) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleTimeRangeChange = (e) => {
    if (onTimeRangeChange) {
      onTimeRangeChange(e.target.value);
    }
  };

  return (
    <div className="revenue-chart">
      <div className="chart-header">
        <h3>Biểu đồ doanh thu</h3>
        <Radio.Group
          value={selectedTimeRange}
          onChange={handleTimeRangeChange}
          buttonStyle="solid"
        >
          <Radio.Button value="week">Tuần</Radio.Button>
          <Radio.Button value="month">Tháng</Radio.Button>
          <Radio.Button value="year">Năm</Radio.Button>
        </Radio.Group>
      </div>

      <div className="chart-container">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis
                yAxisId="left"
                tickFormatter={formatCurrency}
                label={{
                  value: "Doanh thu",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => `${value} đơn`}
                label={{ value: "Số đơn", angle: 90, position: "insideRight" }}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "revenue") return formatCurrency(value);
                  return `${value} đơn`;
                }}
                labelFormatter={(label) => `Ngày: ${label}`}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                name="Doanh thu"
                stroke="#1890ff"
                strokeWidth={2}
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                name="Số đơn"
                stroke="#52c41a"
                strokeWidth={2}
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data">
            <p>Không có dữ liệu doanh thu</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueChart;
