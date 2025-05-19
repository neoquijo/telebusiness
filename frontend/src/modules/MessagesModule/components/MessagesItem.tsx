// frontend/src/modules/MessagesModule/Components/MessageItem.tsx
import React from 'react';
import { MdMessage } from 'react-icons/md';
import { FaUser, FaBroadcastTower, FaFilter, FaClock } from 'react-icons/fa';
import { TelegramMessage } from '../../../API/messagesApi';
import css from './MessageItem.module.css';

interface MessageItemProps {
  message: TelegramMessage;
  index: number;
  searchQuery?: string;
  onClick: () => void;
}

const highlightText = (text: string, query: string) => {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.split(regex).map((part, index) =>
    regex.test(part) ? (
      <span key={index} className={css.highlight}>
        {part}
      </span>
    ) : (
      part
    )
  );
};

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  index,
  searchQuery = '',
  onClick
}) => {
  const getSourceInfo = () => {
    switch (message.sourceType) {
      case 'Private':
        return { icon: FaUser, label: 'Личный чат', color: '#2196f3' };
      case 'Channel':
        return { icon: FaBroadcastTower, label: 'Канал', color: '#ff9800' };
      case 'Chat':
      case 'Group':
        return { icon: MdMessage, label: 'Группа', color: '#4caf50' };
      default:
        return { icon: MdMessage, label: message.sourceType, color: '#607d8b' };
    }
  };

  const sourceInfo = getSourceInfo();
  const SourceIcon = sourceInfo.icon;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div
      className={`${css.item} ${index % 2 === 0 ? css.even : css.odd}`}
      onClick={onClick}
    >
      <div className={css.main}>
        <div className={css.content}>
          <div className={css.header}>
            <div className={css.sourceInfo}>
              <div
                className={css.sourceBadge}
                style={{ backgroundColor: sourceInfo.color }}
              >
                <SourceIcon className={css.sourceIcon} />
                <span>{sourceInfo.label}</span>
              </div>
              <span className={css.accountInfo}>
                Account: {message.accountString}
              </span>
            </div>
            <div className={css.meta}>
              <FaClock className={css.clockIcon} />
              <span className={css.date}>
                {formatDate(message.createdAt)}
              </span>
            </div>
          </div>

          <div className={css.messageContent}>
            <p className={css.messageText}>
              {searchQuery
                ? highlightText(truncateText(message.messageText), searchQuery)
                : truncateText(message.messageText)
              }
            </p>
          </div>

          <div className={css.footer}>
            {message.filtered && message.filtered.length > 0 && (
              <div className={css.filterInfo}>
                <FaFilter className={css.filterIcon} />
                <span className={css.filterText}>
                  Отфильтровано: {message.filterNames.join(', ')}
                </span>
              </div>
            )}

            {message.generatedTags && message.generatedTags.length > 0 && (
              <div className={css.tags}>
                {message.generatedTags.map((tag, idx) => (
                  <span key={idx} className={css.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;