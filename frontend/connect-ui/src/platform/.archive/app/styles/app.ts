import styled from 'styled-components';

export const App = styled.main`
  width:100%;
  height:100%;
  color:${props => props.theme.fontColor};
  background:#303252;
  font-family:"Lato", sans-serif;
  font-size:16px;
  .fill-primary {
    fill: ${props => props.theme.iconFill};
  }

  /* Material UI svg icons */
  svg.MuiSvgIcon-root {
    width: 1em;
    height: 1em;
    position: relative;
  }
`;

export const Body = styled.div`
  display:flex;
  flex-direction:row;
  justify-content:flex-start;
  top:0;
  left:0;
  width:100%;
  height:100%;
  border-bottom:none;
`

export const Modals = styled.div`
  position:fixed;
  left:0;
  right:0;
  height:100%;
  width:100%;
  background:#00000055;
  z-index:100000000;
`

export const Content = styled.div`
  position:relative;
  flex:1;
  display:flex;
  flex-direction:column;
  justify-content:flex-start;
  overflow:hidden;
  background: #fff;
  margin: .25rem .25rem 0 0;
  border-top-right-radius:6px;
  border-top-left-radius:6px;
`