import React, { Component } from 'react';
import fetch from 'isomorphic-fetch';
import './App.scss';

const SPOTIFY_URL = 'http://localhost:3000/';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tracks: []
    }

    this.renderTracks = this.renderTracks.bind(this);
    this.searchTrack = this.searchTrack.bind(this);
  }

  searchTrack() {
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
    const request = new Request(SPOTIFY_URL + 'track_info/Without me', requestOptions);
    fetch(request)
      .then((response) => {
        return response.json();
      }).then((response) => {
        this.setState({tracks: response});
      }).catch((error) => {
        console.error('Error', error);
      });
  }

  getArtists(artists) {
    return artists.map((artist, index) => {
      return (
        <span>
          <a href={artist.uri}>
            {artist.name}
          </a>
          <span>{index === artists.length - 1 ? '' : ', '}</span>
        </span>
      );
    });
  }

  save(trackId) {
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
    const request = new Request(SPOTIFY_URL + `save/${trackId}`, requestOptions);
    fetch(request)
      .then((response) => {
        return response.json();
      }).then((response) => {
        this.setState({tracks: response});
      }).catch((error) => {
        console.error('Error', error);
      });

  }

  renderTracks() {
    return this.state.tracks.map((track) => {
      return (
        <div className="track-info-container">
          <div className="album-image-container">
            <img src={track.album.images[0].url} onClick={() => { this.save(track.id) }}/>
          </div>
          <div className="track-data">
            <a className="song-name" href={track.uri}>{track.name}</a>
            <div className="track-information">
              {
                track.explicit &&
                  <span className="explicit-label">Explicit</span>
              }
              {this.getArtists(track.artists)} • <a href={`${track.album.uri}`}>{track.album.name}</a>
            </div>
          </div>
        </div>
      );
    });
  }

  render() {
    return (
      <div className="App">
        <button type="button" onClick={this.searchTrack}>Get info</button>
        <h1>Tracks found:</h1>
        {this.renderTracks()}
      </div>
    );
  }
}

export default App;
