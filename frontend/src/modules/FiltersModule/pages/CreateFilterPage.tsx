// src/modules/FiltersModule/pages/CreateFilterPage.tsx
import { FC, useState } from 'react';
import css from './CreateFilterPage.module.css';
import Input from '../../../shared/components/UI/Input/Input';
import Button from '../../../shared/components/UI/Button/Button';
import { FaSave, FaPlus, FaTimes, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { useCreateFilterMutation, CreateFilterDto } from '../../../API/filtersApi';
import { useNavigate } from 'react-router-dom';
import { infoSuccess, infoError } from '../../../shared/lib/toastWrapper';
import TextBox from '../../../shared/components/UI/Textbox/Textbox';

interface IProps { }

const CreateFilterPage: FC<IProps> = () => {
  const navigate = useNavigate();
  const [createFilter, { isLoading }] = useCreateFilterMutation();

  const [formData, setFormData] = useState<CreateFilterDto>({
    name: '',
    includesText: [],
    excludesText: [],
    regexp: '',
    callbackTopic: ''
  });

  const [includeInput, setIncludeInput] = useState('');
  const [excludeInput, setExcludeInput] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateRegex = (pattern: string): boolean => {
    if (!pattern) return true;
    try {
      new RegExp(pattern);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};

    // Валидация
    if (!formData.name.trim()) {
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
      await createFilter(formData).unwrap();
      infoSuccess('Фильтр создан успешно');
      navigate('/filters');
    } catch (error) {
      infoError('Ошибка при создании фильтра');
      console.error('Create filter error:', error);
    }
  };

  const addIncludeText = () => {
    const text = includeInput.trim();
    if (text && !(formData.includesText || []).includes(text)) {
      setFormData(prev => ({
        ...prev,
        includesText: [...(prev.includesText || []), text]
      }));
      setIncludeInput('');
      // Очищаем общую ошибку если добавили условие
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
      // Очищаем общую ошибку если добавили условие
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

  const handleIncludeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIncludeText();
    }
  };

  const handleExcludeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addExcludeText();
    }
  };

  const handleRegexChange = (value: string) => {
    setFormData(prev => ({ ...prev, regexp: value }));
    // Очищаем ошибку regex при изменении
    if (errors.regexp) {
      setErrors(prev => ({ ...prev, regexp: '' }));
    }
    // Очищаем общую ошибку если добавили regex
    if (errors.general && value.trim()) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const callbackTopics = [
    { value: '', label: 'Выберите действие...' },
    { value: 'webhook', label: 'Webhook уведомление' },
    { value: 'email', label: 'Email уведомление' },
    { value: 'log', label: 'Запись в лог' },
    { value: 'telegram', label: 'Telegram бот' },
    { value: 'database', label: 'Сохранить в базу' }
  ];

  return (
    <div className={css.wrapper}>
      <div className={css.header}>
        <h1 className={css.title}>Создание фильтра сообщений</h1>
        <p className={css.subtitle}>
          Настройте условия для автоматической фильтрации входящих сообщений
        </p>
      </div>

      <form onSubmit={handleSubmit} className={css.form}>
        {errors.general && (
          <div className={css.generalError}>
            <FaTimes className={css.errorIcon} />
            {errors.general}
          </div>
        )}

        <div className={css.section}>
          <div className={css.sectionHeader}>
            <h3 className={css.sectionTitle}>Основная информация</h3>
            <div className={css.sectionIcon}>📝</div>
          </div>

          <div className={css.inputGroup}>
            <Input
              label="Название фильтра *"
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, name: e.target.value }));
                if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
              }}
              placeholder="Например: Важные уведомления"

              required
            />
          </div>

          <div className={css.inputGroup}>
            <label className={css.label}>Действие при срабатывании</label>
            <select
              className={css.select}
              value={formData.callbackTopic}
              onChange={(e) => setFormData(prev => ({ ...prev, callbackTopic: e.target.value }))}
            >
              {callbackTopics.map(topic => (
                <option key={topic.value} value={topic.value}>
                  {topic.label}
                </option>
              ))}
            </select>
            <span className={css.hint}>
              Выберите действие, которое будет выполнено при обнаружении подходящего сообщения
            </span>
          </div>
        </div>

        <div className={css.section}>
          <div className={css.sectionHeader}>
            <h3 className={css.sectionTitle}>Текстовые условия</h3>
            <div className={css.sectionIcon}>🔍</div>
          </div>

          <div className={css.textConditions}>
            <div className={css.conditionGroup}>
              <div className={css.conditionHeader}>
                <FaThumbsUp className={css.includeIcon} />
                <label className={css.conditionLabel}>Должно содержать:</label>
              </div>
              <p className={css.conditionHint}>
                Сообщение должно содержать ВСЕ указанные слова или фразы
              </p>

              <div className={css.inputWithButton}>
                <Input
                  value={includeInput}
                  onChange={(e) => setIncludeInput(e.target.value)}
                  onKeyPress={handleIncludeKeyPress}
                  placeholder="Введите текст для поиска..."
                />
                <Button
                  type="button"
                  icon={FaPlus}
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
                        type="button"

                        variant="ghost"
                        icon={FaTimes}
                        onClick={() => removeIncludeText(index)}
                        className={css.removeTag}
                        title="Удалить"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={css.conditionGroup}>
              <div className={css.conditionHeader}>
                <FaThumbsDown className={css.excludeIcon} />
                <label className={css.conditionLabel}>Не должно содержать:</label>
              </div>
              <p className={css.conditionHint}>
                Сообщение будет исключено, если содержит ЛЮБОЕ из указанных слов или фраз
              </p>

              <div className={css.inputWithButton}>
                <Input
                  value={excludeInput}
                  onChange={(e) => setExcludeInput(e.target.value)}
                  onKeyPress={handleExcludeKeyPress}
                  placeholder="Введите текст для исключения..."
                />
                <Button
                  type="button"
                  icon={FaPlus}
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
                        type="button"

                        variant="ghost"
                        icon={FaTimes}
                        onClick={() => removeExcludeText(index)}
                        className={css.removeTag}
                        title="Удалить"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={css.section}>
          <div className={css.sectionHeader}>
            <h3 className={css.sectionTitle}>Регулярное выражение</h3>
            <div className={css.sectionIcon}>
              дщд
              {/* <FaRegex /> */}
            </div>
          </div>

          <div className={css.regexSection}>
            <TextBox
              label="Паттерн регулярного выражения"
              value={formData.regexp}
              onChange={(e: { target: { value: string; }; }) => handleRegexChange(e.target.value)}
              placeholder="Например: \b(важно|срочно|urgent)\b"
              rows={3}
            />

            <div className={css.regexHelp}>
              <p className={css.hint}>
                <strong>Примеры регулярных выражений:</strong>
              </p>
              <ul className={css.examples}>
                <li><code>\b\d{4}-\d{2}-\d{2}\b</code> - даты в формате ГГГГ-ММ-ДД</li>
                <li><code>@\w+</code> - упоминания пользователей</li>
                <li><code>#\w+</code> - хештеги</li>
                <li><code>\b(важно|срочно|критично)\b</code> - ключевые слова</li>
              </ul>
              <p className={css.hint}>
                Регулярные выражения позволяют создавать сложные паттерны поиска.
                {formData.regexp && validateRegex(formData.regexp) && (
                  <span className={css.regexValid}> ✓ Выражение валидно</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className={css.previewSection}>
          <h3 className={css.previewTitle}>Предварительный просмотр фильтра</h3>
          <div className={css.preview}>
            <div className={css.previewItem}>
              <strong>Название:</strong> {formData.name || 'Не указано'}
            </div>
            {(formData.includesText?.length || 0) > 0 && (
              <div className={css.previewItem}>
                <strong>Должно содержать:</strong> {formData.includesText!.join(', ')}
              </div>
            )}
            {(formData.excludesText?.length || 0) > 0 && (
              <div className={css.previewItem}>
                <strong>Не должно содержать:</strong> {formData.excludesText!.join(', ')}
              </div>
            )}
            {formData.regexp && (
              <div className={css.previewItem}>
                <strong>Регулярное выражение:</strong> <code>{formData.regexp}</code>
              </div>
            )}
            {formData.callbackTopic && (
              <div className={css.previewItem}>
                <strong>Действие:</strong> {callbackTopics.find(t => t.value === formData.callbackTopic)?.label}
              </div>
            )}
          </div>
        </div>

        <div className={css.actions}>
          <Button
            type="submit"
            icon={FaSave}
            disabled={isLoading}

          >
            {isLoading ? 'Создание фильтра...' : 'Создать фильтр'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/filters')}

          >
            Отменить
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateFilterPage;