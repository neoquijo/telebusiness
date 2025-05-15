// src/modules/FiltersModule/pages/FiltersPage.tsx
import { FC, useState } from 'react';
import css from './FiltersPage.module.css';
import SearchInput from '../../../shared/components/UI/SearchInput/SearchInput';
import Button from '../../../shared/components/UI/Button/Button';
import { FaPlus, FaFilter } from 'react-icons/fa';
import { useGetFiltersQuery } from '../../../API/filtersApi';
import { useNavigate } from 'react-router-dom';
import FilterItem from '../components/FilterItem';
import usePagination from '../../../shared/components/Navigation/Pagination/usePagination';
import NoData from '../../../shared/components/NoData/NoData';

interface IProps { }

const FiltersPage: FC<IProps> = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const { Pagination, page: currentPage, limit } = usePagination(1, 10);

  const queryParams = new URLSearchParams({
    searchQuery,
    page: String(currentPage),
    limit: String(limit),
    orderBy: 'createdAt',
    order,
    ...(selectedStatus && { status: selectedStatus }),
  });

  const { data: filters, isFetching, refetch } = useGetFiltersQuery(queryParams.toString());

  return (
    <div className={css.wrapper}>
      <div className={css.header}>
        <div className={css.title}>
          <FaFilter className={css.titleIcon} />
          Фильтры сообщений
        </div>
        <Button
          icon={FaPlus}
          onClick={() => navigate('/filters/create')}
        >
          Создать фильтр
        </Button>
      </div>

      <div className={css.filterSection}>
        <div className={css.searchRow}>
          <SearchInput
            className={css.searchInput}
            caption="Поиск фильтров"
            cb={(value) => setSearchQuery(value)}
          />
          <Button onClick={() => refetch()}>
            Обновить
          </Button>
          <Button onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}>
            {order === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
      </div>

      <div className={css.filtersContainer}>
        {isFetching && <div className={css.loading}>Загрузка фильтров...</div>}

        {!isFetching && (
          <div className={css.filtersList}>
            {filters?.items?.map((filter) => (
              <FilterItem key={filter.id} filter={filter} />
            ))}

            {filters?.items?.length === 0 && (
              <NoData text="Фильтры не найдены" subText="Создайте первый фильтр для начала работы" />
            )}
          </div>
        )}
      </div>

      <div className={css.pagination}>
        <Pagination totalItems={filters?.totalItems || 0} />
      </div>
    </div>
  );
};

export default FiltersPage;