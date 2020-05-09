/* global chrome */
import React, { Component } from 'react';
import './App.scss';
import {
  sanitizeTitle,
  getTrack,
  getLyrics,
  saveTrack
} from './components/utils';

const INITIAL_STATE = {
  loading: true,
  lyrics: '',
  showLyrics: false,
  tracks: [],
  tracksFound: false,
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = INITIAL_STATE;
    this.renderTracks = this.renderTracks.bind(this);
    this.searchTrack = this.searchTrack.bind(this);
    this.getArtists = this.getArtists.bind(this);
    this.displayLyrics = this.displayLyrics.bind(this);
    this.resetView = this.resetView.bind(this);
    this.handleLoading = this.handleLoading.bind(this);
    this.handleNoTracksFound = this.handleNoTracksFound.bind(this);
    this.renderView = this.renderView.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleState = this.handleState.bind(this);
    this.scrapeTrack = this.scrapeTrack.bind(this);
  }

  handleLoading() {
    return this.state.loading ? <div className="loader">Loading...</div> : null;
  }

  handleMessage(message) {
    if (message.action === 'track-found') {
      this.saveState({ currentView: 'spotify-list' });
      this.searchTrack(sanitizeTitle(message.track));
    } else {
      console.error('Track not found');
    }
  }

  handleNoTracksFound() {
    return !this.state.loading && !this.state.tracksFound ?
      <div className="error-message">No tracks were found</div> : null;
  }

  renderView() {
    return !this.state.showLyrics ? this.renderTracks() : this.displayLyrics();
  }

  saveState(state) {
    chrome.storage.local.set({ state });
  }

  scrapeTrack() {
    this.setState({ ...INITIAL_STATE });

    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id,
        {action: 'get-track'}
      );
    });
  }

  handleState() {
    const $this = this;
    chrome.storage.local.get(['state'], function(result) {
      const { state: { currentView, track } } = result;

      if (currentView === 'spotify-list' || !Object.keys(result).length) {
        $this.scrapeTrack();
      } else {
        $this.getLyrics(track);
      }
    });
  }

  displayLyrics() {
    return (
      <section className="lyrics-section">
        <button className="back-icon" onClick={this.resetView}>
          &#8249;
        </button>
        <div className="lyrics-container">
          {this.state.lyrics}
        </div>
      </section>
    );
  }

  componentDidMount() {
    if (chrome.tabs !== undefined) {
      chrome.runtime.onMessage.addListener(this.handleMessage);
      this.handleState();
    }
  }

  searchTrack(trackName) {
    getTrack(trackName).then((response) => {
      this.setState({
        tracks: response.length ? response : [],
        loading: false,
        tracksFound: response.length ? true : false
      });
    });
  }

  getArtists(artists) {
    return artists.map((artist, index) => {
      return (
        <span>
          <a href={artist.uri} onClick={this.handleLink}>
            {artist.name}
          </a>
          <span>{index === artists.length - 1 ? '' : ', '}</span>
        </span>
      );
    });
  }

  getLyrics(track) {
    getLyrics(track).then((response) => {
      if (response.result !== undefined) {
        this.setState({
          lyrics: response.result.track.text,
          showLyrics: true,
          loading: false,
          tracksFound: true
        });

        this.saveState({
          currentView: 'lyrics',
          track
        });
      }
    });
  }

  resetView() {
    if (!this.state.tracks.length) {
      this.scrapeTrack();
    } else {
      this.setState({
        lyrics: '',
        showLyrics: false
      });
    }
  }

  handleLink(anchor) {
    if (chrome.tabs !== undefined) {
      anchor.preventDefault();
      window.open(anchor.target.href);
    }
  }

  explicitLabel(explicit) {
    return explicit ? <span className="explicit-label">Explicit</span> : null;
  }

  albumData(album) {
    return (
      <a href={`${album.uri}`} onClick={this.handleLink}>
        {album.name}
      </a>
    );
  }

  lyricsButton(track) {
    return (
      <span
        className="explicit-label lyrics"
        onClick={() => {
          this.getLyrics(track);
        }}>
        Lyrics
      </span>
    );
  }

  renderTracks() {
    return this.state.tracks.map((track) => {
      return (
        <div className="track-info-container">
          <div className="album-image-container">
            <img alt="Album" src={track.album.images[0].url} onClick={() => { saveTrack(track.id) }}/>
          </div>
          <div className="track-data">
            <a className="song-name" href={track.uri} onClick={this.handleLink}>
              {track.name}
            </a>
            <div className="track-information">
              {this.explicitLabel(track.explicit)}
              {this.getArtists(track.artists)} • {this.albumData(track.album)}
              {this.lyricsButton(track)}
            </div>
          </div>
        </div>
      );
    });
  }

  render() {
    return (
      <div className="App">
        {this.handleLoading()}
        {this.handleNoTracksFound()}
        {this.renderView()}
      </div>
    );
  }
}

export default App;
