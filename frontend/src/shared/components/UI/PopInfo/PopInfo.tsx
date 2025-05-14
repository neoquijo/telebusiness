import { FC, ReactNode, useState } from 'react';
import { FaCircleInfo } from 'react-icons/fa6'; // Импортируем иконку
import css from './PopInfo.module.css';

interface IProps {
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children?: ReactNode
}

const PopInfo: FC<IProps> = ({ text, position = 'top', children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={css.popInfoWrapper}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children ? children : <FaCircleInfo className={css.icon} />}
      {isVisible && (
        <div className={`${css.tooltip} ${css[position]}`}>
          <div className={css.arrow}></div>
          {text}
        </div>
      )}
    </div>
  );
};

export default PopInfo;