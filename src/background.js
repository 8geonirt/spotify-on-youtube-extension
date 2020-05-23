const SPOTIFY_URL = process.env.API_URL;

const sanitizeTitle = (track) =>  {
  return track.toLowerCase()
    .replace(/featuring.*|ft.*|feat.*$/, '')
    .replace(/with lyrics.*$/, '')
    .replace(/hd.*|4k.*$/, '')
    .replace(/ *\([^)]*\) */g, '')
    .replace(/new video/g, '')
    .replace(/\[.*?\]/, '');
};

const fetchTrack = (trackName) => (new Promise((resolve, reject) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const requestOptions = {
    credentials: 'include',
    method: 'GET',
    headers
  };

  const request = new Request(`${SPOTIFY_URL}track_info?name=${sanitizeTitle(trackName)}`, requestOptions);
  fetch(request)
    .then((response) => {
      return response.json();
    }).then((response) => {
      resolve(response);
    }).catch((error) => {
      resolve(error);
    });
}));

chrome.runtime.onInstalled.addListener(() => {
  console.log('installed');
});

chrome.runtime.onMessage.addListener((message, callback) => {
  console.log('message', message);

  if (message.action === 'track-found') {
    fetchTrack(message.track).then((response) => {
      chrome.runtime.sendMessage({
        action: 'track-fetched',
        trackName: message.track,
        response
      });
    });
  }
});
