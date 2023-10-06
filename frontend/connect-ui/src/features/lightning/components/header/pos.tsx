import Link from "next/link";
import { observer } from "mobx-react-lite";
import { Styles } from "./pos.styles";
import { Button } from "@platform/common";
import { useGetCurrentUser } from "@src/platform/hooks/user/queries";

export const Pos = observer(() => {
  const { Pos } = Styles;
  const { data: user } = useGetCurrentUser();

  // const [checked, setChecked] = useState(false);
  // const {
  //   lightningStore: { currency, setCurrency }
  // } = useDataStore();

  // useEffect(() => {
  //   if (currency === "USD") {
  //     setChecked(true);
  //   } else {
  //     setChecked(false);
  //   }
  // }, []);

  // const switchData = [
  //   {
  //     label: "SAT",
  //     value: "SAT"
  //   },
  //   {
  //     label: "USD",
  //     value: "USD"
  //   }
  // ];

  // const setValue = (checked) => {
  //   if (checked) {
  //     setCurrency("USD");
  //   } else {
  //     setCurrency("SAT");
  //   }
  // };

  return (
    <Pos>
      <Link legacyBehavior href={{ pathname: `/multi-web-app/lightning/pos`, query: { tenantId: user.activeTenant?.tenantId } }}>
        <a target="_blank" style={{ textDecoration: "none" }}>
          <Button id="aRequestMoney" label="Request Money" width="10rem" height="1.6rem" variation="simple" />
        </a>
      </Link>
    </Pos>
  );
});
