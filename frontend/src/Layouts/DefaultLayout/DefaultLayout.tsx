import { ComponentType, FC } from 'react';
import css from './DefaultLayout.module.css';

interface IProps {
  Component: ComponentType<any>
}

const DefaultLayout: FC<IProps> = ({ Component }) => {
  return (
    <div className={css.layoutWrapper}>
      <main className={css.mainContent}>
        <Component />
      </main>
    </div>
  );
};

export default DefaultLayout;