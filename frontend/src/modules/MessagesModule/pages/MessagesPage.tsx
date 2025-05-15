// src/modules/MessagesModule/pages/MessagesPage.tsx
import { FC, useState } from 'react';
import css from './MessagesPage.module.css';
import SearchInput from '../../../shared/components/UI/SearchInput/SearchInput';
import Button from '../../../shared/components/UI/Button/Button';
import { FaFilter, FaChartBar } from 'react-icons/fa';
import { useGetMessagesQuery } from '../../../API/messagesApi';
import { useNavigate } from 'react-router-dom';
import usePagination from '../../../shared/components/Navigation/Pagination/usePagination';
import NoData from '../../../shared/components/NoData/NoData';
import { FaEnvelope } from 'react-icons/fa6';
import { MdRefresh } from 'react-icons/md';
import MessageItem from '../components/MessagesItem';

interface IProps { }

const MessagesPage: FC<IProps> = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
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

  const { data: messages, isFetching, refetch } = useGetMessagesQuery(queryParams.toString());

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
          <FaEnvelope className={css.titleIcon} />
          Все сообщения
        </div>
        <div className={css.headerActions}>
          <Button
            icon={FaFilter}
            onClick={() => navigate('/messages/filtered')}
          >
            Отфильтрованные
          </Button>
          <Button
            icon={FaChartBar}
            onClick={() => navigate('/messages/statistics')}
          >
            Статистика
          </Button>
        </div>
      </div>

      <div className={css.filterSection}>
        <div className={css.searchRow}>
          <SearchInput
            className={css.searchInput}
            caption="Поиск по сообщениям"
            cb={(value) => setSearchQuery(value)}
          />
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
        {isFetching && <div className={css.loading}>Загрузка сообщений...</div>}

        {!isFetching && (
          <div className={css.messagesList}>
            {messages?.items?.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}

            {messages?.items?.length === 0 && (
              <NoData
                text="Сообщения не найдены"
                subText="Попробуйте изменить параметры поиска"
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

export default MessagesPage;