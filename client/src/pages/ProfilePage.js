/*
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get('http://localhost:4000/users/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (data.success) {
                    setUser(data.user);
                } else {
                    setError(data.message || 'Failed to fetch user data.');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'An error occurred.');
            }
        };

        fetchUser();
    }, []);

    if (error) return <p>{error}</p>;
    if (!user) return <p>Loading...</p>;

    return (
        <div>
            <h1>Profile</h1>
            <p>Username: {user.username}</p>
            <p>Email: {user.email}</p>
        </div>
    );
};

export default ProfilePage;
*/
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token'); // Retrieve the token from localStorage
            if (!token) {
                setError('User is not authenticated');
                return;
            }

            try {
                const response = await axios.get('http://localhost:4000/users/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the request
                    },
                });
                setProfile(response.data); // Update state with the user profile
            } catch (err) {
                setError(err.response ? err.response.data.error : 'Failed to fetch profile');
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
