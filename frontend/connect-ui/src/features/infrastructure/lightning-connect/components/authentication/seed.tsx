import { Button } from "@src/platform/components/common"
import { useState } from "react"
import styled from "styled-components"
import { useLightningConnect } from "../../hooks"
import { ViewSeed } from "../seed"

export const Seed = () => {
  const [viewSeed, setViewSeed] = useState(false)
  const {auth} = useLightningConnect()
  return (
    <>
      <SeedContainer>
        <h1>SEED</h1>
        <p>Reveal the private key of the LND wallet.</p>
        <Button label="SHOW" variation="simple" width="6rem" height="2rem" onClick={() => setViewSeed(!viewSeed)} customStyle={{backgroundColor:"#F00", color:"#FFF"}}/>
      </SeedContainer>
      <ViewSeed show={viewSeed} setShow={setViewSeed} seed={auth?.seed || []} />
    </>
  )
}

export const SeedContainer = styled.div`
  display:flex;
  flex-direction:row;
  align-items:center;
  justify-content:space-around;
  // border:1px solid #d8dcf0;
  box-shadow:${p => p.theme.mediumBoxShadow};
  border-radius:1.875rem;
  width:60%;
  font-family:"Roboto Mono";
`