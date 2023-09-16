import { IPractice } from 'shared/api/practice';
import { IModalDialogConfig } from 'shared/model/modal.dialog';

export interface IPracticeUpdateModalConfig extends IModalDialogConfig<IPracticeUpdateModalReturn> {
  practiceId?: string | number;
  isAdded?: boolean;
  businessUnitId?: number;
}

export type IPracticeUpdateModalReturn = null;

export interface IPracticeUpdatePayload {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  name: string;
  prescribingName: string;
  phone: string;
  fax: string;
}

export type IPracticeUpdateFormValues = IPracticeUpdatePayload;

export interface IUpdatedPractice extends Partial<IPractice> {
  pmpLogin?: string;
  pmpPassword?: string;
  practiceStatus: string;
}
