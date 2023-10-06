import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { map } from 'lodash'

import { StyledResourcesDropdown, DropdownLabel, Dropdown, DropdownOption, CategoryLabel, CategoryDropdown, Category } from './resources-dropdown.styles';

import { NetworkCuratedResource } from '@blockspaces/shared/models/network-catalog';
import { NetworkCuratedResourceDto } from '@blockspaces/shared/dtos/network-catalog';

export type CuratedResourceProps = {
  resources:NetworkCuratedResourceDto[]
}

export const ResourcesDropdown = ({ resources }:CuratedResourceProps)=> {

  const dropdown = useRef<HTMLDivElement>();
  const [ showDropdown, setShowDropdown ] = useState(false);

  const closeDropdown = useMemo(() => (
    (e: MouseEvent & { target: HTMLElement; }) => ((
      dropdown.current && (
        e.target !== dropdown.current
        && !dropdown.current.contains(e.target)
      )) ? setShowDropdown(false) : false)
  ), [dropdown.current]);

  useEffect(() => {
    showDropdown
      ? document.addEventListener('mousedown', closeDropdown)
      : document.removeEventListener('mousedown', closeDropdown);
    return () => { document.removeEventListener('mousedown', closeDropdown); }
  }, [ showDropdown ]);

  const resourcesByCategory:{ [category:string]: NetworkCuratedResource[] } = {}
  resources?.forEach(resource => {
    if (!resourcesByCategory[resource.category])
      resourcesByCategory[resource.category] = [];
    resourcesByCategory[resource.category].push(resource)
  })

  if (!resources) return <></>
  return (
    <StyledResourcesDropdown>
      <DropdownLabel onClick={() => setShowDropdown(true)}>
        Resources
      </DropdownLabel>
      { showDropdown && 
        <Dropdown ref={dropdown}>
          { map( resourcesByCategory, ( resources, category ) => (
            <Category>
              <CategoryLabel>{category}</CategoryLabel>
              <CategoryDropdown>
                { map( resources, resource => (
                  <Link legacyBehavior href={resource.url} passHref>
                    <DropdownOption target="_blank">{resource.description}</DropdownOption>
                  </Link>
                ))}
              </CategoryDropdown>
            </Category>
          )) }
        </Dropdown>
      }
    </StyledResourcesDropdown>
  )
};
