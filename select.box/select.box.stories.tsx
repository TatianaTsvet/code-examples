import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import SelectBox from './select.box';
import { map } from 'lodash';

const defaultItems = [
  {
    value: 'Wade Cooper',
    name: 'Wade Cooper',
    id: 2,
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib' +
      '=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    username: '@mpettegree',
  },
  {
    value: 'Arlene Mccoy',
    name: 'Arlene Mccoy',
    id: 1,
    avatar:
      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib' +
      '=rb-1.2.1auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    username: '@gilberto_miguel',
  },
  {
    value: 'Devon Webb',
    name: 'Devon Webb',
    id: 3,
    avatar:
      'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib' +
      '=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    username: '@redington',
  },
  {
    value: 'Tom Cook',
    name: 'Tom Cook',
    id: 4,
    avatar:
      'https://images.unsplash.com/photo-1528763380143-65b3ac89a3ff?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib' +
      '=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    username: '@kurtis',
  },
  {
    value: 'Tanya Fox',
    name: 'Tanya Fox',
    id: 5,
    avatar:
      'https://images.unsplash.com/photo-1569913486515-b74bf7751574?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib' +
      '=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    username: '@sbalmann',
  },
  {
    value: 'Hellen Schmidt',
    name: 'Hellen Schmidt',
    id: 6,
    avatar:
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib' +
      '=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    username: '@brent_m',
  },
];

export default {
  title: 'Shared/SelectBox',
  component: SelectBox,
  args: {
    error: false,
    disabled: false,
    onSelect: action('onSelect'),
    onBlur: action('onBlur'),
    border: 'rounded',
  },
  argTypes: {
    ref: { control: false },
    key: { control: false },
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
    border: {
      options: ['rounded', 'rounded-r', 'rounded-l', 'rounded-none'],
      control: { type: 'radio' },
    },
  },
} as ComponentMeta<typeof SelectBox>;

const Template: ComponentStory<typeof SelectBox> = (args) => <SelectBox {...args} />;

export const Default = Template.bind({});
Default.args = {
  items: defaultItems,
  label: 'Label',
  optional: 'Optional',
  helperText: 'Helper text',
  selected: defaultItems[0].name,
};

export const WithIcons = (args) => (
  <SelectBox
    {...args}
    items={map(defaultItems, (item) => ({
      value: item.value,
      name: (
        <div className="flex items-center" key={item.value}>
          <img src={item.avatar} alt={item.name} className="w-10 h-10 mr-2 rounded-full" />
          <div>
            <p>{item.name}</p>
            <p>{item.username}</p>
          </div>
        </div>
      ),
    }))}
    classes={{ placeholder: '!max-h-max !overflow-none flex', button: '!min-h-8 !h-max', root: 'w-96' }}
  />
);
