import { FC } from 'react';
import css from './InnerLink.module.css';
import { useNavigate } from 'react-router-dom';
import { HiArrowUturnRight } from 'react-icons/hi2';

interface IProps {
  to: string
  caption: string
  showIcon: boolean
}

const InnerLink: FC<IProps> = ({ to, caption, showIcon = false }) => {

  const navigate = useNavigate()

  return (
    <span onClick={() => navigate(to)} className={css.wrapper}>
      {showIcon && <HiArrowUturnRight className={css.icon} />}
      {caption}
    </span>
  );
};

export default InnerLink;