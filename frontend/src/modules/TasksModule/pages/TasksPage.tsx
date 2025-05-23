import { FC } from 'react';
import css from './TasksPage.module.css';
import { useGetAccountQuery } from '../../../API/accountsApi';

interface IProps { }

const TasksPage: FC<IProps> = () => {
  useGetAccountQuery('');
  
  return (
    <div className={css.wrapper}>
      Tasks page
    </div>
  );
};

export default TasksPage;