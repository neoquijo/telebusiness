import React from 'react';
import { useModalManager } from '../../../core/providers/modal/ModalProvider';
import { FcCancel } from 'react-icons/fc';
import css from './MessageDetailsModal.module.css';

interface MessageDetailsModalProps {
  message: any;
}

export const MessageDetailsModal: React.FC<MessageDetailsModalProps> = ({ message }) => {
  const { closeModal } = useModalManager();

  return (
    <div className={css.modal}>
      <div className={css.header}>
        <h2>Детали сообщения</h2>
        <button onClick={() => closeModal('messageDetails')} className={css.closeButton}>
          <FcCancel />
        </button>
      </div>
      
      <div className={css.content}>
        <div className={css.section}>
          <h3>Основная информация</h3>
          <p><strong>ID:</strong> {message.id}</p>
          <p><strong>Текст:</strong> {message.messageText}</p>
          <p><strong>Тип источника:</strong> {message.sourceType}</p>
          <p><strong>Дата создания:</strong> {new Date(message.createdAt).toLocaleString()}</p>
        </div>

        {message.filtered && message.filtered.length > 0 && (
          <div className={css.section}>
            <h3>Фильтры</h3>
            <ul>
              {message.filtered.map((filter: any) => (
                <li key={filter._id}>{filter.name}</li>
              ))}
            </ul>
          </div>
        )}

        {message.messageMedia && message.messageMedia.length > 0 && (
          <div className={css.section}>
            <h3>Медиа</h3>
            <div className={css.mediaGrid}>
              {message.messageMedia.map((media: any, index: number) => (
                <div key={index} className={css.mediaItem}>
                  {/* Здесь можно добавить отображение медиа в зависимости от типа */}
                  <p>{media.type}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {message.generatedTags && message.generatedTags.length > 0 && (
          <div className={css.section}>
            <h3>Теги</h3>
            <div className={css.tags}>
              {message.generatedTags.map((tag: string, index: number) => (
                <span key={index} className={css.tag}>{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 