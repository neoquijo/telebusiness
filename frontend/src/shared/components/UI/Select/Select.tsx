import { FC, SelectHTMLAttributes } from 'react';
import css from './Select.module.css';
import RequiredField from '../RequiredField/RequiredField';
import PopInfo from '../PopInfo/PopInfo';

interface IProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  info?: string;
  inline?: boolean;
  options: { value: string | undefined; label: string }[];
}

const Select: FC<IProps> = ({ className, label, inline, id, info, required, options, ...props }) => {
  return (
    <div className={`${css.wrapper} ${inline ? css.inline : ''} ${className || ''}`}>
      {label && (
        <label htmlFor={id} className={css.label}>
          {label}
          {required && <RequiredField />}
        </label>
      )}

      <div className={css.selectContainer}>
        <select id={id} required={required} {...props} className={css.select}>
          {/* Опции */}
          {options.map((option) => (
            <option className={css.option} key={option.value} value={option.value || ''}>
              {option.label}
            </option>
          ))}
        </select>
        {info && <PopInfo text={info} position="top" />}
      </div>
    </div>
  );
};

export default Select;