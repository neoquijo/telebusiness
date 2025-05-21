// frontend/src/modules/LeadsModule/Pages/LeadsPage.tsx (финальная версия)
import React, { useState } from 'react';
import { useGetLeadsQuery } from '../../../API/leadsApi';
import { useNavigate } from 'react-router-dom';
import Button from '../../../shared/components/UI/Button/Button';
import { FaUserPlus, FaUserTie, FaFilter } from 'react-icons/fa';
import SearchInput from '../../../shared/components/UI/SearchInput/SearchInput';
import LeadListItem from '../Components/LeadListItem';
import css from './LeadsPage.module.css';

const LeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: leads, isLoading, error, refetch } = useGetLeadsQuery('');

  // Filter leads based on search query
  const filteredLeads = leads?.filter(lead =>
    lead.messageText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.mainCategory?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.messageType?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className={css.loading}>
        <div className={css.loadingContent}>
          <div className={css.spinner}></div>
          <p>Загрузка лидов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Error loading leads:", error);
    return (
      <div className={css.error}>
        <h2>Ошибка загрузки</h2>
        <p>Не удалось загрузить список лидов</p>
        <Button onClick={() => refetch()}>Попробовать еще раз</Button>
      </div>
    );
  }

  // Проверка на пустой массив или отсутствие данных
  const hasLeads = Array.isArray(leads) && leads.length > 0;

  return (
    <div className={css.container}>
      <div className={css.header}>
        <div className={css.headerContent}>
          <h1 className={css.title}>
            <FaUserTie className={css.titleIcon} />
            Управление лидами
          </h1>

          <div className={css.stats}>
            <div className={css.statItem}>
              <span className={css.statValue}>{hasLeads ? leads.length : 0}</span>
              <span className={css.statLabel}>Всего лидов</span>
            </div>

            {hasLeads && (
              <div className={css.statItem}>
                <span className={css.statValue}>
                  {leads.filter(lead => lead.messageType === 'serviceOffer').length}
                </span>
                <span className={css.statLabel}>Предложения услуг</span>
              </div>
            )}
          </div>
        </div>

        <div className={css.controls}>
          <div className={css.searchSection}>
            <SearchInput
              style={{ minWidth: '300px' }}
              caption="Поиск по лидам"
              cb={setSearchQuery}
            />
          </div>

          <div className={css.buttonsGroup}>
            <Button
              variant="secondary"
              icon={FaFilter}
              onClick={() => navigate('/filters')}
            >
              Фильтры
            </Button>

            <Button
              variant="primary"
              icon={FaUserPlus}
              onClick={() => alert('Функционал добавления лида в разработке')}
            >
              Добавить лид
            </Button>
          </div>
        </div>
      </div>

      <div className={css.content}>
        {hasLeads && filteredLeads && filteredLeads.length > 0 ? (
          <div className={css.leadsList}>
            {filteredLeads.map(lead => (
              <LeadListItem
                key={lead.id}
                lead={lead}
                onSelect={() => navigate(`/leads/${lead.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className={css.emptyState}>
            <FaUserTie className={css.emptyIcon} />
            <h3>Лиды не найдены</h3>
            <p>
              {searchQuery
                ? 'Попробуйте изменить параметры поиска'
                : 'В системе пока не зарегистрировано ни одного лида'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsPage;
