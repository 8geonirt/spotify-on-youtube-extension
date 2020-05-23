const SPOTIFY_URL = process.env.API_URL;

const sanitizeTitle = (track) =>  {
  return track.toLowerCase()
    .replace(/ featuring. | ft. | feat. /g, ' ')
    .replace(/with lyrics.*$/, '%20')
    .replace(/hd.*|4k.*$/, '')
    .replace(/ *\([^)]*\)*/g, ' ')
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

  const sanitizedName = sanitizeTitle(trackName);
  const request = new Request(`${SPOTIFY_URL}track_info?name=${sanitizedName}`, requestOptions);
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
