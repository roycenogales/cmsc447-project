import logo from '../assets/umbc-logo.png'
import logoDark from '../assets/umbc-logo-dark.png'

// Official files from styleguide.umbc.edu/umbc-logos. The brand rules say the color logo is
// for light backgrounds and the gold one for dark, so swap with the system theme.
export default function UmbcLogo() {
  return (
    <picture>
      <source srcSet={logoDark} media="(prefers-color-scheme: dark)" />
      <img src={logo} alt="UMBC" className="umbc-logo" width={139} height={32} />
    </picture>
  )
}
