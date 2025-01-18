import React, { useState } from 'react';
import axios from 'axios';
import './Form.css';

const LoginForm = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:4000/auth/login', formData);
            console.log('Login successful:', response.data);
            // Save token or redirect
        } catch (error) {
            console.error('Error during login:', error.response?.data || error.message);
            setError(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <form className="form-container" onSubmit={handleSubmit}>
            <h1>Log In</h1>
            {error && <div className="error">{error}</div>}
            <div>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
            </div>
            <button type="submit">Log In</button>
        </form>
    );
};

export default LoginForm;
