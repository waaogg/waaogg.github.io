import { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipForward, Volume2, VolumeX, Disc3, ChevronUp, ChevronDown } from 'lucide-react';
import { siteConfig } from '../site.config';

export default function MusicPlayer() {
  const tracks = siteConfig.music;
  const [index, setIndex] = useState(0), [playing, setPlaying] = useState(false), [expanded, setExpanded] = useState(false);
  const [time, setTime] = useState(0), [duration, setDuration] = useState(0), [muted, setMuted] = useState(false);
  const [error, setError] = useState(''), [loading, setLoading] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const wantsPlay = useRef(false);
  const widget = useRef<HTMLDivElement>(null);
  const track = tracks[index];
  const play = async () => {
    if (!audio.current) return;
    setError(''); setLoading(true);
    try { await audio.current.play(); }
    catch { setError('暂时无法播放，请重试或换一首。'); wantsPlay.current = false; setPlaying(false); }
    finally { setLoading(false); }
  };
  const choose = (next: number, resume = playing) => {
    wantsPlay.current = resume;
    if (next === index) { if (audio.current) audio.current.currentTime = 0; if (resume) void play(); return; }
    setPlaying(false); setTime(0); setDuration(0); setError(''); setIndex(next);
  };
  useEffect(() => { if (wantsPlay.current) void play(); }, [index]);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (widget.current && !widget.current.contains(e.target as Node)) setExpanded(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setExpanded(false); };
    document.addEventListener('click', close); document.addEventListener('keydown', key);
    return () => { document.removeEventListener('click', close); document.removeEventListener('keydown', key); };
  }, []);
  if (!track) return null;
  const clock = (value: number) => Math.floor(value / 60) + ':' + String(Math.floor(value % 60)).padStart(2, '0');
  return <div className="music-widget" data-playing={playing} ref={widget} aria-label="音乐播放器">
    <audio ref={audio} src={track.url} preload="none" muted={muted}
      onPlay={() => { setPlaying(true); setLoading(false); }} onPause={() => setPlaying(false)}
      onWaiting={() => setLoading(true)} onPlaying={() => setLoading(false)}
      onTimeUpdate={e => setTime(e.currentTarget.currentTime)}
      onLoadedMetadata={e => setDuration(Number.isFinite(e.currentTarget.duration) ? e.currentTarget.duration : 0)}
      onEnded={() => choose((index + 1) % tracks.length, true)}
      onError={() => { setError('音源暂时不可用，可以换一首。'); setPlaying(false); setLoading(false); wantsPlay.current = false; }} />
    <div className="music-disc" aria-hidden="true"><Disc3 size={19} strokeWidth={1} /></div>
    <div className="music-info"><strong>{track.title}</strong><small>{loading ? '缓冲中…' : error ? '音源不可用' : playing ? '正在播放 · ' + track.artist : '给阅读一点声音'}</small></div>
    <button type="button" aria-label={playing ? '暂停音乐' : '播放音乐'} onClick={() => {
      if (playing) { wantsPlay.current = false; audio.current?.pause(); } else { wantsPlay.current = true; void play(); }
    }}>{playing ? <Pause size={15} /> : <Play size={15} />}</button>
    <button type="button" className="music-secondary" aria-label="下一曲" onClick={() => choose((index + 1) % tracks.length)}><SkipForward size={14} /></button>
    <button type="button" aria-label={expanded ? '收起歌单' : '展开歌单'} aria-expanded={expanded} aria-controls="music-details" onClick={() => setExpanded(!expanded)}>{expanded ? <ChevronDown size={13} /> : <ChevronUp size={13} />}</button>
    {expanded && <div className="music-expanded" id="music-details">
      <div className="meta"><span>READING RADIO</span><button type="button" aria-label={muted ? '取消静音' : '静音'} aria-pressed={muted} onClick={() => setMuted(!muted)}>{muted ? <VolumeX size={15} /> : <Volume2 size={15} />}</button></div>
      <input type="range" min="0" max={duration || 1} step="1" value={Math.min(time,duration || 1)} aria-label="播放进度" disabled={!duration} onChange={e => { if (audio.current) { audio.current.currentTime = Number(e.target.value); setTime(Number(e.target.value)); } }} />
      <div className="meta"><span>{clock(time)}</span><span>{clock(duration)}</span></div>
      {error && <p className="music-error" role="status">{error}</p>}
      <div className="music-track-list">{tracks.map((item, i) => <button key={item.url} type="button" aria-current={i === index ? 'true' : undefined} onClick={() => choose(i)}><span className={i === index ? 'accent' : ''}>{String(i + 1).padStart(2,'0')}　{item.title}</span><span className="muted">{item.artist}</span></button>)}</div>
    </div>}
  </div>;
}
