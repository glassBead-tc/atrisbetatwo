import { apiLogger } from '../../../logger';

export function parseQuery(query: string): { type: string, title: string | null, artist: string | null, limit?: number | null } {
  apiLogger.debug(`Parsing query: "${query}"`);
  const patterns = {
    genre: /What genre is ['"]?(.*?)['"]? by (.*?)\??$/i,
    genreAlt: /(?:genre|style) of ['"]?(.*?)['"]? by (.*?)/i,
    performer: /Who performed ['"]?(.*?)['"]?\??$/i,
    plays: /How many plays does ['"]?(.*?)['"]? by (.*?) have\??$/i,
    trending: /What( are the top| is trending)?\s*(\d+)?\s*(tracks|playlists)/i,
    search: /(?:search for|find)(?: a)? (track|playlist|user)(?: called| named)? ['"]?(.*?)['"]?/i,
    mostFollowers: /Who (?:is|are) the (?:artist|artists) with the most followers/i,
    latestReleases: /What are the latest releases/i,
    trendingGenres: /What genres are trending/i,
    trendingTracks: /What (?:tracks|songs) are trending/i,
    topArtists: /Who are the top (\d+)? ?most followed artists/i,
    trendingArtists: /(?:who|which) (?:are|is) (?:the )?(?:most )?(?:trending|popular) artists/i,
    artistsByGenre: /(?:who are|show me) (?:the )?(?:top|trending|popular) artists in ([\w\s]+)/i
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    const match = query.match(pattern);
    if (match) {
      switch (type) {
        case 'genre':
        case 'genreAlt':
          return { type: 'genre', title: match[1], artist: match[2], limit: null };
        case 'plays':
          return { type, title: match[1], artist: match[2], limit: null };
        case 'performer':
          return { type, title: match[1], artist: null, limit: null };
        case 'trending':
          return { type: 'topTracks', title: match[3], artist: null, limit: match[2] ? parseInt(match[2]) : null };
        case 'search':
          return { type: `search_${match[1]}`, title: match[2], artist: null, limit: null };
        case 'mostFollowers':
          return { type: 'mostFollowers', title: null, artist: null, limit: null };
        case 'latestReleases':
          return { type: 'latestReleases', title: null, artist: null, limit: null };
        case 'trendingGenres':
          return { type: 'trendingGenres', title: null, artist: null, limit: null };
        case 'trendingTracks':
          return { type: 'topTracks', title: 'tracks', artist: null, limit: null };
        case 'topArtists':
          return { type: 'mostFollowers', title: null, artist: null, limit: match[1] ? parseInt(match[1]) : 5 };
        case 'trendingArtists':
        case 'artistsByGenre':
          return { 
            type: 'trending_artists', 
            title: null, 
            artist: null, 
            limit: match[1] ? parseInt(match[1]) : 10 
          };
        case 'risingArtists':
          return { 
            type: 'rising_artists', 
            title: null, 
            artist: null, 
            limit: 10 
          };
      }
    }
  }

  // If no pattern matches, try to extract a category
  const categoryMatch = query.match(/what.*?(tracks?|playlists?|users?|artists?)/i);
  if (categoryMatch) {
    return { type: categoryMatch[1].toLowerCase(), title: null, artist: null, limit: null };
  }

  return { type: 'unknown', title: null, artist: null, limit: null };
}

// ... (rest of the file remains unchanged)
