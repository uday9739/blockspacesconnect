
import { css } from 'styled-components'

export const reset = css`
    html {
      line-height: 1.15;
      -webkit-text-size-adjust: 100%;
    }

    body {
      margin: 0;
    }



    main {
      display: block;
    }

    h1 {
      font-size: 2em;
      margin: 0.67em 0;
    }



    hr {
      box-sizing: content-box;
      height: 0;
      overflow: visible;
    }



    pre {
      font-family: monospace, monospace;
      font-size: 1em;
    }



    a {
      background-color: transparent;
    }



    abbr[title] {
      border-bottom: none;
      text-decoration: underline;
      text-decoration: underline dotted;
    }


    b,
    strong {
      font-weight: bolder;
    }



    code,
    kbd,
    samp {
      font-family: monospace, monospace;
      font-size: 1em;
    }



    small {
      font-size: 80%;
    }



    sub,
    sup {
      font-size: 75%;
      line-height: 0;
      position: relative;
      vertical-align: baseline;
    }

    sub {
      bottom: -0.25em;
    }

    sup {
      top: -0.5em;
    }


    img {
      border-style: none;
    }



    button,
    input,
    optgroup,
    select,
    textarea {
      font-family: inherit;
      font-size: 100%;
      line-height: 1.15;
      margin: 0;
    }



    button,
    input {
      overflow: visible;
    }

    button,
    select {
      text-transform: none;
    }

    button,
    [type="button"],
    [type="reset"],
    [type="submit"] {
      -webkit-appearance: button;
    }


    button::-moz-focus-inner,
    [type="button"]::-moz-focus-inner,
    [type="reset"]::-moz-focus-inner,
    [type="submit"]::-moz-focus-inner {
      border-style: none;
      padding: 0;
    }

    button:-moz-focusring,
    [type="button"]:-moz-focusring,
    [type="reset"]:-moz-focusring,
    [type="submit"]:-moz-focusring {
      outline: 1px dotted ButtonText;
    }


    fieldset {
      padding: 0.35em 0.75em 0.625em;
    }

    legend {
      box-sizing: border-box;
      color: inherit;
      display: table;
      max-width: 100%;
      padding: 0;
      white-space: normal;
    }



    progress {
      vertical-align: baseline;
    }

    textarea {
      overflow: auto;
    }



    [type="checkbox"],
    [type="radio"] {
      box-sizing: border-box;
      padding: 0;
    }

    [type="number"]::-webkit-inner-spin-button,
    [type="number"]::-webkit-outer-spin-button {
      height: auto;
    }


    [type="search"] {
      -webkit-appearance: textfield;
      outline-offset: -2px;
    }


    [type="search"]::-webkit-search-decoration {
      -webkit-appearance: none;
    }

    ::-webkit-file-upload-button {
      -webkit-appearance: button;
      font: inherit;
    }

    details {
      display: block;
    }

    summary {
      display: list-item;
    }


    template {
      display: none;
    }


    [hidden] {
      display: none;
    }


    html, body, #__next {
      position:fixed;
      display:flex;
      flex-direction:column;
      top:0;
      left:0;
      width:100%;
      height:100%;
      max-height:100%;
      font-family:"Lato", sans-serif;
      font-size:16px;
      color:#323656;

    }

    h1,h2,h3,h4,h5,h6 {
      margin: 0;
      font-size:1rem;
    }

    @media (max-width: 420px) {
      html,body, #__next { font-size:8px }
    }

    ::-webkit-scrollbar {
      display:none;
    }

    * {
      box-sizing: border-box;
    }

    @media (max-width: 300px) {
      html,body, #__next { font-size:5px }
    }

    @media (min-width:300px) and (max-width: 360px) {
      html,body, #__next { font-size:6px }
    }

    @media (min-width:360px) and (max-width: 480px) {
      html,body, #__next { font-size:7px }
    }

    @media (min-width:480px) and (max-width: 600px) {
      html,body, #__next { font-size:8px }
    }

    @media (min-width:600px) and (max-width: 720px) {
      html,body, #__next { font-size:9px }
    }

    @media (min-width:720px) and (max-width: 840px) {
      html,body, #__next { font-size:10px }
    }

    @media (min-width:840px) and (max-width: 960px) {
      html,body, #__next { font-size:11px }
    }

    @media (min-width:960px) and (max-width: 1080px) {
      html,body, #__next { font-size:12px }
    }

    @media (min-width:1080px) and (max-width: 1200px) {
      html,body, #__next { font-size:13px }
    }
`
