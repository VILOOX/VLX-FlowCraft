import React from 'react';
import { BaseNode, BaseNodeProps } from './BaseNode';

export const StartNode: React.FC<BaseNodeProps> = (props) => {
  return (
    <BaseNode
      {...props}
      data={{
        ...props.data,
        label: '▶ Start',
        type: 'trigger'
      }}
    />
  );
};
