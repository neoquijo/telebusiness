// src/modules/FiltersModule/components/FilterItem.tsx
import { FC, useState } from 'react';
import css from './FilterItem.module.css';
import { MessageFilter } from '../../../API/filtersApi';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import Button from '../../../shared/components/UI/Button/Button';
import { useDeleteFilterMutation } from '../../../API/filtersApi';
import { infoSuccess, infoError } from '../../../shared/lib/toastWrapper';
import { useModalManager } from '../../../core/providers/modal/ModalProvider';
import TestFilterModal from '../modals/TestFilterModal';

interface IProps {
  filter: MessageFilter;
}

const FilterItem: FC<IProps> = ({ filter }) => {
  const navigate = useNavigate();
  const modal = useModalManager();
  const [deleteFilter, { isLoading: isDeleting }] = useDeleteFilterMutation();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteFilter(filter.id).unwrap();
      infoSuccess('Фильтр удален');
      setShowConfirm(false);
    } catch (error) {
      infoError('Ошибка при удалении фильтра');
      console.error('Delete error:', error);
    }
  };

  const handleTest = () => {
    modal.openModal(
      'testFilter',
      <TestFilterModal filterId={filter.id} filterName={filter.name} />,
      { title: `Тестирование фильтра: ${filter.name}` }
    );
  };

  return (
    <div className={css.wrapper}>
      <div className={css.content}>
        <div className={css.header}>
          <h3 className={css.name}>{filter.name}</h3>
          <div className={css.actions}>
            <Button
              variant="ghost"

              icon={FaEye}
              onClick={() => navigate(`/filters/${filter.id}`)}
              title="Просмотр"
            />
            <Button
              variant="ghost"

              icon={FaEdit}
              onClick={() => navigate(`/filters/${filter.id}?edit=true`)}
              title="Редактировать"
            />
            <Button
              variant="ghost"

              onClick={handleTest}
              title="Тестировать"
            >
              Тест
            </Button>
            {!showConfirm ? (
              <Button
                variant="ghost"

                icon={FaTrash}
                onClick={() => setShowConfirm(true)}
                title="Удалить"
                className={css.deleteButton}
              />
            ) : (
              <div className={css.confirmActions}>
                <Button
                  variant="danger"

                  icon={FaCheck}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  Да
                </Button>
                <Button
                  variant="ghost"

                  icon={FaTimes}
                  onClick={() => setShowConfirm(false)}
                >
                  Нет
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className={css.details}>
          {filter.includesText && filter.includesText.length > 0 && (
            <div className={css.condition}>
              <span className={css.label}>Включает:</span>
              <div className={css.tags}>
                {filter.includesText.map((text, index) => (
                  <span key={index} className={`${css.tag} ${css.includes}`}>
                    {text}
                  </span>
                ))}
              </div>
            </div>
          )}

          {filter.excludesText && filter.excludesText.length > 0 && (
            <div className={css.condition}>
              <span className={css.label}>Исключает:</span>
              <div className={css.tags}>
                {filter.excludesText.map((text, index) => (
                  <span key={index} className={`${css.tag} ${css.excludes}`}>
                    {text}
                  </span>
                ))}
              </div>
            </div>
          )}

          {filter.regexp && (
            <div className={css.condition}>
              <span className={css.label}>Регулярное выражение:</span>
              <code className={css.regexp}>{filter.regexp}</code>
            </div>
          )}

          {filter.callbackTopic && (
            <div className={css.condition}>
              <span className={css.label}>Callback:</span>
              <span className={css.callback}>{filter.callbackTopic}</span>
            </div>
          )}
        </div>

        <div className={css.meta}>
          <span className={css.date}>
            Создан: {new Date(filter.createdAt).toLocaleDateString('ru-RU')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FilterItem;