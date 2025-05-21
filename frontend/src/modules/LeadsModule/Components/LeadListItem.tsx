// frontend/src/modules/LeadsModule/Components/LeadListItem.tsx
import React from 'react';
import { FaUserTie, FaTelegram, FaCalendarAlt, FaGlobe } from 'react-icons/fa';
import { IoMdEye } from 'react-icons/io';
import { MdLabelOutline } from 'react-icons/md';
import Button from '../../../shared/components/UI/Button/Button';
import { Lead } from '../../../API/leadsApi';
import css from './LeadListItem.module.css';

interface LeadListItemProps {
  lead: Lead;
  onSelect: () => void;
}

const LeadListItem: React.FC<LeadListItemProps> = ({ lead, onSelect }) => {
  // Проверяем, существуют ли необходимые поля
  if (!lead || !lead.id) {
    console.warn("Invalid lead data:", lead);
    return null;
  }

  // Форматирование даты
  const formatDate = (dateString: string | number | undefined) => {
    if (!dateString) return "Нет даты";

    try {
      const date = typeof dateString === 'string'
        ? new Date(dateString)
        : new Date(dateString);

      return date.toLocaleDateString()
    } catch (error) {
      return "Ошибка даты";
    }
  };

  return (
    <div className={css.leadItem}>
      <div className={css.mainInfo}>
        <div className={css.icon}>
          <FaUserTie className={css.avatarIcon} />
        </div>

        <div className={css.details}>
          <div className={css.primaryInfo}>
            <h3 className={css.title}>Лид #{lead.id.slice(0, 8)}</h3>

            <div className={css.badges}>
              <span className={css.categoryBadge}>
                <MdLabelOutline className={css.categoryIcon} />
                {lead.mainCategory || "Без категории"}
              </span>

              <span className={css.sourceBadge}>
                <FaGlobe className={css.sourceIcon} />
                {lead.messageType || "Неизвестно"}
              </span>
            </div>
          </div>

          <div className={css.message}>
            {lead.messageText}
          </div>

          <div className={css.metadata}>
            <div className={css.metaItem}>
              <FaTelegram className={css.metaIcon} />
              ID: {lead.sender}
            </div>

            <div className={css.metaItem}>
              <FaCalendarAlt className={css.metaIcon} />
              {formatDate(lead.sentAt || lead.createdAt)}
            </div>
          </div>
        </div>
      </div>

      <div className={css.actions}>
        <Button
          variant="primary"
          icon={IoMdEye}
          onClick={onSelect}
        >
          Просмотр
        </Button>
      </div>
    </div>
  );
};

export default LeadListItem;
