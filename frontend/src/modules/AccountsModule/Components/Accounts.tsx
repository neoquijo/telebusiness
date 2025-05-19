// frontend/src/modules/AccountsModule/Components/Accounts.tsx
import React, { useState, useMemo } from 'react';
import css from './Accounts.module.css';
import SearchInput from '../../../shared/components/UI/SearchInput/SearchInput';
import Button from '../../../shared/components/UI/Button/Button';
import { FaTelegram, FaPlus, FaSort, FaSortAlphaDown, FaSortAlphaUp } from 'react-icons/fa';
import { BiFilterAlt } from 'react-icons/bi';
import { useModalManager } from '../../../core/providers/modal/ModalProvider';
import { useGetAccountsQuery } from '../../../API/accountsApi';
import { Account } from '../../../types/Account';
import AccountItem from './AccountItem';
import CreateAccountModal from '../modals/CreateAccount/CreateAccountModal';
import usePagination from '../../../shared/components/Navigation/Pagination/usePagination';

type SortType = 'name' | 'username' | 'date';
type SortDirection = 'asc' | 'desc';

const Accounts: React.FC = () => {
  const modal = useModalManager();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortType>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const { Pagination, limit } = usePagination(1, 10);
  const { data: accounts, isLoading, error } = useGetAccountsQuery('');

  const toggleSort = (type: SortType) => {
    if (sortBy === type) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortDirection('asc');
    }
  };

  const statusOptions = [
    { value: null, label: 'Все статусы' },
    { value: 'alive', label: 'Онлайн', color: '#4caf50' },
    { value: 'error', label: 'Ошибка', color: '#f44336' },
    { value: 'expired', label: 'Истекшие', color: '#ff9800' }
  ];

  const filteredAndSortedAccounts = useMemo(() => {
    if (!accounts) return [];

    // Сначала фильтрация
    let result = accounts.filter((account: Account) => {
      // Фильтр по статусу
      if (statusFilter && account.status !== statusFilter) {
        return false;
      }

      // Поиск по тексту
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          (account.name?.toLowerCase().includes(query)) ||
          (account.username?.toLowerCase().includes(query)) ||
          (account.phone?.toLowerCase().includes(query))
        );
      }

      return true;
    });

    // Затем сортировка
    return result.sort((a: Account, b: Account) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'username':
          comparison = (a.username || '').localeCompare(b.username || '');
          break;
        case 'date':
          comparison = (a.createdAt || 0) - (b.createdAt || 0);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [accounts, searchQuery, statusFilter, sortBy, sortDirection]);

  const getSortIcon = (type: SortType) => {
    if (sortBy !== type) return <FaSort />;
    return sortDirection === 'asc' ? <FaSortAlphaDown /> : <FaSortAlphaUp />;
  };

  const addAccount = () => {
    modal.openModal('addAccount', <CreateAccountModal />, {
      title: 'Добавление аккаунта'
    });
  };

  if (isLoading) {
    return (
      <div className={css.loading}>
        <div className={css.loadingContent}>
          <div className={css.spinner}></div>
          <p>Загрузка аккаунтов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={css.error}>
        <h2>Ошибка загрузки</h2>
        <p>Не удалось загрузить список аккаунтов</p>
        <Button onClick={() => window.location.reload()}>Обновить страницу</Button>
      </div>
    );
  }

  return (
    <div className={css.container}>
      <div className={css.header}>
        <div className={css.headerContent}>
          <h1 className={css.title}>
            <FaTelegram className={css.titleIcon} style={{ color: '#0088cc' }} />
            Аккаунты Telegram
          </h1>
          <div className={css.stats}>
            <div className={css.statItem}>
              <span className={css.statValue}>{accounts?.length || 0}</span>
              <span className={css.statLabel}>Всего аккаунтов</span>
            </div>
            <div className={css.statItem}>
              <span className={css.statValue}>
                {accounts?.filter(acc => acc.status === 'alive').length || 0}
              </span>
              <span className={css.statLabel}>Активных</span>
            </div>
          </div>
        </div>

        <div className={css.controls}>
          <div className={css.searchSection}>
            <SearchInput
              style={{ minWidth: '300px' }}
              caption="Поиск по аккаунтам"
              cb={setSearchQuery}
            />
          </div>

          <div className={css.filterSection}>
            <BiFilterAlt className={css.filterIcon} />
            <div className={css.filterButtons}>
              {statusOptions.map(status => (
                <Button
                  key={status.value || 'all'}
                  variant="ghost"
                  active={statusFilter === status.value}
                  onClick={() => setStatusFilter(statusFilter === status.value ? null : status.value)}
                  style={status.value ? { color: status.color } : {}}
                >
                  {status.label}
                </Button>
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            icon={FaPlus}
            onClick={addAccount}
          >
            Добавить аккаунт
          </Button>
        </div>
      </div>

      <div className={css.content}>
        {filteredAndSortedAccounts.length > 0 ? (
          <>
            <div className={css.listHeader}>
              <div className={css.listHeaderItem} style={{ width: '40px' }}></div>
              <div
                className={`${css.listHeaderItem} ${css.sortable}`}
                onClick={() => toggleSort('name')}
              >
                Название {getSortIcon('name')}
              </div>
              <div
                className={`${css.listHeaderItem} ${css.sortable}`}
                onClick={() => toggleSort('username')}
              >
                Username {getSortIcon('username')}
              </div>
              <div className={css.listHeaderItem}>Статус</div>
              <div className={css.listHeaderItem}>Телефон</div>
              <div className={css.listHeaderItem}>Действия</div>
            </div>

            <div className={css.accountsList}>
              {filteredAndSortedAccounts.map((account: Account) => (
                <AccountItem key={account.id} item={account} />
              ))}
            </div>
          </>
        ) : (
          <div className={css.emptyState}>
            <FaTelegram className={css.emptyIcon} />
            <h3>Аккаунты не найдены</h3>
            <p>
              {searchQuery || statusFilter
                ? 'Попробуйте изменить фильтры или поисковый запрос'
                : 'Добавьте Ваш первый аккаунт Telegram для начала работы'}
            </p>
            {!searchQuery && !statusFilter && (
              <Button
                variant="primary"
                icon={FaPlus}
                onClick={addAccount}
              >
                Добавить аккаунт
              </Button>
            )}
          </div>
        )}

        {filteredAndSortedAccounts.length > limit && (
          <div className={css.footer}>
            <Pagination totalItems={filteredAndSortedAccounts.length} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Accounts;