import React, { FC, useRef } from 'react';
import Modal from '@ui-kit/ui/modal';
import { useIntlMessage, useStateRef } from '@ui-kit/hooks';
import { observer } from 'mobx-react-lite';
import { IDialogs } from 'shared/model/dialogs.store';
import PracticeUpdateView from './practice.update.view';
import '../model/practice.update.model';
import ModalFooter from './modal.footer';
import { PracticeUpdateModelProvider } from '../context';
import { ContainerProvider } from '@ui-kit/lib/container';
import PracticeUpdateForm from './practice.update.form';
import InnerModals from './inner.modals';

interface IPracticeUpdateModalProps {
  dialog: IDialogs['practiceUpdate'];
}

const PracticeUpdateModal: FC<IPracticeUpdateModalProps> = observer(({ dialog }) => {
  const { model, isOpen } = dialog;

  if (!model) {
    throw new Error('Model must be set');
  }

  const { isLoading, isAdded, isInitialized } = model;
  const { formatMessage } = useIntlMessage();

  const initialFocusRef = useRef<HTMLButtonElement | null>(null);
  const [container, setContainerRef] = useStateRef<HTMLDivElement | null>(null);
  return (
    <Modal
      open={isOpen}
      className="!w-[780px]"
      initialFocus={initialFocusRef}
      innerRef={setContainerRef}
      isInitialized={isInitialized}
    >
      <ContainerProvider value={container}>
        <PracticeUpdateModelProvider value={model}>
          <PracticeUpdateForm>
            <Modal.Header>
              <p className="font-semibold text-base">
                {isAdded ? formatMessage({ id: 'settings.create.practice' }) : formatMessage({ id: 'update.practice' })}
              </p>
            </Modal.Header>
            <Modal.Body>
              <PracticeUpdateView />
            </Modal.Body>
            <Modal.Loader isLoading={isLoading} />
            <ModalFooter initialFocusRef={initialFocusRef} />
          </PracticeUpdateForm>
        </PracticeUpdateModelProvider>
      </ContainerProvider>
      <InnerModals model={model} />
    </Modal>
  );
});

PracticeUpdateModal.displayName = 'PracticeUpdateModal';
export default PracticeUpdateModal;
