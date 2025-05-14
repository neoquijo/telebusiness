import { FC } from 'react';
import css from './Required.module.css';

interface IProps { }

const RequiredField: FC<IProps> = () => {
  return (
    <span className={css.wrapper}>
      *
    </span>
  );
};

export default RequiredField;