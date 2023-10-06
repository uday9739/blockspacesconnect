import Link from "next/link"
import styled from "styled-components"
import { Tooltip } from "../tooltip/tooltip"

export const InfoHelper = ({content, url}:{content:string, url?:string}) => {
  return (
    <Tooltip content={content}>
      <Link href={url ?? "#"} target={url ? "_blank" : "_self"} style={{textDecoration: "none"}}>
        <InfoWrapper>
          ?
        </InfoWrapper>
      </Link>
    </Tooltip>
  )
}

export const InfoWrapper = styled.div`
  width:.6125rem;
  height:.6125rem;
  background-color:#CCC;
  border-radius:100%;
  display:flex;
  justify-content:center;
  align-items:center;
  color:#FFF;
  font-size:.6125rem;
`