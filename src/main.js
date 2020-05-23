const getTrack = () => {
  const trackElement = document.querySelector('.title.style-scope.ytd-video-primary-info-renderer');
  let action = '';
  let track = '';

  if (trackElement !== null) {
    action = 'track-found';
    track = trackElement.innerText;
  } else {
    action = 'track-not-found';
  }

  chrome.runtime.sendMessage({
    action,
    track
  });
};

chrome.runtime.onMessage.addListener(function listener(message, sender, reply) {
  if (message.action === 'get-track') {
    getTrack();
  }

  return true;
});
