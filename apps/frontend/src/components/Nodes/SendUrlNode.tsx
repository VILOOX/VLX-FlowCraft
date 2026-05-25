import React from 'react';
import { BaseNode, BaseNodeProps } from './BaseNode';

export const SendUrlNode: React.FC<BaseNodeProps> = (props) => {
  return (
    <BaseNode
      {...props}
      data={{
        ...props.data,
        label: '📤 Send URL',
        type: 'action'
      }}
    />
  );
};
