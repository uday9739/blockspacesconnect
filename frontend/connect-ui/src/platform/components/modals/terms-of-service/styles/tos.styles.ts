import styled from "styled-components";

const ToSForm = styled.form<{ visible:boolean }>`
  position:absolute;
  left:50%;
  top:50%;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  width:44rem;
  max-width:calc(100% - 2.25rem);
  background:#FFFFFF;
  padding: 2.25rem 0;
  margin-top:-3.5rem;
  border: 1px solid #A9ACEB;
  box-shadow: 0px .0625rem 3rem rgba(88, 100, 229, 0.24);
  border-radius: .75rem;
  opacity:0;
  transform:translate(-50%, -50%);
  transition: 
    margin 500ms 50ms ease-out,
    opacity 500ms 50ms ease-out;
  ${p => p.visible && `
    opacity:1;
    margin-top:-3rem;
  `}
`

export default ToSForm

export const ToSContainer = styled.div`
  height:28rem;
  width:calc(100% - 5rem);
  margin: 1.5rem 0;
  padding: 0 1.5rem;
  background:#FDFDFF;
  border: 1px solid #A9ACEB;
  /* box-shadow: 0px .0625rem 3rem rgba(88, 100, 229, 0.24); */
  border-top-left-radius: .75rem;
  border-bottom-left-radius: .75rem;
  overflow-y:scroll;
  ::-webkit-scrollbar {
    display:inline;
    position:absolute;
    width:1rem;
  }
  ::-webkit-scrollbar-thumb {
    background:#DBE2FE;
  }
  ::-webkit-scrollbar-track {
    background:#f5f6ff;
  }
`
export const ToSCopy = styled.div`
  margin:0 auto;
  line-height:1.75rem;
  font-size:1rem;
`

export const ToSOptions = styled.div`
  display:flex;
  position:relative;
  justify-content: space-between;
  width:calc(100% - 4.25rem);
`