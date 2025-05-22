// frontend/src/modules/AccountsModule/Components/Accounts.tsx
import React, { useState, useMemo, useEffect } from 'react';
import css from './Accounts.module.css';
import SearchInput from '../../../shared/components/UI/SearchInput/SearchInput';
import Button from '../../../shared/components/UI/Button/Button';
import { FaTelegram, FaPlus, FaSort, FaSortAlphaDown, FaSortAlphaUp, FaTimes } from 'react-icons/fa';
import { BiFilterAlt } from 'react-icons/bi';
import { IoSearch, IoFilter } from 'react-icons/io5';
import { useModalManager } from '../../../core/providers/modal/ModalProvider';
import { useGetAccountsQuery } from '../../../API/accountsApi';
import { Account } from '../../../types/Account';
import AccountItem from './AccountItem';
import CreateAccountModal from '../modals/CreateAccount/CreateAccountModal';
import usePagination from '../../../shared/components/Navigation/Pagination/usePagination';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { useModalBodyScroll } from '../../../hooks/useModalBodyScroll';

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
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // Используем хук для управления прокруткой при открытии модального окна
  useModalBodyScroll(isModalOpen);

  // Сбрасываем состояние модалки при изменении размера экрана
  useEffect(() => {
    if (!isMobile) {
      setIsModalOpen(false);
      setIsSearchVisible(false);
    }
  }, [isMobile]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

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

  // Получаем текущую метку для статуса фильтрации
  const getStatusFilterLabel = () => {
    const option = statusOptions.find(opt => opt.value === statusFilter);
    return option ? option.label : 'Все статусы';
  };

  // Мобильный заголовок
  const mobileHeader = (
    <>
      <div className={`${css.mobileHeader} mobileHeader`}>
        <div className={css.mobileTitle}>
          <FaTelegram className={css.titleIcon} style={{ color: '#0088cc' }} />
          <h1>Аккаунты</h1>
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
      
      {/* Мобильная панель поиска */}
      {isSearchVisible && (
        <div className={`${css.mobileSearchPanel} mobileSearchPanel`}>
          <SearchInput
            style={{ width: '100%' }}
            caption="Поиск по аккаунтам"
            cb={setSearchQuery}
          />
        </div>
      )}
      
      {/* Мобильная плавающая метка фильтра */}
      {statusFilter !== null && (
        <div className={`${css.mobileFilterBadge} mobileFilterBadge`} onClick={handleOpenModal} style={{ color: statusOptions.find(opt => opt.value === statusFilter)?.color }}>
          <div className={`${css.filterBadgeIcon} filterBadgeIcon`}>
            <BiFilterAlt />
          </div>
          <span>{getStatusFilterLabel()}</span>
        </div>
      )}

      {/* Модальное окно с настройками для мобильной версии */}
      {isModalOpen && (
        <div className={`${css.modalOverlay} modalOverlay`} onClick={handleCloseModal}>
          <div className={`${css.modalContent} modalContent`} onClick={e => e.stopPropagation()}>
            <div className={`${css.modalHeader} modalHeader`}>
              <h2>Настройки и фильтры</h2>
              <button className={`${css.modalClose} modalClose`} onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>
            
            <div className={`${css.modalSection} modalSection`}>
              <h3>Статус аккаунтов</h3>
              <div className={`${css.modalFilters} modalFilters`}>
                {statusOptions.map((status) => (
                  <div 
                    key={status.value || 'all'} 
                    className={`${css.modalFilterItem} modalFilterItem ${statusFilter === status.value ? `${css.activeFilter} activeFilter` : ''}`}
                    onClick={() => setStatusFilter(statusFilter === status.value ? null : status.value)}
                    style={status.value && statusFilter === status.value ? 
                      { borderColor: status.color } : {}}
                  >
                    <div className={`${css.modalFilterIcon} modalFilterIcon`} style={status.value ? { color: status.color } : {}}>
                      <BiFilterAlt />
                    </div>
                    <span>{status.label}</span>
                    {statusFilter === status.value && (
                      <div className={`${css.activeFilterMark} activeFilterMark`} style={status.value ? { background: status.color } : {}} />
                    )}
                  </div>
                ))}
              </div>
              
              <h3>Сортировка</h3>
              <div className={`${css.modalSortOptions} modalSortOptions`}>
                <div 
                  className={`${css.modalSortItem} modalSortItem ${sortBy === 'name' ? `${css.activeSortItem} activeSortItem` : ''}`}
                  onClick={() => toggleSort('name')}
                >
                  <span>По имени</span>
                  {sortBy === 'name' && (
                    <div className={`${css.sortDirection} sortDirection`}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </div>
                  )}
                </div>
                
                <div 
                  className={`${css.modalSortItem} modalSortItem ${sortBy === 'username' ? `${css.activeSortItem} activeSortItem` : ''}`}
                  onClick={() => toggleSort('username')}
                >
                  <span>По username</span>
                  {sortBy === 'username' && (
                    <div className={`${css.sortDirection} sortDirection`}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </div>
                  )}
                </div>
                
                <div 
                  className={`${css.modalSortItem} modalSortItem ${sortBy === 'date' ? `${css.activeSortItem} activeSortItem` : ''}`}
                  onClick={() => toggleSort('date')}
                >
                  <span>По дате создания</span>
                  {sortBy === 'date' && (
                    <div className={`${css.sortDirection} sortDirection`}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </div>
                  )}
                </div>
              </div>
              
              <h3>Действия</h3>
              <div className={`${css.modalActions} modalActions`}>
                <button
                  className={`${css.modalButton} modalButton`}
                  onClick={() => {
                    handleCloseModal();
                    addAccount();
                  }}
                >
                  <FaPlus className={`${css.modalButtonIcon} modalButtonIcon`} />
                  Добавить аккаунт
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Десктопный заголовок
  const desktopHeader = (
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
  );

  return (
    <div className={css.container}>
      {isMobile ? mobileHeader : desktopHeader}

      <div className={css.content}>
        {/* Мобильная статистика */}
        {isMobile && (
          <div className={`${css.mobileStats} mobileStats`}>
            <div className={`${css.mobileStatItem} mobileStatItem`}>
              <span className={`${css.mobileStatValue} mobileStatValue`}>{accounts?.length || 0}</span>
              <span className={`${css.mobileStatLabel} mobileStatLabel`}>Всего</span>
            </div>
            <div className={`${css.mobileStatItem} mobileStatItem`}>
              <span className={`${css.mobileStatValue} mobileStatValue`}>
                {accounts?.filter(acc => acc.status === 'alive').length || 0}
              </span>
              <span className={`${css.mobileStatLabel} mobileStatLabel`}>Активных</span>
            </div>
          </div>
        )}

        {filteredAndSortedAccounts.length > 0 ? (
          <>
            {!isMobile && (
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
            )}

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