/* global chrome */
import React, { Component } from 'react';
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { faCheckSquare, faCoffee } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import './App.scss';
import {
  sanitizeTitle,
  getTrack,
  getLyrics,
  saveTrack
} from './components/utils';

const DEFAULT_TITLE = 'Spotify on Youtube';

const INITIAL_STATE = {
  loading: true,
  lyrics: '',
  showLyrics: false,
  tracks: [],
  tracksFound: false,
  message: DEFAULT_TITLE,
  messageType: 'success'
};

library.add(fab, faCheckSquare, faCoffee);

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...INITIAL_STATE,
    };
    this.renderTracks = this.renderTracks.bind(this);
    this.searchTrack = this.searchTrack.bind(this);
    this.getArtists = this.getArtists.bind(this);
    this.displayLyrics = this.displayLyrics.bind(this);
    this.resetView = this.resetView.bind(this);
    this.handleLoading = this.handleLoading.bind(this);
    this.handleNoTracksFound = this.handleNoTracksFound.bind(this);
    this.renderView = this.renderView.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.handleState = this.handleState.bind(this);
    this.scrapeTrack = this.scrapeTrack.bind(this);
    this.handleAuthorization = this.handleAuthorization.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.saveTrack = this.saveTrack.bind(this);
    this.shouldSearchTrack = this.shouldSearchTrack.bind(this);
  }

  authorize() {
    window.open(`${process.env.API_URL}authorize`);
  }

  handleMessage(message, messageType) {
    this.setState({
      message,
      messageType
    }, () => {
      setTimeout(() => {
        this.setState({
          message: DEFAULT_TITLE,
          messageType: 'success'
        });
      }, 2000);
    });
  }

  saveTrack(track) {
    saveTrack(track)
      .then((response) => {
        this.handleMessage('Track saved in your library', 'success');
      })
      .catch(() => {
        this.handleMessage('Couldn\'t save track', 'error');
      });
  }

  handleAuthorization() {
    const { authorized } = this.state;

    if (authorized !== undefined && !authorized) {
      return (
        <div className="login-button-container">
          <button className="btn-login" onClick={this.authorize}>
            Authorize with Spotify
          </button>
        </div>
      );
    }
  }

  handleLoading() {
    return this.state.loading ? <div className="loader">Loading...</div> : null;
  }

  onMessage(message) {
    if (message.action === 'track-found') {
      chrome.storage.local.get(['state'], (result) => {
        let { state } = result;

        if (state === undefined) {
          state = {};
          state.currentView = 'spotify-list';
        }

        chrome.storage.local.set({ state }, () => {
          this.handleState(message.track);
        });
      });

    } else {
      console.error('Track not found');
    }
  }

  handleNoTracksFound() {
    const { loading, tracksFound, authorized } = this.state;
    return !loading && !tracksFound && authorized ?
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

  shouldSearchTrack(state, trackName) {
    const { currentView, track, scrappedTrack } = state;
    const isEmptyState = !Object.keys(state).length;
    const initialView = currentView === 'spotify-list';
    const differentTrack = track !== undefined && scrappedTrack !== trackName;

    return isEmptyState || initialView || differentTrack;
  }

  handleState(scrappedTrack) {
    chrome.storage.local.get(['state'], (result) => {
      const { state: { track, lyrics, copyright } } = result;

      if (this.shouldSearchTrack(result.state, scrappedTrack)) {
        this.saveState({
          currentView: 'spotify-list',
          scrappedTrack
        });
        this.searchTrack(sanitizeTitle(scrappedTrack));
      } else {
        this.setState({
          lyrics,
          showLyrics: true,
          loading: false,
          tracksFound: true,
          authorized: true,
          copyright
        });
      }
    });
  }

  displayLyrics() {
    return (
      <section className="lyrics-section">
        <button className="back-icon" onClick={this.resetView}></button>
        <div className="lyrics-container">
          {this.state.lyrics}
        </div>
        <div className="copyright">
          {this.state.copyright}<br/>
        </div>
      </section>
    );
  }

  componentDidMount() {
    if (chrome.tabs !== undefined) {
      chrome.runtime.onMessage.addListener(this.onMessage);
      this.scrapeTrack();
    }
  }

  searchTrack(trackName) {
    getTrack(trackName).then((response) => {
      if (response.error !== undefined) {
        if (response.error === 're-authenticate') {
          this.searchTrack(trackName);
        }

        if (response.error === 'Internal Server Error') {
          this.setState({
            tracksFound: false,
            loading: false,
            authorized: true
          });
        } else {
          this.setState({
            authorized: false,
            loading: false
          });
        }

      } else {
        this.setState({
          authorized: true,
          tracks: response.length ? response : [],
          loading: false,
          tracksFound: response.length ? true : false
        });
      }
      this.handleMessage(DEFAULT_TITLE, 'success');
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
      if (response.lyrics_id !== undefined) {
        this.setState({
          lyrics: response.lyrics_body,
          showLyrics: true,
          loading: false,
          tracksFound: true,
          authorized: true,
          copyright: response.lyrics_copyright
        });

        chrome.storage.local.get(['state'], (result) => {
          let { state } = result;
          state.currentView = 'lyrics';
          state.track = track;
          state.lyrics = response.lyrics_body;
          state.copyright = response.lyrics_copyright;
          this.saveState(state);
        });
      } else {
        this.handleMessage('Couldn\'t find lyrics', 'error');
      }
    });
  }

  resetView() {
    if (!this.state.tracks.length) {
      chrome.storage.local.get(['state'], (result) => {
        let { state } = result;
        state.currentView = 'spotify-list';
        state.track = undefined;

        chrome.storage.local.set({ state }, () => {
          this.scrapeTrack();
        });
      });
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
    return explicit ? <span className="explicit-label">E</span> : null;
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

  albumImage(album) {
    return album.images !== undefined && album.images.length ? album.images[0].url : null;
  }

  renderTracks() {
    return this.state.tracks.map((track) => {
      return (
        <div className="track-info-container">
          <div className="album-image-container">
            <img alt="Album" src={this.albumImage(track.album)}/>
            <span onClick={() => { this.saveTrack(track.id) }}>Save</span>
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

  renderMessage() {
    const { message, messageType } = this.state;

    return (
      <div className={`message-container ${messageType}`}>
        <FontAwesomeIcon icon={['fab', 'spotify']} />
        {message}
        <FontAwesomeIcon icon={['fab', 'youtube']} />
      </div>
    );
  }

  render() {
    return (
      <div className="App">
        {this.renderMessage()}
        {this.handleAuthorization()}
        {this.handleLoading()}
        {this.handleNoTracksFound()}
        {this.renderView()}
      </div>
    );
  }
}

export default App;
