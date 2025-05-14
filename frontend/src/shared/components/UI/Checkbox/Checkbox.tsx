import React from "react";
import css from "./Checkbox.module.css";
import RequiredField from "../RequiredField/RequiredField";
import PopInfo from "../PopInfo/PopInfo";

interface CustomCheckboxProps {
  label?: string;
  checked: boolean;
  onChange: () => void;
  required?: boolean;
  info?: string;
  id?: string;
  inline?: boolean;
}

const Checkbox: React.FC<CustomCheckboxProps> = ({
  label,
  checked,
  onChange,
  required,
  info,
  id,
  inline,
}) => {
  return (
    <div
      className={`${css.checkboxWrapper} ${inline ? css.inline : ""}`}
    >
      {label && (
        <label htmlFor={id} className={css.label}>
          {label}
          {required && <RequiredField />}
        </label>
      )}
      <div className={css.checkboxContainer}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className={css.hiddenCheckbox}
          id={id}
        />
        <span onClick={onChange} className={css.customCheckbox}>
          {checked && <span className={css.checkmark}>✓</span>}
        </span>
        {info && <PopInfo text={info} position="top" />}
      </div>
    </div>
  );
};

export default Checkbox;