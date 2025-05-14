import { FC, ReactNode } from 'react';
import css from './NoData.module.css';
import { GrDocumentMissing } from 'react-icons/gr';

interface IProps {
  text?: string;
  subText?: string;
  element?: ReactNode;
}

const NoData: FC<IProps> = ({ text = 'По данному запросу нет данных', subText = 'NoDATA', element }) => {
  return (
    <div className={css.wrapper}>
      <div className={css.text}>
        {text}
      </div>
      <GrDocumentMissing className={css.icon} />
      <div className={css.underIcon}>

        <div className={css.subText}>
          {subText}
        </div>

        {element}
      </div>
    </div>
  );
};

export default NoData;