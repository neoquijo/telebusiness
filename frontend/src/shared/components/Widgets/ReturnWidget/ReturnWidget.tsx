import { FC } from 'react';
import css from './ReturnWidget.module.css';
import { useNavigate } from 'react-router-dom';
import { IoChevronBackSharp } from 'react-icons/io5';

interface IProps {
  to: string;
  text: string;
  cb?: () => void;
}

export const ReturnWidget: FC<IProps> = ({ text, to, cb }) => {
  const navigate = useNavigate()
  return (
    <div onClick={() => {
      if (cb) {
        cb()
      }
      navigate(to)
    }} className={css.wrapper}>
      <div className={css.icon}><IoChevronBackSharp /></div>
      <div className={css.text}>{text}</div>
    </div>
  );
};
