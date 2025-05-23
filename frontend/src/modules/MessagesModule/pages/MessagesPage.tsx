import React, { useState, useEffect } from 'react';
import { useGetMessagesQuery, useGetMessageStatisticsQuery } from '../../../API/messagesApi';
import Button from '../../../shared/components/UI/Button/Button';
import SearchInput from '../../../shared/components/UI/SearchInput/SearchInput';
import { MdMessage, MdFilterList, MdSettings } from 'react-icons/md';
import { FaUser, FaBroadcastTower, FaFilter, FaTimes } from 'react-icons/fa';
import { IoBarChart, IoFilter, IoSearch } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import usePagination from '../../../shared/components/Navigation/Pagination/usePagination';
import css from './MessagesPage.module.css';
import MessageItem from '../components/MessagesItem';
import StatisticsCard from './StatisticsCard';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceType, setSourceType] = useState<string | null>(null);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const { Pagination, page, limit } = usePagination(1, 20);
  const [isOverviewVisible, setIsOverviewVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Сбрасываем состояние модалки при изменении размера экрана
  useEffect(() => {
    if (!isMobile) {
      setIsModalOpen(false);
      setIsSearchVisible(false);
    }
  }, [isMobile]);

  const queryParams = new URLSearchParams({
    searchQuery,
    page: page.toString(),
    limit: limit.toString(),
    orderBy: 'createdAt',
    order,
    type: sourceType ?? ''
  }).toString();

  const { data: messages, isFetching, refetch } = useGetMessagesQuery(queryParams);
  const { data: statistics } = useGetMessageStatisticsQuery('');

  const sourceTypes = [
    { key: null, label: 'Все источники' },
    { key: 'Private', label: 'Личные чаты', icon: FaUser },
    { key: 'Channel', label: 'Каналы', icon: FaBroadcastTower },
    { key: 'Chat', label: 'Группы', icon: MdMessage },
    { key: 'Group', label: 'Группы', icon: MdMessage }
  ];
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSearchVisible(false);
    document.body.style.overflow = '';
  };
  
  const handleOpenModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };
  
  const getFilterLabel = () => {
    const filter = sourceTypes.find(type => type.key === sourceType);
    return filter ? filter.label : 'Все источники';
  };

  return (
    <div className={css.container}>
      {/* Заголовок для десктопа */}
      {!isMobile && (
        <div className={css.header}>
          <div className={css.headerContent}>
            <h1 className={css.title}>
              <MdMessage className={css.titleIcon} />
              Сообщения
            </h1>
            <div className={css.headerActions}>
              <Button icon={IoBarChart} variant='ghost' onClick={()=>setIsOverviewVisible(!isOverviewVisible)} className={css.headerActionsItem}>
                {isOverviewVisible ? 'Скрыть статистику' : 'Показать статистику'}
              </Button>
              <Button icon={IoBarChart} variant='ghost' onClick={()=>navigate('/messages/statistics')}>
                Перейти к детальной статистике
              </Button>
              <Button
                variant="primary"
                icon={FaFilter}
                onClick={() => navigate('/messages/filtered')}
              >
                Отфильтрованные сообщения
              </Button>
            </div>
          </div>

          {statistics && isOverviewVisible && (
            <div className={css.statistics}>
              <StatisticsCard
                title="Всего сообщений"
                value={statistics.totalMessages}
                icon={MdMessage}
                color="#2196f3"
              />
              <StatisticsCard
                title="Отфильтрованных"
                value={statistics.filteredMessages}
                icon={MdFilterList}
                color="#4caf50"
                subtitle={`${statistics.filteredPercentage}% от общего числа`}
              />
              {statistics.topFilters && statistics.topFilters.length > 0 && (
                <StatisticsCard
                  title="Топ фильтр"
                  value={statistics.topFilters[0].filterName}
                  subtitle={`${statistics.topFilters[0].count} сообщений`}
                  icon={FaFilter}
                  color="#ff9800"
                />
              )}
            </div>
          )}

          <div className={css.controls}>
            <div className={css.searchSection}>
              <SearchInput
                style={{ minWidth: '300px' }}
                caption="Поиск по сообщениям"
                cb={setSearchQuery}
              />
            </div>

            <div className={css.filterSection}>
              <MdFilterList className={css.filterIcon} />
              <div className={css.filterButtons}>
                {sourceTypes.map(({ key, label, icon: Icon }) => (
                  <Button
                    key={key || 'all'}
                    variant="ghost"
                    active={sourceType === key}
                    onClick={() => setSourceType(sourceType === key ? null : key)}
                    icon={Icon}
                  >
                    {label}
                  </Button>
                ))}
              </div>
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
        </div>
      )}

      {/* Мобильный плавающий заголовок */}
      {isMobile && (
        <div className={css.mobileHeader}>
          <div className={css.mobileTitle}>
            <MdMessage className={css.titleIcon} />
            <h1>Сообщения</h1>
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
      )}
      
      {/* Мобильная панель поиска */}
      {isMobile && isSearchVisible && (
        <div className={css.mobileSearchPanel}>
          <SearchInput
            style={{ width: '100%' }}
            caption="Поиск по сообщениям"
            cb={setSearchQuery}
          />
        </div>
      )}
      
      {/* Мобильная плавающая метка фильтра */}
      {isMobile && sourceType !== null && (
        <div className={css.mobileFilterBadge} onClick={handleOpenModal}>
          <div className={css.filterBadgeIcon}>
            {sourceTypes.find(type => type.key === sourceType)?.icon && 
              React.createElement(sourceTypes.find(type => type.key === sourceType)?.icon!)}
          </div>
          <span>{getFilterLabel()}</span>
        </div>
      )}

      {/* Модальное окно с настройками для мобильной версии */}
      {isMobile && isModalOpen && (
        <div className={css.modalOverlay} onClick={handleCloseModal}>
          <div className={css.modalContent} onClick={e => e.stopPropagation()}>
            <div className={css.modalHeader}>
              <h2>Настройки и фильтры</h2>
              <button className={css.modalClose} onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>
            
            <div className={css.modalSection}>
              <h3>Тип сообщений</h3>
              <div className={css.modalFilters}>
                {sourceTypes.map(({ key, label, icon: Icon }) => (
                  <div 
                    key={key || 'all'} 
                    className={`${css.modalFilterItem} ${sourceType === key ? css.activeFilter : ''}`}
                    onClick={() => setSourceType(sourceType === key ? null : key)}
                  >
                    {Icon && <Icon className={css.modalFilterIcon} />}
                    <span>{label}</span>
                    {sourceType === key && <div className={css.activeFilterMark} />}
                  </div>
                ))}
              </div>
              
              <h3>Порядок сортировки</h3>
              <div 
                className={css.modalSortButton}
                onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
              >
                {order === 'asc' ? 'По возрастанию ↑' : 'По убыванию ↓'}
              </div>
              
              <h3>Настройки отображения</h3>
              <div className={css.modalOptions}>
                <div 
                  className={css.modalOption}
                  onClick={() => setIsOverviewVisible(!isOverviewVisible)}
                >
                  <div className={css.modalOptionText}>
                    <span className={css.modalOptionTitle}>Статистика</span>
                    <span className={css.modalOptionDescription}>
                      {isOverviewVisible ? 'Отображается' : 'Скрыта'}
                    </span>
                  </div>
                  <div className={`${css.modalToggle} ${isOverviewVisible ? css.modalToggleActive : ''}`}>
                    <div className={css.modalToggleHandle}></div>
                  </div>
                </div>
                
                <button
                  className={css.modalButton}
                  onClick={() => {
                    handleCloseModal();
                    navigate('/messages/statistics');
                  }}
                >
                  Детальная статистика
                </button>
                
                <button
                  className={css.modalButton}
                  onClick={() => {
                    handleCloseModal();
                    navigate('/messages/filtered');
                  }}
                >
                  Отфильтрованные сообщения
                </button>
                
                <button
                  className={css.modalButton}
                  onClick={() => {
                    handleCloseModal();
                    refetch();
                  }}
                >
                  Обновить список
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={css.content}>
        {isMobile && statistics && isOverviewVisible && (
          <div className={css.mobileStatistics}>
            <StatisticsCard
              title="Всего"
              value={statistics.totalMessages}
              icon={MdMessage}
              color="#2196f3"
              compact={true}
            />
            <StatisticsCard
              title="Отфильтровано"
              value={statistics.filteredMessages}
              icon={MdFilterList}
              color="#4caf50"
              compact={true}
            />
            {statistics.topFilters && statistics.topFilters.length > 0 && (
              <StatisticsCard
                title="Топ фильтр"
                value={statistics.topFilters[0].count}
                subtitle={statistics.topFilters[0].filterName}
                icon={FaFilter}
                color="#ff9800"
                compact={true}
              />
            )}
          </div>
        )}
      
        <div className={css.messageList}>
          {isFetching ? (
            <div className={css.loading}>Загрузка сообщений...</div>
          ) : messages?.items?.length! > 0 ? (
            messages?.items.map((message, index) => (
              <MessageItem
                key={message.id}
                message={message}
                index={index}
                searchQuery={searchQuery}
                // onClick={() => navigate(`/messages/detail/${message.id}`)}
              />
            ))
          ) : (
            <div className={css.emptyState}>
              <MdMessage className={css.emptyIcon} />
              <h3>Сообщения не найдены</h3>
              <p>
                {sourceType || searchQuery
                  ? 'Попробуйте изменить фильтры или поисковый запрос'
                  : 'Пока нет сообщений для отображения'}
              </p>
            </div>
          )}
        </div>

        {messages && messages.totalPages > 1 && (
          <div className={css.paginationWrapper}>
            <Pagination totalItems={messages.totalItems} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;