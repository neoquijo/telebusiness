import { ButtonHTMLAttributes, CSSProperties, FC } from 'react';
import css from './Button.module.css';
import { IconType } from 'react-icons';

interface IProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'ghost';
  icon?: IconType;
  iconClassname?: string;
  active?: boolean;
  iconStyle?: CSSProperties
}

const Button: FC<IProps> = ({ className, icon: Icon, variant = 'primary', iconClassname, active, iconStyle, ...props }) => {
  return (
    <div className={`${css.wrapper}`}>
      <button
        {...props}
        className={`${css.input} ${css[variant]} ${className || ''} ${active ? css[`${variant}-active`] : ''}`}
      >
        {Icon && <Icon style={iconStyle} className={iconClassname || css.icon} />}
        {props.children}
      </button>
    </div>
  );
};

export default Button;