import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios';

const ProfilePage = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await apiClient.get('/users');
                console.log('Backend response (users):', response.data); // Log the response for debugging
                setUsers(response.data || []); // Directly set the response data
            } catch (error) {
                console.error('Error fetching users:', error);
                setUsers([]); // Set to an empty array on error
            }
        };
        fetchUsers();
    }, []);

    return (
        <div>
            <h1>User Profiles</h1>
            <ul>
                {users.length > 0 ? (
                    users.map((user) => (
                        <li key={user._id}>
                            <strong>Name:</strong> {user.name} <br />
                            <strong>Email:</strong> {user.email}
                        </li>
                    ))
                ) : (
                    <p>No users available</p>
                )}
            </ul>
        </div>
    );
};

export default ProfilePage;
