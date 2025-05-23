import React, { useState, useEffect } from 'react';
import { useGetFiltersQuery, useDeleteFilterMutation } from '../../../API/filtersApi';
import Button from '../../../shared/components/UI/Button/Button';
import SearchInput from '../../../shared/components/UI/SearchInput/SearchInput';
import { BsFilter, BsPlus } from 'react-icons/bs';
import { FaTimes } from 'react-icons/fa';
import { IoSearch, IoFilter, IoRefresh } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { infoSuccess, infoError } from '../../../shared/lib/toastWrapper';
import usePagination from '../../../shared/components/Navigation/Pagination/usePagination';
import css from './FiltersPage.module.css';
import FilterItem from '../components/FilterItem';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { useModalBodyScroll } from '../../../hooks/useModalBodyScroll';

const FiltersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const { Pagination, page, limit } = usePagination(1, 20);
  const [deleteFilter] = useDeleteFilterMutation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // Используем хук для управления прокруткой при открытии модального окна
  useModalBodyScroll(isModalOpen);
  
  // Сбрасываем состояние модалки при изменении размера экрана
  useEffect(() => {
    if (!isMobile) {
      setIsModalOpen(false);
      setIsSearchVisible(false);
    }
  }, [isMobile]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const queryParams = new URLSearchParams({
    searchQuery,
    page: page.toString(),
    limit: limit.toString(),
    orderBy: 'createdAt',
    order,
  }).toString();

  const { data, isFetching, refetch } = useGetFiltersQuery(queryParams);

  const handleDeleteFilter = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот фильтр?')) {
      try {
        await deleteFilter(id).unwrap();
        infoSuccess('Фильтр успешно удален');
        refetch();
      } catch (error) {
        infoError('Ошибка при удалении фильтра');
      }
    }
  };

  // Мобильный заголовок
  const mobileHeader = (
    <>
      <div className={`${css.mobileHeader} mobileHeader`}>
        <div className={css.mobileTitle}>
          <BsFilter className={css.titleIcon} />
          <h1>Фильтры</h1>
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
        <div className={`${css.mobileSearchPanel} mobileSearchPanel`}>
          <SearchInput
            style={{ width: '100%' }}
            caption="Поиск по фильтрам"
            cb={setSearchQuery}
          />
        </div>
      )}

      {/* Модальное окно с настройками для мобильной версии */}
      {isModalOpen && (
        <div className={`${css.modalOverlay} modalOverlay`} onClick={handleCloseModal}>
          <div className={`${css.modalContent} modalContent`} onClick={e => e.stopPropagation()}>
            <div className={`${css.modalHeader} modalHeader`}>
              <h2>Настройки и действия</h2>
              <button className={`${css.modalClose} modalClose`} onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>
            
            <div className={`${css.modalSection} modalSection`}>
              <h3>Сортировка</h3>
              <div 
                className={`${css.modalSortOption} modalSortOption`} 
                onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
              >
                <span>Порядок сортировки</span>
                <div className={css.sortDirection}>
                  {order === 'asc' ? 'По возрастанию ↑' : 'По убыванию ↓'}
                </div>
              </div>
              
              <h3>Действия</h3>
              <div className={`${css.modalActions} modalActions`}>
                <button
                  className={`${css.modalButton} modalButton`}
                  onClick={() => {
                    handleCloseModal();
                    navigate('/filters/create');
                  }}
                >
                  <BsPlus className={`${css.modalButtonIcon} modalButtonIcon`} />
                  Создать фильтр
                </button>
                
                <button
                  className={`${css.modalSecondaryButton} modalSecondaryButton`}
                  onClick={() => {
                    handleCloseModal();
                    refetch();
                  }}
                >
                  <IoRefresh className={`${css.modalButtonIcon} modalButtonIcon`} />
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
          <BsFilter className={css.titleIcon} />
          Фильтры сообщений
        </h1>
        <div className={css.stats}>
          <div className={css.statItem}>
            <span className={css.statValue}>{data?.totalItems || 0}</span>
            <span className={css.statLabel}>Всего фильтров</span>
          </div>
        </div>
      </div>

      <div className={css.controls}>
        <div className={css.searchSection}>
          <SearchInput
            style={{ minWidth: '300px' }}
            caption="Поиск по фильтрам"
            cb={setSearchQuery}
          />
        </div>

        <Button
          variant="primary"
          icon={BsPlus}
          onClick={() => navigate('/filters/create')}
        >
          Создать фильтр
        </Button>

        <Button onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}>
          {order === 'asc' ? '↑' : '↓'}
        </Button>

        <Button
          className={css.refreshButton}
          onClick={() => refetch()}
          title="Обновить список"
        >
          Обновить
        </Button>
      </div>
    </div>
  );

  return (
    <div className={css.container}>
      {isMobile ? mobileHeader : desktopHeader}

      <div className={css.content}>
        {/* Мобильная статистика */}
        {isMobile && (
          <div className={css.mobileStats}>
            <div className={css.mobileStatItem}>
              <span className={css.mobileStatValue}>{data?.totalItems || 0}</span>
              <span className={css.mobileStatLabel}>Всего фильтров</span>
            </div>
          </div>
        )}

        <div className={css.filterList}>
          {isFetching ? (
            <div className={css.loading}>Загрузка фильтров...</div>
          ) : data?.items?.length! > 0 ? (
            data?.items.map((filter, index) => (
              <FilterItem
                key={filter.id}
                filter={filter}
                index={index}
                searchQuery={searchQuery}
                onEdit={(id) => navigate(`/filters/${id}?edit=true`)}
                onDelete={handleDeleteFilter}
              />
            ))
          ) : (
            <div className={css.emptyState}>
              <BsFilter className={css.emptyIcon} />
              <h3>Фильтры не найдены</h3>
              <p>
                {searchQuery
                  ? 'Попробуйте изменить поисковый запрос'
                  : 'Создайте свой первый фильтр для отслеживания сообщений'}
              </p>
              {!searchQuery && (
                <Button
                  variant="primary"
                  icon={BsPlus}
                  onClick={() => navigate('/filters/create')}
                >
                  Создать первый фильтр
                </Button>
              )}
            </div>
          )}
        </div>

        {data && data.totalPages > 1 && (
          <div className={css.paginationWrapper}>
            <Pagination totalItems={data.totalItems} />
          </div>
        )}
      </div>
    </div>
  );
};

export default FiltersPage;