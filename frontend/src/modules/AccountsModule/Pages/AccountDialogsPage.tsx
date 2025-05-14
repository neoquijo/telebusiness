import { FC, useEffect } from 'react';
import css from './AccountsPage.module.css';
import { useParams } from 'react-router-dom';
import { useGetAccountChatsQuery } from '../../../API/accountsApi';
import { infoError, infoSuccess } from '../../../shared/lib/toastWrapper';
import AccountDialogs from '../Components/Dialogs/Dialogs';
import Button from '../../../shared/components/UI/Button/Button';
import { useDispatch } from 'react-redux';
import { setDialogs } from '../../../core/store/slices/accountSlice';
import { useAppSelector } from '../../../core/store/MainStore';
import {
  resetChatImports,
  setChatImportIds,
  setImportingChats,
  setFilterType,
  setSearchQuery
} from '../../../core/store/slices/dialogSlice';
import { NormalizedDialog } from '../types';
import { useImportChatsMutation } from '../../../API/chatsApi';

interface IProps { }

const AccountDialogsPage: FC<IProps> = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { data, isFetching, isError, isSuccess } = useGetAccountChatsQuery(id + '/');
  const { currentAccount: account } = useAppSelector(s => s.account);
  const dialogState = useAppSelector(s => s.dialogs);
  const nowImporting = dialogState.nowImporting;
  const selectedChatIds: any = dialogState.importingChatIds || [];

  // Use the import chats mutation
  const [importChats, { isLoading: isImporting }] = useImportChatsMutation();

  useEffect(() => {
    if (data && isSuccess) {
      dispatch(setDialogs(data));
    }
  }, [data, isSuccess]);

  useEffect(() => {
    if (isError) {
      infoError('При попытке загрузить чаты произошла ошибка');
    }
  }, [isError]);

  useEffect(() => {
    dispatch(resetChatImports());
    dispatch(setImportingChats(false));
    dispatch(setFilterType(null));
    dispatch(setSearchQuery(''));
  }, []);

  const handleMarkAll = () => {
    const allIds = data?.map((dialog: NormalizedDialog) => dialog.id) || [];
    dispatch(setChatImportIds(allIds));
  };

  const handleResetAll = () => {
    dispatch(resetChatImports());
  };

  const handleSave = async () => {
    if (!id) return;
    if (selectedChatIds.length === 0) {
      infoError('Выберите хотя бы один чат для импорта');
      return;
    }

    try {
      // Filter selected chats from the data
      const selectedChats = data?.filter((dialog: NormalizedDialog) =>
        selectedChatIds.includes(dialog.id)
      ) || [];

      const result = await importChats({
        accountId: id,
        chats: selectedChats,
        makePublic: false, // Default value without modal
        collectionName: undefined // Default value without modal
      }).unwrap();

      infoSuccess(`Успешно импортировано ${result.imported} чатов`);
      dispatch(resetChatImports());
      dispatch(setImportingChats(false));
    } catch (error) {
      infoError('Ошибка при импорте чатов');
      console.error('Import error:', error);
    }
  };

  return (
    <div className={css.wrapper}>
      {isFetching ? (
        <div>Загружаем чаты...</div>
      ) : (
        <>
          <div className={css.row}>
            <div className={css.title}>
              Список диалогов: {account?.name}
            </div>
          </div>
          <AccountDialogs dialogs={data || []} />
          <div className={css.actions}>
            {nowImporting ? (
              <div className={css.importOptions}>
                <Button onClick={() => dispatch(setImportingChats(false))}>
                  Отменить импортирование
                </Button>
                <Button onClick={handleMarkAll}>
                  Отметить все
                </Button>
                <Button onClick={handleResetAll}>
                  Сбросить все
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={selectedChatIds.length === 0 || isImporting}
                >
                  {isImporting ? 'Импортирую...' : `Сохранить ${selectedChatIds.length > 0 ? `(${selectedChatIds.length})` : ''}`}
                </Button>
              </div>
            ) : (
              <Button onClick={() => dispatch(setImportingChats(true))}>
                Импортировать чаты
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AccountDialogsPage;