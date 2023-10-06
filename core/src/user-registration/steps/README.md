# Registration Steps

This directory contains definitions for the steps that are part of the user registration process.

---

## Defining a new step

1. Add a class in this directory that inherits from `BaseRegistrationStep`
2. Update `RegistrationStepProvider.OrderedSteps`, adding the new step in the order in which it should be run
