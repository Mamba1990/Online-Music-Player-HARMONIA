import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token'); // Retrieve the token from localStorage
            if (!token) {
                setError('User is not authenticated. Please log in.');
                return;
            }

            try {
                const { data } = await axios.get('http://localhost:4000/users/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the request
                    },
                });

                if (data.success) {
                    setProfile(data.user); // Update state with the user data
                } else {
                    setError(data.message || 'Failed to fetch user data.');
                }
            } catch (err) {
                setError(
                    err.response?.data?.message || 'An unexpected error occurred. Please try again.'
                );
            }
        };

        fetchProfile();
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!profile) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Profile Page</h1>
            <p>Name: {profile.name}</p>
            <p>Email: {profile.email}</p>
        </div>
    );
};

export default ProfilePage;
