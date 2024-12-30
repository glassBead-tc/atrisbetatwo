---
title: "Interface: UploadTrackMetadata"
---

# **`interface`** UploadTrackMetadata

Contains required and optional fields for uploading a track.

## Properties

```typescript
{
  // Required fields:
  title: string;
  genre: Genre; // Can import `Genre` enum from @audius/sdk


  // Optional fields:
  description?: string;
  mood?: Mood; // Can import `Mood` enum from @audius/sdk
  releaseDate?: Date; // Should not be in the future. Defaults to today's date.
  tags?: string; // Comma separated list of tags
  remixOf?: { tracks: Array<{ parentTrackId: string }> }; // For specifying the track(s) that your track is a remix of
  aiAttributionUserId?: string; // Audius user ID of the artist whom your AI-generated track was trained on. Note: Only artists who have opted into AI attribution can be used.
  isStreamGated?: boolean; // Whether streaming your track is only available to users who meet certain criteria, which must be specified by `streamConditions`.
  streamConditions?: AccessConditions; // See "Specifying Stream Conditions" section below
  isDownloadGated?: boolean; // Whether downloading your track is only available to users who meet certain criteria, which must be specified by `downloadConditions`. Note that stream gated tracks are automatically download gated, whereas the reverse is not true.
  downloadConditions?: AccessConditions;
  isUnlisted?: boolean; // If set to true, only users with a link to your track will be able to listen, and your track will not show up in your profile or in any feed. Defaults to false.
  fieldVisibility?: {
    mood?: boolean;
    tags?: boolean;
    genre?: boolean;
    share?: boolean;
    playCount?: boolean;
    remixes?: boolean;
  }; // For specifying which fields/features are visible on a hidden track. Only applicable if `isUnlisted` is set to true. All default to true.
  isrc?: string; // International Standard Recording Code
  iswc?: string // International Standard Musical Word Code
  license?: string; // License type, e.g. Attribution-NonCommercial-ShareAlike CC BY-NC-SA
}
```

## Example with all fields specified

```typescript
import { Mood, Genre } from "@audius/sdk";
import fs from "fs";

const coverArtBuffer = fs.readFileSync("path/to/cover-art.png");
const trackBuffer = fs.readFileSync("path/to/track.mp3");

const { trackId } = await audiusSdk.tracks.uploadTrack({
  userId: "7eP5n",
  coverArtFile: {
    buffer: Buffer.from(coverArtBuffer),
    name: "coverArt",
  },
  metadata: {
    title: "Monstera",
    genre: Genre.METAL,

    // Optional metadata:
    description: "Dedicated to my favorite plant",
    mood: Mood.DEVOTIONAL,
    releaseDate: new Date("2022-09-30"),
    tags: "plantlife,love,monstera",
    remixOf: { tracks: [{ parentTrackId: "KVx2xpO" }] },
    aiAttributionUserId: "3aE1p",
    isStreamGated: true,
    streamConditions: {
      tipUserId: "7eP5n", // Require tipping user to unlock track
    },
    isUnlisted: true,
    fieldVisibility: {
      mood: true,
      tags: true,
      genre: true,
      share: false,
      playCount: false,
      remixes: true,
    },
    isrc: "USAT21812345",
    iswc: "T-123.456.789-0",
    license: "Attribution-NonCommercial-ShareAlike CC BY-NC-SA",
  },
  trackFile: {
    buffer: Buffer.from(trackArtBuffer),
    name: "monsteraAudio",
  },
});
```

## Specifying Stream Conditions

Use the `AccessConditions` field to specify the criteria required to unlock a track.

### Tip-gated

Require the listener to tip the artist to unlock the track.

#### Example

```typescript
const { trackId } = await audiusSdk.tracks.uploadTrack({
  // ...
  metadata: {
    // ...
    isStreamGated: true,
    streamConditions: {
      tipUserId: "7eP5n", // Require tipping user with user ID "7eP5n" to unlock track
    },
  },
});
```

### Follow-gated

Require the listener to follow the artist to unlock the track.

#### Example

```typescript
const { trackId } = await audiusSdk.tracks.uploadTrack({
  // ...
  metadata: {
    // ...
    isStreamGated: true,
    streamConditions: {
      followUserId: "7eP5n", // Require following user with user ID "7eP5n" to unlock track
    },
  },
});
```

### NFT-gated

Require the listener to hold an Ethereum or Solana NFT to unlock the track.

#### Ethereum NFT example

```typescript
const { trackId } = await audiusSdk.tracks.uploadTrack({
  // ...
  metadata: {
    // ...
    isStreamGated: true,
    streamConditions: {
      chain: "eth",
      address: "0xAbCdEfGhIjKlMnOpQrStUvWxYz", // The Ethereum address of the NFT contract
      standard: "ERC-721", // The standard followed by the NFT - either "ERC-721" or "ERC-1155"
      name: "Example NFT", // The name of the NFT
      slug: "example-nft", // The slug of the NFT collection. E.g. if your collection is located at https://opensea.io/collection/example-nft, the slug is "example-nft".
      imageUrl: "https://www.example.com/nft-image.png", // Optional: URL to the image representing the NFT
      externalLink: "https://www.example.com/nft-details", // Optional: URL to an external resource providing more details about the NFT
    },
  },
});
```

#### Solana NFT example

```typescript
const { trackId } = await audiusSdk.tracks.uploadTrack({
  // ...
  metadata: {
    // ...
    isStreamGated: true,
    streamConditions: {
      chain: "sol",
      address: "ABCDEF1234567890", // The address of the NFT on the Solana blockchain
      name: "Example NFT", // The name of the NFT
      imageUrl: "https://www.example.com/nft-image.png", // Optional: URL to the image representing the NFT
      externalLink: "https://www.example.com/nft-details", // Optional: URL to an external resource providing more details about the NFT
    },
  },
});
```
