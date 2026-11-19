import express from 'express';
import Playlist from '../models/Playlist.js';
import Track from '../models/Track.js';
import Comment from '../models/Comment.js';
import authMiddleware from '../middleware/authMiddleware.js';
import optionalAuth from '../middleware/optionalAuth.js';
import { commentLimiter } from '../middleware/rateLimiters.js';
import { loadAuthors } from '../utils/authors.js';

const playlistsRouter = express.Router();

const isObjectId = (value) => typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value);
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const COMMENT_MAX_LENGTH = 500;
const COMMENTS_PER_PAGE = 100;

// Un ID invalide dans l'URL renvoie 400 au lieu de planter en 500
playlistsRouter.param('id', (req, res, next, id) => {
    if (!isObjectId(id)) {
        return res.status(400).json({ success: false, message: 'Invalid playlist ID.' });
    }
    next();
});

playlistsRouter.param('commentId', (req, res, next, commentId) => {
    if (!isObjectId(commentId)) {
        return res.status(400).json({ success: false, message: 'Invalid comment ID.' });
    }
    next();
});

const isOwner = (playlist, user) => Boolean(user) && playlist.createdBy?.toString() === String(user.id);

// Seul le créateur ou un admin peut modifier ou supprimer une playlist
const canModify = (playlist, user) => Boolean(user) && (user.role === 'admin' || isOwner(playlist, user));

// Une playlist privée n'est visible que de son propriétaire et des admins
// (isPublic !== false : les anciennes playlists, sans ce champ, restent publiques)
const canView = (playlist, user) => playlist.isPublic !== false || canModify(playlist, user);

// Filtre MongoDB équivalent à canView, pour les listes
const visibleFilter = (user) => {
    if (user?.role === 'admin') return {};
    if (!user) return { isPublic: { $ne: false } };
    return { $or: [{ isPublic: { $ne: false } }, { createdBy: user.id }] };
};

// Vérifie que "tracks" est une liste d'IDs de morceaux existants
const parseTrackIds = async (tracks) => {
    if (tracks === undefined) return { ids: undefined };
    if (!Array.isArray(tracks) || !tracks.every(isObjectId)) {
        return { error: 'tracks must be an array of valid track IDs.' };
    }
    const ids = [...new Set(tracks)];
    const found = await Track.countDocuments({ _id: { $in: ids } });
    if (found !== ids.length) return { error: 'One or more tracks do not exist.' };
    return { ids };
};

// Réponse publique : compteur et état du like au lieu de la liste des likers, plus l'auteur
const serializePlaylist = (playlist, user, authors) => {
    const { likes = [], ...rest } = playlist.toObject();
    return {
        ...rest,
        isPublic: rest.isPublic !== false,
        likesCount: likes.length,
        liked: Boolean(user) && likes.some((id) => String(id) === String(user.id)),
        author: authors.get(String(rest.createdBy)) || null,
    };
};

const serializeOne = async (playlist, user) => {
    const authors = await loadAuthors([playlist.createdBy]);
    return serializePlaylist(playlist, user, authors);
};

// Charge une playlist visible par l'appelant, sinon répond 404 (on ne révèle pas l'existence d'une playlist privée)
const findVisible = async (id, user, res, { populate = false } = {}) => {
    const query = Playlist.findById(id);
    const playlist = await (populate ? query.populate('tracks') : query);
    if (!playlist || !canView(playlist, user)) {
        res.status(404).json({ success: false, message: `Playlist with ID ${id} not found.` });
        return null;
    }
    return playlist;
};

// 1- Liste des playlists visibles par l'appelant
playlistsRouter.get('/', optionalAuth, async (req, res) => {
    try {
        const playlists = await Playlist.find(visibleFilter(req.user)).sort({ _id: -1 });
        const authors = await loadAuthors(playlists.map((p) => p.createdBy));
        res.status(200).json({
            success: true,
            data: playlists.map((p) => serializePlaylist(p, req.user, authors)),
        });
    } catch (error) {
        console.error('Error fetching playlists:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch playlists.' });
    }
});

// 2- Une playlist avec ses morceaux
playlistsRouter.get('/:id', optionalAuth, async (req, res) => {
    try {
        const playlist = await findVisible(req.params.id, req.user, res, { populate: true });
        if (!playlist) return;
        res.status(200).json({ success: true, data: await serializeOne(playlist, req.user) });
    } catch (error) {
        console.error('Error fetching playlist by ID:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch playlist.' });
    }
});

// 3- Créer une playlist (utilisateur connecté)
playlistsRouter.post('/', authMiddleware, async (req, res) => {
    const { name, description, tracks, isPublic } = req.body;

    if (!isNonEmptyString(name)) {
        return res.status(400).json({ success: false, message: 'Name is required.' });
    }
    if (description !== undefined && typeof description !== 'string') {
        return res.status(400).json({ success: false, message: 'Description must be a string.' });
    }
    if (isPublic !== undefined && typeof isPublic !== 'boolean') {
        return res.status(400).json({ success: false, message: 'isPublic must be a boolean.' });
    }

    try {
        const { ids, error } = await parseTrackIds(tracks);
        if (error) return res.status(400).json({ success: false, message: error });

        const newPlaylist = new Playlist({
            name: name.trim(),
            description,
            tracks: ids || [],
            createdBy: req.user.id,
            isPublic: isPublic ?? true,
        });
        await newPlaylist.save();
        res.status(201).json({ success: true, data: await serializeOne(newPlaylist, req.user) });
    } catch (error) {
        console.error('Error creating playlist:', error);
        res.status(500).json({ success: false, message: 'Failed to create playlist.' });
    }
});

// 4- Modifier une playlist (créateur ou admin)
playlistsRouter.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { name, description, tracks, isPublic } = req.body;

    if (name !== undefined && !isNonEmptyString(name)) {
        return res.status(400).json({ success: false, message: 'Name cannot be empty.' });
    }
    if (description !== undefined && typeof description !== 'string') {
        return res.status(400).json({ success: false, message: 'Description must be a string.' });
    }
    if (isPublic !== undefined && typeof isPublic !== 'boolean') {
        return res.status(400).json({ success: false, message: 'isPublic must be a boolean.' });
    }

    try {
        const playlist = await Playlist.findById(id);
        if (!playlist || !canView(playlist, req.user)) {
            return res.status(404).json({ success: false, message: `Playlist with ID ${id} not found.` });
        }

        if (!canModify(playlist, req.user)) {
            return res.status(403).json({ success: false, message: 'You do not have permission to update this playlist.' });
        }

        const { ids, error } = await parseTrackIds(tracks);
        if (error) return res.status(400).json({ success: false, message: error });

        if (name !== undefined) playlist.name = name.trim();
        if (description !== undefined) playlist.description = description; // "" permet d'effacer
        if (ids !== undefined) playlist.tracks = ids;
        if (isPublic !== undefined) playlist.isPublic = isPublic;

        await playlist.save();
        res.status(200).json({
            success: true,
            message: `Playlist with ID ${id} has been updated.`,
            data: await serializeOne(playlist, req.user),
        });
    } catch (error) {
        console.error('Error updating playlist:', error);
        res.status(500).json({ success: false, message: 'Failed to update playlist.' });
    }
});

// 5- Supprimer une playlist (créateur ou admin) et ses commentaires
playlistsRouter.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const playlist = await Playlist.findById(id);
        if (!playlist || !canView(playlist, req.user)) {
            return res.status(404).json({ success: false, message: `Playlist with ID ${id} not found.` });
        }

        if (!canModify(playlist, req.user)) {
            return res.status(403).json({ success: false, message: 'You do not have permission to delete this playlist.' });
        }

        await Comment.deleteMany({ playlist: playlist._id });
        await playlist.deleteOne();
        res.status(200).json({ success: true, message: `Playlist with ID ${id} has been deleted.` });
    } catch (error) {
        console.error('Error deleting playlist:', error);
        res.status(500).json({ success: false, message: 'Failed to delete playlist.' });
    }
});

// 6- Liker une playlist visible (un like par utilisateur)
playlistsRouter.post('/:id/like', authMiddleware, async (req, res) => {
    try {
        const playlist = await findVisible(req.params.id, req.user, res);
        if (!playlist) return;
        const updated = await Playlist.findByIdAndUpdate(
            playlist._id,
            { $addToSet: { likes: req.user.id } },
            { new: true }
        );
        res.status(200).json({ success: true, data: { likesCount: updated.likes.length, liked: true } });
    } catch (error) {
        console.error('Error liking playlist:', error);
        res.status(500).json({ success: false, message: 'Failed to like playlist.' });
    }
});

// 7- Retirer son like
playlistsRouter.delete('/:id/like', authMiddleware, async (req, res) => {
    try {
        const playlist = await findVisible(req.params.id, req.user, res);
        if (!playlist) return;
        const updated = await Playlist.findByIdAndUpdate(
            playlist._id,
            { $pull: { likes: req.user.id } },
            { new: true }
        );
        res.status(200).json({ success: true, data: { likesCount: updated.likes.length, liked: false } });
    } catch (error) {
        console.error('Error unliking playlist:', error);
        res.status(500).json({ success: false, message: 'Failed to remove like.' });
    }
});

// 8- Copier une playlist visible dans ses propres playlists (la copie est privée)
playlistsRouter.post('/:id/copy', authMiddleware, async (req, res) => {
    try {
        const playlist = await findVisible(req.params.id, req.user, res);
        if (!playlist) return;

        const copy = new Playlist({
            name: `${playlist.name} (copy)`,
            description: playlist.description,
            tracks: playlist.tracks,
            createdBy: req.user.id,
            isPublic: false,
        });
        await copy.save();
        res.status(201).json({ success: true, data: await serializeOne(copy, req.user) });
    } catch (error) {
        console.error('Error copying playlist:', error);
        res.status(500).json({ success: false, message: 'Failed to copy playlist.' });
    }
});

// 9- Commentaires d'une playlist visible (les plus récents d'abord)
playlistsRouter.get('/:id/comments', optionalAuth, async (req, res) => {
    try {
        const playlist = await findVisible(req.params.id, req.user, res);
        if (!playlist) return;

        const comments = await Comment.find({ playlist: playlist._id })
            .sort({ _id: -1 })
            .limit(COMMENTS_PER_PAGE);
        const authors = await loadAuthors(comments.map((c) => c.author));

        res.status(200).json({
            success: true,
            data: comments.map((comment) => ({
                _id: comment._id,
                text: comment.text,
                createdAt: comment.createdAt,
                author: authors.get(String(comment.author)) || null,
                // L'auteur, le propriétaire de la playlist et les admins peuvent supprimer
                canDelete:
                    Boolean(req.user) &&
                    (req.user.role === 'admin' ||
                        String(comment.author) === String(req.user.id) ||
                        isOwner(playlist, req.user)),
            })),
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch comments.' });
    }
});

// 10- Commenter une playlist visible (utilisateur connecté)
playlistsRouter.post('/:id/comments', authMiddleware, commentLimiter, async (req, res) => {
    const { text } = req.body;

    if (!isNonEmptyString(text)) {
        return res.status(400).json({ success: false, message: 'Comment text is required.' });
    }
    if (text.trim().length > COMMENT_MAX_LENGTH) {
        return res.status(400).json({
            success: false,
            message: `Comment cannot exceed ${COMMENT_MAX_LENGTH} characters.`,
        });
    }

    try {
        const playlist = await findVisible(req.params.id, req.user, res);
        if (!playlist) return;

        const comment = await Comment.create({
            playlist: playlist._id,
            author: req.user.id,
            text: text.trim(),
        });
        const authors = await loadAuthors([comment.author]);

        res.status(201).json({
            success: true,
            data: {
                _id: comment._id,
                text: comment.text,
                createdAt: comment.createdAt,
                author: authors.get(String(comment.author)) || null,
                canDelete: true,
            },
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ success: false, message: 'Failed to create comment.' });
    }
});

// 11- Supprimer un commentaire (son auteur, le propriétaire de la playlist ou un admin)
playlistsRouter.delete('/:id/comments/:commentId', authMiddleware, async (req, res) => {
    try {
        const playlist = await findVisible(req.params.id, req.user, res);
        if (!playlist) return;

        const comment = await Comment.findOne({ _id: req.params.commentId, playlist: playlist._id });
        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found.' });
        }

        const allowed =
            req.user.role === 'admin' ||
            String(comment.author) === String(req.user.id) ||
            isOwner(playlist, req.user);
        if (!allowed) {
            return res.status(403).json({ success: false, message: 'You do not have permission to delete this comment.' });
        }

        await comment.deleteOne();
        res.status(200).json({ success: true, message: 'Comment deleted.' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ success: false, message: 'Failed to delete comment.' });
    }
});

export default playlistsRouter;
