import { FC, HTMLAttributes } from 'react'; // Добавлен HTMLAttributes
import css from './Divider.module.css';
interface IProps extends HTMLAttributes<HTMLDivElement> { }

const VDivider: FC<IProps> = ({ className, style, ...props }) => {
  return (
    <div
      {...props}
      style={style}
      className={`${css.VDivider} ${className || ''}`}
    />
  );
};

export default VDivider;