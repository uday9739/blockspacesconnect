
import React, { createContext } from "react"
import { IStep, IStepper } from "./stepper"
import {
  makeAutoObservable,
  onReactionError,
  runInAction,
} from "mobx";

export class StepperStore {

  currentStepId: number
  steps: IStep[]
  header: React.ReactNode
  footer: React.ReactNode
  animations: boolean
  isNotLast: boolean
  canGoToStep: (stepId: number) => boolean = null

  constructor(data: IStepper) {

    makeAutoObservable(this);
    this.currentStepId = 1
    this.steps = data.steps
    this.header = data.header
    this.footer = data.footer
    this.animations = false

    //console.log('initializing', data, this)
  }

  get finished() {
    //  console.log('calculating finished', this.steps.length === this.currentStepId)
    return this.steps.length === this.currentStepId
  }

  get nextStepId() {
    //  console.log('calculating next step id', this.currentStepId, this.steps.length)
    let stepId = 1;
    if (this.currentStepId < this.steps.length) {
      stepId = this.currentStepId + 1
    }
    return stepId
  }

  get currentStep() {
    return this.steps.find(step => step.id === this.currentStepId)
  }


  handleClick = () => {

    this.currentStepId = this.nextStepId
    // console.log('setting next step', this.currentStepId, this.nextStepId)
  }

  goToStepId = (id: number) => {

    if (this.canGoToStep && this.canGoToStep(id) === false) return;
    this.currentStepId = id
    // console.log('setting step id', this.currentStepId, id)
  }

  getContentForId = (id: number) => {
    const step = this?.steps.find((item: IStep) => item.id === id)
    //console.log('looking for content', id)
    return (step ? step?.content : <div>did not find content</div>)
  }

  isNotLastStep = (id: number) => {
    if (id < this.steps.length) {
      return true
    } else {
      return false
    }

  }


}

export const StepperContext = createContext<StepperStore>(null)