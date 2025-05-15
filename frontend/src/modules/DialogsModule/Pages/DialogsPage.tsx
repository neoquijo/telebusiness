import React, { useState } from 'react';
import { useGetChatsQuery } from '../../../API/chatsApi';
import Button from '../../../shared/components/UI/Button/Button';
import SearchInput from '../../../shared/components/UI/SearchInput/SearchInput';
import { BsFilter } from 'react-icons/bs';
import { IoIosChatboxes } from 'react-icons/io';
import { FaUser, FaBroadcastTower } from 'react-icons/fa';
import usePagination from '../../../shared/components/Navigation/Pagination/usePagination';
import css from './DialogsPage.module.css';
import DialogItem from './DialogItem';
import { RiRobot2Line } from 'react-icons/ri';
import { IoMdRefresh } from 'react-icons/io';

const DialogsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const { Pagination, page, limit } = usePagination(1, 20);

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

  return (
    <div className={css.container}>
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

      <div className={css.content}>
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