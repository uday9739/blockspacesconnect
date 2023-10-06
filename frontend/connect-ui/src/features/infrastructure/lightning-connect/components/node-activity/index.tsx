import { ActivityChart } from "./activity-chart"
import { NodeActivityContainer, Heading } from "./index.styles"

export const NodeActivity = () => {

  return (
    <NodeActivityContainer>
      <Heading>ACTIVITY</Heading>
      <ActivityChart />
    </NodeActivityContainer>
  )
}