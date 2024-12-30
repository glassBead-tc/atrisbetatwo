import { Mood } from '@audius/sdk';

export { Mood };

export const CALM_MOODS = [
  'Peaceful',
  'Tender',
  'Easygoing',
  'Sophisticated',
  'Melancholy',
  'Brooding',
  'Sentimental',
  'Yearning'
] as const;

export const NEUTRAL_MIXED_MOODS = [
  'Romantic',
  'Sensual',
  'Cool',
  'Serious',
  'Gritty',
  'Stirring',
  'Other'
] as const;

export const ENERGETIC_MOODS = [
  'Excited',
  'Energizing',
  'Empowering',
  'Fiery',
  'Defiant',
  'Aggressive',
  'Rowdy',
  'Upbeat'
] as const;

export const MOOD_MAPPINGS = {
  'Peaceful': ['peaceful', 'calm', 'serene', 'tranquil', 'gentle', 'quiet', 'relaxing', 'zen'],
  'Romantic': ['romantic', 'love', 'passion', 'intimate', 'affectionate', 'lovely', 'sweet', 'romance'],
  'Sentimental': ['sentimental', 'nostalgic', 'emotional', 'heartfelt', 'memories', 'feels', 'touching'],
  'Tender': ['tender', 'soft', 'delicate', 'sweet', 'gentle', 'warm', 'kind'],
  'Easygoing': ['easygoing', 'laid back', 'relaxed', 'casual', 'chill', 'mellow', 'lowkey', 'vibing', 'easy'],
  'Yearning': ['yearning', 'longing', 'desire', 'wistful', 'wanting', 'missing', 'need'],
  'Sophisticated': ['sophisticated', 'elegant', 'refined', 'polished', 'fancy', 'classy', 'smart'],
  'Sensual': ['sensual', 'sultry', 'seductive', 'sexy', 'intimate', 'steamy', 'hot'],
  'Cool': ['cool', 'smooth', 'suave', 'hip', 'slick', 'fresh', 'dope'],
  'Gritty': ['gritty', 'raw', 'rough', 'harsh', 'dirty', 'tough', 'hard'],
  'Melancholy': ['melancholy', 'sad', 'blue', 'sorrowful', 'somber', 'depressed', 'down', 'unhappy', 'sadness'],
  'Serious': ['serious', 'intense', 'profound', 'deep', 'heavy', 'real', 'truth'],
  'Brooding': ['brooding', 'dark', 'moody', 'contemplative', 'gloomy', 'thoughtful', 'depression'],
  'Fiery': ['fiery', 'passionate', 'intense', 'burning', 'hot', 'angry', 'mad', 'heated'],
  'Defiant': ['defiant', 'rebellious', 'resistant', 'bold', 'rebel', 'fighting', 'protest'],
  'Aggressive': ['aggressive', 'fierce', 'forceful', 'intense', 'angry', 'mad', 'fired up', 'rage'],
  'Rowdy': ['rowdy', 'wild', 'boisterous', 'unruly', 'crazy', 'loud', 'party', 'hype'],
  'Excited': ['excited', 'thrilled', 'enthusiastic', 'eager', 'happy', 'stoked', 'pumped', 'psyched'],
  'Energizing': ['energizing', 'invigorating', 'stimulating', 'dynamic', 'pumped', 'hyped', 'energy', 'power'],
  'Empowering': ['empowering', 'strong', 'confident', 'inspiring', 'motivated', 'powerful', 'strength'],
  'Stirring': ['stirring', 'moving', 'touching', 'rousing', 'powerful', 'deep', 'feels'],
  'Upbeat': ['upbeat', 'cheerful', 'positive', 'optimistic', 'happy', 'fun', 'good vibes', 'joy'],
  'Other': ['other', 'different', 'unique', 'miscellaneous', 'random', 'special', 'various']
} as const;

export type AudiusMood = keyof typeof MOOD_MAPPINGS;
