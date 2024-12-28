import React from 'react';
import './Button.css';

const Button = ({ text, onClick, type = 'button', styleClass = '' }) => {
    return (
        <button className={`custom-button ${styleClass}`} type={type} onClick={onClick}>
            {text}
        </button>
    );
};

export default Button;
