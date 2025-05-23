// frontend/src/modules/LeadsModule/Pages/LeadsPage.tsx (финальная версия)
import React, { useState, useEffect } from 'react';
import { useGetLeadsQuery } from '../../../API/leadsApi';
import { useNavigate } from 'react-router-dom';
import Button from '../../../shared/components/UI/Button/Button';
import { FaUserPlus, FaUserTie, FaFilter, FaTimes } from 'react-icons/fa';
import { IoSearch, IoFilter } from 'react-icons/io5';
import SearchInput from '../../../shared/components/UI/SearchInput/SearchInput';
import LeadListItem from '../Components/LeadListItem';
import css from './LeadsPage.module.css';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

const LeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: leads, isLoading, error, refetch } = useGetLeadsQuery('');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  
  // Сбрасываем состояние модалки при изменении размера экрана
  useEffect(() => {
    if (!isMobile) {
      setIsModalOpen(false);
      setIsSearchVisible(false);
    }
  }, [isMobile]);
  
  const handleOpenModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = '';
  };

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
  
  // Мобильный заголовок
  const mobileHeader = (
    <>
      <div className={css.mobileHeader}>
        <div className={css.mobileTitle}>
          <FaUserTie className={css.titleIcon} />
          <h1>Лиды</h1>
        </div>
        <div className={css.mobileActions}>
          <button 
            className={css.mobileActionButton} 
            onClick={() => setIsSearchVisible(!isSearchVisible)}
            aria-label="Поиск"
          >
            <IoSearch />
          </button>
          <button 
            className={css.mobileActionButton} 
            onClick={handleOpenModal}
            aria-label="Настройки"
          >
            <IoFilter />
          </button>
        </div>
      </div>
      
      {/* Мобильная панель поиска */}
      {isSearchVisible && (
        <div className={css.mobileSearchPanel}>
          <SearchInput
            style={{ width: '100%' }}
            caption="Поиск по лидам"
            cb={setSearchQuery}
          />
        </div>
      )}
      
      {/* Модальное окно с настройками для мобильной версии */}
      {isModalOpen && (
        <div className={css.modalOverlay} onClick={handleCloseModal}>
          <div className={css.modalContent} onClick={e => e.stopPropagation()}>
            <div className={css.modalHeader}>
              <h2>Действия</h2>
              <button className={css.modalClose} onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>
            
            <div className={css.modalSection}>
              <div className={css.modalActions}>
                <button
                  className={css.modalButton}
                  onClick={() => {
                    handleCloseModal();
                    alert('Функционал добавления лида в разработке');
                  }}
                >
                  <FaUserPlus className={css.modalButtonIcon} />
                  Добавить лид
                </button>
                
                <button
                  className={css.modalSecondaryButton}
                  onClick={() => {
                    handleCloseModal();
                    navigate('/filters');
                  }}
                >
                  <FaFilter className={css.modalButtonIcon} />
                  Управление фильтрами
                </button>
                
                <button
                  className={css.modalSecondaryButton}
                  onClick={() => {
                    handleCloseModal();
                    refetch();
                  }}
                >
                  <IoFilter className={css.modalButtonIcon} />
                  Обновить список
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
  
  // Десктопный заголовок
  const desktopHeader = (
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
  );

  return (
    <div className={css.container}>
      {isMobile ? mobileHeader : desktopHeader}

      <div className={css.content}>
        {/* Мобильная статистика */}
        {isMobile && hasLeads && (
          <div className={css.mobileStats}>
            <div className={css.mobileStatItem}>
              <span className={css.mobileStatValue}>{leads.length || 0}</span>
              <span className={css.mobileStatLabel}>Всего лидов</span>
            </div>
            
            <div className={css.mobileStatItem}>
              <span className={css.mobileStatValue}>
                {leads.filter(lead => lead.messageType === 'serviceOffer').length}
              </span>
              <span className={css.mobileStatLabel}>Предложения</span>
            </div>
          </div>
        )}

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
