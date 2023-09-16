import { makeAutoObservable } from 'mobx';
import { ModalDialog, IModalDialogConfig, IModalDialogModel } from 'shared/model/modal.dialog';
import { DialogsStore } from 'shared/model/dialogs.store';
import { IPractice } from 'shared/api/practice';
import { notification } from '@ui-kit/lib/notification';
import { IntlMessage } from '@ui-kit/lib/intl.message';
import { ensureNotNil } from '@ui-kit/lib/asserts';
import { IPracticeUpdateModalConfig, IPracticeUpdateModalReturn, IUpdatedPractice } from '../types';
import { fetchSettingsWith, IPracticeSetting, SettingTypeEnum } from 'shared/api/settings';
import { ErrorService } from 'shared/model/error.service';
import { AjaxResponse } from 'rxjs/ajax';
import { lastValueFrom, startWith } from 'rxjs';
import { IBusinessUnit } from 'shared/api/business.unit';
import { UserStore } from 'features/user/model/user.store';
import { BusinessUnitService } from 'features/business.unit/business.unit.service';
import { practiceUpdatePayload } from '../lib';
import { UserService } from 'features/user/model/user.service';
import { DeepNullable } from 'ts-essentials';
import { IConfirmModalReturn } from 'features/common/confirm.modal';
import { RegisterTypeEnum } from 'shared/api/register';

export class PracticeUpdateModel implements IModalDialogModel {
  private _practiceId?: string | number;

  private _practice: IPractice | null = null;

  public get practice() {
    return ensureNotNil(this._practice, 'Practice');
  }

  private _newPractice: IPractice | null = null;

  private _businessUnits?: IBusinessUnit[];

  public get businessUnits() {
    return ensureNotNil(this._businessUnits, 'Business Units');
  }

  private _isInitialized = false;

  public get isInitialized() {
    return this._isInitialized;
  }

  private _isLoading = false;

  public get isLoading() {
    return this._isLoading;
  }

  private _isAdded? = false;

  public get isAdded() {
    return this._isAdded;
  }

  private readonly _dialog?: IModalDialogConfig['dialog'];


  readonly dialogs = {
    confirm: DialogsStore.createModalDialog('confirm'),
    electronicRegistration: DialogsStore.createModalDialog('electronicRegistration'),
  };

  constructor({ practiceId, isAdded, businessUnitId, dialog }: IPracticeUpdateModalConfig) {
    this._practiceId = practiceId;
    this._isAdded = isAdded;
    if (businessUnitId) this._businessUnitId = businessUnitId;
    this._dialog = dialog;

    makeAutoObservable(this, {}, { autoBind: true });

    this.init();
  }

  private *init() {
    try {
      yield this.fetchBusinessUnits();

      if (this._practiceId && Number(this._practiceId) > 0) {
        this._practice = yield this._practiceStore.getAdminPracticeNew(this._practiceId);

        yield this.getSettings();
      }

      this._isInitialized = true;
    } catch (err) {
      this.errorService.handleError(err);
      this._dialog?.close(null);
    }
  }

  private get userId() {
    return this.currentEntityService.currentUserId;
  }

  private get _userStore() {
    return UserStore.instance();
  }

  private get _practiceStore() {
    return PracticeStore.instance();
  }

  private get errorService() {
    return ErrorService.instance();
  }

  private get businessUnitService() {
    return BusinessUnitService.instance();
  }


  private get userService() {
    return UserService.instance();
  }

  public getInitialFormValues() {
    if (!this.isAdded)
      return { ...this._practice, practiceStatus: String(this._practice?.practiceStatus) };
    const defaultValues: DeepNullable<IUpdatedPractice> = {
      practiceStatus: '0',
      businessUnitId: this._businessUnitId,
      addressLine1: null,
      addressLine2: null,
      city: null,
      fax: null,
      name: null,
      phone: null,
      prescribingName: null,
      state: null,
      zip: null,
      pmpLogin: null,
      pmpPassword: null,
      id: null,
    };
    return defaultValues;
  }

  cancel() {
    this._dialog?.close(false);    
  }
 
  *updatePractice(practice) {
    try {
      const newPractice = { ...practice, updatedAt: new Date() };
      if (!this._isAdded) {
        yield this.changePractice(newPractice);
      } else {
        yield this.addPractice(newPractice);
        this._dialog?.close(true);
      }
    } catch (err) {
      this.errorService.handleError(err);
    } finally {
      this._isLoading = false;
    }
  }

  private *changePractice(practice) {
    const confirm: IConfirmModalReturn = yield this.dialogs.confirm.show({
      title: new IntlMessage('practice.update.confirm'),
      content: new IntlMessage({ id: 'practice.update.confirm.register.providers' }),
      ok: new IntlMessage({ id: 'practice.update.register.all' }),
    });
    if (!confirm) return;
    this._isLoading = true;

    const updatedPractice = practiceUpdatePayload(practice, practice.practiceStatus);
    yield this._practiceStore.updateCurrentAdminPractice(practice.id, updatedPractice);
    
    notification.success({
      title: new IntlMessage('register.success'),
      content: new IntlMessage('practice.measures.practiceUpdated'),
    });
    yield this.registerAllProviders();

    yield this._userStore.refreshSession();

    this._dialog?.close(true);
  }

 
  private *addPractice(practice) {
    this._isLoading = true;
    this._newPractice = yield this._practiceStore.addPractice(practice);

    yield this._userStore.refreshSession();

    if (this._newPractice) {
      notification.success({
        title: new IntlMessage('register.success'),
        content: new IntlMessage('settings.practice.created'),
      });
    }
  }

}

declare module 'shared/model/dialogs.store' {
  interface IDialogs {
    practiceUpdate: ModalDialog<IPracticeUpdateModalConfig, IPracticeUpdateModalReturn, PracticeUpdateModel>;
  }
}

DialogsStore.setModelSetupFn('practiceUpdate', (config) => new PracticeUpdateModel(config));
