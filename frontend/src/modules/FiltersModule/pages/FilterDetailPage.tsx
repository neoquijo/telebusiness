// src/modules/FiltersModule/pages/FilterDetailPage.tsx
import { FC, useState, useEffect } from 'react';
import css from './FilterDetailPage.module.css';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useGetFilterQuery, useUpdateFilterMutation, UpdateFilterDto } from '../../../API/filtersApi';
import { FaEdit, FaSave, FaTimes, FaThumbsUp, FaThumbsDown, FaPlay } from 'react-icons/fa';
import Button from '../../../shared/components/UI/Button/Button';
import Input from '../../../shared/components/UI/Input/Input';
import { infoSuccess, infoError } from '../../../shared/lib/toastWrapper';
import { useModalManager } from '../../../core/providers/modal/ModalProvider';
import TestFilterModal from '../modals/TestFilterModal';
import NoData from '../../../shared/components/NoData/NoData';
import TextBox from '../../../shared/components/UI/Textbox/Textbox';

interface IProps { }

const FilterDetailPage: FC<IProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const modal = useModalManager();
  const isEditMode = searchParams.get('edit') === 'true';

  const { data: filter, isFetching, error } = useGetFilterQuery(id!);
  const [updateFilter, { isLoading: isUpdating }] = useUpdateFilterMutation();

  const [isEditing, setIsEditing] = useState(isEditMode);
  const [formData, setFormData] = useState<UpdateFilterDto>({});
  const [includeInput, setIncludeInput] = useState('');
  const [excludeInput, setExcludeInput] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (filter) {
      setFormData({
        name: filter.name,
        includesText: [...(filter.includesText || [])],
        excludesText: [...(filter.excludesText || [])],
        regexp: filter.regexp || '',
        callbackTopic: filter.callbackTopic || ''
      });
    }
  }, [filter]);

  const validateRegex = (pattern: string): boolean => {
    if (!pattern) return true;
    try {
      new RegExp(pattern);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Название фильтра обязательно';
    }

    if (formData.regexp && !validateRegex(formData.regexp)) {
      newErrors.regexp = 'Некорректное регулярное выражение';
    }

    if ((formData.includesText?.length || 0) === 0 &&
      (formData.excludesText?.length || 0) === 0 &&
      !formData.regexp) {
      newErrors.general = 'Укажите хотя бы одно условие фильтрации';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      infoError('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    try {
      await updateFilter({ id: id!, data: formData }).unwrap();
      infoSuccess('Фильтр обновлен успешно');
      setIsEditing(false);
      navigate(`/filters/${id}`);
    } catch (error) {
      infoError('Ошибка при обновлении фильтра');
      console.error('Update filter error:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: filter?.name,
      includesText: [...(filter?.includesText || [])],
      excludesText: [...(filter?.excludesText || [])],
      regexp: filter?.regexp || '',
      callbackTopic: filter?.callbackTopic || ''
    });
    setErrors({});
    navigate(`/filters/${id}`);
  };

  const addIncludeText = () => {
    const text = includeInput.trim();
    if (text && !(formData.includesText || []).includes(text)) {
      setFormData(prev => ({
        ...prev,
        includesText: [...(prev.includesText || []), text]
      }));
      setIncludeInput('');
      if (errors.general) {
        setErrors(prev => ({ ...prev, general: '' }));
      }
    }
  };

  const removeIncludeText = (index: number) => {
    setFormData(prev => ({
      ...prev,
      includesText: (prev.includesText || []).filter((_, i) => i !== index)
    }));
  };

  const addExcludeText = () => {
    const text = excludeInput.trim();
    if (text && !(formData.excludesText || []).includes(text)) {
      setFormData(prev => ({
        ...prev,
        excludesText: [...(prev.excludesText || []), text]
      }));
      setExcludeInput('');
      if (errors.general) {
        setErrors(prev => ({ ...prev, general: '' }));
      }
    }
  };

  const removeExcludeText = (index: number) => {
    setFormData(prev => ({
      ...prev,
      excludesText: (prev.excludesText || []).filter((_, i) => i !== index)
    }));
  };

  const handleTest = () => {
    modal.openModal(
      'testFilter',
      <TestFilterModal filterId={id!} filterName={filter?.name || ''} />,
      { title: `Тестирование фильтра: ${filter?.name}` }
    );
  };

  const callbackTopics = [
    { value: '', label: 'Нет действия' },
    { value: 'webhook', label: 'Webhook уведомление' },
    { value: 'email', label: 'Email уведомление' },
    { value: 'log', label: 'Запись в лог' },
    { value: 'telegram', label: 'Telegram бот' },
    { value: 'database', label: 'Сохранить в базу' }
  ];

  if (isFetching) {
    return (
      <div className={css.loading}>
        <div className={css.loadingText}>Загрузка фильтра...</div>
      </div>
    );
  }

  if (error || !filter) {
    return (
      <div className={css.wrapper}>
        <NoData
          text="Фильтр не найден"
          subText="Возможно, фильтр был удален или у вас нет доступа к нему"
        />
      </div>
    );
  }

  return (
    <div className={css.wrapper}>
      <div className={css.header}>
        <div className={css.titleSection}>
          <h1 className={css.title}>
            {isEditing ? 'Редактирование фильтра' : filter.name}
          </h1>
          <div className={css.metadata}>
            <span>Создан: {new Date(filter.createdAt).toLocaleDateString('ru-RU')}</span>
            <span>•</span>
            <span>Обновлен: {new Date(filter.updatedAt).toLocaleDateString('ru-RU')}</span>
          </div>
        </div>

        <div className={css.actions}>
          {!isEditing ? (
            <>
              <Button
                icon={FaPlay}
                onClick={handleTest}
                variant="ghost"
              >
                Тестировать
              </Button>
              <Button
                icon={FaEdit}
                onClick={() => setIsEditing(true)}
              >
                Редактировать
              </Button>
            </>
          ) : (
            <>
              <Button
                icon={FaSave}
                onClick={handleSave}
                disabled={isUpdating}
              >
                {isUpdating ? 'Сохранение...' : 'Сохранить'}
              </Button>
              <Button
                icon={FaTimes}
                variant="ghost"
                onClick={handleCancel}
              >
                Отменить
              </Button>
            </>
          )}
        </div>
      </div>

      {errors.general && (
        <div className={css.generalError}>
          <FaTimes className={css.errorIcon} />
          {errors.general}
        </div>
      )}

      <div className={css.content}>
        <div className={css.section}>
          <div className={css.sectionHeader}>
            <h3 className={css.sectionTitle}>Основная информация</h3>
            <div className={css.sectionIcon}>📝</div>
          </div>

          {isEditing ? (
            <div className={css.editSection}>
              <Input
                label="Название фильтра *"
                value={formData.name || ''}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }));
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                }}
                placeholder="Введите название фильтра"
                required
              />

              <div className={css.inputGroup}>
                <label className={css.label}>Действие при срабатывании</label>
                <select
                  className={css.select}
                  value={formData.callbackTopic || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, callbackTopic: e.target.value }))}
                >
                  {callbackTopics.map(topic => (
                    <option key={topic.value} value={topic.value}>
                      {topic.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className={css.viewSection}>
              <div className={css.infoItem}>
                <span className={css.infoLabel}>Название:</span>
                <span className={css.infoValue}>{filter.name}</span>
              </div>
              <div className={css.infoItem}>
                <span className={css.infoLabel}>Действие:</span>
                <span className={css.infoValue}>
                  {filter.callbackTopic ?
                    callbackTopics.find(t => t.value === filter.callbackTopic)?.label || filter.callbackTopic :
                    'Нет действия'
                  }
                </span>
              </div>
            </div>
          )}
        </div>

        <div className={css.section}>
          <div className={css.sectionHeader}>
            <h3 className={css.sectionTitle}>Текстовые условия</h3>
            <div className={css.sectionIcon}>🔍</div>
          </div>

          <div className={css.conditionsContainer}>
            <div className={css.conditionGroup}>
              <div className={css.conditionHeader}>
                <FaThumbsUp className={css.includeIcon} />
                <span className={css.conditionLabel}>Должно содержать:</span>
              </div>

              {isEditing ? (
                <>
                  <div className={css.inputWithButton}>
                    <Input
                      value={includeInput}
                      onChange={(e) => setIncludeInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIncludeText())}
                      placeholder="Добавить слово или фразу..."
                    />
                    <Button
                      onClick={addIncludeText}
                      disabled={!includeInput.trim()}

                    >
                      Добавить
                    </Button>
                  </div>

                  {(formData.includesText?.length || 0) > 0 && (
                    <div className={css.tags}>
                      {(formData.includesText || []).map((text, index) => (
                        <div key={index} className={`${css.tag} ${css.includeTag}`}>
                          <span>{text}</span>
                          <Button

                            variant="ghost"
                            icon={FaTimes}
                            onClick={() => removeIncludeText(index)}
                            className={css.removeTag}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className={css.tags}>
                  {filter.includesText && filter.includesText.length > 0 ? (
                    filter.includesText.map((text, index) => (
                      <span key={index} className={`${css.tag} ${css.includeTag}`}>
                        {text}
                      </span>
                    ))
                  ) : (
                    <span className={css.emptyText}>Не указано</span>
                  )}
                </div>
              )}
            </div>

            <div className={css.conditionGroup}>
              <div className={css.conditionHeader}>
                <FaThumbsDown className={css.excludeIcon} />
                <span className={css.conditionLabel}>Не должно содержать:</span>
              </div>

              {isEditing ? (
                <>
                  <div className={css.inputWithButton}>
                    <Input
                      value={excludeInput}
                      onChange={(e) => setExcludeInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExcludeText())}
                      placeholder="Добавить слово или фразу..."
                    />
                    <Button
                      onClick={addExcludeText}
                      disabled={!excludeInput.trim()}

                    >
                      Добавить
                    </Button>
                  </div>

                  {(formData.excludesText?.length || 0) > 0 && (
                    <div className={css.tags}>
                      {(formData.excludesText || []).map((text, index) => (
                        <div key={index} className={`${css.tag} ${css.excludeTag}`}>
                          <span>{text}</span>
                          <Button

                            variant="ghost"
                            icon={FaTimes}
                            onClick={() => removeExcludeText(index)}
                            className={css.removeTag}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className={css.tags}>
                  {filter.excludesText && filter.excludesText.length > 0 ? (
                    filter.excludesText.map((text, index) => (
                      <span key={index} className={`${css.tag} ${css.excludeTag}`}>
                        {text}
                      </span>
                    ))
                  ) : (
                    <span className={css.emptyText}>Не указано</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={css.section}>
          <div className={css.sectionHeader}>
            <h3 className={css.sectionTitle}>Регулярное выражение</h3>
            <div className={css.sectionIcon}>
              Icon
            </div>
          </div>

          {isEditing ? (
            <TextBox
              label="Паттерн регулярного выражения"
              value={formData.regexp || ''}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, regexp: e.target.value }));
                if (errors.regexp) setErrors(prev => ({ ...prev, regexp: '' }));
              }}
              placeholder="Например: \b(важно|срочно|urgent)\b"
              rows={3}

            />
          ) : (
            <div className={css.regexDisplay}>
              {filter.regexp ? (
                <code className={css.regexCode}>{filter.regexp}</code>
              ) : (
                <span className={css.emptyText}>Не указано</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterDetailPage;