import React, { useState } from 'react';
import {
  useGetFilteredMessagesQuery,
  //  useGetMessageStatisticsQuery
} from '../../../API/messagesApi';
import { useGetFiltersQuery } from '../../../API/filtersApi';
import Button from '../../../shared/components/UI/Button/Button';
import SearchInput from '../../../shared/components/UI/SearchInput/SearchInput';
import { MdFilterList, MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import { FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import usePagination from '../../../shared/components/Navigation/Pagination/usePagination';
import css from './FilteredMessagesPage.module.css';
// import StatisticsCard from './StatisticsCard';
import MessageItem from '../components/MessagesItem';

const FilteredMessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const { Pagination, page, limit } = usePagination(1, 20);

  const queryParams = new URLSearchParams({
    searchQuery,
    page: page.toString(),
    limit: limit.toString(),
    orderBy: 'createdAt',
    order,
    filters: selectedFilters.join(',')
  }).toString();

  const { data: messages, isLoading: messagesLoading, refetch } = useGetFilteredMessagesQuery(queryParams);
  // const { data: statistics } = useGetMessageStatisticsQuery('');
  const { data: filtersData } = useGetFiltersQuery('');

  const handleFilterToggle = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  if (messagesLoading) {
    return (
      <div className={css.loading}>
        <div className={css.loadingContent}>
          <div className={css.spinner}></div>
          <p>Загрузка отфильтрованных сообщений...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={css.container}>
      <div className={css.header}>
        <div className={css.headerContent}>
          <h1 className={css.title}>
            <MdFilterList className={css.titleIcon} />
            Отфильтрованные сообщения
          </h1>
          <div className={css.headerActions}>
            <Button
              variant="secondary"
              onClick={() => navigate('/messages')}
            >
              Все сообщения
            </Button>
            <Button
              variant="primary"
              icon={FaFilter}
              onClick={() => navigate('/filters')}
            >
              Управление фильтрами
            </Button>
          </div>
        </div>

        {/* {statistics && (
          <div className={css.statistics}>
            <StatisticsCard
              title="Отфильтрованных сообщений"
              value={statistics.filteredMessages}
              icon={MdFilterList}
              color="#4caf50"
              subtitle={`${statistics.filteredPercentage}% от общего числа`}
            />
            {statistics.topFilters && statistics.topFilters.length > 0 && (
              <StatisticsCard
                title="Самый активный фильтр"
                value={statistics.topFilters[0].filterName}
                subtitle={`${statistics.topFilters[0].count} сообщений`}
                icon={FaFilter}
                color="#ff9800"
              />
            )}
          </div>
        )} */}

        <div className={css.controls}>
          <div className={css.searchSection}>
            <SearchInput
              style={{ minWidth: '300px' }}
              caption="Поиск по сообщениям"
              cb={setSearchQuery}
            />
          </div>

          <div className={css.filterSection}>
            <div className={css.filterHeader} onClick={toggleFilters}>
              <label className={css.filterLabel}>
                Фильтры: {selectedFilters.length > 0 ? `(Выбрано: ${selectedFilters.length})` : ''}
              </label>
              {showFilters ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
            </div>
            {showFilters && (
              <div className={css.filterCheckboxes}>
                {filtersData?.items.map(filter => (
                  <label key={filter.id} className={css.filterCheckbox}>
                    <input
                      type="checkbox"
                      checked={selectedFilters.includes(filter.id)}
                      onChange={() => handleFilterToggle(filter.id)}
                    />
                    <span>{filter.name}</span>
                  </label>
                ))}
              </div>
            )}
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

      <div className={css.content}>
        <div className={css.messageList}>
          {messages?.items && messages.items.length > 0 ? (
            messages.items.map((message, index) => (
              <MessageItem
                key={message.id}
                message={message}
                index={index}
                searchQuery={searchQuery}
              />
            ))
          ) : (
            <div className={css.emptyState}>
              <MdFilterList className={css.emptyIcon} />
              <h3>Отфильтрованные сообщения не найдены</h3>
              <p>
                {selectedFilters.length > 0 || searchQuery
                  ? 'Попробуйте изменить фильтры или поисковый запрос'
                  : 'Пока нет сообщений, соответствующих заданным фильтрам'}
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

export default FilteredMessagesPage;
