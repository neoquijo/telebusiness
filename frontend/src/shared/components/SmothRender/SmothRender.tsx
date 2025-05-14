import { FC, ReactNode, useEffect, useState } from 'react';
import css from './SmothRender.module.css';

interface Props {
  items: ReactNode[];
  reRender?: any;
}

const SmoothRender: FC<Props> = ({ items, reRender }) => {
  const [localItems, setLocalItems] = useState<ReactNode[]>(items);

  useEffect(() => {
    setLocalItems(items);
  }, [reRender, items]);

  return (
    <>
      {localItems.map((el, index) => {
        return (
          <span
            key={index}
            style={{ animationDelay: `${index * 100}ms` }}
            className={css.animated}
          >
            {el}
          </span>
        );
      })}
    </>
  );
};

export default SmoothRender;