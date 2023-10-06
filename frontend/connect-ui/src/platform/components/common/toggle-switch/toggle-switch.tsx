import React, { useEffect, useState } from 'react';
import { Styles } from './toggle-switch.styles';

export function ToggleSwitch({
  name, id, checkedOuter, setValue,
}) {
  const { ToggleSwitch } = Styles;

  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(checkedOuter);
  }, [checkedOuter]);

  const onChange = (value) => {
    setChecked(value);
    setValue(value);
  };

  return (
    <ToggleSwitch className="toggle-switch" onClick={(e) => onChange(!checked)}>
      <input
        type="checkbox"
        className="toggle-switch-checkbox"
        name={name}
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label className="toggle-switch-label" htmlFor="toggleSwitch">
        <span className="toggle-switch-inner" />
        <span className="toggle-switch-switch" />
      </label>
    </ToggleSwitch>
  );
}
