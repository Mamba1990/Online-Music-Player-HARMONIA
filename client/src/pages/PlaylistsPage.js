import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios';

const PlaylistsPage = () => {
    const [playlists, setPlaylists] = useState([]);

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const response = await apiClient.get('/playlists');
                console.log('Backend response:', response.data); // Log the response data for debugging
                setPlaylists(response.data.data || []); // Extract the 'data' key
            } catch (error) {
                console.error('Error fetching playlists:', error);
                setPlaylists([]); // Set to an empty array on error
            }
        };
        fetchPlaylists();
    }, []);

    return (
        <div>
            <h1>Playlists</h1>
            <ul>
                {playlists.length > 0 ? (
                    playlists.map((playlist) => (
                        <li key={playlist._id}>
                            <strong>{playlist.name}</strong>: {playlist.description}
                        </li>
                    ))
                ) : (
                    <p>No playlists available</p>
                )}
            </ul>
        </div>
    );
};

export default PlaylistsPage;
