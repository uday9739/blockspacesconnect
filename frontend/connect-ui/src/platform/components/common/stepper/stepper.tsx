import { Component } from "react"
import Progress, { Stage } from "./components/progress"
import Steps, { Step } from "./components/steps"
import React from "react"
import { Header } from "./components/header"
import { Footer } from "./components/footer"

type StepperChildren = {
  children?: any
};
export interface IStepper extends StepperChildren
{
  /** an id, in case we have several steppers we can identify them by id. can use `useId()` hook that react provides to generate this */
  id: number;
  /** the will a header and it will display whatever gets assigned here. false means no header will be displayed. `steps` means the header from each step will be dispalyed in the header space. */
  header?: React.ReactNode
  /** the footer will be displayed if one is assigned here, true means show the standard footer with the continue button, false means no footeer will be dispalyed. */
  footer?: React.ReactNode
  /** this is where the array of steps is defined @see {@link IStep} */
  steps: IStep[];
}
export interface IStep
{
  /** step id, starting with 1, sequential numbers */
  id: number;
  /** if steps have headers, they will override the main header */
  header?: React.ReactNode
  /** content to display for each step */
  content: React.ReactNode
}

const styles = {
  container: {
    height: '100%',
    width: '100%',
    display: 'grid',
    grid: '1fr / 1fr',
    position: 'relative' as 'relative',
    backgroundColor: 'hsl(220, 13.04%, 18.04%)'
  }
}
class Stepper extends Component<IStepper, {}>
{
  static Progress = Progress
  static Steps = Steps
  static Stage = Stage
  static Step = Step
  static Header = Header
  static Footer = Footer

  render()
  {
    return (
      <div style={ styles.container }>
        { this.props.children }
      </div>)
  }

}
export default Stepper