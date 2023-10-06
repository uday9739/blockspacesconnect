import Link from "next/link";

import { PayButton } from "./pay.styles";

import { Button } from "@platform/common";

export const Pay = () => {
  return (
    <PayButton>
      <Link legacyBehavior replace={true} href={{pathname: `/multi-web-app/lightning`, query: {modal: 'pay'}}}>
        <a style={{"textDecoration":"none"}}>
          <Button id="btnSendMoney" label="Send Money" width="10rem" height="1.6rem" variation="simple"/>
        </a>
      </Link>
    </PayButton>
  );
};
