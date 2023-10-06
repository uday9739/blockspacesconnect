import React from 'react';
import { FallbackProps } from 'react-error-boundary';

const Crashed: React.FC<FallbackProps> = props => (
  <div className="Crashed">
    <p>
      <i/>
      Sorry this compoennt has crashed!
    </p>
  </div>
);

export default Crashed;