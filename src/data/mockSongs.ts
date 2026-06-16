import { Track } from "../types";

export const SAMPLE_TRACKS: Omit<Track, "createdAt">[] = [
  {
    id: "soundhelix-1",
    title: "Synthwaves of Tomorrow",
    artist: "Alex Horizon",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=85",
    duration: 372,
    genre: "Electronic",
    description: "An immersive retro-futuristic synthwave excursion filled with sweeping filter pads, arpeggiated basslines, and electronic nostalgia.",
    lyrics: "[Instrumental - 80s Synthesizer Solo]\n\n[Verse 1]\nDrifting through the neon lights\nIn the city of a thousand nights\nSpeeding down the highway line\nWe are running out of time\n\n[Chorus]\nOh, synthwaves are calling tomorrow\nWash away all of your sorrow\nElectronic hearts beating high\nUnderneath the cosmic sky\n\n[Instrumental Outro]",
    plays: 1245,
    likesCount: 88,
    sharesCount: 15,
    uploadedBy: "system-admin"
  },
  {
    id: "soundhelix-2",
    title: "City Lights & Vinyl Beats",
    artist: "Lofi Theory",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=85",
    duration: 425,
    genre: "Lofi Hip-Hop",
    description: "Classic dusty vinyl crackle blended with soft piano loops and relaxed boom-bap rhythms. Perfect for study, work, or simple reflection.",
    lyrics: "[Chill Vinyl Static Sound]\n\n[Mellow Piano Intro]\n\n[Verse 1]\nMidnight rain, taps on the room glass pane\nThinking 'bout standard things, washing away the pain\nWrite another page in the notebook line\nEverything changes, everything's fine\n\n[Chorus]\nChasing after city lights, vinyl beats through golden nights\nNothing feels as sweet as this relaxed flow\nTurn the dial down, let the record rotate slow\n\n[Chill Saxophone Improvisation]",
    plays: 3820,
    likesCount: 295,
    sharesCount: 54,
    uploadedBy: "system-admin"
  },
  {
    id: "soundhelix-3",
    title: "Stage Horizon Glow",
    artist: "Echo & The Waves",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=85",
    duration: 344,
    genre: "Indie Rock",
    description: "Energetic arena sound capturing the feeling of live performance lights, driving rhythm guitars, and soaring emotional choruses.",
    lyrics: "[Drum Roll - Guitar feedback intro]\n\n[Verse 1]\nStep on the floor, count one to four\nYou hear the rumble shaking the doors\nTen thousand lights, one single sound\nWe're leaving our footprints in the ground\n\n[Chorus]\nOh, under the horizontal glow\nLet the sonic currents capture you slow\nWe roar to the heavens, we dive in the deep\nThis is a memory we intend to keep\n\n[High Energy Guitar Solo]",
    plays: 890,
    likesCount: 42,
    sharesCount: 8,
    uploadedBy: "system-admin"
  },
  {
    id: "soundhelix-4",
    title: "Vaporwave Memories",
    artist: "Sunset Mall 1989",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=85",
    duration: 302,
    genre: "Vaporwave",
    description: "Chopped, slowed, and echo-drenched retro mall muzak. Transport yourself back to a consumerist paradise that never truly existed.",
    lyrics: "[Slowed Vocal Sample Loop: 'Welcome to the sunset oasis parlor...']\n\n[Verse 1]\nGlazing statues in the shopping hall\nNeon pink posters on the concrete wall\nSipping cold soda from a plastic cup\nElevator music never giving up\n\n[Chorus]\nDreaming in digital, memory frames\nWe are only characters inside computer games\nFloating in a slow-motion virtual lake\nEvery promise is beautifully fake\n\n[Chopped and Screwed sax loop]",
    plays: 2310,
    likesCount: 167,
    sharesCount: 32,
    uploadedBy: "system-admin"
  },
  {
    id: "soundhelix-8",
    title: "Midnight Drive Bassline",
    artist: "Subwoofer Club",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=85",
    duration: 518,
    genre: "Deep House",
    description: "Deep, hypnotic bassline with punchy 4-on-the-floor kick drums and soul-stirring vocal samples designed strictly for late night highway cruising.",
    lyrics: "[Hypnotic Kick Drum Loop]\n\n[Repeated Vocal Hook]\n'Gotta let your spirit move to the drum...\nFeel the bass vibrate before you are numb...'\n\n[Verse 1]\nFour AM, empty cruise\nNothing left to win or lose\nFollow down the yellow bars\nDriving with the speed of stars\n\n[Vocal Build-up]\nLet the tempo rise...\nLook into my cybernetic eyes...\n\n[The Bass Drops! Heavy club groove]",
    plays: 4012,
    likesCount: 341,
    sharesCount: 89,
    uploadedBy: "system-admin"
  }
];

export const GENRES = [
  "All",
  "Electronic",
  "Lofi Hip-Hop",
  "Indie Rock",
  "Vaporwave",
  "Deep House",
  "Hip-Hop",
  "Afrobeats",
  "R&B",
  "Soca",
  "Reggae",
  "Pop"
];
