import { Composition } from 'remotion';
import { MainComposition, RemotionProps } from './Composition';

const defaultProps: RemotionProps = {
  videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  musicUrl: "",
  audioVolume: 1,
  overlays: []
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Yaxn8Commercial"
      component={MainComposition}
      durationInFrames={450} // 30fps x 15 saniye = 450 kare
      fps={30}
      width={1080}
      height={1920}
      defaultProps={defaultProps}
    />
  );
};
