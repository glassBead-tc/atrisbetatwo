### getTrack

#### getTrack(`params`)

Get a track by id.

Example:

```typescript
const { data: track } = await audiusSdk.tracks.getTrack({
  trackId: 'D7KyD',
})

console.log(track)
```

#### Params

Create an object with the following fields and pass it as the first argument, as shown in the
example above.

| Name      | Type     | Description         | Required?    |
| :-------- | :------- | :------------------ | :----------- |
| `trackId` | `string` | The ID of the track | **Required** |

#### Returns

Returns a `Promise` containing an object with a `data` field. `data` contains information about the
track as described below.

Return type:

```ts
Promise<{
  data: {
    artwork?: {
      _1000x1000?: string
      _150x150?: string
      _480x480?: string
    }
    description?: string
    downloadable?: boolean
    duration: number
    favoriteCount: number
    genre?: string
    id: string
    isStreamable?: string
    mood?: string
    permalink?: string
    playCount: number
    releaseDate: string
    remixOf?: {
      tracks: { parentTrackId: string }[]
    }
    repostCount: number
    tags?: string[]
    title: string
    trackCid?: string
    user: {
      albumCount: number
      artistPickTrackId?: string
      bio?: string
      coverPhoto?: {
        _2000?: string
        _640?: string
      }
      doesFollowCurrentUser?: boolean
      ercWallet: string
      followeeCount: number
      followerCount: number
      handle: string
      id: string
      isAvailable: boolean
      isDeactivated: boolean
      isVerified: boolean
      location?: string
      name: string
      playlistCount: number
      profilePicture?: {
        _1000x1000?: string
        _150x150?: string
        _480x480?: string
      }
      repostCount: number
      splWallet: string
      supporterCount: number
      supportingCount: number
      totalAudioBalance: number
      trackCount: number
    }
  }
}>
```

---

### getBulkTracks

#### getBulkTracks(`params`)

Get a list of tracks using their IDs or permalinks.

Example:

```typescript
const { data: tracks } = await audiusSdk.tracks.getBulkTracks({
  id: ['D7KyD', 'PjdWN', 'Jwo2A'],
})
console.log(tracks)
```

#### Params

Create an object with the following fields and pass it as the first argument, as shown in the
example above.

| Name        | Type       | Description                      | Required?  |
| :---------- | :--------- | :------------------------------- | :--------- |
| `id`        | `string[]` | An array of IDs of tracks        | _Optional_ |
| `permalink` | `string[]` | An array of permalinks of tracks | _Optional_ |

#### Returns

Returns a `Promise` containing an object with a `data` field. `data` is an array of items containing
information about the tracks as described below.

Return type:

```ts
Promise<{
  data: {
    artwork?: {
      _1000x1000?: string
      _150x150?: string
      _480x480?: string
    }
    description?: string
    downloadable?: boolean
    duration: number
    favoriteCount: number
    genre?: string
    id: string
    isStreamable?: string
    mood?: string
    permalink?: string
    playCount: number
    releaseDate: string
    remixOf?: {
      tracks: { parentTrackId: string }[]
    }
    repostCount: number
    tags?: string[]
    title: string
    trackCid?: string
    user: {
      albumCount: number
      artistPickTrackId?: string
      bio?: string
      coverPhoto?: {
        _2000?: string
        _640?: string
      }
      doesFollowCurrentUser?: boolean
      ercWallet: string
      followeeCount: number
      followerCount: number
      handle: string
      id: string
      isAvailable: boolean
      isDeactivated: boolean
      isVerified: boolean
      location?: string
      name: string
      playlistCount: number
      profilePicture?: {
        _1000x1000?: string
        _150x150?: string
        _480x480?: string
      }
      repostCount: number
      splWallet: string
      supporterCount: number
      supportingCount: number
      totalAudioBalance: number
      trackCount: number
    }
  }[]
}>
```

---

### getTrendingTracks

#### getTrendingTracks(`params`)

Get the top 100 trending (most popular) tracks on Audius.

Example:

```typescript
const { data: tracks } = await audiusSdk.tracks.getTrendingTracks()
console.log(tracks)
```

#### Params

Optionally create an object with the following fields and pass it as the first argument.

| Name    | Type                                                             | Description                                                                                                  | Required?  |
| :------ | :--------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- | :--------- |
| `genre` | `Genre` (can be imported from `@audius/sdk`)                     | If provided, the top 100 trending tracks of the genre will be returned                                       | _Optional_ |
| `time`  | `GetTrendingTracksTimeEnum` (can be imported from `@audius/sdk`) | A time range for which to return the trending tracks. Default value is **GetTrendingTracksTimeEnum.AllTime** | _Optional_ |

#### Returns

The return type is the same as [`getBulkTracks`](#getbulktracks)

### getUndergroundTrendingTracks

#### getUndergroundTrendingTracks(`params`)

Get the top 100 trending underground tracks on Audius.

Example:

```typescript
const { data: tracks } = await audiusSdk.tracks.getUndergroundTrendingTracks()
console.log(tracks)
```

#### Params

Optionally create an object with the following fields and pass it as the first argument.

| Name     | Type     | Description                                                                  | Required?  |
| :------- | :------- | :--------------------------------------------------------------------------- | :--------- |
| `limit`  | `number` | If provided, will return only the given number of tracks. Default is **100** | _Optional_ |
| `offset` | `number` | An offset to apply to the list of results. Default value is **0**            | _Optional_ |

#### Returns

The return type is the same as [`getBulkTracks`](#getbulktracks)

---

### searchTracks

#### searchTracks(`params`)

Search for tracks.

Example:

```typescript
const { data: tracks } = await audiusSdk.tracks.searchTracks({
  query: 'skrillex',
})
console.log(tracks)
```

#### Params

Create an object with the following fields and pass it as the first argument, as shown in the
example above.

| Name    | Type     | Description             | Required?    |
| :------ | :------- | :---------------------- | :----------- |
| `query` | `string` | The query to search for | **Required** |

#### Returns

The return type is the same as [`getBulkTracks`](#getbulktracks)

---

### getTrackStreamUrl

#### getTrackStreamUrl(`params`)

Get the url of the track's streamable mp3 file.

Example:

```typescript
const url = await audiusSdk.tracks.getTrackStreamUrl({
  trackId: 'PjdWN',
})
const audio = new Audio(url)
audio.play()
```

#### Params

Create an object with the following fields and pass it as the first argument, as shown in the
example above.

| Name      | Type     | Description         | Required?    |
| :-------- | :------- | :------------------ | :----------- |
| `trackId` | `string` | The ID of the track | **Required** |

#### Returns

Returns a `Promise` containing a `string` url which can be used to stream the track.

Return type:

```ts
Promise<string>
```

---

### uploadTrack

#### uploadTrack(`params`, `advancedOptions?`)

Upload a track.

Example:

```typescript
import { Mood, Genre } from '@audius/sdk'
import fs from 'fs'

const coverArtBuffer = fs.readFileSync('path/to/cover-art.png')
const trackBuffer = fs.readFileSync('path/to/track.mp3')

const { trackId } = await audiusSdk.tracks.uploadTrack({
  userId: '7eP5n',
  coverArtFile: {
    buffer: Buffer.from(coverArtBuffer),
    name: 'coverArt',
  },
  metadata: {
    title: 'Monstera',
    description: 'Dedicated to my favorite plant',
    genre: Genre.METAL,
    mood: Mood.DEVOTIONAL,
  },
  trackFile: {
    buffer: Buffer.from(trackArtBuffer),
    name: 'monsteraAudio',
  },
})
```

#### `parameters`

Create an object with the following fields and pass it as the first argument, as shown in the
example above.

| Name           | Type                                                     | Description                                                             | Required?    |
| :------------- | :------------------------------------------------------- | :---------------------------------------------------------------------- | :----------- |
| `coverArtFile` | `File`                                                   | A file that will be used as the cover art for the track                 | _Optional_   |
| `metadata`     | [`UploadTrackMetadata`](/developers/UploadTrackMetadata) | An object containing the details of the track                           | **Required** |
| `onProgress`   | `(progress: number) => void`                             | A function that will be called with progress events as the files upload | _Optional_   |
| `trackFile`    | `File`                                                   | The audio file of the track                                             | **Required** |
| `userId`       | `string`                                                 | The ID of the user                                                      | **Required** |

#### `advancedOptions`

You can pass an optional [`advancedOptions`](/developers/advancedOptions) object as the second
argument.

#### Returns

Returns a `Promise` containing an object with the new track's ID (`trackId`), as well as the block
hash (`blockHash`) and block number (`blockNumber`) for the transaction.

Return type:

```ts
Promise<{
  blockHash: string
  blockNumber: number
  trackId: string
}>
```

---

### updateTrack

#### updateTrack(`params`, `advancedOptions?`)

Update a track. If cover art or any metadata fields are not provided, their values will be kept the
same as before.

Example:

```typescript
import fs from 'fs'
import { Mood } from '@audius/sdk'

const coverArtBuffer = fs.readFileSync('path/to/updated-cover-art.png')

const { trackId } = await audiusSdk.tracks.updateTrack({
  trackId: 'h5pJ3Bz',
  coverArtFile: {
    buffer: Buffer.from(coverArtBuffer),
    name: 'coverArt',
  },
  metadata: {
    description: 'Dedicated to my favorite plant... new cover art!',
    mood: Mood.YEARNING,
  },
  onProgress: (progress) => {
    console.log('Progress: ', progress / 100)
  },
  userId: '7eP5n',
})
```

#### `params`

Create an object with the following fields and pass it as the first argument, as shown in the
example above.

| Name           | Type                                                                  | Description                                                                   | Required?    |
| :------------- | :-------------------------------------------------------------------- | :---------------------------------------------------------------------------- | :----------- |
| `trackId`      | `string`                                                              | The ID of the track                                                           | **Required** |
| `userId`       | `string`                                                              | The ID of the user                                                            | **Required** |
| `coverArtFile` | `File`                                                                | A file that will be used as the cover art for the track                       | _Optional_   |
| `metadata`     | `Partial<`[`UploadTrackMetadata`](/developers/UploadTrackMetadata)`>` | An object containing the details of the track                                 | **Required** |
| `onProgress`   | `(progress: number) => void`                                          | A function that will be called with progress events as the image file uploads | _Optional_   |

#### `advancedOptions`

You can pass an optional [`advancedOptions`](/developers/advancedOptions) object as the second
argument.

#### Returns

Returns a `Promise` containing an object with the block hash (`blockHash`) and block number
(`blockNumber`) for the transaction.

Return type:

```ts
Promise<{
  blockHash: string
  blockNumber: number
}>
```

---

### deleteTrack

#### deleteTrack(`params`, `advancedOptions?`)

Delete a track

Example:

```typescript
await audiusSdk.tracks.deleteTrack({
  trackId: 'h5pJ3Bz',
  userId: '7eP5n',
})
```

#### `params`

Create an object with the following fields and pass it as the first argument, as shown in the
example above.

| Name      | Type     | Description         | Required?    |
| :-------- | :------- | :------------------ | :----------- |
| `trackId` | `string` | The ID of the track | **Required** |
| `userId`  | `string` | The ID of the user  | **Required** |

#### `advancedOptions`

You can pass an optional [`advancedOptions`](/developers/advancedOptions) object as the second
argument.

#### Returns

Returns a `Promise` containing an object with the block hash (`blockHash`) and block number
(`blockNumber`) for the transaction.

Return type:

```ts
Promise<{
  blockHash: string
  blockNumber: number
}>
```

---

### favoriteTrack

#### favoriteTrack(`params`, `advancedOptions?`)

Favorite a track

Example:

```typescript
await audiusSdk.tracks.favoriteTrack({
  trackId: 'x5pJ3Az'
  userId: "7eP5n",
});
```

#### `params`

Create an object with the following fields and pass it as the first argument, as shown in the
example above.

| Name       | Type                    | Description                                                          | Required?    |
| :--------- | :---------------------- | :------------------------------------------------------------------- | :----------- |
| `trackId`  | `string`                | The ID of the track                                                  | **Required** |
| `userId`   | `string`                | The ID of the user                                                   | **Required** |
| `metadata` | _see code sample below_ | Set `isSaveOfRepost` to true if you are favoriting a reposted track. | _Optional_   |

```json
{
  isSaveOfRepost: boolean
}
```

#### `advancedOptions`

You can pass an optional [`advancedOptions`](/developers/advancedOptions) object as the second
argument.

#### Returns

Returns a `Promise` containing an object with the block hash (`blockHash`) and block number
(`blockNumber`) for the transaction.

Return type:

```ts
Promise<{
  blockHash: string
  blockNumber: number
}>
```

---

### unfavoriteTrack

#### unfavoriteTrack(`params`, `advancedOptions?`)

Unfavorite a track

Example:

```typescript
await audiusSdk.tracks.unfavoriteTrack({
  trackId: 'x5pJ3Az'
  userId: "7eP5n",
});
```

#### `params`

Create an object with the following fields and pass it as the first argument, as shown in the
example above.

| Name      | Type     | Description         | Required?    |
| :-------- | :------- | :------------------ | :----------- |
| `trackId` | `string` | The ID of the track | **Required** |
| `userId`  | `string` | The ID of the user  | **Required** |

#### `advancedOptions`

You can pass an optional [`advancedOptions`](/developers/advancedOptions) object as the second
argument.

#### Returns

Returns a `Promise` containing an object with the block hash (`blockHash`) and block number
(`blockNumber`) for the transaction.

Return type:

```ts
Promise<{
  blockHash: string
  blockNumber: number
}>
```

---

### repostTrack

#### repostTrack(`params`, `advancedOptions?`)

Repost a track

Example:

```typescript
await audiusSdk.tracks.repostTrack({
  trackId: 'x5pJ3Az'
  userId: "7eP5n",
});
```

#### `params`

Create an object with the following fields and pass it as the first argument, as shown in the
example above.

| Name       | Type                    | Description                                                           | Required?    |
| :--------- | :---------------------- | :-------------------------------------------------------------------- | :----------- |
| `trackId`  | `string`                | The ID of the track                                                   | **Required** |
| `userId`   | `string`                | The ID of the user                                                    | **Required** |
| `metadata` | _see code sample below_ | Set `isRepostOfRepost` to true if you are reposting a reposted track. | _Optional_   |

```json
{
  isRepostOfRepost: boolean
}
```

#### `advancedOptions`

You can pass an optional [`advancedOptions`](/developers/advancedOptions) object as the second
argument.

#### Returns

Returns a `Promise` containing an object with the block hash (`blockHash`) and block number
(`blockNumber`) for the transaction.

Return type:

```ts
Promise<{
  blockHash: string
  blockNumber: number
}>
```

---

### unrepostTrack

#### unrepostTrack(`params`, `advancedOptions?`)

Unrepost a track

Example:

```typescript
await audiusSdk.tracks.unrepostTrack({
  trackId: 'x5pJ3Az'
  userId: "7eP5n",
});
```

#### `params`

Create an object with the following fields and pass it as the first argument, as shown in the
example above.

| Name      | Type     | Description         | Required?    |
| :-------- | :------- | :------------------ | :----------- |
| `trackId` | `string` | The ID of the track | **Required** |
| `userId`  | `string` | The ID of the user  | **Required** |

#### `advancedOptions`

You can pass an optional [`advancedOptions`](/developers/advancedOptions) object as the second
argument.

#### Returns

Returns a `Promise` containing an object with the block hash (`blockHash`) and block number
(`blockNumber`) for the transaction.

Return type:

```ts
Promise<{
  blockHash: string
  blockNumber: number
}>
```

---
