import React, { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { ConfirmModal } from 'features/common/confirm.modal';
import { PracticeUpdateModel } from '../model';
import { RegisterModal } from 'features/register';

interface IInnerModalsProps {
  model: PracticeUpdateModel;
}

const InnerModals: FC<IInnerModalsProps> = observer(({ model }) => {
  const { confirm, electronicRegistration } = model.dialogs;
  return (
    <>
      {confirm.isActive && <ConfirmModal key={confirm.key} dialog={confirm} />}
      {electronicRegistration?.isActive && <RegisterModal key={electronicRegistration?.key} dialog={electronicRegistration} />}
    </>
  );
});
InnerModals.displayName = 'InnerModals';

export default InnerModals;
