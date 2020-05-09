chrome.runtime.onMessage.addListener(function listener(message, sender, reply) {
  console.log('message', message);
  if (message.action === 'get-track') {
    reply({
      track: document.querySelector('.title.style-scope.ytd-video-primary-info-renderer').innerText,
      action: 'track-found'
    });
  }
});
