import { FC } from 'react';
import css from './ImportChats.module.css';
import { useAppSelector } from '../../../../core/store/MainStore';

interface IProps { }

const ImportChatsModal: FC<IProps> = () => {

  const { dialogs } = useAppSelector(s => s.account)

  return (
    <div className={css.wrapper}>
      {dialogs.length}
    </div>
  );
};

export default ImportChatsModal;