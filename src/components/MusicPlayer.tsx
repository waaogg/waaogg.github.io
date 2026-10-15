import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Disc3 } from 'lucide-react';
import { siteConfig } from '../site.config';

export default function MusicPlayer() {
  const tracks = siteConfig.music || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = tracks[currentIdx] || {
    title: 'Ambient Sound',
    artist: 'Peaceful',
    url: '',
    cover: '/favicon.svg',
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => handleNext();

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentIdx]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Autoplay prevented by browser:', err);
          setIsPlaying(false);
        });
    }
  }

  function handleNext() {
    if (tracks.length === 0) return;
    const next = (currentIdx + 1) % tracks.length;
    setCurrentIdx(next);
    setIsPlaying(false);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }, 100);
  }

  function handlePrev() {
    if (tracks.length === 0) return;
    const prev = (currentIdx - 1 + tracks.length) % tracks.length;
    setCurrentIdx(prev);
    setIsPlaying(false);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }, 100);
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }

  function toggleMute() {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }

  function formatTime(seconds: number) {
    if (isNaN(seconds) || seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  if (tracks.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/60 backdrop-blur p-4 sm:p-5 shadow-sm craft-card">
      <audio ref={audioRef} src={currentTrack.url} preload="metadata" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Track Info with Spinning Vinyl Disc */}
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden ring-1 ring-zinc-300 dark:ring-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 shadow-xs">
            <Disc3
              className={`w-7 h-7 text-indigo-500 dark:text-indigo-400 transition-transform ${
                isPlaying ? 'animate-spin' : ''
              }`}
              style={{ animationDuration: '6s' }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {currentTrack.title}
              </span>
              {isPlaying && (
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 h-full bg-indigo-500 rounded-full animate-bounce"></span>
                  <span
                    className="w-0.5 h-full bg-indigo-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0.15s' }}
                  ></span>
                  <span
                    className="w-0.5 h-full bg-indigo-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0.3s' }}
                  ></span>
                </div>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* Controls & Progress */}
        <div className="flex flex-col sm:items-end w-full sm:w-64 gap-2">
          {/* Action Buttons */}
          <div className="flex items-center justify-center sm:justify-end gap-2.5 w-full">
            <button
              onClick={handlePrev}
              type="button"
              aria-label="上一曲"
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              type="button"
              aria-label={isPlaying ? '暂停' : '播放'}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <button
              onClick={handleNext}
              type="button"
              aria-label="下一曲"
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={toggleMute}
              type="button"
              aria-label={isMuted ? '取消静音' : '静音'}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors ml-1"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Seekbar & Time */}
          <div className="flex items-center gap-2 w-full text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
