import { FC } from 'react';
import css from './RequiredField.module.css';

const RequiredField: FC = () => {
  return <span className={css.wrapper}>*</span>;
};

export default RequiredField;