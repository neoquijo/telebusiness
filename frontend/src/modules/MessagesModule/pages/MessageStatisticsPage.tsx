import { FC, useState } from 'react';
import css from './MessageStatisticsPage.module.css';
import { useGetMessageStatisticsQuery } from '../../../API/messagesApi';
import { FaChartBar, FaArrowLeft, FaCalendarAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Button from '../../../shared/components/UI/Button/Button';
import { useNavigate } from 'react-router-dom';
import Input from '../../../shared/components/UI/Input/Input';

interface IProps { }

const MessageStatisticsPage: FC<IProps> = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isOverviewVisible, setIsOverviewVisible] = useState(true);

  const queryParams = new URLSearchParams();
  if (startDate) {
    const fromDate = new Date(`${startDate}T00:00:00`); // Начало дня в UTC
    const fromTimestamp = Math.floor(fromDate.getTime() / 1000); // Конвертация в секунды
    queryParams.append('from', fromTimestamp.toString());
  }
  
  // Преобразование endDate в Unix timestamp
  if (endDate) {
    const toDate = new Date(`${endDate}T23:59:59`); // Конец дня в UTC
    const toTimestamp = Math.floor(toDate.getTime() / 1000); // Конвертация в секунды
    queryParams.append('to', toTimestamp.toString());
  }

  const { data: statistics, isFetching, refetch } = useGetMessageStatisticsQuery(queryParams.toString());

  const handleDateReset = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className={css.wrapper}>
      <div className={css.header}>
        <div className={css.title}>
          <FaChartBar className={css.titleIcon} />
          Статистика сообщений
        </div>
        <div className={css.headerActions}>
          <Button
            icon={FaArrowLeft}
            variant="ghost"
            onClick={() => navigate('/messages')}
          >
            Назад к сообщениям
          </Button>
        </div>
      </div>

      <div className={css.filterSection}>
        <div className={css.dateFilters}>
          <div className={css.dateGroup}>
            <FaCalendarAlt className={css.calendarIcon} />
            <Input
              type="date"
              label="Дата от"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              label="Дата до"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Button onClick={handleDateReset} variant="ghost">
              Сбросить
            </Button>
            <Button onClick={() => refetch()}>
              Применить
            </Button>
          </div>
        </div>
      </div>

      {isFetching ? (
        <div className={css.loading}>Загрузка статистики...</div>
      ) : (
        <div className={css.content}>
          <div className={css.overviewHeader} onClick={() => setIsOverviewVisible(!isOverviewVisible)}>
            <h3>Свод данных</h3>
            {isOverviewVisible ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          
          {isOverviewVisible && (
            <div className={css.overviewCards}>
              <div className={css.card}>
                <div className={css.cardIcon}>📊</div>
                <div className={css.cardContent}>
                  <div className={css.cardValue}>{statistics?.totalMessages || 0}</div>
                  <div className={css.cardLabel}>Всего сообщений</div>
                </div>
              </div>

              <div className={css.card}>
                <div className={css.cardIcon}>🔍</div>
                <div className={css.cardContent}>
                  <div className={css.cardValue}>{statistics?.filteredMessages || 0}</div>
                  <div className={css.cardLabel}>Отфильтрованных</div>
                </div>
              </div>

              <div className={css.card}>
                <div className={css.cardIcon}>📈</div>
                <div className={css.cardContent}>
                  <div className={css.cardValue}>{statistics?.filteredPercentage || 0}%</div>
                  <div className={css.cardLabel}>Процент фильтрации</div>
                </div>
              </div>
            </div>
          )}

          <div className={css.chartsSection}>
            <div className={css.chartCard}>
              <h3 className={css.chartTitle}>Топ фильтров по количеству сообщений</h3>
              <div className={css.filtersList}>
                {statistics?.topFilters?.map((filter, index) => (
                  <div key={filter._id} className={css.filterItem}>
                    <div className={css.filterRank}>#{index + 1}</div>
                    <div className={css.filterName}>{filter.filterName}</div>
                    <div className={css.filterCount}>{filter.count} сообщений</div>
                  </div>
                )) || <div className={css.noData}>Нет данных</div>}
              </div>
            </div>

            <div className={css.chartCard}>
              <h3 className={css.chartTitle}>Активность по аккаунтам</h3>
              <div className={css.accountsList}>
                {statistics?.topAccounts?.map((account, index) => (
                  <div key={account._id} className={css.accountItem}>
                    <div className={css.accountRank}>#{index + 1}</div>
                    <div className={css.accountName}>{account._id}</div>
                    <div className={css.accountCount}>{account.count} сообщений</div>
                  </div>
                )) || <div className={css.noData}>Нет данных</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageStatisticsPage;