// Pastille ronde : la photo si elle existe, sinon l'initiale du nom
const Avatar = ({ src, name = '', size = 36, className = '' }) => {
  const initial = (name.trim().charAt(0) || '?').toUpperCase()
  return (
    <span
      className={`avatar ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
      aria-hidden="true"
    >
      {src ? <img src={src} alt="" /> : initial}
    </span>
  )
}

export default Avatar
