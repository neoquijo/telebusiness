// frontend/src/modules/FiltersModule/Pages/CreateFilterPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateFilterMutation } from '../../../API/filtersApi';
import Input from '../../../shared/components/UI/Input/Input';
import Button from '../../../shared/components/UI/Button/Button';
import { BsFilter, BsPlus, BsX } from 'react-icons/bs';
import { FaCheck, FaTimes, FaCode } from 'react-icons/fa';
import { infoSuccess, infoError } from '../../../shared/lib/toastWrapper';
import css from './CreateFilterPage.module.css';

const CreateFilterPage: React.FC = () => {
  const navigate = useNavigate();
  const [createFilter, { isLoading }] = useCreateFilterMutation();

  const [formData, setFormData] = useState({
    name: '',
    includesText: [''],
    excludesText: [''],
    regexp: '',
    callbackTopic: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'includesText' | 'excludesText', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'includesText' | 'excludesText') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'includesText' | 'excludesText', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const filterData = {
      name: formData.name,
      includesText: formData.includesText.filter(text => text.trim()),
      excludesText: formData.excludesText.filter(text => text.trim()),
      regexp: formData.regexp || undefined,
      callbackTopic: formData.callbackTopic || undefined
    };

    if (!filterData.name.trim()) {
      infoError('Название фильтра обязательно');
      return;
    }

    if (filterData.includesText.length === 0 && filterData.excludesText.length === 0 && !filterData.regexp) {
      infoError('Необходимо указать хотя бы одно условие фильтрации');
      return;
    }

    try {
      await createFilter(filterData).unwrap();
      infoSuccess('Фильтр успешно создан');
      navigate('/filters');
    } catch (error) {
      infoError('Ошибка при создании фильтра');
    }
  };

  return (
    <div className={css.container}>
      {/* <div className={css.header}>
        <div className={css.headerContent}>
          <h1 className={css.title}>
            <BsFilter className={css.titleIcon} />
            Создать новый фильтр
          </h1>
          <p className={css.subtitle}>
            Настройте условия для автоматического отслеживания сообщений
          </p>
        </div>
      </div> */}

      <div className={css.content}>
        <form onSubmit={handleSubmit} className={css.form}>
          <div className={css.mainInfo}>
            <div className={css.card}>
              <h2 className={css.cardTitle}>Основная информация</h2>
              <div className={css.inputGroup}>
                <Input
                  label="Название фильтра"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Введите название фильтра"
                  required
                />
                <Input
                  label="Callback Topic"
                  value={formData.callbackTopic}
                  onChange={(e) => handleInputChange('callbackTopic', e.target.value)}
                  placeholder="topic.notifications"
                />
              </div>
            </div>

            <div className={css.card}>
              <h2 className={css.cardTitle}>
                <FaCode className={css.cardIcon} />
                Регулярное выражение
              </h2>
              <Input
                value={formData.regexp}
                onChange={(e) => handleInputChange('regexp', e.target.value)}
                placeholder="/pattern/flags"
              />
            </div>
          </div>

          <div className={css.filterConditions}>
            <div className={css.card}>
              <h2 className={css.cardTitle}>
                <FaCheck className={css.cardIcon} style={{ color: '#4caf50' }} />
                Должно содержать
              </h2>
              <div className={css.conditionsList}>
                {formData.includesText.map((text, index) => (
                  <div key={index} className={css.conditionItem}>
                    <Input
                      value={text}
                      onChange={(e) => handleArrayChange('includesText', index, e.target.value)}
                      placeholder="Введите текст для поиска"
                    />
                    {formData.includesText.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        icon={BsX}
                        onClick={() => removeArrayItem('includesText', index)}
                        className={css.removeButton}
                      />
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  icon={BsPlus}
                  onClick={() => addArrayItem('includesText')}
                  className={css.addButton}
                >
                  Добавить условие
                </Button>
              </div>
            </div>

            <div className={css.card}>
              <h2 className={css.cardTitle}>
                <FaTimes className={css.cardIcon} style={{ color: '#f44336' }} />
                НЕ должно содержать
              </h2>
              <div className={css.conditionsList}>
                {formData.excludesText.map((text, index) => (
                  <div key={index} className={css.conditionItem}>
                    <Input
                      value={text}
                      onChange={(e) => handleArrayChange('excludesText', index, e.target.value)}
                      placeholder="Введите исключаемый текст"
                    />
                    {formData.excludesText.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        icon={BsX}
                        onClick={() => removeArrayItem('excludesText', index)}
                        className={css.removeButton}
                      />
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  icon={BsPlus}
                  onClick={() => addArrayItem('excludesText')}
                  className={css.addButton}
                >
                  Добавить условие
                </Button>
              </div>
            </div>
          </div>

          <div className={css.actions}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/filters')}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              icon={FaCheck}
            >
              {isLoading ? 'Создание...' : 'Создать фильтр'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFilterPage;