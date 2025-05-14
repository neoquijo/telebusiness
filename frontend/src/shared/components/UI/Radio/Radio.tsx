import React from "react";
import css from "./Radio.module.css";
import RequiredField from "../RequiredField/RequiredField";
import PopInfo from "../PopInfo/PopInfo";
import { FaCheck } from "react-icons/fa6";

interface CustomRadioProps {
  label?: string;
  checked: boolean;
  onChange: () => void;
  required?: boolean;
  info?: string;
  id?: string;
  inline?: boolean;
  name?: string; // Добавляем name для группировки радио-кнопок
}

const Radio: React.FC<CustomRadioProps> = ({
  label,
  checked,
  onChange,
  required,
  info,
  id,
  inline,
  name,
}) => {
  return (
    <div
      className={`${css.radioWrapper} ${inline ? css.inline : ""}`}
    >
      {label && (
        <label htmlFor={id} className={css.label}>
          {label}
          {required && <RequiredField />}
        </label>
      )}
      <div className={css.radioContainer}>
        <input
          type="radio"
          checked={checked}
          onChange={onChange}
          className={css.hiddenRadio}
          id={id}
          name={name} // Группировка радио-кнопок
        />
        <span onClick={onChange} className={css.customRadio}>
          {checked && <div className={css.radiomark}>
            <FaCheck />
          </div>}
        </span>
        {info && <PopInfo text={info} position="top" />}
      </div>
    </div>
  );
};

export default Radio;