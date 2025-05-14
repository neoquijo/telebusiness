import { FC, InputHTMLAttributes } from 'react';
import css from './Input.module.css';
import RequiredField from '../RequiredField/RequiredField';
import PopInfo from '../PopInfo/PopInfo';

interface IProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  info?: string;
  inline?: boolean;
  inputClassname?: string;
}

const Input: FC<IProps> = ({ className, inline, label, inputClassname, id, info, required, ...props }) => {
  return (
    <div style={props.style} className={`${css.wrapper} ${inline ? css.inline : ''} ${className || ''}`}>
      {label && (
        <label htmlFor={id} className={css.label}>
          {label}
          {required && <RequiredField />}
        </label>
      )}

      <div className={css.inputContainer}>
        <input id={id} required={required} {...props} className={`${css.input} ${inputClassname ? inputClassname : ''}`} />
        {info && <PopInfo text={info} position="top" />}
      </div>
    </div>
  );
};

export default Input;