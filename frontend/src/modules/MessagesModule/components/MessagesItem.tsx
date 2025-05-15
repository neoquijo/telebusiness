// src/modules/MessagesModule/components/MessageItem.tsx
import { FC } from 'react';
import css from './MessageItem.module.css';
import { TelegramMessage } from '../../../API/messagesApi';
import { FaUser, FaUsers, FaBroadcastTower, FaFilter } from 'react-icons/fa';

interface IProps {
  message: TelegramMessage;
}

const MessageItem: FC<IProps> = ({ message }) => {
  const getSourceIcon = () => {
    switch (message.sourceType) {
      case 'Private':
        return <FaUser />;
      case 'Group':
        return <FaUsers />;
      case 'Channel':
        return <FaBroadcastTower />;
      default:
        return <FaUser />;
    }
  };

  const getSourceTypeLabel = () => {
    switch (message.sourceType) {
      case 'Private':
        return 'Личная переписка';
      case 'Group':
        return 'Группа';
      case 'Channel':
        return 'Канал';
      default:
        return message.sourceType;
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={css.wrapper}>
      <div className={css.header}>
        <div className={css.source}>
          <div className={css.sourceIcon}>
            {getSourceIcon()}
          </div>
          <div className={css.sourceInfo}>
            <div className={css.sourceType}>{getSourceTypeLabel()}</div>
            <div className={css.accountInfo}>
              Аккаунт: {message.accountString}
              {message.sender && <span> • ID отправителя: {message.sender}</span>}
            </div>
          </div>
        </div>
        <div className={css.date}>
          {formatDate(message.createdAt)}
        </div>
      </div>

      <div className={css.content}>
        <div className={css.messageText}>
          {message.messageText || <span className={css.noText}>Сообщение без текста</span>}
        </div>

        {message.messageMedia && message.messageMedia.length > 0 && (
          <div className={css.media}>
            <div className={css.mediaLabel}>
              📎 Содержит медиа ({message.messageMedia.length})
            </div>
          </div>
        )}
      </div>

      {message.filtered && message.filtered.length > 0 && (
        <div className={css.filters}>
          <div className={css.filtersHeader}>
            <FaFilter className={css.filterIcon} />
            <span>Соответствует фильтрам:</span>
          </div>
          <div className={css.filterTags}>
            {message.filterNames.map((filterName, index) => (
              <span key={index} className={css.filterTag}>
                {filterName}
              </span>
            ))}
          </div>
        </div>
      )}

      {message.generatedTags && message.generatedTags.length > 0 && (
        <div className={css.tags}>
          <div className={css.tagsLabel}>Теги:</div>
          <div className={css.tagsList}>
            {message.generatedTags.map((tag, index) => (
              <span key={index} className={css.tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageItem;