import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const PlaylistDetailsPage = () => {
    const { id } = useParams(); // Getting the playlist ID from the URL
    const [playlist, setPlaylist] = useState(null); // Stating to store playlist details
    const [error, setError] = useState(null); // Stating to handle errors

    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/playlists/${id}`);
                setPlaylist(response.data.data); // Assuming the backend wraps data in `data
            } catch (error) {
                console.error('Error fetching playlist details:', error);
                setError('Failed to fetch playlist details. Please try again later.');
            }
        };

        fetchPlaylist();
    }, [id]);

    if (error) return <div>{error}</div>;
    if (!playlist) return <div>Loading...</div>;

    return (
        <div>
            <h1>{playlist.name}</h1>
            <p>{playlist.description}</p>
            <h2>Tracks:</h2>
            <ul>
                {playlist.tracks.map((track) => (
                    <li key={track._id}>
                        <strong>{track.title}</strong> by {track.artist}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PlaylistDetailsPage;
