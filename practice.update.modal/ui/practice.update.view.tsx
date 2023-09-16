import React, { FC, useCallback, useEffect } from 'react';
import { useFormUpperFirst, useIntlMessage } from '@ui-kit/hooks';
import { useFormContext } from 'react-hook-form';
import TextField from '@ui-kit/ui/text.field';
import SelectBox from '@ui-kit/ui/select.box';
import { map, isBoolean } from 'lodash';
import cx from 'classnames';
import stateOptions from 'shared/config/state.options';
import { useContainer } from '@ui-kit/lib/container';
import { observer } from 'mobx-react-lite';
import { usePracticeUpdateModel } from '../context';
import CheckBox from '@ui-kit/ui/check.box/check.box';

const PracticeUpdateView: FC = observer(() => {
  const { businessUnits, getCityStateByZIP, cityStateByZip, canSetupSettingEdit } = usePracticeUpdateModel();
  const { control, setValue, getValues, watch } = useFormContext();

  const container = useContainer();

  useEffect(() => {
    if (cityStateByZip && Object.keys(cityStateByZip).length > 0) {
      setValue('city', cityStateByZip?.City, { shouldValidate: true, shouldDirty: true });
      setValue('state', cityStateByZip?.StateCode, { shouldValidate: true, shouldDirty: true });
    }
  }, [cityStateByZip]);

  const { t, formatMessage } = useIntlMessage();
  
  const statusPractice = [
    { value: '0', name: formatMessage({ id: 'diagnosis.measures.active' }) },
    { value: '1', name: formatMessage({ id: 'diagnosis.measures.inactive' }) },
  ];

  const checkPhoneValidate = (phone: string) => {
    const noPhoneRepeats = /^5{3}|0{10}$|1{10}$|2{10}$|3{10}$|4{10}$|5{10}$|6{10}$|7{10}$|8{10}$|9{10}$/;
    const no555AreaCodeRegex = /^5{3}/;
    const invalidNumbers = ['1234567890', '0123456789', '9876543210'];
    let valid = false;

    valid = !noPhoneRepeats.test(phone);
    if (!valid) return t('practice.phone.no.repeats');

    valid = !no555AreaCodeRegex.test(phone);
    if (!valid) return t('practice.phone.repeat.area.code');

    valid = invalidNumbers.findIndex((item) => item === phone) === -1;
    if (!valid) return t('practice.phone.invalid.number');

    return valid;

  };

  const checkAddressPOBox = (address: string) => {
    const noPOBoxRe = /[p]\.?\s?[o]\.?\s+?[b][o][x]/;
    const noPostOfficeBoxRe = /(post)\s+(office)\s+(box)/;
    let valid = false;

    valid = !noPOBoxRe.test(address.toLocaleLowerCase());
    if (!valid) return t('pratice.address.no.po.boxes');
    valid = !noPostOfficeBoxRe.test(address.toLocaleLowerCase());
    if (!valid) return t('pratice.address.no.post.office.box');

    return valid;
  };

  const checkAddressValidate = (address: string) => {
    const addressLineFormat = /^\d+\s[A-Za-z-]+/;
    let valid: boolean | string = false;

    valid = checkAddressPOBox(address);
    if (!isBoolean(valid)) return true;

    valid = addressLineFormat.test(address);
    if (!valid) return t('pratice.address.need.valid.street.address');

    return valid;
  };

  const handleZipChange = async (zip) => {
    if (zip.length > 4) {
      await getCityStateByZIP(Number(zip));
    }
  };

  const handleBlurName = useCallback((name: string) => {
    if (!getValues('prescribingName')) {
      setValue('prescribingName', name);
    }
  }, []);

  return (
    <div>
      <div className="flex flex-col xs:flex-row w-full xs:items-end xs:gap-6 gap-3 border-b border-primary pb-3">
        <SelectBox.Control
          control={control}
          name="practiceStatus"
          label={formatMessage({ id: 'header.practice.status' })}
          container={container}
          classes={{ button: '!mb-0', root: 'xs:w-[132px]' }}
          items={statusPractice}
        />
        {/* <Button size="sm" className="!px-5" color="red" variant="outlined" onClick={() => handleInactivatePractice(model.practice)}>
              {model.practice.practiceStatus === 0 ? formatMessage({ id: 'inactivate.practice' }) : formatMessage({ id: 'activate.practice' })}
            </Button> */}
      </div>
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:gap-x-6 gap-x-3 gap-y-2 pt-3">
          <TextField.Control
            control={control}
            name="name"
            label={formatMessage({ id: 'practice.measures.practiceName' })}
            rules={{
              maxLength: { value: 70, message: formatMessage({ id: 'fields.string.max' }, { value: 70 }) },
              required: true,
            }}
            maxLength={70}
            classes={{
              helperText: 'text-1.25u font-medium text-gray-500 italic',
            }}
            onBlur={(e) => handleBlurName(e.target.value)}
            // helperTextProps={{ forced: false }}
            helperTextMessage={formatMessage({ id: 'practice.name.description.printed' })}
          />
          <TextField.Control
            control={control}
            name="prescribingName"
            label={<p className="capitalize">{formatMessage({ id: 'settings.user.profile.practices.table.printedName' })}</p>}
            maxLength={70}
            rules={{
              maxLength: { value: 70, message: formatMessage({ id: 'fields.string.max' }, { value: 70 }) },
              required: true,
            }}
            classes={{
              helperText: 'text-1.25u font-medium text-gray-500 italic',
            }}
            // helperTextProps={{ forced: false }}
            helperTextMessage={formatMessage({ id: 'practice.nickname.description.presented' })}
          />

          <TextField.Control
            control={control}
            name="addressLine1"
            label={`${formatMessage({ id: 'address.line' })} 1`}
            rules={{
              required: true,
              maxLength: { value: 40, message: formatMessage({ id: 'fields.string.max' }, { value: 40 }) },
              validate: { checkAddress: checkAddressValidate },
            }}
            maxLength={40}
            helperTextProps={{ forced: false }}
          />
          <TextField.Control
            control={control}
            name="addressLine2"
            label={`${formatMessage({ id: 'address.line' })} 2`}
            rules={{
              maxLength: { value: 40, message: formatMessage({ id: 'fields.string.max' }, { value: 40 }) },
              validate: { checkAddress: checkAddressPOBox },
            }}
            maxLength={40}
            helperTextProps={{ forced: false }}
          />
        </div>
        <div className="grid md:grid-cols-3 xs:grid-cols-2 grid-cols-1 md:gap-x-6 gap-x-3 gap-y-2 sm:gap-y-0 pt-2">
          <TextField.Control
            control={control}
            name="zip"
            rules={{
              required: true,
              minLength: { value: 5, message: t('fields.string.min', { value: 5 }) },
            }}
            label={formatMessage({ id: 'pharmacy.zip' })}
            autoComplete="on"
            placeholder="_____-____"
            maskOptions={{ mask: '99999-9999' }}
            minLength={9}
            helperTextProps={{ forced: false }}
            onChange={(e) => handleZipChange(e.target.value)}
          />
          <TextField.Control
            control={control}
            name="city"
            label={formatMessage({ id: 'demographics.measures.city' })}
            maxLength={35}
            rules={{
              required: true,
              maxLength: { value: 35, message: formatMessage({ id: 'fields.string.max' }, { value: 35 }) },
            }}
            helperTextProps={{ forced: false }}
          />
          <SelectBox.Control
            control={control}
            name="state"
            label={formatMessage({ id: 'state' })}
            items={stateOptions}
            container={container}
            rules={{ required: true }}
            required
            helperTextProps={{ forced: false }}
          />
          <TextField.Control
            control={control}
            name="phone"
            label={formatMessage({ id: 'sheet.phone' })}
            placeholder="(___) ___-____"
            maskOptions={{ mask: '(999) 999-9999' }}
            autoComplete="off"
            rules={{
              required: true,
              minLength: { value: 10, message: ' ' },
              validate: { checkPhone: checkPhoneValidate },
            }}
            helperTextProps={{ forced: false }}
          />
          <TextField.Control
            control={control}
            name="fax"
            rules={{
              required: true,
              minLength: { value: 10, message: ' ' },
              validate: { checkFax: checkPhoneValidate },
            }}
            label={formatMessage({ id: 'pharmacy.fax' })}
            placeholder="(___) ___-____"
            maskOptions={{ mask: '(999) 999-9999' }}
            autoComplete="off"
            helperTextProps={{ forced: false }}
          />
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 flex items-center h-10 md:mt-8 mt-3 mb-2">
          <p className="text-sm font-semibold pl-4">{formatMessage({ id: 'diagnosis.measures.other' })}</p>
        </div>
        <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 md:gap-x-6 gap-x-3 md:gap-y-2">
          <TextField.Control
            control={control}
            name="otherInfo"
            label={formatMessage({ id: 'other.information' })}
            rules={{
              maxLength: { value: 35, message: formatMessage({ id: 'fields.string.max' }, { value: 35 }) },
            }}
            maxLength={35}
            classes={{ helperText: '!justify-end' }}
          />
          <TextField.Control
            control={control}
            name="footNote"
            label={formatMessage({ id: 'footnote' })}
            rules={{
              maxLength: { value: 35, message: formatMessage({ id: 'fields.string.max' }, { value: 35 }) },
            }}
            classes={{ helperText: '!justify-end' }}
            maxLength={35}
          />
          <TextField.Control
            control={control}
            name="taxId"
            label={formatMessage({ id: 'tax.id' })}
            rules={{
              maxLength: { value: 35, message: formatMessage({ id: 'fields.string.max' }, { value: 35 }) },
            }}
            classes={{ helperText: '!justify-end' }}
            maxLength={35}
          />
          <TextField.Control
            control={control}
            name="facilityNpi"
            label={formatMessage({ id: 'facility.npi' })}
            rules={{
              maxLength: { value: 35, message: formatMessage({ id: 'fields.string.max' }, { value: 35 }) },
            }}
            classes={{ helperText: '!justify-end' }}
            maxLength={35}
          />
          <SelectBox.Control
            control={control}
            label={formatMessage({ id: 'settings.user.profile.general.businessUnit' })}
            name="businessUnitId"
            container={container}
            classes={{ button: 'md:!mb-0 !mb-4', root: '' }}
            items={map(businessUnits, (unit) => ({
              value: unit.id,
              name: unit.name,
            }))}
            rules={{ required: true }}
          />
          <TextField.Control
            control={control}
            name="practiceExternalId"
            label={formatMessage({ id: 'external.identification' })}
            rules={{
              maxLength: { value: 50, message: formatMessage({ id: 'fields.string.max' }, { value: 50 }) },
            }}
            classes={{ helperText: '!justify-end' }}
            maxLength={50}
          />
        </div>
        <p className="bamboo.pmp.note text-sm font-medium mt-3 mb-2">{formatMessage('bamboo.pmp.integration')}</p>
      </div>
    </div>
  );
});

PracticeUpdateView.displayName = 'PracticeUpdateView';
export default PracticeUpdateView;
