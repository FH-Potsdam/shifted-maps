import styled from '../styled';

interface Props {
  className?: string;
}

function Screencast({ className }: Props) {
  return (
    <div className={className}>
      <video autoPlay preload="auto" loop>
        <source src="/static/videos/screencast-hd.mp4" type="video/mp4" />
        <source src="/static/videos/screencast-hd.webm" type="video/webm" />
      </video>
    </div>
  );
}

export default styled(Screencast)`
  position: absolute;
  height: 100%;
  min-width: 100%;
  min-height: 100%;
  display: block;
  z-index: -1;
  background-color: ${props => props.theme.backgroundColor};

  video {
    object-fit: cover;
    width: 100%;
    height: 100%;
    opacity: 0.7;
    display: block;
  }
`;
