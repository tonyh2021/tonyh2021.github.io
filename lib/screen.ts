interface FsEl extends HTMLElement {
  msRequestFullscreen?: () => void;
  mozRequestFullScreen?: () => void;
  webkitRequestFullscreen?: () => void;
}
interface FsDoc extends Document {
  webkitIsFullScreen?: boolean;
  mozFullScreen?: boolean;
  msFullscreenElement?: Element;
}

export const isFullScreen = (): boolean => {
  const d = document as FsDoc;
  return !!(d.fullscreenElement || d.webkitIsFullScreen || d.mozFullScreen || d.msFullscreenElement);
};

export const enterFullScreen = (): void => {
  if (isFullScreen()) return;
  const el = document.documentElement as FsEl;
  if (el.requestFullscreen) el.requestFullscreen();
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
  else if (el.msRequestFullscreen) el.msRequestFullscreen();
};

export const exitFullScreen = (): void => {
  if (isFullScreen()) document.exitFullscreen().catch(() => {});
};
