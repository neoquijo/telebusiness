import React, { useState, useEffect } from 'react';
import { useGetChatsQuery } from '../../../API/chatsApi';
import Button from '../../../shared/components/UI/Button/Button';
import SearchInput from '../../../shared/components/UI/SearchInput/SearchInput';
import { BsFilter } from 'react-icons/bs';
import { IoIosChatboxes } from 'react-icons/io';
import { FaUser, FaBroadcastTower, FaTimes } from 'react-icons/fa';
import { IoSearch, IoFilter } from 'react-icons/io5';
import usePagination from '../../../shared/components/Navigation/Pagination/usePagination';
import css from './DialogsPage.module.css';
import DialogItem from './DialogItem';
import { RiRobot2Line } from 'react-icons/ri';
import { IoMdRefresh } from 'react-icons/io';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { useModalBodyScroll } from '../../../hooks/useModalBodyScroll';

const DialogsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const { Pagination, page, limit } = usePagination(1, 20);
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
    type: filterType,
  }).toString();

  const { data, isFetching, refetch } = useGetChatsQuery(queryParams);

  const filterButtons = [
    { key: '', label: 'Все', icon: undefined },
    { key: 'User', label: 'Личные чаты', icon: FaUser },
    { key: 'Channel', label: 'Каналы', icon: FaBroadcastTower },
    { key: 'Chat', label: 'Группы', icon: IoIosChatboxes },
    { key: 'Forum', label: 'Форумы', icon: RiRobot2Line },
  ];

  // Получаем текущую метку для типа чата
  const getFilterTypeLabel = () => {
    const filter = filterButtons.find(btn => btn.key === filterType);
    return filter ? filter.label : 'Все чаты';
  };

  // Мобильный заголовок
  const mobileHeader = (
    <>
      <div className={`${css.mobileHeader} mobileHeader`}>
        <div className={css.mobileTitle}>
          <IoIosChatboxes className={css.titleIcon} />
          <h1>Чаты</h1>
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
            aria-label="Фильтры и настройки"
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
            caption="Поиск по чатам"
            cb={setSearchQuery}
          />
        </div>
      )}

      {/* Мобильная плавающая метка фильтра */}
      {filterType && (
        <div className={`${css.mobileFilterBadge} mobileFilterBadge`} onClick={handleOpenModal}>
          <div className={`${css.filterBadgeIcon} filterBadgeIcon`}>
            {filterButtons.find(btn => btn.key === filterType)?.icon && 
              React.createElement(filterButtons.find(btn => btn.key === filterType)?.icon!)}
          </div>
          <span>{getFilterTypeLabel()}</span>
        </div>
      )}

      {/* Модальное окно с настройками для мобильной версии */}
      {isModalOpen && (
        <div className={`${css.modalOverlay} modalOverlay`} onClick={handleCloseModal}>
          <div className={`${css.modalContent} modalContent`} onClick={e => e.stopPropagation()}>
            <div className={`${css.modalHeader} modalHeader`}>
              <h2>Настройки и фильтры</h2>
              <button className={`${css.modalClose} modalClose`} onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>
            
            <div className={`${css.modalSection} modalSection`}>
              <h3>Тип чата</h3>
              <div className={`${css.modalFilters} modalFilters`}>
                {filterButtons.map(({ key, label, icon: Icon }) => (
                  <div 
                    key={key || 'all'} 
                    className={`${css.modalFilterItem} modalFilterItem ${filterType === key ? `${css.activeFilter} activeFilter` : ''}`}
                    onClick={() => setFilterType(filterType === key ? '' : key)}
                  >
                    {Icon && <Icon className={`${css.modalFilterIcon} modalFilterIcon`} />}
                    <span>{label}</span>
                    {filterType === key && <div className={`${css.activeFilterMark} activeFilterMark`} />}
                  </div>
                ))}
              </div>
              
              <h3>Порядок сортировки</h3>
              <div 
                className={`${css.modalSortButton} modalSortButton`}
                onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
              >
                {order === 'asc' ? 'По возрастанию ↑' : 'По убыванию ↓'}
              </div>
              
              <h3>Действия</h3>
              <button
                className={`${css.modalButton} modalButton`}
                onClick={() => {
                  handleCloseModal();
                  refetch();
                }}
              >
                <IoMdRefresh className={`${css.modalButtonIcon} modalButtonIcon`} />
                Обновить список
              </button>
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
          <IoIosChatboxes className={css.titleIcon} />
          Мои чаты
        </h1>
        <div className={css.stats}>
          <div className={css.statItem}>
            <span className={css.statValue}>{data?.totalItems || 0}</span>
            <span className={css.statLabel}>Всего чатов</span>
          </div>
        </div>
      </div>

      <div className={css.controls}>
        <div className={css.searchSection}>
          <SearchInput
            style={{ minWidth: '300px' }}
            caption="Поиск по чатам"
            cb={setSearchQuery}
          />
        </div>

        <div className={css.filterSection}>
          <BsFilter className={css.filterIcon} />
          <div className={css.filterButtons}>
            {filterButtons.map(({ key, label, icon: Icon }) => (
              <Button
                key={key || 'all'}
                variant="ghost"
                active={filterType === key}
                onClick={() => setFilterType(filterType === key ? '' : key)}
                icon={Icon}
              >
                {label}
              </Button>
            ))}
          </div>
          <Button
            className={css.refreshButton}
            onClick={() => refetch()}
            title="Обновить список"
          >
            <IoMdRefresh size={20} />
          </Button>

          <Button onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}>
            {order === 'asc' ? '↑' : '↓'}
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
        {isMobile && (
          <div className={css.mobileStats}>
            <div className={css.mobileStatItem}>
              <span className={css.mobileStatValue}>{data?.totalItems || 0}</span>
              <span className={css.mobileStatLabel}>Всего чатов</span>
            </div>
          </div>
        )}
        
        <div className={css.chatList}>
          {isFetching ? (
            <div className={css.loading}>Загрузка чатов...</div>
          ) : data?.items?.length! > 0 ? (
            data?.items.map((chat, index) => (
              <DialogItem
                key={chat.id}
                chat={chat}
                index={index}
                searchQuery={searchQuery}
              />
            ))
          ) : (
            <div className={css.emptyState}>
              <IoIosChatboxes className={css.emptyIcon} />
              <h3>Чаты не найдены</h3>
              <p>
                {filterType || searchQuery
                  ? 'Попробуйте изменить фильтры или поисковый запрос'
                  : 'У вас пока нет импортированных чатов'}
              </p>
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

export default DialogsPage;