import { FC, useState } from 'react';
import css from '../pages/MessagesPage.module.css';
import SearchInput from '../../../shared/components/UI/SearchInput/SearchInput';
import Button from '../../../shared/components/UI/Button/Button';
import { FaFilter, FaArrowLeft } from 'react-icons/fa';
import { useGetFilteredMessagesQuery } from '../../../API/messagesApi';
import { useGetFiltersQuery } from '../../../API/filtersApi';
import { useNavigate } from 'react-router-dom';
import usePagination from '../../../shared/components/Navigation/Pagination/usePagination';
import NoData from '../../../shared/components/NoData/NoData';
import { MdRefresh } from 'react-icons/md';
import MessageItem from '../components/MessagesItem';

interface IProps { }

const FilteredMessagesPage: FC<IProps> = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [selectedSourceType, setSelectedSourceType] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const { Pagination, page: currentPage, limit } = usePagination(1, 20);

  const queryParams = new URLSearchParams({
    searchQuery,
    page: String(currentPage),
    limit: String(limit),
    orderBy: 'createdAt',
    order,
    ...(selectedSourceType && { sourceType: selectedSourceType }),
  });

  const { data: messages, isFetching, refetch } = useGetFilteredMessagesQuery(queryParams.toString());
  const { data: filters } = useGetFiltersQuery('limit=100');

  const sourceTypes = [
    { value: '', label: 'Все типы' },
    { value: 'Private', label: 'Личные' },
    { value: 'Group', label: 'Группы' },
    { value: 'Channel', label: 'Каналы' },
  ];

  return (
    <div className={css.wrapper}>
      <div className={css.header}>
        <div className={css.title}>
          <FaFilter className={css.titleIcon} />
          Отфильтрованные сообщения
        </div>
        <div className={css.headerActions}>
          <Button
            icon={FaArrowLeft}
            variant="ghost"
            onClick={() => navigate('/messages')}
          >
            Все сообщения
          </Button>
        </div>
      </div>

      <div className={css.filterSection}>
        <div className={css.searchRow}>
          <SearchInput
            className={css.searchInput}
            caption="Поиск по отфильтрованным сообщениям"
            cb={(value) => setSearchQuery(value)}
          />

          <select
            className={css.typeSelect}
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="">Все фильтры</option>
            {filters?.items?.map(filter => (
              <option key={filter.id} value={filter.id}>
                {filter.name}
              </option>
            ))}
          </select>

          <select
            className={css.typeSelect}
            value={selectedSourceType}
            onChange={(e) => setSelectedSourceType(e.target.value)}
          >
            {sourceTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <Button
            icon={MdRefresh}
            onClick={() => refetch()}
            title="Обновить"
          />
          <Button onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}>
            {order === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
      </div>

      <div className={css.messagesContainer}>
        {isFetching && <div className={css.loading}>Загрузка отфильтрованных сообщений...</div>}

        {!isFetching && (
          <div className={css.messagesList}>
            {messages?.items?.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}

            {messages?.items?.length === 0 && (
              <NoData
                text="Отфильтрованные сообщения не найдены"
                subText="Попробуйте создать фильтры или изменить параметры поиска"
              />
            )}
          </div>
        )}
      </div>

      <div className={css.pagination}>
        <Pagination totalItems={messages?.totalItems || 0} />
      </div>
    </div>
  );
};

export default FilteredMessagesPage;