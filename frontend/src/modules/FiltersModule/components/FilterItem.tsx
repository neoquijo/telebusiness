import React from 'react';
import { BsFilter } from 'react-icons/bs';
import { MdEdit, MdDelete } from 'react-icons/md';
import { FaCheck, FaTimes, FaLayerGroup, FaRobot, FaPhotoVideo, FaCode, FaPlay } from 'react-icons/fa';
import { MessageFilter } from '../../../API/filtersApi';
import Button from '../../../shared/components/UI/Button/Button';
import css from './FilterItem.module.css';
import { useNavigate } from 'react-router-dom';
import { useModalManager } from '../../../core/providers/modal/ModalProvider';
import TestFilterModal from '../modals/TestFilterModal';

interface FilterItemProps {
  filter: MessageFilter;
  index: number;
  searchQuery?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
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

const FilterItem: React.FC<FilterItemProps> = ({
  filter,
  index,
  searchQuery = '',
  onEdit,
  onDelete
}) => {
  const navigate = useNavigate();
  const modal = useModalManager();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCallbackDisplay = (topic: string) => {
    switch (topic) {
      case 'webhook':
        return 'Webhook уведомление';
      case 'email':
        return 'Email уведомление';
      case 'log':
        return 'Запись в лог';
      case 'telegram':
        return 'Telegram бот';
      case 'database':
        return 'Сохранить в базу';
      case 'ai_analysis':
        return 'Анализ AI';
      default:
        return topic || 'Нет действия';
    }
  };

  const handleViewFilter = () => {
    navigate(`/filters/${filter.id}`);
  };

  const handleTestFilter = () => {
    modal.openModal(
      'testFilter',
      <TestFilterModal
        filterId={filter.id}
        filterName={filter.name}
        hasMediaOption={filter.includesMedia || filter.excludesMedia}
      />,
      { title: `Тестирование фильтра: ${filter.name}` }
    );
  };

  return (
    <div className={`${css.item} ${index % 2 === 0 ? css.even : css.odd}`} onClick={handleViewFilter}>
      <div className={css.main}>
        <div className={css.content}>
          <div className={css.header}>
            <h3 className={css.title}>
              <BsFilter className={css.titleIcon} />
              {searchQuery ? highlightText(filter.name, searchQuery) : filter.name}
              {filter.callbackTopic === 'ai_analysis' && (
                <span className={css.aiTag}>
                  <FaRobot /> AI
                </span>
              )}
            </h3>
            <div className={css.meta}>
              <span className={css.date}>
                Создан: {formatDate(filter.createdAt)}
              </span>
            </div>
          </div>

          <div className={css.rules}>
            {/* includesText rule */}
            {filter.includesText && filter.includesText.length > 0 && (
              <div className={css.rule}>
                <FaCheck className={css.ruleIcon} style={{ color: '#4caf50' }} />
                <span className={css.ruleLabel}>Содержит любое из:</span>
                <div className={css.ruleTags}>
                  {filter.includesText.map((text, idx) => (
                    <span key={idx} className={css.includeTag}>
                      {text}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* includesAll rule */}
            {filter.includesAll && filter.includesAll.length > 0 && (
              <div className={css.rule}>
                <FaLayerGroup className={css.ruleIcon} style={{ color: '#2196f3' }} />
                <span className={css.ruleLabel}>Содержит все слова:</span>
                <div className={css.ruleTags}>
                  {filter.includesAll.map((text, idx) => (
                    <span key={idx} className={css.includeAllTag}>
                      {text}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* excludesText rule */}
            {filter.excludesText && filter.excludesText.length > 0 && (
              <div className={css.rule}>
                <FaTimes className={css.ruleIcon} style={{ color: '#f44336' }} />
                <span className={css.ruleLabel}>Исключает:</span>
                <div className={css.ruleTags}>
                  {filter.excludesText.map((text, idx) => (
                    <span key={idx} className={css.excludeTag}>
                      {text}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Media settings */}
            {(filter.includesMedia || filter.excludesMedia) && (
              <div className={css.rule}>
                <FaPhotoVideo className={css.ruleIcon} style={{ color: '#ff9800' }} />
                <span className={css.ruleLabel}>Медиа:</span>
                <div className={css.ruleTags}>
                  {filter.includesMedia && (
                    <span className={css.mediaTag}>
                      Содержит медиа
                    </span>
                  )}
                  {filter.excludesMedia && (
                    <span className={css.excludeMediaTag}>
                      Не содержит медиа
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* RegExp rule */}
            {filter.regexp && (
              <div className={css.rule}>
                <FaCode className={css.ruleIcon} style={{ color: '#9c27b0' }} />
                <span className={css.ruleLabel}>RegExp:</span>
                <code className={css.regexp}>{filter.regexp}</code>
              </div>
            )}

            {/* Callback topic */}
            {filter.callbackTopic && (
              <div className={css.rule}>
                <span className={css.ruleLabel}>Действие:</span>
                <span className={css.callbackTopic}>{getCallbackDisplay(filter.callbackTopic)}</span>
              </div>
            )}

            {/* AI match goal (if applicable) */}
            {filter.callbackTopic === 'ai_analysis' && filter.matchGoal && (
              <div className={css.rule}>
                <FaRobot className={css.ruleIcon} style={{ color: '#9c27b0' }} />
                <span className={css.ruleLabel}>Цель AI:</span>
                <div className={css.aiGoal}>{filter.matchGoal}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={css.actions} onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          icon={FaPlay}
          onClick={handleTestFilter}
          title="Тестировать фильтр"
        >
          Тест
        </Button>
        <Button
          variant="ghost"
          icon={MdEdit}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(filter.id);
          }}
          title="Редактировать фильтр"
        >
          Изменить
        </Button>
        <Button
          variant="danger"
          icon={MdDelete}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(filter.id);
          }}
          title="Удалить фильтр"
        >
          Удалить
        </Button>
      </div>
    </div>
  );
};

export default FilterItem;