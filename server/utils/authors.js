import User from '../models/User.js';

// Renvoie une Map id -> { _id, name, hasAvatar, v } pour une liste d'identifiants d'utilisateurs.
// On ne charge jamais les photos elles-mêmes : le client les récupère via GET /users/:id/avatar.
export const loadAuthors = async (ids) => {
    const unique = [...new Set(ids.filter(Boolean).map(String))];
    const map = new Map();
    if (!unique.length) return map;

    const [users, withAvatar] = await Promise.all([
        User.find({ _id: { $in: unique } }).select('name updatedAt').lean(),
        User.find({ _id: { $in: unique }, avatar: /^data:image/ }).select('_id').lean(),
    ]);
    const avatarIds = new Set(withAvatar.map((u) => String(u._id)));

    for (const user of users) {
        map.set(String(user._id), {
            _id: user._id,
            name: user.name,
            hasAvatar: avatarIds.has(String(user._id)),
            v: user.updatedAt ? new Date(user.updatedAt).getTime() : 0,
        });
    }
    return map;
};
