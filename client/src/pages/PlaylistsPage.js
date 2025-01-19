import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PlaylistPage = () => {
    const [playlists, setPlaylists] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const response = await axios.get('http://localhost:4000/playlists', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setPlaylists(response.data?.data || []);
            } catch (error) {
                console.error('Error fetching playlists:', error);
                setError('Failed to fetch playlists. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylists();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!playlists.length) return <div>No playlists available</div>;

    return (
        <div>
            <h1>Playlists</h1>
            <ul>
                {playlists.map((playlist) => (
                    <li key={playlist._id}>
                        <Link to={`/playlists/${playlist._id}`}>{playlist.name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PlaylistPage;

