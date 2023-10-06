import Error from "@mui/icons-material/Error"
import { Cancel } from "@src/platform/components"
import styled from "styled-components"
import { SeedPhrase, ViewSeedContainer, Title, SeedWarning, SeedWord, Close } from "./index.styles"

export const ViewSeed = ({show, setShow, seed}:{show:boolean, setShow: any, seed?:string[]}) => {
  return (
    <>
    <ViewSeedContainer show={show}>
      <Title>Your seed phrase</Title>
      <SeedWarning>
        <Error color="warning"/>
        <h2 style={{marginLeft: "1rem"}}>Your seed phrase is the key to your Bitcoin wallet. Keep it safe and never share it with anyone, as anyone with access to your seed phrase can take control of your wallet and your funds.</h2>
      </SeedWarning>
      <SeedPhrase>
        {seed.map((seed, index) => {
          return <SeedWord>{++index}. {seed}</SeedWord>
        })}
      </SeedPhrase>
    <Close onClick={() => setShow(!show)}><Cancel /></Close>
    </ViewSeedContainer>
    </>
  )
}