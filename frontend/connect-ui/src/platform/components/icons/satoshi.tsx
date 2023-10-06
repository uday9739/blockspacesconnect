type SatoshiIconProps = { color:string, style?:any }
export default function Satoshi({color,style}:SatoshiIconProps) {
  return (
    <svg width="11" style={style}height="19" viewBox="0 0 11 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.02548 0H4.54297V2.53287H6.02548V0Z" fill={color} />
      <path d="M6.02548 16.3457H4.54297V18.8786H6.02548V16.3457Z" fill={color} />
      <path d="M10.5703 6.23837V4.75586L-0.000249863 4.75586V6.23837L10.5703 6.23837Z" fill={color} />
      <path d="M10.5703 10.1544V8.67188H-0.000248909V10.1544H10.5703Z" fill={color} />
      <path d="M10.5703 13.9591V12.4766H-0.000249863V13.9591H10.5703Z" fill={color} />
    </svg>
  );
}
