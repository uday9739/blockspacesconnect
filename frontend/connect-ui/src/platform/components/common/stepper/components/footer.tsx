import Button from './button'

const styles = {
  footer: {
    flex: 1,
    height: '3.75rem',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
    border: '1px solid #404040',
    backgroundClip: 'border-box',
    justifyContent: 'right',
    paddingRight: '1rem'
  }
}
export const Footer = () =>
{
  return (<div style={ styles.footer }><Button /></div>)
}
