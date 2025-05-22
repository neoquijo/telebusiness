import React, { useState } from 'react';
import { useGetMessagesQuery, useGetMessageStatisticsQuery } from '../../../API/messagesApi';
import Button from '../../../shared/components/UI/Button/Button';
import SearchInput from '../../../shared/components/UI/SearchInput/SearchInput';
import { MdMessage, MdFilterList } from 'react-icons/md';
import { FaUser, FaBroadcastTower, FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import usePagination from '../../../shared/components/Navigation/Pagination/usePagination';
import css from './MessagesPage.module.css';
import MessageItem from '../components/MessagesItem';
import StatisticsCard from './StatisticsCard';
import { IoBarChart } from 'react-icons/io5';

const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceType, setSourceType] = useState<string | null>(null);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const { Pagination, page, limit } = usePagination(1, 20);
  const [isOverviewVisible, setIsOverviewVisible] = useState(false);

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

  return (
    <div className={css.container}>
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

      <div className={css.content}>
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
                onClick={() => navigate(`/messages/detail/${message.id}`)}
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