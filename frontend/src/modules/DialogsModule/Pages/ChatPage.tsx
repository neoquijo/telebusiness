import { FC, useState } from 'react';
import css from './ChatPage.module.css';
import { useGetChatsQuery } from '../../../API/chatsApi';
import usePagination from '../../../shared/components/Navigation/Pagination/usePagination';
import { IoMdRefresh } from 'react-icons/io';
import NoData from '../../../shared/components/NoData/NoData';
import ChatItem from '../Components/ChatItem';
import SearchInput from '../../../shared/components/UI/SearchInput/SearchInput';
import Button from '../../../shared/components/UI/Button/Button';

interface IProps { }

const ChatPage: FC<IProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const { Pagination, page: currentPage, limit } = usePagination(1, 10);

  const queryParams = new URLSearchParams({
    searchQuery,
    page: String(currentPage),
    limit: String(limit),
    orderBy: 'createdAt',
    order,
    type: selectedType,
  });

  const { data: chats, isFetching, refetch } = useGetChatsQuery(queryParams.toString());

  return (
    <div className={css.wrapper}>
      <div className={css.filterSection}>

        {/* Search Row */}
        <div className={css.searchRow}>

          <SearchInput
            className={css.searchInput}

            cb={(e) => setSearchQuery(e)}
          />
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

        {/* Type Filters */}
        <div className={css.typeFilters}>
          <button
            className={`${css.typeButton} ${!selectedType ? css.active : ''}`}
            onClick={() => setSelectedType('')}
          >
            Все чаты
          </button>
          <button
            className={`${css.typeButton} ${selectedType === 'Channel' ? css.active : ''}`}
            onClick={() => setSelectedType('Channel')}
          >
            Каналы
          </button>
          <button
            className={`${css.typeButton} ${selectedType === 'Chat' ? css.active : ''}`}
            onClick={() => setSelectedType('Chat')}
          >
            Группы
          </button>
          <button
            className={`${css.typeButton} ${selectedType === 'User' ? css.active : ''}`}
            onClick={() => setSelectedType('User')}
          >
            Приватные
          </button>
        </div>
      </div>

      {/* Chats List */}
      <div className={css.chatsContainer}>
        {/* Header with sorting and pagination */}

        {/* Loading State */}
        {isFetching && <div className={css.loading}>Загрузка чатов...</div>}

        {/* Chats List */}
        {!isFetching && (
          <div className={css.chatsList}>
            {chats?.items?.map((chat) => (
              <ChatItem item={chat} />
            ))}

            {/* Empty State */}
            {chats?.items?.length === 0 && (
              <NoData />
            )}
          </div>
        )}
      </div>

      <div className={css.pagination}>
        <Pagination totalItems={chats?.totalItems || 0} />
      </div>
    </div>

  );
};

export default ChatPage;