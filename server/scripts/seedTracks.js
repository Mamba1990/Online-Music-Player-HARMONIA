import mongoose from 'mongoose'
import Track from '../models/Track.js'

const TRACKS = [
  {
    title: 'Gymnopédie No. 1',
    artist: 'Erik Satie (arr. & perf. Kevin MacLeod, CC BY 3.0)',
    duration: 187,
    filePath: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Gymnopedie_No._1_(ISRC_USUAN1100787).mp3',
  },
  {
    title: 'Odeon',
    artist: 'Ernesto Nazareth (arr. Eduardo Feld, CC BY-SA 4.0)',
    duration: 197,
    filePath: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Odeon.mp3',
  },
]

const run = async () => {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required')
  await mongoose.connect(process.env.MONGO_URI)
  for (const t of TRACKS) {
    await Track.updateOne({ filePath: t.filePath }, { $set: t }, { upsert: true })
  }
  console.log(`Seeded ${TRACKS.length} tracks`)
  await mongoose.disconnect()
}

run().catch((e) => {
  console.error(e.message)
  process.exit(1)
})