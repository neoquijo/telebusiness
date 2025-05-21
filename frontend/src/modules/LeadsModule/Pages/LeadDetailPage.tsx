// frontend/src/modules/LeadsModule/Pages/LeadDetailPage.tsx (обновленная версия)
import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetLeadQuery } from '../../../API/leadsApi';
import Button from '../../../shared/components/UI/Button/Button';
import { FaEdit } from 'react-icons/fa';
import { ReturnWidget } from '../../../shared/components/Widgets/ReturnWidget/ReturnWidget';
import LeadCard from '../Components/LeadCard';
import css from './LeadDetailPage.module.css';

const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: lead, isLoading, error, refetch } = useGetLeadQuery(id || '');

  if (isLoading) {
    return (
      <div className={css.loading}>
        <div className={css.spinner}></div>
        <p>Загрузка данных лида...</p>
      </div>
    );
  }

  if (error || !lead) {
    console.error("Error loading lead:", error);
    return (
      <div className={css.error}>
        <ReturnWidget to="/leads" text="Вернуться к списку лидов" />
        <h2>Ошибка загрузки</h2>
        <p>Не удалось загрузить данные лида</p>
        <div className={css.errorDetails}>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
        <Button onClick={() => refetch()}>Попробовать еще раз</Button>
      </div>
    );
  }

  return (
    <div className={css.container}>
      <div className={css.header}>
        <ReturnWidget to="/leads" text="Вернуться к списку лидов" />

        <div className={css.actions}>
          <Button
            variant="primary"
            icon={FaEdit}
            onClick={() => alert('Функционал редактирования лида в разработке')}
          >
            Редактировать
          </Button>
        </div>
      </div>

      <div className={css.content}>
        <LeadCard lead={lead} />
      </div>
    </div>
  );
};

export default LeadDetailPage;
