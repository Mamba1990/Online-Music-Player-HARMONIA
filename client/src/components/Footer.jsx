import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <p>
        &copy; {new Date().getFullYear()} <span className="footer-brand">Harmonia</span>.
        All rights reserved.
      </p>
    </footer>
  )
}

export default Footer