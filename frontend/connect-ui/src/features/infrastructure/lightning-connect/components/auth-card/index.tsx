import { Button, CopyText } from "@src/platform/components/common"
import { AuthCardContainer, Title } from "./auth-card.styles"
import { saveHexToFile } from "@platform/utils"
import Link from "next/link"

type AuthCardProps = { title: string, description:string, hex?:string, base64?:string, hidden?:boolean }
export const AuthCard = ({title, description, hex, base64, hidden}: AuthCardProps) => {
  return (
    <AuthCardContainer>
      <div>
      <Title>{title}</Title>
      <p style={{textAlign:"center"}}>{description}</p>
      </div>
      {hidden && <Link href="#unlock"><Button label="Unlock" variation="simple" width="13.2rem" height="3rem" customStyle={{backgroundColor:"#7B1AF8", color:"#FFF"}} /></Link>}
      <div style={{display: hidden && "none"}}>
        <Button label="Download" variation="simple" width="13.2rem" height="3rem" onClick={()=> saveHexToFile(hex, title)} customStyle={{backgroundColor:"#7B1AF8", color:"#FFF"}}/>
        <CopyText label="HEX" text={hex} style={copyTextStyles}/>
        <CopyText label="Base64" text={base64} style={copyTextStyles}/>
      </div>
    </AuthCardContainer>
  )
}

const copyTextStyles = {
  maxWidth: "13.2rem",
  textOverflow: "ellipsis",
  height: "3rem",
  marginTop: "1rem"
}