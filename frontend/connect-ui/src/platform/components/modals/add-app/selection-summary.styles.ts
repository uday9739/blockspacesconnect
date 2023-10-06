import styled from "styled-components"

export const StyledSelectionSummary = styled.div`
position:relative;
display:flex;
margin:.125rem 0;
border:1px solid ${p => p.theme.bscBlue};
border-radius:.75rem;
`

export const SelectionLabel = styled.div`
display:flex;
align-items: center;
justify-content: center;
width:10rem;
border-right:1px solid ${p => p.theme.lighterBlue};
color:${p => p.theme.bscBlue};
`

export const SelectionDetails = styled.div`
display:flex;
flex-direction: column;
padding: .875rem;
`

export const Detail = styled.div`
display:flex;
align-items:center;
height:2rem;
`

export const DetailIcon = styled.div`
margin: 0 .125rem;
.fill-primary { fill:${p => p.theme.bscBlue} }
svg {
  width:2rem;
  height:2rem;
}
`
export const DetailCopy = styled.div`
color:${p => p.theme.bscBlue};
font-size:.9375rem;
`

export const EditIcon = styled.div`
position:absolute;
top:50%;
right:.75rem;
width:3rem;
height:3rem;
transform:translate(0,-50%);
opacity:.2;
svg {
  width:100%;
  height:100%;
}
.fill-primary { fill:${p => p.theme.bscBlue }}
cursor:pointer;
&:hover { opacity:1 }
`
