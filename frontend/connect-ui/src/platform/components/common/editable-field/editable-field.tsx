import React, { useEffect, useState } from 'react';
import { StyledEditableField, Display, Label, TextInput, EditIcon, EnterIcon } from './editable-field.styles';
import { Edit, Enter } from '@icons'
import CSS from 'csstype';

export type Props = {
  label: string,
  value: string,
  onUpdate: (value: string) => Promise<void>
  style?: CSS.Properties
}

export const EditableField = ({ label, value, onUpdate, style }: Props) => {

  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);

  useEffect(() => {
    setEditedValue(value);
  }, [value, isEditing])

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleOnChange = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      await onUpdate(editedValue);
      setIsEditing(false);
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
  }

  return (
    <StyledEditableField style={style} editing={isEditing}>
      <Label>
        {label}
      </Label>
      {isEditing ? (
        <>
          <TextInput
            id="txtEditableField"
            type="text"
            value={editedValue}
            onBlur={handleBlur}
            onChange={e => setEditedValue(e.target.value)}
            onKeyDown={handleOnChange}
            autoFocus
            onFocus={e => e.target.select()}
          />
          <EnterIcon>
            <Enter />
          </EnterIcon>
        </>
      ) : (
        <>
          <Display id='lblEditableField' onClick={handleClick}>{value}</Display>
          <EditIcon>
            <Edit />
          </EditIcon>
        </>
      )
      }
    </StyledEditableField>
  )
};