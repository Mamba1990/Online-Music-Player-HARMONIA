import React from 'react';

const AudioPlayer = ({ src }) => {
    return (
        <div>
            <audio controls>
                <source src={`http://localhost:4000/${src}`} type="audio/mpeg" />
                Your browser does not support the audio element.
            </audio>
        </div>
    );
};

export default AudioPlayer;
