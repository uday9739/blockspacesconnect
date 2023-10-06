import Link from "next/link"
import styled from "styled-components"

export const Button = styled.div`
  display:flex;
  align-items:center;
  align-self:center;
  color:black;
  text-decoration:none;
  border:1px solid ${p => p.theme.lighterBlue};
  border-radius:1.125rem;
  height:2.25rem;
  margin: 0 .1875rem;
  padding: 0 3.25rem;
  font-size:.9375rem;
  cursor:pointer;
  transition:125ms ease-out;
  &:hover {
    color:${p => p.theme.bscBlue};
    border:1px solid ${p => p.theme.bscBlue};
    background:${p => p.theme.bscBlue}05;
  }
`

export const NetworkExplorer = () => {
  return (
    <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
      <Link legacyBehavior href="https://amboss.space">
        <a target="_blank" style={{ textDecoration: "none" }}>
          <Button>Network Explorer</Button>
        </a>
      </Link>
    </div>
  )
}