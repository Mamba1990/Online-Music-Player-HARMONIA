import './AudioPlayer.css'

const API_URL = import.meta.env.VITE_API_URL

const AudioPlayer = ({ src }) => {
  const cleanSrc = src.replace(/^\/+/, '') // évite le double slash

  return (
    <audio className="audio-player" controls>
      <source src={`${API_URL}/${cleanSrc}`} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  )
}

export default AudioPlayer