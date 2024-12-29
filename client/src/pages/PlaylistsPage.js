import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PlaylistsPage = () => {
    const [playlists, setPlaylists] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const response = await axios.get('http://localhost:4000/playlists');
                setPlaylists(response.data.data); // Assuming backend wraps data in `data`
            } catch (error) {
                console.error('Error fetching playlists:', error);
                setError('Failed to fetch playlists. Please try again later.');
            }
        };

        fetchPlaylists();
    }, []);

    if (error) return <div>{error}</div>;
    if (!playlists.length) return <div>Loading...</div>;

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

export default PlaylistsPage;
