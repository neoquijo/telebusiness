import { FC } from 'react';
import css from './Information.module.css';
import { FaInfoCircle } from 'react-icons/fa';
import { MdDangerous } from 'react-icons/md';
import { FaTriangleExclamation } from 'react-icons/fa6';

type Variant = 'info' | 'warning' | 'danger'
interface IProps {
  title: string;
  content: string | FC;
  variant?: Variant
}
const getClass = (variant: Variant) => {
  if (variant == 'danger')
    return css.danger
  if (variant == 'info')
    return css.info
  if (variant == 'warning')
    return css.warning
}

const Information: FC<IProps> = ({ title, content, variant = 'info' }) => {
  return (
    <div className={`${css.wrapper} ${getClass(variant)}`}>
      <div className={css.row}>

        {variant == 'info' && <FaInfoCircle className={css.icon} />}
        {variant == 'danger' && <MdDangerous className={css.icon} />}
        {variant == 'warning' && <FaTriangleExclamation className={css.icon} />}

        <div className={css.title}>
          {title}
        </div>
      </div>

      <div className={css.content}>
        {typeof content == 'string' ? content : <text />}
      </div>
    </div>
  );
};

export default Information;