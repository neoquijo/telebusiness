// frontend/src/modules/MessagesModule/Components/StatisticsCard.tsx
import React from 'react';
import { IconType } from 'react-icons';
import css from './StatisticsCard.module.css';

export interface StatisticsCardProps {
  title: string;
  value: number | string;
  icon: IconType;
  color: string;
  subtitle?: string;
  compact?: boolean;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  compact = false
}) => {
  return (
    <div className={`${css.card} ${compact ? css.compactCard : ''}`}>
      <div 
        className={css.icon} 
        style={{ 
          backgroundColor: `${color}15`, 
          color: color 
        }}
      >
        <Icon />
      </div>
      <div className={css.content}>
        <div className={`${css.value} ${compact ? css.compactValue : ''}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className={`${css.title} ${compact ? css.compactTitle : ''}`}>{title}</div>
        {subtitle && <div className={`${css.subtitle} ${compact ? css.compactSubtitle : ''}`}>{subtitle}</div>}
      </div>
    </div>
  );
};

export default StatisticsCard;