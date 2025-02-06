import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, details }) => {
  const getDetailClassName = (type) => {
    switch (type) {
      case 'active':
        return 'stat-active';
      case 'inactive':
        return 'stat-inactive';
      case 'month':
        return 'stat-month';
      default:
        return '';
    }
  };

  return (
    <div className="stat-card">
      <h3>{title}</h3>
      <p className="stat-value">{value}</p>
      <div className="stat-details">
        {details.map((detail, index) => (
          <p 
            key={index} 
            className={getDetailClassName(detail.type)}
          >
            {detail.label}: {detail.value}
          </p>
        ))}
      </div>
    </div>
  );
};

export default StatCard;