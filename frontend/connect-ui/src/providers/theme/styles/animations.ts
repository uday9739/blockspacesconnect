import { css } from 'styled-components'

export const animations = css`
    @keyframes network-glow-a {
      from {
        opacity:.05
      }

      50% {
        opacity:.25
      }

      to {
        opacity:.05;
      }
    }

    @keyframes network-glow-b {
      from {
        opacity:.05
      }

      50% {
        opacity:.2
      }

      to {
        opacity:.05;
      }
    }

    @keyframes network-glow-c {
      from {
        opacity:.05
      }

      50% {
        opacity:.15
      }

      to {
        opacity:.05;
      }
    }

    @keyframes submitting-button {
      0%{background-position:10% 0%}
      50%{background-position:91% 100%}
      100%{background-position:10% 0%}
    }

    @keyframes pulsing-button {
      0%{
        transform: scale(1);
      }
      50%{
        transform: scale(1.05);
      }
      100%{
        transform: scale(1);
      }
    }

    @keyframes pulsing-success-check {
      0%{
        width:85%;
        height:85%;
      }
      50%{
        width:100%;
        height:100%;
      }
      100%{
        width:85%;
        height:85%;
      }
    }

    @keyframes spinning-checkbox-border {
      0%{
        transform:rotate(0);
      }
      100%{
        transform:rotate(360deg);
      }
    }
`
