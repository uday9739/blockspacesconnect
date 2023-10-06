import Styles from './';
import Link from 'next/link';
import { Cancel } from "@icons"

type Props = {
  label:string;
  style?:'modal' | 'default' | 'intro' | 'main'
  href?:string | { pathname:string, query:any },
  customStyle?:any
}

export const Title= ({
  style = 'modal',
  href, label, customStyle,
}:Props)=>  {
  const { Title } = Styles[style];

  if (href) {
    return (
      <Link legacyBehavior href={href}>
        <Title clickable style={customStyle}>
          {label}
          <Cancel />
        </Title>
      </Link>
    );
  }

  return (
    <Title>
      { label }
    </Title>
  );
}
