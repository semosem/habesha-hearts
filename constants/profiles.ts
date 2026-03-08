export type Profile = {
  id: string;
  name: string;
  age: number;
  city: string;
  bio: string;
  interests: string[];
  vibe: string;
  photoUrls?: string[];
  intent?: 'Dating' | 'Long term' | 'Friendship';
  distanceKm?: number;
};

export const profiles: Profile[] = [
  {
    id: '1',
    name: 'Lily Tesfaye',
    age: 27,
    city: 'Addis Ababa',
    bio: 'Coffee ceremony lover, weekend hiker, curious about tech + film.',
    interests: ['Buna', 'Film nights', 'Entoto hikes'],
    vibe: '#7AD7F0',
    photoUrls: ['https://randomuser.me/api/portraits/women/65.jpg'],
    intent: 'Dating',
    distanceKm: 3
  },
  {
    id: '2',
    name: 'Mikyas Bekele',
    age: 29,
    city: 'Bahir Dar',
    bio: 'Sunrise runner by the lake, jazz vinyl collector, foodie.',
    interests: ['Jazz', '5k runs', 'Injera perfection'],
    vibe: '#F7B267',
    photoUrls: ['https://randomuser.me/api/portraits/men/43.jpg'],
    intent: 'Long term',
    distanceKm: 10
  },
  {
    id: '3',
    name: 'Selam Haile',
    age: 25,
    city: 'Adama',
    bio: 'Designer who sketches cafés. Let’s trade playlists and stories.',
    interests: ['Design', 'Playlists', 'Travel'],
    vibe: '#C792E9',
    photoUrls: ['https://randomuser.me/api/portraits/women/47.jpg'],
    intent: 'Dating',
    distanceKm: 45
  },
  {
    id: '4',
    name: 'Yonatan Mulu',
    age: 31,
    city: 'Hawassa',
    bio: 'Cyclist, amateur chef, always planning the next road trip.',
    interests: ['Cycling', 'Cooking', 'Road trips'],
    vibe: '#7EE38F',
    photoUrls: ['https://randomuser.me/api/portraits/men/59.jpg'],
    intent: 'Long term',
    distanceKm: 25
  },
  {
    id: '5',
    name: 'Rahel Worku',
    age: 26,
    city: 'Mekelle',
    bio: 'Book club host, photography on film, stargazer.',
    interests: ['Books', 'Film photos', 'Stargazing'],
    vibe: '#FF9AA2',
    photoUrls: ['https://randomuser.me/api/portraits/women/68.jpg'],
    intent: 'Long term',
    distanceKm: 120
  },
  {
    id: '6',
    name: 'Kalkidan Fikru',
    age: 28,
    city: 'Gondar',
    bio: 'History buff & museum crawler. Brunch + conversations.',
    interests: ['History', 'Brunch', 'Museums'],
    vibe: '#6DD3B6',
    photoUrls: ['https://randomuser.me/api/portraits/women/42.jpg'],
    intent: 'Dating',
    distanceKm: 90
  },
  {
    id: '7',
    name: 'Nahom Samuel',
    age: 30,
    city: 'Dire Dawa',
    bio: 'Engineer by day, salsa learner by night. Coffee is non‑negotiable.',
    interests: ['Salsa', 'Coffee', 'Tech'],
    vibe: '#FFD166',
    photoUrls: ['https://randomuser.me/api/portraits/men/34.jpg'],
    intent: 'Friendship',
    distanceKm: 35
  },
  {
    id: '8',
    name: 'Sosina Dawit',
    age: 24,
    city: 'Addis Ababa',
    bio: 'Writer, podcast addict, city walker. Looking for story swaps.',
    interests: ['Writing', 'Podcasts', 'City walks'],
    vibe: '#9BBDF9',
    photoUrls: ['https://randomuser.me/api/portraits/women/52.jpg'],
    intent: 'Dating',
    distanceKm: 5
  }
];
