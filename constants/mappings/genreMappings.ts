import { Genre } from '@audius/sdk';

export { Genre };

export const ELECTRONIC_SUBGENRES = [
  'Techno',
  'Trap',
  'House',
  'Tech House',
  'Deep House',
  'Disco',
  'Electro',
  'Jungle',
  'Progressive House',
  'Hardstyle',
  'Glitch Hop',
  'Trance',
  'Future Bass',
  'Future House',
  'Tropical House',
  'Downtempo',
  'Drum & Bass',
  'Dubstep',
  'Jersey Club',
  'Vaporwave',
  'Moombahton'
] as const;

export const HOUSE_SUBGENRES = [
  'House',
  'Tech House',
  'Deep House',
  'Progressive House',
  'Future House',
  'Tropical House'
] as const;

export const SOMETIMES_ELECTRONIC = [
  'Hyperpop',
  'Dancehall',
  'Ambient',
  'Experimental',
  'Lo-Fi'
] as const;

export const GENRE_MAPPINGS = {
  'All Genres': ['all', 'everything', 'any'],
  'Hip-Hop/Rap': ['hip hop', 'hip-hop', 'rap', 'hiphop'],
  'Electronic': ['electronic', 'edm', 'electronica', ...ELECTRONIC_SUBGENRES.map(genre => genre.toLowerCase())],
  'Rock': ['rock', 'alternative rock', 'indie rock'],
  'Metal': ['metal', 'heavy metal', 'metallic'],
  'Pop': ['pop', 'popular'],
  'R&B/Soul': ['r&b', 'rnb', 'soul', 'rhythm and blues'],
  'Jazz': ['jazz', 'jazzy'],
  'Drum & Bass': ['drum and bass', 'drum & bass', 'dnb', 'd&b', 'jungle', 'liquid'],
  'House': ['house'],
  'Deep House': ['deep house'],
  'Tech House': ['tech house'],
  'Techno': ['techno'],
  'Trap': ['trap'],
  'Dubstep': ['dubstep'],
  'Alternative': ['alternative', 'alt', 'indie'],
  'Classical': ['classical', 'orchestra', 'orchestral'],
  'Ambient': ['ambient', 'atmospheric', 'background'],
  'World': ['world music', 'world', 'international'],
  'Progressive House': ['progressive house'],
  'Future Bass': ['future bass'],
  'Future House': ['future house'],
  'Tropical House': ['tropical house'],
  'Hardstyle': ['hardstyle'],
  'Glitch Hop': ['glitch hop'],
  'Trance': ['trance'],
  'Downtempo': ['downtempo'],
  'Jersey Club': ['jersey club'],
  'Vaporwave': ['vaporwave'],
  'Moombahton': ['moombahton'],
  'Disco': ['disco'],
  'Electro': ['electro'],
  'Jungle': ['jungle'],
  'Experimental': ['experimental', 'avant garde', 'avant-garde', 'weird'],
  'Punk': ['punk', 'punk rock'],
  'Folk': ['folk', 'folk music', 'traditional'],
  'Soundtrack': ['soundtrack', 'score', 'film music', 'movie music'],
  'Acoustic': ['acoustic', 'unplugged'],
  'Funk': ['funk', 'funky'],
  'Devotional': ['devotional', 'spiritual', 'religious', 'sacred', 'worship', 
    'christian', 'christianity', 'gospel', 'hymn', 'hymnal',
    'muslim', 'islam', 'islamic', 'quran', 'nasheed',
    'jewish', 'judaism', 'hebrew', 'synagogue',
    'hindu', 'hinduism', 'bhajan', 'kirtan',
    'buddhist', 'buddhism', 'meditation', 'mantra',
    'sikh', 'sikhism', 'gurbani', 'shabad',
    'pagan', 'wiccan', 'new age'],
  'Reggae': ['reggae', 'ska'],
  'Podcasts': ['podcast', 'podcasts', 'talk', 'host'],
  'Country': ['country', 'country music', 'western'],
  'Spoken Word': ['spoken word', 'poetry', 'speech'],
  'Comedy': ['comedy', 'funny', 'humorous'],
  'Blues': ['blues', 'bluesy'],
  'Kids': ['kids', 'children', 'family'],
  'Audiobooks': ['audiobook', 'audiobooks', 'book', 'reading', 'narrator', 'author'],
  'Latin': ['latin', 'latino', 'latina'],
  'Lo-Fi': ['lo-fi', 'lofi', 'low fidelity'],
  'Hyperpop': ['hyperpop', 'hyper pop', 'pc music'],
  'Dancehall': ['dancehall', 'dance hall']
} as const;

export type AudiusGenre = keyof typeof GENRE_MAPPINGS;
