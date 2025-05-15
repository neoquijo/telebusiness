// frontend/src/modules/DialogsModule/Components/DialogItem.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBroadcastTower, FaUser, FaUsers, FaEye } from 'react-icons/fa';
import { IoIosChatboxes } from 'react-icons/io';
import { RiRobot2Line } from 'react-icons/ri';
import { NormalizedDialog } from '../../AccountsModule/types';
import css from './DialogItem.module.css';

interface DialogItemProps {
  chat: NormalizedDialog;
  index: number;
  searchQuery?: string;
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

const DialogItem: React.FC<DialogItemProps> = ({ chat, index, searchQuery = '' }) => {
  const navigate = useNavigate();

  const getTypeInfo = () => {
    switch (chat.type) {
      case 'User':
        return {
          icon: chat.isBot ? RiRobot2Line : FaUser,
          label: chat.isBot ? 'Бот' : 'Личный чат',
          color: chat.isBot ? '#9c27b0' : '#2196f3'
        };
      case 'Channel':
        return {
          icon: FaBroadcastTower,
          label: 'Канал',
          color: '#ff9800'
        };
      case 'Chat':
      case 'Group':
        return {
          icon: FaUsers,
          label: 'Группа',
          color: '#4caf50'
        };
      case 'Forum':
        return {
          icon: IoIosChatboxes,
          label: 'Форум',
          color: '#673ab7'
        };
      default:
        return {
          icon: IoIosChatboxes,
          label: chat.type,
          color: '#607d8b'
        };
    }
  };

  const typeInfo = getTypeInfo();
  const TypeIcon = typeInfo.icon;

  const handleClick = () => {
    navigate(`/dialogs/detail/${chat.id}`);
  };

  return (
    <div
      className={`${css.item} ${index % 2 === 0 ? css.even : css.odd}`}
      onClick={handleClick}
    >
      <div className={css.main}>
        <div className={css.content}>
          <div className={css.header}>
            <h3 className={css.title}>
              {searchQuery ? highlightText(chat.title, searchQuery) : chat.title}
            </h3>
            <div className={css.badges}>
              <div
                className={css.typeBadge}
                style={{ backgroundColor: typeInfo.color }}
              >
                <TypeIcon className={css.typeIcon} />
                <span>{typeInfo.label}</span>
              </div>
            </div>
          </div>

          {chat.description && (
            <p className={css.description}>
              {searchQuery ? highlightText(chat.description, searchQuery) : chat.description}
            </p>
          )}

          <div className={css.stats}>
            {chat.participantsCount !== undefined && (
              <div className={css.stat}>
                <FaUsers className={css.statIcon} />
                <span>{chat.participantsCount.toLocaleString()} участников</span>
              </div>
            )}

            {chat.unreadCount > 0 && (
              <div className={css.stat}>
                <FaEye className={css.statIcon} />
                <span>{chat.unreadCount} непрочитанных</span>
              </div>
            )}
          </div>
        </div>

        {!chat.canSendMessages && (
          <div className={css.readOnlyBadge}>
            Только для чтения
          </div>
        )}
      </div>

      <div className={css.actions}>
        <div className={css.actionButton}>
          <FaEye />
        </div>
      </div>
    </div>
  );
};

export default DialogItem;