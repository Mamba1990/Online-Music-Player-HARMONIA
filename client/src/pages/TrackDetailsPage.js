import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const TrackDetailsPage = () => {
    const { id } = useParams(); // Get the track ID from the URL
    const [track, setTrack] = useState(null); // State to store track details
    const [error, setError] = useState(null); // State to handle errors

    useEffect(() => {
        const fetchTrack = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/tracks/${id}`);
                setTrack(response.data.data); // Assuming your backend wraps data in `data`
            } catch (error) {
                console.error('Error fetching track details:', error);
                setError('Failed to fetch track details. Please try again later.');
            }
        };

        fetchTrack();
    }, [id]);

    if (error) return <div>{error}</div>;
    if (!track) return <div>Loading...</div>;

    return (
        <div>
            <h1>{track.title}</h1>
            <p><strong>Artist:</strong> {track.artist}</p>
            <p><strong>Duration:</strong> {track.duration} seconds</p>
        </div>
    );
};

export default TrackDetailsPage;

