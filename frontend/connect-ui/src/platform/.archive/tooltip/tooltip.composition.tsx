import React from 'react';
import { Tooltip } from './tooltip';

export const BasicTooltip = () => {
  return (
    <React.StrictMode>
      <Tooltip tooltip="this is the tooltip" arrow position="right">
        <div
          role="button"
          style={{ width: 200, height: 200, left: 100, top: 40 }}
        >
          hello world!
        </div>
      </Tooltip>
    </React.StrictMode>
  );
}
