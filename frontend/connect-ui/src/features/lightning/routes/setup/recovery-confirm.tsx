import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { includes, isEqual, sampleSize, without, countBy, pullAll } from 'lodash';
import { observer } from 'mobx-react-lite';
import Marquee from "react-fast-marquee";

import { StyledRecoveryConfirm, Title, Copy, StepButton, PhraseEntry, Buttons, PhraseAnswer, CodeAnswer, CodeOption, ConfirmText, Code } from './recovery-confirm.styles';

import { LightningSetup } from '@blockspaces/shared/models/lightning/Setup';

type Props = {
  back:() => void
  next:() => void
  setup: LightningSetup,
  setSetup: any
}

export const RecoveryConfirm = observer(({ back, next, setup, setSetup }:Props) => {
  const router = useRouter();
  if (!setup?.seed?.length) router.replace('/multi-web-app/lightning/setup')
  const answerLength = 6;

  // Used to not allow the selection of a duplicated seed word.
  //    Duplicate the array and find instances of the array that
  //    have > 1 instance of it
  const seedCopy = [...setup.seed]
  const numEntries = countBy(seedCopy)
  const dups = []
  for (const [key, value] of Object.entries(numEntries)) {
    if (value > 1) {
      dups.push(key)
    }
  }
  const removeDups = pullAll(seedCopy, dups)

  // Select blanks that have the duplicates removed.
  const blanks = useMemo(() => sampleSize(removeDups, answerLength), []);
  
  const phraseWithBlanks = setup?.seed && setup.seed.map(code => includes(blanks, code) ? null : code)
  
  if (!phraseWithBlanks) return <></>
  const shuffledBlanks = useMemo(() => blanks, [])
  
  const [answer,setAnswer] = useState([])
  const answerPhrase = useMemo(() => {
    let k = 0;
    return phraseWithBlanks.map(code => {
      if (!code){
        if ( answer[k] ){
          k++; return answer[k - 1]
        }
      }
      return code
    })
  }, [answer])
  
  return (
    <StyledRecoveryConfirm id="confirm-seed">
      <Title>
        Confirm Your Recovery Code
      </Title>
      <Copy>
        For your safety please confirm you recorded <br />
        the recovery code by recreating it below
      </Copy>
      <PhraseAnswer>
        { answerPhrase.map((code,index) => {
          if (!code)
            return <Code key={index} data-index={index} data-code={code}>______</Code>
          return includes(blanks, code) ? 
            <CodeAnswer  key={index} data-index={index} data-code={code} onClick={() => code && setAnswer(without(answer, code))}>
              { code ? code : '______' }
            </CodeAnswer> :
            <Code data-index={index} data-code={code}>{ code }</Code>
        })}
      </PhraseAnswer>
      <PhraseEntry>
        { answer.length === answerLength ?
          isEqual(answerPhrase, setup.seed) ?
            <Marquee
              speed={100}
              gradient={false}>
              <ConfirmText id="perfect-match">A Perfect Match!</ConfirmText>
            </Marquee> :
            <Marquee
              speed={100}
              gradient={false}>
              <ConfirmText id="no-match">Not Quite...</ConfirmText>
            </Marquee>
          :
          <>
            { shuffledBlanks.map(code => {
              return !answer.includes(code) ?
                <CodeOption data-code={code}
                  onClick={() => setAnswer([...answer,code])}>
                  { code }
                </CodeOption> : <></>
              })
            }
          </>
      }
      </PhraseEntry>
      <Buttons>
        <StepButton
        id="btnBack"
          margin={'0 .5rem'}
          width={'16rem'}
          onClick={() => back()}>
            Back
        </StepButton>
        <StepButton
        id="btnContinue"
          margin={'0 .5rem'}
          width={'16rem'}
          disabled={ !isEqual(answerPhrase, setup.seed )}
          onClick={() => isEqual(answerPhrase, setup.seed) && next()}>
            Continue
        </StepButton>
      </Buttons>
    
    </StyledRecoveryConfirm>
  )
});
