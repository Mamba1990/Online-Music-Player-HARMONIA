import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const TrackPage = () => {
    const [tracks, setTracks] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTracks = async () => {
            try {
                const response = await axios.get('http://localhost:4000/tracks', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setTracks(response.data?.data || []);
            } catch (error) {
                console.error('Error fetching tracks:', error);
                setError('Failed to fetch tracks. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchTracks();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!tracks.length) return <div>No tracks available</div>;

    return (
        <div>
            <h1>Tracks</h1>
            <ul>
                {tracks.map((track) => (
                    <li key={track._id}>
                        <Link to={`/tracks/${track._id}`}>{track.title}</Link>
                        <AudioPlayer filePath={track.filePath} /> 
                    </li>
                ))}
            </ul>
        </div>
    );
};

const AudioPlayer = ({ filePath }) => {
    if (!filePath) return null; 

    return (
        <audio controls>
            <source src={filePath} type="audio/mpeg" />
            Your browser does not support the audio element.
        </audio>
    );
};

export default TrackPage;
