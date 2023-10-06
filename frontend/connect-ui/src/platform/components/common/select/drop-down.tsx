import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Option } from './option';
import { useSelectStore } from './select-provider';

export const DropDown = observer(() => {
  const { options, styles } = useSelectStore();
  const refInput = useRef(null);

  const {
    DropdownInput, DropdownContainerInput, DropdownIconSearch, DropdownContainerOptions,
  } = styles;

  const [filterParam, setFilterParam] = useState('');

  const [optionsFiltered, setOptionsFiltered] = useState(options);

  // useEffect(() => {
  //   refInput.current.focus();
  // }, []);

  useEffect(() => {
    setOptionsFiltered(options.filter((option) => option.label.toLocaleLowerCase().includes(filterParam.toLocaleLowerCase())));
  }, [filterParam]);

  return (
    <>
      <DropdownContainerInput>
        <DropdownInput
          ref={refInput}
          placeholder="Filter"
          onChange={(e) => {
            setFilterParam(e.target.value);
          }}
        />
        <DropdownIconSearch src="images/select/icon-search.png" />
      </DropdownContainerInput>
      <DropdownContainerOptions>
        {optionsFiltered.map(
          (option) => <Option key={option.value} option={option} />,
        )}
      </DropdownContainerOptions>
    </>
  );
});
