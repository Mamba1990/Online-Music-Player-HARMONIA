import Avatar from './Avatar'
import { authorAvatarUrl } from '../utils/apiUrl'

// Petite pastille "photo + nom" pour l'auteur d'une playlist ou d'un commentaire
const AuthorChip = ({ author, size = 24, prefix = '' }) => (
  <span className="pl-author">
    <Avatar src={authorAvatarUrl(author)} name={author?.name || '?'} size={size} />
    <span className="pl-author-name">
      {prefix}
      {author?.name || 'Deleted user'}
    </span>
  </span>
)

export default AuthorChip
