import styled, {keyframes} from 'styled-components';

const circulardash = keyframes`
  0% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: 0px;
  }

  50% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -20px;
  }

  100% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -125px;
  }
`;

const circularrotate = keyframes`
  0% {
    transform-origin: 50% 50%;
  }

  100% {
    transform: rotate(360deg);
  }
`;


export const Styles = {
  Wrapper: styled.div<{ margin: string }>`
    position: relative;
    margin: ${props=> props.margin ? props.margin : 0};
    border: 0;
    background: transparent;
  `,
  Outer: styled.div<{height: string, width:string}>`
    min-width: .5rem;
    min-height: .5rem;
    display: inline-block;
    color: #2196f3;
    height: ${props=> props.height ? props.height : '.5rem'};
    width: ${props=> props.width ? props.width : '.5rem'};
    animation: ${circularrotate} 2500ms ease-in-out 200ms infinite;
    .svg{
      display: block;
      overflow: hidden;
      .circle_two{
        stroke: #f2f5f7;
      }
      .circle{
        animation: ${circulardash} 2500ms ease-in-out 200ms infinite;
        stroke: #2196f3;
        stroke-linecap: round;
        stroke-dasharray: 80px, 200px;
        stroke-dashoffset: 0px;

      }
    }
  `
}