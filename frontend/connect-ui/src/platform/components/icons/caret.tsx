type IconProps = { style?:any }
export default function Caret({ style }:IconProps) {
  return (
    <svg style={style} width="51" height="51" viewBox="0 0 51 51" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path className="fill-primary" d="M26.6958 31.389L35.4583 23.2147C36.2582 22.4685 35.4511 21.164 34.4264 21.5467L26.3665 24.5565C26.1428 24.6401 25.8965 24.6408 25.6723 24.5586L17.4236 21.5332C16.3949 21.1559 15.5959 22.4692 16.4037 23.2094L25.3381 31.3951C25.723 31.7476 26.3142 31.745 26.6958 31.389Z" fill="#0C3958" />
    </svg>
  );
}
