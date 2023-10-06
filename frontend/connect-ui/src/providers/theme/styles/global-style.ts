import { createGlobalStyle } from 'styled-components'
import { reset } from './reset';
import { animations } from './animations';

export const GlobalStyle = createGlobalStyle`
  ${reset}
  ${animations}
`
