import React, { useEffect } from 'react';
import { useState } from 'react';
import { Text, CopyIcon, StyledCopyText, Label } from './copy-text.styles';
import CSS from 'csstype'
import { Tooltip } from '@platform/common'
import { Clipboard, Check } from '@icons';

export type Props = {
  label: string,
  text: string,
  style?: CSS.Properties,
  fontSize?: number
}

export function CopyText({ label, text, style, fontSize }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const resetCopy = setTimeout(() => setCopied(false), 4000)
    return () => clearTimeout(resetCopy)
  }, [copied])

  const handleClick = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
  }

  return (
    <>{copied ?
      <Tooltip content="Copied to Clipboard!" placement='right' forceShow={true}>
        <StyledCopyText
          onClick={handleClick}
          copied={copied}
          style={style}>
          <Label>
            {label}
          </Label>

          <Text>{text}</Text>
          <CopyIcon>
            <Check />
          </CopyIcon>
        </StyledCopyText>
      </Tooltip >
      :
      <StyledCopyText
        onClick={handleClick}
        copied={copied}
        style={style}>
        <Label>
          {label}
        </Label>

        <Text size={fontSize}>{text}</Text>
        <CopyIcon>
          <Clipboard />
        </CopyIcon>
      </StyledCopyText>
    }
    </>
  );
}