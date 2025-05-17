// frontend/src/modules/MessagesModule/Components/StatisticsCard.tsx
import React from 'react';
import { IconType } from 'react-icons';
import css from './StatisticsCard.module.css';

interface StatisticsCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  color: string;
  subtitle?: string;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString('ru-RU');
    }
    return val;
  };

  return (
    <div className={css.card}>
      <div className={css.header}>
        <div className={css.iconContainer} style={{ backgroundColor: color }}>
          <Icon className={css.icon} />
        </div>
        <div className={css.content}>
          <h3 className={css.title}>{title}</h3>
          <span style={{ display: 'flex', flexDirection: 'column' }}>

            <div className={css.value}>{formatValue(value)}</div>
            {subtitle && <p className={css.subtitle}>{subtitle}</p>}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatisticsCard;