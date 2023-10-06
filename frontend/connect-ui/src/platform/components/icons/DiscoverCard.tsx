import React from "react";
const DiscoverIcon = (props) =>
  React.createElement(
    "div",
    {
      className: props.className,
      style: {
        width: 50,
        ...props.style
      }
    },
    <svg
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      x={0}
      y={0}
      viewBox="0 0 60 40"
      style={{
        enableBackground: "new 0 0 60 40"
      }}
      xmlSpace="preserve"
      {...props}
    >
      <style>{".st2{fill:#001722}"}</style>
      <path
        style={{
          fillRule: "evenodd",
          clipRule: "evenodd",
          fill: "#f3f6f9"
        }}
        d="M0 0h60v40H0z"
      />
      <path
        d="M31.4 16c-2.2 0-4.1 1.8-4.1 3.9 0 2.3 1.7 4 4.1 4 2.3 0 4.1-1.7 4.1-4-.1-2.1-1.9-3.9-4.1-3.9z"
        style={{
          fill: "#f48628"
        }}
      />
      <path className="st2" d="M8.3 16.2H6.1v7.6h2.2c1.2 0 2-.3 2.7-.9.9-.7 1.4-1.8 1.4-2.9 0-2.3-1.7-3.8-4.1-3.8zm1.7 5.7c-.5.4-1.1.6-2 .6h-.4v-5H8c1 0 1.5.2 2 .6.5.5.8 1.2.8 1.9s-.3 1.4-.8 1.9z" />
      <path className="st2" d="M13 16.2h1.5v7.6H13z" />
      <path
        className="st2"
        d="M18.2 19.1c-.9-.3-1.2-.5-1.2-1s.5-.8 1.1-.8c.4 0 .8.2 1.2.6l.8-1c-.6-.6-1.4-.8-2.2-.8-1.3 0-2.4.9-2.4 2.2 0 1.1.5 1.6 1.9 2.1.6.2.9.3 1 .4.3.2.4.5.4.8 0 .6-.5 1.1-1.2 1.1s-1.3-.4-1.6-1l-1 .9c.7 1 1.5 1.5 2.6 1.5 1.5 0 2.6-1 2.6-2.5.2-1.3-.3-1.9-2-2.5z"
      />
      <path
        className="st2"
        d="M20.8 20c0 2.2 1.8 4 4 4 .6 0 1.2-.1 1.9-.4v-1.8c-.6.6-1.1.8-1.8.8-1.5 0-2.6-1.1-2.6-2.6s1.1-2.6 2.5-2.6c.7 0 1.2.3 1.9.9v-1.8c-.7-.3-1.2-.5-1.8-.5-2.3 0-4.1 1.8-4.1 4z"
      />
      <path className="st2" d="m38.8 21.3-2-5.1h-1.7l3.3 7.8h.8l3.3-7.8h-1.6z" />
      <path className="st2" d="M43.1 23.8h4.3v-1.3h-2.8v-2h2.7v-1.3h-2.7v-1.7h2.8v-1.3h-4.3z" />
      <path className="st2" d="M53.3 18.4c0-1.4-1-2.3-2.7-2.3h-2.2v7.6h1.5v-3.1h.1l2.1 3.1h1.8l-2.4-3.2c1.1-.1 1.8-.9 1.8-2.1zm-3 1.3h-.4v-2.3h.5c.9 0 1.4.4 1.4 1.1-.1.8-.6 1.2-1.5 1.2z" />
    </svg>
  );
export default DiscoverIcon;
