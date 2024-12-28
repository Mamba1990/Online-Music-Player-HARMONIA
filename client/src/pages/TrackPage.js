import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios';

const TracksPage = () => {
    const [tracks, setTracks] = useState([]);

    useEffect(() => {
        const fetchTracks = async () => {
            try {
                const response = await apiClient.get('/tracks');
                console.log('Backend response:', response.data); // Log the response data
                setTracks(response.data.data || []); // Extract the 'data' key
            } catch (error) {
                console.error('Error fetching tracks:', error);
                setTracks([]); // Set to an empty array on error
            }
        };
        fetchTracks();
    }, []);

    return (
        <div>
            <h1>Tracks</h1>
            <ul>
                {tracks.length > 0 ? (
                    tracks.map((track) => (
                        <li key={track._id}>
                            <strong>{track.title}</strong> by {track.artist}
                        </li>
                    ))
                ) : (
                    <p>No tracks available</p>
                )}
            </ul>
        </div>
    );
};

export default TracksPage;
