// frontend/src/modules/LeadsModule/Components/LeadCard.tsx
import React from 'react';
import {
  FaUser,
  FaTelegram,
  FaCalendarAlt,
  FaGlobe,
  FaFilter,
  FaPercentage,
  FaTag,
  FaExclamationTriangle
} from 'react-icons/fa';
import { MdLabelOutline } from 'react-icons/md';
import { BsChatText } from 'react-icons/bs';
import { Lead } from '../../../API/leadsApi';
import css from './LeadCard.module.css';

interface LeadCardProps {
  lead: Lead;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead }) => {
  // Форматирование даты
  const formatDate = (dateString: string | number) => {
    try {
      const date = typeof dateString === 'string'
        ? new Date(dateString)
        : new Date(dateString);

      return date.toLocaleDateString()
    } catch (error) {
      return 'Некорректная дата';
    }
  };

  return (
    <div className={css.leadCard}>
      <div className={css.header}>
        <div className={css.headerInfo}>
          <h2 className={css.title}>Лид #{lead.id}</h2>
          <div className={css.categoryBadge}>
            <MdLabelOutline className={css.categoryIcon} />
            {lead.mainCategory || 'Без категории'}
          </div>
        </div>

        <div className={css.confidence}>
          <span className={css.confidenceLabel}>Уверенность:</span>
          <div className={css.confidenceValue}>
            <FaPercentage className={css.confidenceIcon} />
            {Math.round(lead.confidence * 100)}%
          </div>
        </div>
      </div>

      <div className={css.content}>
        <div className={css.section}>
          <h3 className={css.sectionTitle}>
            <BsChatText className={css.sectionIcon} />
            Сообщение
          </h3>
          <div className={css.messageContent}>
            {lead.messageText}
          </div>
        </div>

        <div className={css.columns}>
          <div className={css.column}>
            <div className={css.section}>
              <h3 className={css.sectionTitle}>
                <FaUser className={css.sectionIcon} />
                Отправитель
              </h3>
              <div className={css.infoList}>
                <div className={css.infoItem}>
                  <span className={css.infoLabel}>ID:</span>
                  <span className={css.infoValue}>{lead.sender}</span>
                </div>
                {lead.senderUsername && (
                  <div className={css.infoItem}>
                    <span className={css.infoLabel}>Имя пользователя:</span>
                    <span className={css.infoValue}>{lead.senderUsername}</span>
                  </div>
                )}
                <div className={css.infoItem}>
                  <span className={css.infoLabel}>Тип чата:</span>
                  <span className={css.infoValue}>{lead.chatType}</span>
                </div>
                {lead.chatTitle && (
                  <div className={css.infoItem}>
                    <span className={css.infoLabel}>Название чата:</span>
                    <span className={css.infoValue}>{lead.chatTitle}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={css.section}>
              <h3 className={css.sectionTitle}>
                <FaGlobe className={css.sectionIcon} />
                Детали
              </h3>
              <div className={css.infoList}>
                <div className={css.infoItem}>
                  <span className={css.infoLabel}>Язык:</span>
                  <span className={css.infoValue}>{lead.lang}</span>
                </div>
                <div className={css.infoItem}>
                  <span className={css.infoLabel}>Тип сообщения:</span>
                  <span className={css.infoValue}>{lead.messageType}</span>
                </div>
                <div className={css.infoItem}>
                  <span className={css.infoLabel}>Скам:</span>
                  <span className={`${css.infoValue} ${lead.isScam ? css.scamTrue : css.scamFalse}`}>
                    {lead.isScam ? 'Да' : 'Нет'}
                    {lead.isScam && <FaExclamationTriangle className={css.scamIcon} />}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={css.column}>
            <div className={css.section}>
              <h3 className={css.sectionTitle}>
                <FaTelegram className={css.sectionIcon} />
                Аккаунт
              </h3>
              <div className={css.infoList}>
                {lead.account ? (
                  <>
                    <div className={css.infoItem}>
                      <span className={css.infoLabel}>Название:</span>
                      <span className={css.infoValue}>{lead.account.name}</span>
                    </div>
                    <div className={css.infoItem}>
                      <span className={css.infoLabel}>ID:</span>
                      <span className={css.infoValue}>{lead.account.id}</span>
                    </div>
                    <div className={css.infoItem}>
                      <span className={css.infoLabel}>Телефон:</span>
                      <span className={css.infoValue}>{lead.account.phone}</span>
                    </div>
                    <div className={css.infoItem}>
                      <span className={css.infoLabel}>Статус:</span>
                      <span className={`${css.infoValue} ${css[`status-${lead.account.status}`]}`}>
                        {lead.account.status}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className={css.infoItem}>
                    <span className={css.infoValue}>Нет данных об аккаунте</span>
                  </div>
                )}
              </div>
            </div>

            <div className={css.section}>
              <h3 className={css.sectionTitle}>
                <FaCalendarAlt className={css.sectionIcon} />
                Время
              </h3>
              <div className={css.infoList}>
                <div className={css.infoItem}>
                  <span className={css.infoLabel}>Отправлено:</span>
                  <span className={css.infoValue}>{formatDate(lead.sentAt)}</span>
                </div>
                <div className={css.infoItem}>
                  <span className={css.infoLabel}>Создано:</span>
                  <span className={css.infoValue}>{formatDate(lead.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={css.section}>
          <h3 className={css.sectionTitle}>
            <FaFilter className={css.sectionIcon} />
            Фильтр
          </h3>
          {lead.matchedFilter ? (
            <div className={css.filterInfo}>
              <div className={css.filterName}>
                {lead.matchedFilter.name}
              </div>
              <div className={css.filterDetails}>
                {lead.matchedFilter.includesText.length > 0 && (
                  <div className={css.filterItem}>
                    <span className={css.filterLabel}>Включает тексты:</span>
                    <div className={css.tagsList}>
                      {lead.matchedFilter.includesText.map((text, index) => (
                        <span key={index} className={css.tag}>{text}</span>
                      ))}
                    </div>
                  </div>
                )}
                {lead.matchedFilter.excludesText.length > 0 && (
                  <div className={css.filterItem}>
                    <span className={css.filterLabel}>Исключает тексты:</span>
                    <div className={css.tagsList}>
                      {lead.matchedFilter.excludesText.map((text, index) => (
                        <span key={index} className={css.tag}>{text}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={css.noFilter}>Нет данных о сработавшем фильтре</div>
          )}
        </div>

        {lead.keywords && lead.keywords.length > 0 && (
          <div className={css.section}>
            <h3 className={css.sectionTitle}>
              <FaTag className={css.sectionIcon} />
              Ключевые слова
            </h3>
            <div className={css.keywordsList}>
              {lead.keywords.map((keyword, index) => (
                <span key={index} className={css.keyword}>{keyword}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadCard;
