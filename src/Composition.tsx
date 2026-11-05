import React from 'react';
import { AbsoluteFill, Audio, Sequence, Video, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface RemotionProps {
  videoUrl: string;
  musicUrl?: string;
  audioVolume?: number;
  overlays?: Array<{
    type: 'text' | 'popup_badge' | 'logo_outro' | 'flash_effect';
    startFrame: number;
    durationInFrames: number;
    content?: string;
    subContent?: string;
    position?: 'center' | 'bottom' | 'top_right' | 'bottom_left';
    stylePreset?: 'luxury_gold' | 'minimal_white' | 'cyber_neon';
  }>;
}

const TextOverlay: React.FC<{ overlay: RemotionProps['overlays'][0] }> = ({ overlay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 100 },
  });

  const opacity = interpolate(frame, [0, 10, overlay.durationInFrames - 10, overlay.durationInFrames], [0, 1, 1, 0]);

  const getPositionStyle = () => {
    switch (overlay.position) {
      case 'top_right': return { top: 80, right: 60 };
      case 'bottom_left': return { bottom: 120, left: 60 };
      case 'bottom': return { bottom: 140, left: 0, right: 0, margin: 'auto' };
      default: return { top: '50%', left: '50%', transform: `translate(-50%, -50%) scale(${scale})` };
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        opacity,
        transform: overlay.position !== 'center' ? `scale(${scale})` : undefined,
        textAlign: 'center',
        zIndex: 10,
        ...getPositionStyle(),
      }}
    >
      <h1
        style={{
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontWeight: 800,
          fontSize: 64,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: overlay.stylePreset === 'luxury_gold' ? '#D4AF37' : '#FFFFFF',
          textShadow: '0 4px 20px rgba(0,0,0,0.8)',
          margin: 0,
        }}
      >
        {overlay.content}
      </h1>
      {overlay.subContent && (
        <p style={{ fontSize: 28, color: '#E0E0E0', letterSpacing: '4px', margin: '10px 0 0 0' }}>
          {overlay.subContent}
        </p>
      )}
    </div>
  );
};

const FlashEffect: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, durationInFrames], [0.7, 0]);
  return <AbsoluteFill style={{ backgroundColor: '#FFFFFF', opacity, zIndex: 15 }} />;
};

export const MainComposition: React.FC<RemotionProps> = ({ videoUrl, musicUrl, audioVolume = 1, overlays = [] }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {videoUrl && (
        <AbsoluteFill>
          <Video src={videoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </AbsoluteFill>
      )}

      {musicUrl && <Audio src={musicUrl} volume={audioVolume} />}

      {overlays.map((overlay, index) => (
        <Sequence key={index} from={overlay.startFrame} durationInFrames={overlay.durationInFrames}>
          {overlay.type === 'flash_effect' && <FlashEffect durationInFrames={overlay.durationInFrames} />}
          {(overlay.type === 'text' || overlay.type === 'popup_badge' || overlay.type === 'logo_outro') && (
            <TextOverlay overlay={overlay} />
          )}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
