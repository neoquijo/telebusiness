// frontend/src/modules/LeadsModule/Components/LeadItem.tsx
import React from 'react';
import { FaUserTie, FaEnvelope, FaPhone } from 'react-icons/fa';
import { IoMdEye } from 'react-icons/io';
import Button from '../../../shared/components/UI/Button/Button';
import css from './LeadItem.module.css';

interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  status: 'new' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: number;
  updatedAt?: number;
  notes?: string;
  assignedTo?: {
    id: string;
    username: string;
  };
}

interface LeadItemProps {
  lead: Lead;
  onSelect: () => void;
}

const LeadItem: React.FC<LeadItemProps> = ({ lead, onSelect }) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'Новый';
      case 'in_progress': return 'В работе';
      case 'completed': return 'Завершен';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  return (
    <div className={css.leadItem}>
      <div className={css.leadInfo} style={{ flex: 2 }}>
        <div className={css.avatar}>
          <FaUserTie className={css.avatarIcon} />
        </div>
        <div className={css.name}>{lead.name}</div>
      </div>

      <div className={css.contacts}>
        {lead.email && (
          <div className={css.contact}>
            <FaEnvelope className={css.contactIcon} />
            <span className={css.contactText}>{lead.email}</span>
          </div>
        )}
        {lead.phone && (
          <div className={css.contact}>
            <FaPhone className={css.contactIcon} />
            <span className={css.contactText}>{lead.phone}</span>
          </div>
        )}
      </div>

      <div className={css.source}>{lead.source || '-'}</div>

      <div className={css.status}>
        <div className={`${css.statusBadge} ${css[`status-${lead.status}`]}`}>
          {getStatusLabel(lead.status)}
        </div>
      </div>

      <div className={css.date}>{formatDate(lead.createdAt)}</div>

      <div className={css.actions}>
        <Button
          variant="ghost"
          icon={IoMdEye}
          onClick={onSelect}
          title="Просмотреть детали"
        >
          Просмотр
        </Button>
      </div>
    </div>
  );
};

export default LeadItem;
