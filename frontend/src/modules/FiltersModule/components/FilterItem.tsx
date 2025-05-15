// frontend/src/modules/FiltersModule/Components/FilterItem.tsx
import React from 'react';
import { BsFilter } from 'react-icons/bs';
import { MdEdit, MdDelete } from 'react-icons/md';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { MessageFilter } from '../../../API/filtersApi';
import Button from '../../../shared/components/UI/Button/Button';
import css from './FilterItem.module.css';

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
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`${css.item} ${index % 2 === 0 ? css.even : css.odd}`}>
      <div className={css.main}>
        <div className={css.content}>
          <div className={css.header}>
            <h3 className={css.title}>
              <BsFilter className={css.titleIcon} />
              {searchQuery ? highlightText(filter.name, searchQuery) : filter.name}
            </h3>
            <div className={css.meta}>
              <span className={css.date}>
                Создан: {formatDate(filter.createdAt)}
              </span>
            </div>
          </div>

          <div className={css.rules}>
            {filter.includesText && filter.includesText.length > 0 && (
              <div className={css.rule}>
                <FaCheck className={css.ruleIcon} style={{ color: '#4caf50' }} />
                <span className={css.ruleLabel}>Содержит:</span>
                <div className={css.ruleTags}>
                  {filter.includesText.map((text, idx) => (
                    <span key={idx} className={css.includeTag}>
                      {text}
                    </span>
                  ))}
                </div>
              </div>
            )}

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

            {filter.regexp && (
              <div className={css.rule}>
                <span className={css.ruleLabel}>RegExp:</span>
                <code className={css.regexp}>{filter.regexp}</code>
              </div>
            )}

            {filter.callbackTopic && (
              <div className={css.rule}>
                <span className={css.ruleLabel}>Callback Topic:</span>
                <span className={css.callbackTopic}>{filter.callbackTopic}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={css.actions}>
        <Button
          variant="ghost"
          icon={MdEdit}
          onClick={() => onEdit(filter.id)}
          title="Редактировать фильтр"
        >
          Изменить
        </Button>
        <Button
          variant="danger"
          icon={MdDelete}
          onClick={() => onDelete(filter.id)}
          title="Удалить фильтр"
        >
          Удалить
        </Button>
      </div>
    </div>
  );
};

export default FilterItem;