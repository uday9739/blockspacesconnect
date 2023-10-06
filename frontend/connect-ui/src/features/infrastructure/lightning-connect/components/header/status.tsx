import { useLightningConnect } from "../../hooks";
import { Column, Row, Container, Title, Active } from "./status.styles";

export const Status = () => {
  const {auth} = useLightningConnect()
  console.log("auth", auth === undefined)
  return (
    <Container>
      <Column>
        <Title>STATUS</Title>
        <Row>
          <Active active={auth === undefined}/>
          <h1>{auth !== undefined ? "ACTIVE" : "LOCKED"}</h1>
        </Row>
      </Column>
    </Container>
  );
};

