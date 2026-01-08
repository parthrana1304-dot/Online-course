import React, { useEffect, useRef, useState } from "react";
import "../styles/videoPlayer.css";

const FREE_TRIAL_SECONDS = 600; // 10 minutes

const VideoPlayer = ({
  videoUrl,
  videoId,
  isSubscribed
}) => {
  const videoRef = useRef(null);
  const [trialEnded, setTrialEnded] = useState(false);

  /* ================= RESUME PLAYBACK ================= */
  useEffect(() => {
    const savedTime = localStorage.getItem(`video-progress-${videoId}`);
    if (savedTime && videoRef.current) {
      videoRef.current.currentTime = parseFloat(savedTime);
    }
  }, [videoId]);

  /* ================= TIME TRACKING ================= */
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    const currentTime = videoRef.current.currentTime;

    // Save progress
    localStorage.setItem(
      `video-progress-${videoId}`,
      currentTime
    );

    // Free trial limit
    if (!isSubscribed && currentTime >= FREE_TRIAL_SECONDS) {
      videoRef.current.pause();
      setTrialEnded(true);
    }
  };

  /* ================= SPEED CONTROL ================= */
  const changeSpeed = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  return (
    <div className="video-wrapper">
      <video
        ref={videoRef}
        controls
        onTimeUpdate={handleTimeUpdate}
        className="video-player"
      >
        <source src={videoUrl} type="video/mp4" />

        {/* Subtitles */}
        <track
          src="/subtitles/en.vtt"
          kind="subtitles"
          srcLang="en"
          label="English"
          default
        />
        <track
          src="/subtitles/hi.vtt"
          kind="subtitles"
          srcLang="hi"
          label="Hindi"
        />
      </video>

      {/* SPEED CONTROLS */}
      {isSubscribed && (
        <div className="speed-controls">
          {[0.5, 1, 1.25, 1.5, 2].map((s) => (
            <button key={s} onClick={() => changeSpeed(s)}>
              {s}x
            </button>
          ))}
        </div>
      )}

      {/* FREE TRIAL POPUP */}
      {trialEnded && (
        <div className="trial-popup">
          <h2>⏳ Free Trial Ended</h2>
          <p>Subscribe to continue watching</p>
          <button className="subscribe-btn">Subscribe Now</button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
