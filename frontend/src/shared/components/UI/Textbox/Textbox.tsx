import { FC, TextareaHTMLAttributes } from 'react';
import css from './Textbox.module.css';
import RequiredField from '../RequiredField/RequiredField';
import PopInfo from '../PopInfo/PopInfo';

interface IProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  info?: string;
}

const TextBox: FC<IProps> = ({ className, label, id, info, required, ...props }) => {
  return (
    <div className={`${css.wrapper} ${className || ''}`}>
      {label && (
        <label htmlFor={id} className={css.label}>
          {label}
          {required && <RequiredField />}
        </label>
      )}

      <div className={css.textareaContainer}>
        <textarea id={id} required={required} {...props} className={css.textArea} />
        {info && <PopInfo text={info} position="top" />}
      </div>
    </div>
  );
};

export default TextBox;