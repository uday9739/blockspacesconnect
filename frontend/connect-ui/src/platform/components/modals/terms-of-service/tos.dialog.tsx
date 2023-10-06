import { Title, Button } from "@platform/common";
import ToS, { ToSContainer, ToSCopy, ToSOptions } from "./styles/tos.styles";
import TermsHtml from "./terms-html";
import { useLogout } from "@src/platform/hooks/user/mutations";

/**  */
export type ToSDialogProps = {
  /** called when the Continue button is pressed */
  onAccept: () => void;
};

/** Display the ToS */
const ToSDialog = ({ onAccept }: ToSDialogProps) => {
  const { mutate: logout, isLoading, isSuccess } = useLogout();
  return (
    <ToS visible={true} id="terms-of-service-form">
      <Title label="Terms of Service" style="modal" />
      <ToSContainer>
        <ToSCopy>
          <TermsHtml />
        </ToSCopy>
      </ToSContainer>
      <ToSOptions>
        <Button
          id="tosReject"
          label="REJECT"
          variation="simple"
          width="38%"
          onClick={() => {
            logout();
          }}
        />
        <Button id="btnToSAccept" label="ACCEPT" variation="default" width="60%" onClick={onAccept} />
      </ToSOptions>
    </ToS>
  );
};

export default ToSDialog;
