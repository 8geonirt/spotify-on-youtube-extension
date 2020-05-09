# Spotify on Youtube Chrome Extension

Chrome Extension to search for tracks played on Youtube using the Spotify Library.

This extension detects the current played song on Youtube
and fetch the tracks from Spotify where you can do the following operations:

- Saved track: with just one click you'll get the selected song in your Spotify Library
- Get track/artists/album information in Spotify: click on any track data and you'll see it in the Spotify app.
- Get track lyrics: currently using the Lyrics API from [API Seeds](https://orion.apiseeds.com/documentation/lyrics)

## Note
- Sometimes the extension is not able to fetch songs from Spotify when the title has non-ascii characters, like titles in Spanish or other languages. (WIP - Adding more support)
- The currently used lyrics API does not provide a lot of lyrics, so the extension won't show some of them. (WIP - Trying to use Musixmatch API).

## Prerequisites
* [Node](https://www.ruby-lang.org/) v13+
* [Yarn](https://yarnpkg.com/) v1.21+

## Getting Started

1. Clone the repository.
2. Go to the repository folder.
3. Run the command `yarn install`
6. Start adding/fixing code

## Env variables
* Copy the `.env.sample` file and rename it to `.env`.

The following environment variables are required:
```
API_URL=http://localhost:3000/
LYRICS_API_URL=https://orion.apiseeds.com/api/music/lyric/
LYRICS_API_TOKEN=121312321321321
```

You can obtain a free API Key from [this page](https://orion.apiseeds.com/documentation/lyrics)

## Development
* This project need an API server to make it work (communicate, authorize and perform operations with Spotify), please refer to the [README](https://github.com/8geonirt/spotify-on-youtube-web) of the project so you can have your dev environment ready.

Configure your correct env variables to start pointing to your local server, example:
```
API_URL=http://localhost:3000/
```

1. Run `yarn build`
2. Using Chrome open [chrome://extensions](chrome://extensions) and enable the developer mode
3. Drag the build folder generated by the `yarn build` command.
4. You'll see the extension icon in your browser.
5. Start browsing and playing a video on Youtube and click on the extension.
6. Play with the different options.

## Future ideas
- Start using Musixmatch API to provide more lyrics.
- Use the Musixmatch Rich Lyrics API to create a full playback experience showing
lyrics based on the current played video time.
- Create a better UX when saving tracks (currently the extension can't detect if you already have a track stored.

## Built with

* React JS
