import React from 'react';
import './InfoCard.css';

const InfoCard = ({ title, items }) => {
  const getValueClassName = (type) => {
    switch (type) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      case 'locked':
        return 'status-locked';
      default:
        return '';
    }
  };

  return (
    <div className="info-card">
      <h3>{title}</h3>
      <div className="info-list">
        {items.map((item, index) => (
          <div key={index} className="info-item">
            <span>{item.label}</span>
            <span className={getValueClassName(item.type)}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoCard;