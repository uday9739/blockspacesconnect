import { BorderContent, BorderWithLabelContainer } from "./border-with-label.styles"

type Props = {
  width: string
  height: string
  borderColor: string
  label: string
  children: JSX.Element | JSX.Element[]
}
export const BorderWithLabel = ({width, height, borderColor, label, children}:Props) => {
  return (  
    <BorderWithLabelContainer width={width} height={height} borderColor={borderColor}>
      {/* <BorderLabel borderColor={borderColor}><em>{label}</em></BorderLabel> */}
      <div style={{position:"absolute", top: -4, backgroundColor: "#FFFFFF", margin:0, padding: "0 1rem", fontSize:".875rem", color: borderColor}}><em>{label}</em></div>
      <BorderContent>
        {children}
      </BorderContent>
    </BorderWithLabelContainer>
  )
}