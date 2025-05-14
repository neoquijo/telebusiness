import { FC, HtmlHTMLAttributes } from 'react';
import css from './SearchInput.module.css';
import { IoIosSearch } from 'react-icons/io';

interface IProps extends HtmlHTMLAttributes<HTMLDivElement> {
  caption?: string;
  cb: (props: any | void) => void
}

const SearchInput: FC<IProps> = ({ cb, caption, ...props }) => {
  return (
    <div {...props} className={css.wrapper}>
      <IoIosSearch className={css.icon} />
      <input placeholder={caption} className={css.input} onChange={e => cb(e.target.value)} />
    </div>
  );
};

export default SearchInput;