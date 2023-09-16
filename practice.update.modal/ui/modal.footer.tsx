import React, { FC, MutableRefObject } from 'react';
import { observer } from 'mobx-react-lite';
import { useFormContext, useFormState } from 'react-hook-form';
import { XIcon } from '@heroicons/react/solid';
import { useIntlMessage } from '@ui-kit/hooks';
import Modal from '@ui-kit/ui/modal';
import Button from '@ui-kit/ui/button';
import { fromFormValues } from 'shared/lib/helpers';
import { FloppyDiskIcon } from '@ui-kit/icons/outline';
import Icon from '@ui-kit/ui/icon';
import { usePracticeUpdateModel } from '../context';
import { IPractice } from 'shared/api/practice';

interface IModalFooterProps {
  initialFocusRef: MutableRefObject<Nullable<HTMLButtonElement>>;
}

const ModalFooter: FC<IModalFooterProps> = observer(({ initialFocusRef }) => {
  const { formatMessage } = useIntlMessage();
  const { handleSubmit } = useFormContext<IPractice>();
  const { isValid } = useFormState();
  const { updatePractice, cancel } = usePracticeUpdateModel();
  const handleSavePractice = handleSubmit((data) => {
    updatePractice(fromFormValues(data));
  });

  const handleClose = () => {
    cancel();
  };

  return (
    <Modal.Footer className="flex items-center justify-end gap-4 md:gap-6 bg-primary">
      <Button ref={initialFocusRef} variant="outlined" color="gray" size="sm" className="!px-3 gap-1" onClick={handleClose}>
        <XIcon className="w-3 h-3" /> <span>{formatMessage('dialog.button.close')}</span>
      </Button>

      <Button variant="filled" color={isValid ? 'alpha' : 'red'} size="sm" className="!px-8" onClick={handleSavePractice}>
        <Icon as={FloppyDiskIcon} className="w-3 h-3 mr-2" />
        <span>{formatMessage('dialog.button.save')}</span>
      </Button>
    </Modal.Footer>
  );
});
ModalFooter.displayName = 'ModalFooter';

export default ModalFooter;
