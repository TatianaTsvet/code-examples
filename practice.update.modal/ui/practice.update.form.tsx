import React, { FC, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, useForm } from 'react-hook-form';
import { toFormValues } from 'shared/lib/helpers';
import { usePracticeUpdateModel } from '../context';

const PracticeUpdateForm: FC<PropsWithChildren> = observer(({ children }) => {
  const { getInitialFormValues } = usePracticeUpdateModel();

  const [defaultValues] = useState(() => toFormValues(getInitialFormValues()));

  const form = useForm({
    defaultValues,
    mode: 'all',
  });

  return <FormProvider {...form}>{children}</FormProvider>;
});
PracticeUpdateForm.displayName = 'PracticeUpdateForm';

export default PracticeUpdateForm;
