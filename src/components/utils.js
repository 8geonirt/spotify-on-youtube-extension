const SPOTIFY_URL = process.env.API_URL;
const LYRICS_API_URL = process.env.LYRICS_API_URL;
const LYRICS_API_TOKEN = process.env.LYRICS_API_TOKEN;

const sanitizeTitle = (track) =>  {
  return track.toLowerCase()
    .replace(/featuring.*|ft.*$/, '')
    .replace(/with lyrics.*$/, '')
    .replace(/hd.*|4k.*$/, '')
    .replace(/ *\([^)]*\) */g, '')
    .replace(/\[.*?\]/, '');
};

const getTrack = (trackName) => (new Promise((resolve, reject) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Accept': 'application/json'
  };

  const requestOptions = {
    credentials: 'include',
    method: 'GET',
    headers
  };

  const request = new Request(`${SPOTIFY_URL}track_info?name=${trackName}`, requestOptions);
  fetch(request)
    .then((response) => {
      return response.json();
    }).then((response) => {
      resolve(response);
    }).catch((error) => {
      resolve(error);
    });
}));

const getLyrics = (track) => (new Promise((resolve, reject) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Accept': 'application/json'
  };

  const requestOptions = {
    method: 'GET',
    headers
  };
  const artist = track.artists[0].name;
  const lyricsUrl =
    `${LYRICS_API_URL}${artist}/${sanitizeTitle(track.name)}?apikey=${LYRICS_API_TOKEN}`;
  const request = new Request(lyricsUrl, requestOptions);
  fetch(request)
    .then((response) => {
      return response.json();
    }).then((response) => {
      resolve(response);
    }).catch((error) => {
      reject(error);
    });
}));

const saveTrack = (trackId) => (new Promise((resolve, reject) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Accept': 'application/json'
  };

  const requestOptions = {
    credentials: 'include',
    method: 'GET',
    headers
  };
  const request = new Request(SPOTIFY_URL + `save_track/${trackId}`, requestOptions);
  fetch(request)
    .then((response) => {
      resolve(response.json());
    });
}));

export {
  sanitizeTitle,
  getLyrics,
  getTrack,
  saveTrack
};
