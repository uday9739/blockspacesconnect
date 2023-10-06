import { Button } from "@src/platform/components/common"
import { Container, Title, Column } from "./status.styles"

export const Upgrade = () => {
  return (
    <Container>
      <Column>
        <Title>UPGRADE</Title>
        <Button label="BIP" variation="simple" width="8rem" height="2.25rem" customStyle={{color: "#000"}}/>
      </Column>
    </Container>
  )
}