type IconProps = { style?:any }
export default function OptionDots({ style }:IconProps) {
  return (
    <svg style={style} width="4" height="16" viewBox="0 0 4 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle className="fill-primary" cx="2.32526" cy="1.99469" r="1.59943" fill="#727AC2" />
      <circle className="fill-primary" cx="2.32526" cy="7.75275" r="1.59943" fill="#727AC2" />
      <circle className="fill-primary" cx="2.32526" cy="13.5103" r="1.59943" fill="#727AC2" />
    </svg>
  );
}
