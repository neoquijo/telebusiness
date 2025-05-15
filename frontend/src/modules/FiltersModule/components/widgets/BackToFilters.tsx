import { FC } from 'react';
import { ReturnWidget } from '../../../../shared/components/Widgets/ReturnWidget/ReturnWidget';

interface IProps { }

const BackToFilters: FC<IProps> = () => {
  return (
    <ReturnWidget to='/filters' text='Вернуться к фильтрам' />
  );
};

export default BackToFilters;