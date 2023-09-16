
import React, { Key, ChangeEventHandler, FocusEventHandler, ChangeEvent, MutableRefObject, RefObject, ReactNode, forwardRef, useRef, useEffect } from 'react';
import { useIntl } from 'react-intl';
import cx from 'classnames';
import { map, assign, merge, isFunction } from 'lodash';
import { Controller, UseControllerProps } from 'react-hook-form';
import { ChevronDownIcon, ChevronUpIcon, CheckIcon } from '@heroicons/react/outline';
import { Item } from '@react-stately/collections';
import { useSelectState } from '@react-stately/select';
import type { SelectState } from '@react-stately/select';
import { useButton } from '@react-aria/button';
import { FocusScope, useFocusRing } from '@react-aria/focus';
import { useListBox, useOption } from '@react-aria/listbox';
import { useSelect, useHiddenSelect } from '@react-aria/select';
import { mergeProps, useId } from '@react-aria/utils';
import { isReqiredError, renderErrorMessage } from '../../lib/form';
import { releaseVirtualPointer } from '../../lib/event';
import { setRef } from '../../lib/element';
import Popper from '../popper';
import Tooltip from '../tooltip';
import Icon from '../icon';
import FormHelperText from '../form.helper.text';
import styles from './select.box.module.css';

type SelectBoxClasses =
  | 'root'
  | 'label'
  | 'optional'
  | 'helperText'
  | 'button'
  | 'itemWidth'
  | 'icon'
  | 'list'
  | 'btnGroup'
  | 'placeholder'
  | 'placeholderBlock';

interface AriaHiddenSelectProps {
  /**
   * Describes the type of autocomplete functionality the input should provide if any.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefautocomplete).
   */
  autoComplete?: string;
  /** The text label for the select. */
  label?: ReactNode;
  /** HTML form input name. */
  name?: string;
  /** Sets the disabled state of the select and input. */
  isDisabled?: boolean;
}

interface HiddenSelectProps<T> extends AriaHiddenSelectProps {
  /** State for the select. */
  state: SelectState<T>;
  /** A ref to the trigger element. */
  innerRef: RefObject<HTMLElement>;
  onChange?: ChangeEventHandler;
  triggerRef: RefObject<HTMLElement>;
}

export interface ISelectProps<V = any> {
  alt?: string;
  autoFocus?: boolean;
  cols?: number;
  disabled?: boolean;
  form?: string;
  name?: string;
  pattern?: string;
  required?: boolean;
  type?: string;
  width?: number | string;
  listWidth?: number | string;
  border?: BorderOptions | undefined;
  value?: string | number;
  placeholder?: string | null;
  id?: string;
  rootRef?: MutableRefObject<HTMLDivElement>;
  container?: Nullable<Element> | undefined;

  label?: ReactNode;
  optional?: ReactNode;
  helperText?: ReactNode | string;
  helperTextProps?: any;
  // forced?: boolean;
  items: readonly { value: V; name: string }[];
  selected?: Key;
  tooltip?: string;

  error?: boolean;
  noAsterisk?: boolean;
  highlightBeforeFirstFocus?: boolean;
  allowClear?: boolean;

  onSelect?: (value: Key) => void;
  onBlur?: FocusEventHandler;
}

type BorderOptions = 'rounded' | 'rounded-l' | 'rounded-r' | 'rounded-none';

/**
 * @private
 * Renders a hidden native `<select>` element, which can be used to support browser
 * form autofill, mobile form navigation, and native form submission.
 */
function HiddenSelect<T>(props: HiddenSelectProps<T>) {
  const { state, triggerRef, label, name, isDisabled, onChange: receivedOnChange, innerRef } = props;
  const assignRef = assign(innerRef, triggerRef);
  const {
    containerProps,
    inputProps,
    selectProps: { onChange, ...selectProps },
  } = useHiddenSelect(props, state, assignRef);

  const handleOnChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (isFunction(receivedOnChange)) receivedOnChange(event);
    if (!event.isDefaultPrevented()) onChange(event);
  };

  // If used in a <form>, use a hidden input so the value can be submitted to a server.
  // If the collection isn't too big, use a hidden <select> element for this so that browser
  // autofill will work. Otherwise, use an <input type="hidden">.
  if (state.collection.size <= 300) {
    return (
      <div {...containerProps} hidden>
        <input {...inputProps} />
        <label>
          {label}
          <select {...selectProps} onChange={handleOnChange}>
            {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
            <option />
            {/* eslint-disable-next-line array-callback-return, consistent-return */}
            {map([...state.collection.getKeys()], (key) => {
              const item = state.collection.getItem(key);
              if (item.type === 'item') {
                return (
                  <option key={item.key} value={item.key}>
                    {item.textValue}
                  </option>
                );
              }
            })}
          </select>
        </label>
      </div>
    );
  }
  if (name) {
    return <input autoComplete={selectProps.autoComplete} name={name} value={state.selectedKey} {...inputProps} />;
  }

  return null;
}
HiddenSelect.displayName = 'HiddenSelect';

/** @private */
function Option({ item, state, width, classes }) {
  const ref = useRef(null);
  const { optionProps, isSelected, isFocused, isDisabled } = useOption({ key: item.key }, state, ref);
  const { focusProps } = useFocusRing();
  return (
    <li
      {...mergeProps(optionProps, focusProps, { style: { width: width > 0 ? `${width}px` : width ?? classes.itemWidth } })}
      ref={ref}
      className={cx(styles.root, isFocused && styles.focused, isDisabled && styles.disabled, isSelected && isFocused && styles.hovered)}
    >
      <div className={cx(styles.option)}>
        <p className="flex-initial">{item.rendered}</p>
        {isSelected && <Icon as={CheckIcon} className={cx(styles.icon, isSelected && styles.selected, isSelected && isFocused && styles.hovered)} />}
        {!isSelected && <span className={cx(styles.icon)} />}
      </div>
    </li>
  );
}
Option.displayName = 'Option';

function ListBox(props) {
  const ref = useRef(null);
  const { listBoxRef = ref, state, listWidth, classes } = props;
  const { listBoxProps } = useListBox(props, state, listBoxRef);
  return (
    <ul {...listBoxProps} ref={listBoxRef} className={cx(styles.list)}>
      {map([...state.collection], (item) => (
        <Option key={item.key} item={item} state={state} width={listWidth} classes={classes} />
      ))}
    </ul>
  );
}
ListBox.displayName = 'ListBox';

/** @private */
function List(props) {
  const {
    label,
    selected,
    optional,
    helperText,
    disabled,
    container,
    required,
    error,
    helperTextProps,
    children,
    onSelect,
    onBlur,
    width,
    listWidth: receivedListWidth,
    border,
    innerRef,
    classes,
    value,
    placeholder,
    allowClear,
    tooltip,
  } = props;
  const { formatMessage } = useIntl();

  const state = useSelectState({ label, children, onSelectionChange: onSelect, defaultSelectedKey: value ?? '' });
  const triggerRef = useRef<HTMLDivElement>(null);
  const { labelProps, triggerProps, menuProps, valueProps } = useSelect({ label, children, onBlur }, state, triggerRef);
  const { focusProps } = useFocusRing();
  const {
    buttonProps: { onPointerDown, ...buttonProps },
  } = useButton({ ...triggerProps, isDisabled: disabled }, triggerRef);
  const defaultSelected = selected !== undefined ? selected : <p className="text-gray-500">{placeholder ?? formatMessage({ id: 'measures.noSelected' })}</p>;

  const listWidth = receivedListWidth ?? triggerRef?.current?.clientWidth;

  useEffect(() => {
    if (value?.length === 0) state.setSelectedKey('');
    if (value !== state.selectedItem?.key) {
      state.setSelectedKey(value);
    }
  }, [value]);

  useEffect(() => {
    if (!state.isFocused && state.isOpen) {
      state.close();
    }
  }, [state.isFocused]);

  return (
    <Popper
      container={container}
      placement="bottom-start"
      trigger={null}
      open={state.isOpen}
      onOpen={() => state.open(null)}
      onClose={state.close}
      className={classes?.list}
      content={
        <FocusScope autoFocus restoreFocus>
          <ListBox {...menuProps} state={state} label={label} listWidth={listWidth} selectionMode="single" />
        </FocusScope>
      }
    >
      {({ ref: stickyRef }) => (
        <>
          <HiddenSelect state={state} triggerRef={triggerRef} innerRef={innerRef} label={label} />
          {label && (
            <div {...labelProps} className={cx('form-group __row justify-between', classes?.label)}>
              {label}
              {optional}
              {allowClear && state.selectedKey && (
                <button
                  type="button"
                  className="font-medium capitalize text-xs text-blue-500"
                  onClick={() => {
                    state.setSelectedKey('');
                  }}
                >
                  {formatMessage({ id: 'dialog.button.clear' })}
                </button>
              )}
            </div>
          )}
          <div className={cx(width ?? styles.width, classes?.btnGroup, { [styles.disabled]: disabled })}>
            <Tooltip content={tooltip}>
              <span>
                <button
                  type="button"
                  className={cx(
                    styles.button,
                    'form-input-affix',
                    'rounded-none',
                    width ?? styles.width,
                    styles.root,
                    { __error: error && required },
                    // (!state.selectedItem || selected === undefined) && styles.not_selected,
                    border ?? styles.border,
                    classes?.button
                  )}
                  {...buttonProps}
                  onPointerDown={(e) => onPointerDown && onPointerDown(releaseVirtualPointer(e))}
                  ref={(el) => {
                    setRef(triggerRef, el);
                    setRef(stickyRef, el);
                  }}
                  {...mergeProps(buttonProps, focusProps)}
                >
                  <div className={cx(classes?.placeholderBlock, 'flex justify-start truncate flex-grow')}>
                    <p {...valueProps} className={cx(styles.button_child, classes?.placeholder)}>
                      {state.selectedItem ? state.selectedItem.rendered : defaultSelected}
                    </p>
                  </div>
                  <div>
                    {state.isOpen ? (
                      <Icon as={ChevronUpIcon} className={cx(styles.button_icon, classes?.icon)} />
                    ) : (
                      <Icon as={ChevronDownIcon} className={cx(styles.button_icon, classes?.icon)} />
                    )}
                  </div>
                </button>
              </span>
            </Tooltip>

            {helperText}
          </div>
        </>
      )}
    </Popper>
  );
}
List.displayName = 'List';

const SelectBox = forwardRef<XHTMLElement<HTMLInputElement>, StyledComponentProps<ISelectProps, SelectBoxClasses>>((props, ref) => {
  const {
    className,
    classes,
    style,
    rootRef,
    id: receivedId,
    label: receivedLabel,
    optional: receivedOptional,
    helperText: receivedHelperText,
    helperTextProps,
    error = false,
    required = false,
    disabled = false,
    noAsterisk = true,
    selected,
    items,
    container,
    onSelect,
    width,
    listWidth,
    border,
    value,
    tooltip,
    placeholder,
    highlightBeforeFirstFocus,
    allowClear,
    ...attrs
  } = props;

  const id = useId(receivedId);
  const labelId = `label-${id}`;
  const inputId = `input-${id}`;
  const helperTextId = useId();

  const label = receivedLabel && (
    <label className={cx(className, 'form-label', { __required: required && !noAsterisk })} htmlFor={inputId} id={labelId}>
      {receivedLabel}
    </label>
  );

  const optional = receivedOptional && <span className={cx(classes?.optional, 'form-helper-text')}>{receivedOptional}</span>;
  const helperText = receivedHelperText && (
    <FormHelperText {...helperTextProps} className={classes?.helperText} id={helperTextId}>
      {receivedHelperText}
    </FormHelperText>
  );
  return (
    <div ref={rootRef} className={cx('form-control', classes?.root)}>
      <List
        {...attrs}
        innerRef={ref}
        label={label}
        placeholder={placeholder}
        selected={selected}
        onSelect={onSelect}
        optional={optional}
        helperText={helperText}
        disabled={disabled}
        container={container}
        required={required}
        error={error}
        width={width}
        listWidth={listWidth}
        border={border}
        classes={classes}
        value={value}
        allowClear={allowClear}
        tooltip={tooltip}
      >
        {map(items, (item) => (
          <Item key={item.value} textValue={item.name}>
            {item.name}
          </Item>
        ))}
      </List>
    </div>
  );
});
SelectBox.displayName = 'SelectBox';

type SelectControlProps<F extends Record<string, any> = any> = ISelectProps & UseControllerProps<F>;

function Control(props: StyledComponentProps<SelectControlProps, SelectBoxClasses>) {
  const { classes, items, helperTextProps, highlightBeforeFirstFocus = false, allowClear = false, selected, onSelect, onBlur, ...rest } = props;
  const { name, control, rules, shouldUnregister, defaultValue, ...attrs } = rest;
  const { formatMessage } = useIntl();

  // @ts-ignore
  const required = Boolean(rules?.required);
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      defaultValue={defaultValue}
      // eslint-disable-next-line @typescript-eslint/no-shadow
      render={({ field: { ref, name, value, onChange: onFieldChange, onBlur: onFieldBlur }, fieldState: { invalid, error, isTouched, isDirty } }) => {
        const mergedProps = mergeProps({ onSelect, onBlur }, { onSelect: onFieldChange, onBlur: onFieldBlur });
        const shownRequired = (required && !value) || isReqiredError({ invalid, error, isTouched, isDirty }, rules);
        const selectedValue =
          selected === undefined && value !== null && value !== '0' && value !== '' ? items.find((item) => item.value === value)?.name : selected;
        const firstFocus = !selectedValue && highlightBeforeFirstFocus;
        return (
          <SelectBox
            {...attrs}
            {...mergedProps}
            classes={mergeProps(classes ?? {}, {
              optional: cx(classes?.optional, { __error: required }),
              button: cx(classes?.button, firstFocus ? 'border-green-500' : ''),
              helperText: cx(styles.root, { __error: invalid }),
            })}
            ref={ref}
            name={name}
            required={required}
            selected={selectedValue}
            error={invalid}
            value={value}
            optional={shownRequired && <span>{formatMessage({ id: 'fields.error.required' })}</span>}
            helperText={<>{renderErrorMessage({ invalid, error, isTouched, isDirty }, rules, 'span')}</>}
            helperTextProps={merge({ forced: true }, helperTextProps)}
            items={items}
            allowClear={allowClear}
          />
        );
      }}
      shouldUnregister={shouldUnregister}
    />
  );
}
Control.displayName = 'SelectBox.Control';

export default assign(SelectBox, { Control });
