import { FC } from 'react';
import { ReturnWidget } from '../../../../shared/components/Widgets/ReturnWidget/ReturnWidget';


interface IProps { }

const BackToAccounts: FC<IProps> = () => {
  return (
    <>
      <ReturnWidget to='/' text='Вернуться к выбору аккаунта' />
    </>
  );
};

export default BackToAccounts;