import React, { Component } from "react";
import Stepper, { IStepper } from "./stepper"
import { StepperContext } from './stepper.context'
import { StepperStore } from "./stepper.context";

let stepperStore: null | StepperStore
export class Stage extends Component<IStepper, {}>
{


  render()
  {
    if (!stepperStore)
    {
      stepperStore = new StepperStore(this.props);
    }

    return (
      <StepperContext.Provider value={ stepperStore }>
        <Stepper id={ this.props.id } steps={ this.props.steps } >
          <React.Fragment>
            <Stepper.Progress>
              <Stepper.Stage id={ 1 } />
              <Stepper.Stage id={ 2 } />
              <Stepper.Stage id={ 3 } />
            </Stepper.Progress>
            <div style={ { flex: 1, display: "flex", flexDirection: "column" } }>
              <Stepper.Header />
              <Stepper.Steps>
                <Stepper.Step id={ 1 } />
                <Stepper.Step id={ 2 } />
                <Stepper.Step id={ 3 } />
              </Stepper.Steps>
              <Stepper.Footer />
            </div>
          </React.Fragment>
        </Stepper>
      </StepperContext.Provider>
    );
  }
}
export default Stage;
