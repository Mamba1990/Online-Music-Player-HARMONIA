import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const TrackPage = () => {
    const [tracks, setTracks] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTracks = async () => {
            try {
                const response = await axios.get('http://localhost:4000/tracks');
                setTracks(response.data.data); // Assuming backend wraps data in `data`
            } catch (error) {
                console.error('Error fetching tracks:', error);
                setError('Failed to fetch tracks. Please try again later.');
            }
        };

        fetchTracks();
    }, []);

    if (error) return <div>{error}</div>;
    if (!tracks.length) return <div>Loading...</div>;

    return (
        <div>
            <h1>Tracks</h1>
            <ul>
                {tracks.map((track) => (
                    <li key={track._id}>
                        <Link to={`/tracks/${track._id}`}>{track.title}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TrackPage;
