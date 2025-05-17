import React, { useState } from 'react';
import { useGetFiltersQuery, useDeleteFilterMutation } from '../../../API/filtersApi';
import Button from '../../../shared/components/UI/Button/Button';
import SearchInput from '../../../shared/components/UI/SearchInput/SearchInput';
import { BsFilter, BsPlus } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { infoSuccess, infoError } from '../../../shared/lib/toastWrapper';
import usePagination from '../../../shared/components/Navigation/Pagination/usePagination';
import css from './FiltersPage.module.css';
import FilterItem from '../components/FilterItem';

const FiltersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const { Pagination, page, limit } = usePagination(1, 20);
  const [deleteFilter] = useDeleteFilterMutation();

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

  return (
    <div className={css.container}>
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

      <div className={css.content}>
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
                onEdit={(id) => navigate(`/filters/edit/${id}`)}
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