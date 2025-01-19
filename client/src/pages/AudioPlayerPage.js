/*import React from 'react';*/

import React from 'react';
import AudioPlayer from '../components/AudioPlayer'; 

const AudioPlayerPage = () => {
    const trackSrc = "uploads/1736270857143-Unwritten.mp3";

    return (
        <div>
            <h1>Audio Player</h1>
            <AudioPlayer src={trackSrc} />
        </div>
    );
};

export default AudioPlayerPage;
