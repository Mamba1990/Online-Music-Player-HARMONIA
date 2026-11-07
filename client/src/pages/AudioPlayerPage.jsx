import AudioPlayer from '../components/AudioPlayer'
import './AudioPlayerPage.css'

const AudioPlayerPage = () => {
  const trackSrc = 'uploads/1750874555553-Madcon - Beggin.mp3'

  return (
    <div className="audio-page">
      <h1>Audio Player</h1>
      <AudioPlayer src={trackSrc} />
    </div>
  )
}

export default AudioPlayerPage