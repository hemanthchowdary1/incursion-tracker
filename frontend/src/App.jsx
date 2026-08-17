import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import axios from 'axios';
import AuthGateway from './components/AuthGateway';
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Chakra+Petch:wght@400;600;700&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500&family=Orbitron:wght@700&family=Space+Grotesk:wght@500&display=swap');
    
    html, body {
      background-color: #050706;
      margin: 0;
      padding: 0;
      -webkit-overflow-scrolling: touch;
    }

    #root {
    min-height: 100dvh;
    }

    * { 
      -webkit-font-smoothing: antialiased; 
    }

    ::selection { background: rgba(70,255,150,0.25); }
    
    @keyframes scan {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    @keyframes pulseGlow {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
    
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      opacity: 0;
    }
    .delay-100 { animation-delay: 100ms; }
    .delay-200 { animation-delay: 200ms; }
    .delay-300 { animation-delay: 300ms; }
    .delay-400 { animation-delay: 400ms; }
    
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
}
    @keyframes timeline-glitch {
      0%, 100% { transform: translate(0); opacity: 1; }
      2% { transform: translate(-2px, 1px); opacity: 0.8; }
      4% { transform: translate(2px, -1px); opacity: 0.9; }
      6% { transform: translate(0); opacity: 1; }
      50% { transform: translate(0); opacity: 1; }
      52% { transform: translate(1px, 2px); opacity: 0.7; }
      54% { transform: translate(-1px, -2px); opacity: 1; }
      56% { transform: translate(0); opacity: 1; }
    }
    .animate-glitch {
      animation: timeline-glitch 4s ease-in-out infinite;
    }

    /* Full-gauntlet snap flash */
    @keyframes snapFlash {
      0% { opacity: 0; }
      8% { opacity: 1; }
      100% { opacity: 0; }
    }
    @keyframes shockwave {
      0% { transform: scale(0); opacity: 0.9; border-width: 6px; }
      100% { transform: scale(45); opacity: 0; border-width: 0px; }
    }

    /* Toast notifications */
    @keyframes toastIn {
      from { opacity: 0; transform: translateX(60px) scale(0.96); }
      to { opacity: 1; transform: translateX(0) scale(1); }
    }
    .animate-toast-in { animation: toastIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

    /* Terminal Cursor Blink */
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    .cursor-blink { 
      animation: blink 1s step-end infinite; 
      display: inline-block;
      width: 8px;
      height: 15px;
      background-color: rgb(52, 211, 153);
      vertical-align: middle;
      margin-left: 4px;
    }
  `}</style>
);

/* SAGA DEFINITIONS */

const SAGAS = [
  { 
    id: 'infinity', code: '01', name: 'Infinity Saga', tag: 'MCU · Phase 1–3', desc: 'Where it all converges from.',
    stone: 'Space Stone', 
    theme: { text: 'text-blue-400', border: 'border-blue-500/20 group-hover:border-blue-400/50', bg: 'bg-gradient-to-br from-blue-500/10 to-transparent', progress: 'bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.8)]', shadow: 'group-hover:shadow-[0_0_25px_rgba(59,130,246,0.15)]' }
  },
  { 
    id: 'multiverse', code: '02', name: 'Multiverse Saga', tag: 'MCU · Phase 4–6', desc: 'The cracks that let Doom in.',
    stone: 'Reality Stone', 
    theme: { text: 'text-red-500', border: 'border-red-500/20 group-hover:border-red-400/50', bg: 'bg-gradient-to-br from-red-500/10 to-transparent', progress: 'bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_12px_rgba(248,113,113,0.8)]', shadow: 'group-hover:shadow-[0_0_25px_rgba(239,68,68,0.15)]' }
  },
  { 
    id: 'mutant', code: '03', name: 'Mutant Saga', tag: 'X-Men Legacy', desc: 'The variant that started it.',
    stone: 'Mind Stone', 
    theme: { text: 'text-yellow-400', border: 'border-yellow-500/20 group-hover:border-yellow-400/50', bg: 'bg-gradient-to-br from-yellow-500/10 to-transparent', progress: 'bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.8)]', shadow: 'group-hover:shadow-[0_0_25px_rgba(234,179,8,0.15)]' }
  },
  { 
    id: 'defenders', code: '04', name: 'Defenders Saga', tag: 'Street-Level', desc: 'Ground-level stakes, same board.',
    stone: 'Power Stone', 
    theme: { text: 'text-purple-400', border: 'border-purple-500/20 group-hover:border-purple-400/50', bg: 'bg-gradient-to-br from-purple-500/10 to-transparent', progress: 'bg-gradient-to-r from-purple-600 to-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.8)]', shadow: 'group-hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]' }
  },
  { 
    id: 'spiderverse', code: '05', name: 'Spider-Verse', tag: 'Sony Universe', desc: 'Adjacent threads worth pulling.',
    stone: 'Time Stone', 
    theme: { text: 'text-emerald-400', border: 'border-emerald-500/20 group-hover:border-emerald-400/50', bg: 'bg-gradient-to-br from-emerald-500/10 to-transparent', progress: 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]', shadow: 'group-hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]' }
  },
  { 
    id: 'origins', code: '06', name: 'Origins & Precursors', tag: 'Early Marvel', desc: 'Where the multiverse got messy first.',
    stone: 'Soul Stone', 
    theme: { text: 'text-orange-400', border: 'border-orange-500/20 group-hover:border-orange-400/50', bg: 'bg-gradient-to-br from-orange-500/10 to-transparent', progress: 'bg-gradient-to-r from-orange-600 to-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.8)]', shadow: 'group-hover:shadow-[0_0_25px_rgba(249,115,22,0.15)]' }
  },
];

const AMBIENT_THEMES = {
  default:     { tint: 'bg-transparent',    blob1: 'bg-black/0',        blob2: 'bg-black/0' }, 
  infinity:    { tint: 'bg-purple-950/20',  blob1: 'bg-purple-600/15',  blob2: 'bg-amber-500/15' }, 
  multiverse:  { tint: 'bg-rose-950/20',    blob1: 'bg-red-600/15',     blob2: 'bg-emerald-600/20' }, 
  mutant:      { tint: 'bg-blue-950/30',    blob1: 'bg-yellow-500/20',  blob2: 'bg-blue-600/15' }, 
  defenders:   { tint: 'bg-red-950/20',     blob1: 'bg-red-700/25',     blob2: 'bg-purple-800/25' }, 
  spiderverse: { tint: 'bg-fuchsia-950/20', blob1: 'bg-red-500/25',     blob2: 'bg-blue-600/25' }, 
  origins: { tint: 'bg-orange-950/20',  blob1: 'bg-orange-500/20',  blob2: 'bg-blue-500/20' }, 
};

const GEM_COLORS = {
  infinity:    { from: '#2563eb', to: '#60a5fa', hex: '#60a5fa' }, // Space
  multiverse:  { from: '#dc2626', to: '#f87171', hex: '#f87171' }, // Reality
  mutant:      { from: '#ca8a04', to: '#facc15', hex: '#facc15' }, // Mind
  defenders:   { from: '#9333ea', to: '#c084fc', hex: '#c084fc' }, // Power
  spiderverse: { from: '#059669', to: '#34d399', hex: '#34d399' }, // Time
  origins:     { from: '#ea580c', to: '#fb923c', hex: '#fb923c' }, // Soul
};

/* MULTIVERSAL NEWS TICKER */

const NEWS_ITEMS = [
  'AVENGERS: DOOMSDAY LOCKS THEATRICAL RELEASE — DECEMBER 18, 2026',
  'RUSSO BROTHERS CONFIRMED TO DIRECT THE MULTIVERSE SAGA FINALE',
  'ROBERT DOWNEY JR. RETURNS AS VICTOR VON DOOM',
  'TVA CONFIRMS: SACRED TIMELINE BRANCH COUNT AT ALL-TIME HIGH',
  'FANTASTIC FOUR AND X-MEN VARIANTS CONFIRMED FOR THE COLLISION',
  'SECRET WARS TARGETED AS THE MULTIVERSE SAGA\'S FINAL CHAPTER',
];

/* CASE FILES */

const CAST = [
  { name: 'Robert Downey Jr.', role: 'Victor Von Doom / Iron Man', tag: 'Multiverse Saga', code: 'VAR-DOOM', imageUrl: '/cast/rdj.jpg' },
  { name: 'Pedro Pascal', role: 'Reed Richards', tag: 'Origins & Precursors', code: 'VAR-FF01', imageUrl: '/cast/pedro.jpg' },
  { name: 'Tom Holland', role: 'Peter Parker', tag: 'Spider-Verse', code: 'VAR-SPDR', imageUrl: '/cast/tom.jpg' },
  { name: 'Hugh Jackman', role: 'Logan', tag: 'Mutant Saga', code: 'VAR-WOLV', imageUrl: '/cast/hugh.jpg' },
  { name: 'Ryan Reynolds', role: 'Wade Wilson', tag: 'Mutant Saga', code: 'VAR-POOL', imageUrl: '/cast/ryan.jpg' },
  { name: 'Chris Evans', role: 'Steve Rogers', tag: 'Infinity Saga', code: 'VAR-CAP1', imageUrl: '/cast/evans.jpg' },
  { name: 'Chris Hemsworth', role: 'Thor Odinson', tag: 'Infinity Saga', code: 'VAR-THOR', imageUrl: '/cast/hemsworth.jpg' },
  { name: 'Scarlett Johansson', role: 'Natasha Romanoff', tag: 'Infinity Saga', code: 'VAR-WIDW', imageUrl: '/cast/scarlett.jpg' },
  { name: 'Mark Ruffalo', role: 'Bruce Banner', tag: 'Infinity Saga', code: 'VAR-HULK', imageUrl: '/cast/ruffalo.jpg' },
  { name: 'Elizabeth Olsen', role: 'Wanda Maximoff', tag: 'Multiverse Saga', code: 'VAR-SCAR', imageUrl: '/cast/elizabeth.jpg' },
  { name: 'Chadwick Boseman', role: "T'Challa", tag: 'Infinity Saga', code: 'VAR-PNTH', imageUrl: '/cast/boseman.jpg' },
  { name: 'Brie Larson', role: 'Carol Danvers', tag: 'Multiverse Saga', code: 'VAR-MARV', imageUrl: '/cast/larson.jpg' },
  { name: 'Chris Pratt', role: 'Peter Quill', tag: 'Infinity Saga', code: 'VAR-STAR', imageUrl: '/cast/pratt.jpg' },
  { name: 'Josh Brolin', role: 'Thanos', tag: 'Infinity Saga', code: 'VAR-THNS', imageUrl: '/cast/brolin.jpg' },
  { name: 'Zoe Saldaña', role: 'Gamora', tag: 'Infinity Saga', code: 'VAR-GAMO', imageUrl: '/cast/saldana.jpg' },
  { name: 'Samuel L. Jackson', role: 'Nick Fury', tag: 'Infinity Saga', code: 'VAR-FURY', imageUrl: '/cast/samuel.jpg' },
  { name: 'Paul Rudd', role: 'Scott Lang', tag: 'Multiverse Saga', code: 'VAR-ANTM', imageUrl: '/cast/rudd.jpg' },
  { name: 'Benedict Cumberbatch', role: 'Stephen Strange', tag: 'Multiverse Saga', code: 'VAR-STRG', imageUrl: '/cast/benedict.jpg' },
  { name: 'Anthony Mackie', role: 'Sam Wilson', tag: 'Multiverse Saga', code: 'VAR-CAP2', imageUrl: '/cast/mackie.jpg' },
  { name: 'Tom Hiddleston', role: 'Loki Laufeyson', tag: 'Multiverse Saga', code: 'VAR-LOKI', imageUrl: '/cast/hiddleston.jpg' },
  { name: 'Florence Pugh', role: 'Yelena Belova', tag: 'Multiverse Saga', code: 'VAR-YLNA', imageUrl: '/cast/florence.jpg' },
  { name: 'Simu Liu', role: 'Shang-Chi', tag: 'Multiverse Saga', code: 'VAR-SHNG', imageUrl: '/cast/simu.jpg' },
  { name: 'Letitia Wright', role: 'Shuri', tag: 'Multiverse Saga', code: 'VAR-SHUR', imageUrl: '/cast/wright.jpg' },
  { name: 'Sebastian Stan', role: 'Bucky Barnes', tag: 'Multiverse Saga', code: 'VAR-BUCK', imageUrl: '/cast/sebastian.jpg' },
  { name: 'Oscar Isaac', role: 'Marc Spector', tag: 'Multiverse Saga', code: 'VAR-MOON', imageUrl: '/cast/oscar.jpg' },
  { name: 'Kathryn Hahn', role: 'Agatha Harkness', tag: 'Multiverse Saga', code: 'VAR-AGTH', imageUrl: '/cast/hahn.jpg' },
  { name: 'Tobey Maguire', role: 'Peter Parker', tag: 'Spider-Verse', code: 'VAR-SPDR1', imageUrl: '/cast/tobey.jpg' },
  { name: 'Andrew Garfield', role: 'Peter Parker', tag: 'Spider-Verse', code: 'VAR-SPDR2', imageUrl: '/cast/andrew.jpg' },
  { name: 'Tom Hardy', role: 'Eddie Brock', tag: 'Spider-Verse', code: 'VAR-VENM', imageUrl: '/cast/hardy.jpg' },
  { name: 'Willem Dafoe', role: 'Norman Osborn', tag: 'Spider-Verse', code: 'VAR-GOBL', imageUrl: '/cast/dafoe.jpg' },
  { name: 'Charlie Cox', role: 'Matt Murdock', tag: 'Defenders Saga', code: 'VAR-DDVL', imageUrl: '/cast/charlie.jpg' },
  { name: 'Jon Bernthal', role: 'Frank Castle', tag: 'Defenders Saga', code: 'VAR-PUNS', imageUrl: '/cast/jon.jpg' },
  { name: 'Vanessa Kirby', role: 'Sue Storm', tag: 'Origins & Precursors', code: 'VAR-FF02', imageUrl: '/cast/vanessa.jpg' },
  { name: 'Joseph Quinn', role: 'Johnny Storm', tag: 'Origins & Precursors', code: 'VAR-FF03', imageUrl: '/cast/joseph.jpg' },
  { name: 'Ebon Moss-Bachrach', role: 'Ben Grimm', tag: 'Origins & Precursors', code: 'VAR-FF04', imageUrl: '/cast/ebon.jpg' },
  { name: 'Patrick Stewart', role: 'Professor X', tag: 'Mutant Saga', code: 'VAR-XAV1', imageUrl: '/cast/patrick.jpg' },
  { name: 'Ian McKellen', role: 'Magneto', tag: 'Mutant Saga', code: 'VAR-MAGN', imageUrl: '/cast/mckellen.jpg' },
  { name: 'Mahershala Ali', role: 'Eric Brooks', tag: 'Origins & Precursors', code: 'VAR-BLAD', imageUrl: '/cast/mahershala.jpg' },
];

/* TRANSMISSION LOG */

const MEDIA_ITEMS = [
  { id: 'f17J3AXVK5w', label: 'Doomsday Clock', kind: 'Trailer' },
];

/* DEMO DATA */

const DEMO_DATA = [
  // 1. LEGACY ERA (PRE-2008)
  { id: 99, title: 'Blade', sagas: ['origins'], importance: 'optional', meta: 'Marvel Legacy', why_watch_this: 'Half-vampire hunter Blade wages a brutal war against the vampire world while trying to stop the rise of a powerful blood god.', poster_url: '/posters/blade.webp' },
  { id: 60, title: 'X-Men', sagas: ['mutant'], importance: 'essential', meta: 'Fox Era', why_watch_this: 'Professor X assembles a team of mutants to protect humanity, while Magneto believes mutants should rise above humans. It establishes the core X-Men and the Fox universe whose legacy characters return in Avengers: Doomsday.', poster_url: '/posters/x-men.webp' },
  { id: 100, title: 'Blade II', sagas: ['origins'], importance: 'optional', meta: 'Marvel Legacy', why_watch_this: 'Blade reluctantly teams up with vampires to stop a new breed of creatures threatening both humans and vampires.', poster_url: '/posters/blade-ii.webp' },
  { id: 86, title: 'Spider-Man', sagas: ['spiderverse'], importance: 'essential', meta: 'Sony Legacy', why_watch_this: 'After being bitten by a genetically altered spider, Peter Parker becomes Spider-Man and faces the Green Goblin. It establishes the Raimi Spider-Man universe and one of Marvel’s most iconic alternate versions of Peter Parker.', poster_url: '/posters/spider-man.webp' },
  { id: 61, title: 'X2: X-Men United', sagas: ['mutant'], importance: 'essential', meta: 'Fox Era', why_watch_this: 'The X-Men are hunted by the government after an attack on the President, while Wolverine uncovers secrets about his past and the team fights a plan to eliminate mutants.', poster_url: '/posters/x2-x-men-united.webp' },
  { id: 87, title: 'Spider-Man 2', sagas: ['spiderverse'], importance: 'recommended', meta: 'Sony Legacy', why_watch_this: 'Peter Parker struggles with his life as Spider-Man while facing Doctor Octopus, forcing him to decide whether he can continue carrying the responsibility of being a hero.', poster_url: '/posters/spider-man-2.webp' },
  { id: 101, title: 'Blade: Trinity', sagas: ['origins'], importance: 'optional', meta: 'Marvel Legacy', why_watch_this: 'Blade joins forces with a new generation of vampire hunters to stop Dracula, the original vampire, from taking control of the vampire world.', poster_url: '/posters/blade-trinity.webp' },
  { id: 102, title: 'Elektra', sagas: ['origins'], importance: 'optional', meta: 'Marvel Legacy', why_watch_this: 'After being resurrected, assassin Elektra turns against the Hand when she is hired to kill a father and his daughter.', poster_url: '/posters/elektra.webp' },
  { id: 103, title: 'Fantastic Four', sagas: ['origins'], importance: 'essential', meta: 'Marvel Legacy', why_watch_this: 'Four astronauts gain superpowers after exposure to cosmic radiation and become the Fantastic Four, facing their former teammate Victor von Doom. It introduces an early cinematic version of Marvel’s First Family and Doctor Doom.', poster_url: '/posters/fantastic-four.webp' },
  { id: 62, title: 'X-Men: The Last Stand', sagas: ['mutant'], importance: 'recommended', meta: 'Fox Era', why_watch_this: 'A controversial mutant “cure” divides the X-Men while Jean Grey returns as the immensely powerful Phoenix, bringing the original trilogy to its most devastating conflict.', poster_url: '/posters/x-men-the-last-stand.webp' },
  { id: 104, title: 'Ghost Rider', sagas: ['origins'], importance: 'recommended', meta: 'Marvel Legacy', why_watch_this: 'Johnny Blaze makes a deal with the devil and becomes the supernatural Spirit of Vengeance, eventually turning against his demonic master to save humanity.', poster_url: '/posters/ghost-rider.webp' },
  { id: 88, title: 'Spider-Man 3', sagas: ['spiderverse'], importance: 'essential', meta: 'Sony Legacy', why_watch_this: 'Peter Parker battles the corrupting influence of the Venom symbiote while facing Sandman and Harry Osborn’s transformation into the new Goblin. It completes the Raimi Spider-Man trilogy.', poster_url: '/posters/spider-man-3.webp' },
  { id: 105, title: 'Fantastic Four: Rise of the Silver Surfer', sagas: ['origins'], importance: 'recommended', meta: 'Marvel Legacy', why_watch_this: 'The Fantastic Four encounter the Silver Surfer, whose arrival warns of Galactus, a cosmic entity preparing to consume Earth.', poster_url: '/posters/fantastic-four-rise-of-the-silver-surfer.webp' },

  // 2. PHASE 1 & CONCURRENT MULTIVERSE (2008 - 2012)
  { id: 1, title: 'Iron Man', sagas: ['infinity'], importance: 'essential', meta: 'Phase 1', why_watch_this: 'Tony Stark is kidnapped and forced to build a weapon, but instead creates the Iron Man armor and returns home determined to change his life. His transformation into a hero becomes the starting point of the MCU and ultimately leads to the formation of the Avengers.', poster_url: '/posters/iron-man.webp' },
  { id: 2, title: 'The Incredible Hulk', sagas: ['infinity'], importance: 'recommended', meta: 'Phase 1', why_watch_this: 'Bruce Banner searches for a cure while General Ross hunts him down, eventually forcing Banner to unleash the Hulk against the monstrous Abomination. It introduces characters and conflicts that continue to surface throughout the MCU.', poster_url: '/posters/the-incredible-hulk.webp' },
  { id: 63, title: 'X-Men Origins: Wolverine', sagas: ['mutant'], importance: 'recommended', meta: 'Fox Era', why_watch_this: 'Logan’s past is revealed as he fights through decades of conflict, eventually undergoing the experiment that bonds adamantium to his skeleton and transforms him into Wolverine.', poster_url: '/posters/x-men-origins-wolverine.webp' },
  { id: 3, title: 'Iron Man 2', sagas: ['infinity'], importance: 'recommended', meta: 'Phase 1', why_watch_this: 'Tony Stark struggles with the consequences of revealing his identity while facing Ivan Vanko and a new generation of threats. The film expands the Avengers Initiative and introduces Natasha Romanoff and James Rhodes as major players in the MCU.', poster_url: '/posters/iron-man-2.webp' },
  { id: 4, title: 'Thor', sagas: ['infinity'], importance: 'essential', meta: 'Phase 1', why_watch_this: 'Thor is banished to Earth after abusing his power and must learn humility before he can reclaim his hammer. Meanwhile, Loki begins his transformation into one of the MCU’s central villains, setting up the conflict that brings the Avengers together.', poster_url: '/posters/thor.webp' },
  { id: 64, title: 'X-Men: First Class', sagas: ['mutant'], importance: 'recommended', meta: 'Fox Era', why_watch_this: 'A young Charles Xavier and Erik Lehnsherr join forces to stop a mutant-driven nuclear conflict, forming the first generation of the X-Men before their opposing ideologies drive them apart. It establishes the younger versions and history of several major Fox-era mutants.', poster_url: '/posters/x-men-first-class.webp' },
  { id: 5, title: 'Captain America: The First Avenger', sagas: ['infinity'], importance: 'essential', meta: 'Phase 1', why_watch_this: 'Steve Rogers volunteers for an experiment and becomes Captain America, leading the fight against HYDRA during World War II. The Tesseract, HYDRA and Steve’s eventual disappearance become important pieces of the MCU’s larger history.', poster_url: '/posters/captain-america-the-first-avenger.webp' },
  { id: 6, title: 'The Avengers', sagas: ['infinity'], importance: 'essential', meta: 'Phase 1', why_watch_this: 'Loki steals the Tesseract and opens a portal for the Chitauri invasion, forcing Iron Man, Captain America, Thor, Hulk, Black Widow and Hawkeye to fight together for the first time. It marks the birth of the Avengers as a team and establishes the scale of threats they will face going forward.', poster_url: '/posters/the-avengers.webp' },
  { id: 89, title: 'The Amazing Spider-Man', sagas: ['spiderverse'], importance: 'recommended', meta: 'Sony Legacy', why_watch_this: 'After being bitten by a genetically altered spider, Peter Parker becomes Spider-Man while investigating the disappearance of his parents and the experiments at Oscorp. It establishes Andrew Garfield’s version of Peter Parker and another distinct universe within Marvel’s growing Spider-Verse.', poster_url: '/posters/the-amazing-spider-man.webp' },
  { id: 108, title: 'Ghost Rider: Spirit of Vengeance', sagas: ['origins'], importance: 'optional', meta: 'Marvel Legacy', why_watch_this: 'Johnny Blaze returns as the Ghost Rider when he is asked to protect a young boy from a demonic prophecy that could unleash Hell on Earth.', poster_url: '/posters/ghost-rider-spirit-of-vengeance.webp' },

  // 3. PHASE 2 & CONCURRENT MULTIVERSE (2013 - 2015)
  { id: 7, title: 'Iron Man 3', sagas: ['infinity'], importance: 'recommended', meta: 'Phase 2', why_watch_this: 'Haunted by the Battle of New York, Tony Stark struggles with anxiety while facing the mysterious terrorist known as the Mandarin and his army of enhanced soldiers. The film explores the aftermath of Tony’s first encounter with an alien invasion.', poster_url: '/posters/iron-man-3.webp' },
  { id: 65, title: 'The Wolverine', sagas: ['mutant'], importance: 'optional', meta: 'Fox Era', why_watch_this: 'Logan travels to Japan, where he becomes caught between rival clans and confronts his own immortality while protecting the granddaughter of a powerful businessman.', poster_url: '/posters/the-wolverine.webp' },
  { id: 8, title: 'Thor: The Dark World', sagas: ['infinity'], importance: 'optional', meta: 'Phase 2', why_watch_this: 'Thor battles Malekith and the Dark Elves as they attempt to use the Aether, an ancient weapon capable of plunging the universe into darkness. The Aether is later revealed to be the Reality Stone.', poster_url: '/posters/thor-the-dark-world.webp' },
  { id: 9, title: 'Captain America: The Winter Soldier', sagas: ['infinity'], importance: 'essential', meta: 'Phase 2', why_watch_this: 'Steve Rogers discovers that S.H.I.E.L.D. has been infiltrated by HYDRA and is forced to confront the mysterious Winter Soldier, who turns out to be his old friend Bucky Barnes. The conspiracy brings down S.H.I.E.L.D. and fundamentally changes the MCU’s political landscape.', poster_url: '/posters/captain-america-the-winter-soldier.webp' },
  { id: 90, title: 'The Amazing Spider-Man 2', sagas: ['spiderverse'], importance: 'optional', meta: 'Sony Legacy', why_watch_this: 'Peter Parker faces Electro and Harry Osborn while uncovering the secrets behind Oscorp and his father’s research. The film expands Andrew Garfield’s Spider-Man universe and sets up its abandoned plans for a larger interconnected universe.', poster_url: '/posters/the-amazing-spider-man-2.webp' },
  { id: 66, title: 'X-Men: Days of Future Past', sagas: ['mutant'], importance: 'essential', meta: 'Fox Era', why_watch_this: 'Wolverine is sent into the past to prevent a future where mutant-hunting Sentinels have nearly wiped out mutants and humans. Changing history creates a new X-Men timeline, making this a key chapter in the franchise’s multiverse story.', poster_url: '/posters/x-men-days-of-future-past.webp' },
  { id: 10, title: 'Guardians of the Galaxy', sagas: ['infinity'], importance: 'essential', meta: 'Phase 2', why_watch_this: 'Peter Quill steals a mysterious Orb and becomes caught in a conflict involving Ronan, Thanos and the Guardians of the Galaxy. The Orb is revealed to contain the Power Stone, expanding the MCU beyond Earth and establishing the cosmic side of the Infinity Saga.', poster_url: '/posters/guardians-of-the-galaxy.webp' },
  { id: 11, title: 'Avengers: Age of Ultron', sagas: ['infinity'], importance: 'essential', meta: 'Phase 2', why_watch_this: 'Tony Stark and Bruce Banner accidentally create Ultron, an artificial intelligence that decides humanity itself must be destroyed. The Avengers unite to stop him, while Wanda Maximoff and Vision join the MCU and the Mind Stone becomes central to Vision’s existence.', poster_url: '/posters/avengers-age-of-ultron.webp' },
  { id: 12, title: 'Ant-Man', sagas: ['infinity'], importance: 'recommended', meta: 'Phase 2', why_watch_this: 'Thief Scott Lang becomes Ant-Man after receiving a suit that allows him to shrink while gaining incredible strength. His journey introduces the Quantum Realm, a mysterious dimension beyond conventional space and time that later becomes important to the MCU’s understanding of reality.', poster_url: '/posters/ant-man.webp' },
  { id: 109, title: 'Fantastic Four (2015)', sagas: ['origins'], importance: 'optional', meta: 'Marvel Legacy', why_watch_this: 'A group of young scientists travel to an alternate dimension and return with unstable superhuman abilities, becoming the Fantastic Four. The film presents a darker reimagining of Marvel’s First Family.', poster_url: '/posters/fantastic-four-2015.webp' },

  // 4. DEFENDERS SAGA (NETFLIX ERA)
  { id: 73, title: 'Daredevil (Season 1)', sagas: ['defenders'], importance: 'recommended', meta: 'Netflix Era', why_watch_this: 'Matt Murdock uses his heightened senses and legal skills to protect Hell’s Kitchen as Daredevil, while secretly taking on Wilson Fisk and his criminal empire. It establishes the Netflix version of Daredevil and the street-level world surrounding him.', poster_url: '/posters/daredevil.webp' },
  { id: 74, title: 'Jessica Jones (Season 1)', sagas: ['defenders'], importance: 'recommended', meta: 'Netflix Era', why_watch_this: 'Private investigator Jessica Jones is forced to confront Kilgrave, the man who once controlled her mind and destroyed her life. The season establishes Jessica and the darker supernatural side of the Defenders universe.', poster_url: '/posters/jessica-jones.webp' },
  { id: 75, title: 'Daredevil (Season 2)', sagas: ['defenders'], importance: 'recommended', meta: 'Netflix Era', why_watch_this: 'Daredevil faces the Punisher while his old love Elektra returns, drawing him into a war against the ancient organization known as the Hand. The season establishes Frank Castle and Elektra as major parts of Daredevil’s world.', poster_url: '/posters/daredevil.webp' },
  { id: 76, title: 'Luke Cage (Season 1)', sagas: ['defenders'], importance: 'optional', meta: 'Netflix Era', why_watch_this: 'Luke Cage, a superhuman with unbreakable skin, becomes a reluctant hero while protecting Harlem from crime boss Cornell “Cottonmouth” Stokes and the forces threatening his community.', poster_url: '/posters/luke-cage.webp' },
  { id: 77, title: 'Iron Fist (Season 1)', sagas: ['defenders'], importance: 'recommended', meta: 'Netflix Era', why_watch_this: 'Danny Rand returns to New York after years of training in the mystical city of K’un-Lun, claiming the power of the Iron Fist. He becomes caught between his family’s company, the Hand and the supernatural forces surrounding his past.', poster_url: '/posters/iron-fist.webp' },
  { id: 78, title: 'The Defenders (Season 1)', sagas: ['defenders'], importance: 'essential', meta: 'Netflix Era', why_watch_this: 'Daredevil, Jessica Jones, Luke Cage and Iron Fist are brought together when the Hand threatens New York City. The four heroes finally unite as the Defenders, making this the central crossover event of the Netflix era.', poster_url: '/posters/the-defenders.webp' },
  { id: 79, title: 'The Punisher (Season 1)', sagas: ['defenders'], importance: 'essential', meta: 'Netflix Era', why_watch_this: 'Frank Castle uncovers a conspiracy connected to the murder of his family and realizes his past as a Marine is tied to a much larger operation. His war against those responsible transforms him into the Punisher the world fears.', poster_url: '/posters/the-punisher.webp' },
  { id: 80, title: 'Jessica Jones (Season 2)', sagas: ['defenders'], importance: 'optional', meta: 'Netflix Era', why_watch_this: 'Jessica investigates the mysterious experiments that gave her superhuman abilities, forcing her to confront the people responsible for transforming her life.', poster_url: '/posters/jessica-jones.webp' },
  { id: 81, title: 'Luke Cage (Season 2)', sagas: ['defenders'], importance: 'optional', meta: 'Netflix Era', why_watch_this: 'Luke Cage becomes a symbol of Harlem while facing a new criminal threat and struggling with the responsibility that comes with becoming a public hero.', poster_url: '/posters/luke-cage.webp' },
  { id: 82, title: 'Iron Fist (Season 2)', sagas: ['defenders'], importance: 'optional', meta: 'Netflix Era', why_watch_this: 'Danny Rand embraces his role as protector of New York while a new threat emerges from the Hand, forcing him and Colleen Wing to confront the consequences of their past.', poster_url: '/posters/iron-fist.webp' },
  { id: 83, title: 'Daredevil (Season 3)', sagas: ['defenders'], importance: 'essential', meta: 'Netflix Era', why_watch_this: 'After surviving a devastating attack, Matt Murdock returns to Hell’s Kitchen as Wilson Fisk begins rebuilding his criminal empire from prison. Daredevil must reclaim his identity and stop Fisk before he takes control of the city again.', poster_url: '/posters/daredevil.webp' },
  { id: 84, title: 'The Punisher (Season 2)', sagas: ['defenders'], importance: 'recommended', meta: 'Netflix Era', why_watch_this: 'Frank Castle tries to leave his violent past behind until he becomes responsible for protecting a young woman targeted by a dangerous conspiracy. Forced back into the fight, Frank fully embraces the Punisher identity.', poster_url: '/posters/the-punisher.webp' },
  { id: 85, title: 'Jessica Jones (Season 3)', sagas: ['defenders'], importance: 'optional', meta: 'Netflix Era', why_watch_this: 'Jessica faces a calculating serial killer while trying to prove that she can be more than a damaged private investigator and reluctant superhero.', poster_url: '/posters/jessica-jones.webp' },

  // 5. PHASE 3 & CONCURRENT MULTIVERSE (2016 - 2019)
  { id: 67, title: 'Deadpool', sagas: ['mutant'], importance: 'essential', meta: 'Fox Era', why_watch_this: 'After a cancer diagnosis, Wade Wilson undergoes an experimental treatment that leaves him disfigured but gives him accelerated healing. He becomes the wisecracking mercenary Deadpool and begins hunting the people responsible for his transformation.', poster_url: '/posters/deadpool.webp' },
  { id: 13, title: 'Captain America: Civil War', sagas: ['infinity'], importance: 'essential', meta: 'Phase 3', why_watch_this: 'After a catastrophic mission leads governments to demand control over the Avengers, Steve Rogers and Tony Stark find themselves on opposite sides of the conflict. The resulting split fractures the Avengers while introducing Tom Holland’s Spider-Man to the MCU.', poster_url: '/posters/captain-america-civil-war.webp' },
  { id: 68, title: 'X-Men: Apocalypse', sagas: ['mutant'], importance: 'optional', meta: 'Fox Era', why_watch_this: 'The young X-Men unite when Apocalypse, one of the world’s first mutants, awakens and attempts to reshape humanity by recruiting powerful mutants to his cause.', poster_url: '/posters/x-men-apocalypse.webp' },
  { id: 14, title: 'Doctor Strange', sagas: ['infinity'], importance: 'essential', meta: 'Phase 3', why_watch_this: 'After losing the use of his hands, arrogant surgeon Stephen Strange discovers the mystical arts and becomes a sorcerer under the Ancient One. He learns to manipulate reality, time and dimensional forces while protecting Earth from supernatural threats.', poster_url: '/posters/doctor-strange.webp' },
  { id: 69, title: 'Logan', sagas: ['mutant'], importance: 'essential', meta: 'Fox Era', why_watch_this: 'In a bleak future, an aging Logan cares for a declining Professor X while protecting a mysterious young mutant named Laura. The film brings a powerful conclusion to Hugh Jackman’s original Wolverine story, making his history especially important as the character returns to Marvel’s larger multiverse.', poster_url: '/posters/logan.webp' },
  { id: 15, title: 'Guardians of the Galaxy Vol. 2', sagas: ['infinity'], importance: 'recommended', meta: 'Phase 3', why_watch_this: 'The Guardians uncover the truth about Peter Quill’s mysterious father, Ego, while their relationships are tested by betrayal and loss. The film deepens the team’s cosmic history and develops characters who become important players in the larger Marvel universe.', poster_url: '/posters/guardians-of-the-galaxy-vol-2.webp' },
  { id: 16, title: 'Spider-Man: Homecoming', sagas: ['infinity', 'spiderverse'], importance: 'recommended', meta: 'Phase 3', why_watch_this: 'Peter Parker tries to prove himself as a real superhero while balancing high school and a growing threat from the Vulture. Following the events of Civil War, it establishes Tom Holland’s Spider-Man as a major part of the MCU.', poster_url: '/posters/spider-man-homecoming.webp' },
  { id: 17, title: 'Thor: Ragnarok', sagas: ['infinity'], importance: 'essential', meta: 'Phase 3', why_watch_this: 'Thor is stranded on Sakaar and forced to fight Hulk before discovering that his sister Hela has returned to conquer Asgard. The destruction of Asgard and the fate of Thor, Loki and Hulk directly lead into Avengers: Infinity War.', poster_url: '/posters/thor-ragnarok.webp' },
  { id: 18, title: 'Black Panther', sagas: ['infinity'], importance: 'essential', meta: 'Phase 3', why_watch_this: 'T’Challa returns to Wakanda to become king but is challenged by his cousin Killmonger, who seeks to use Wakanda’s resources to arm oppressed people around the world. The film establishes Wakanda, its technology and its people before the nation becomes a major battlefield in Infinity War.', poster_url: '/posters/black-panther.webp' },
  { id: 19, title: 'Avengers: Infinity War', sagas: ['infinity'], importance: 'essential', meta: 'Phase 3', why_watch_this: 'Thanos begins his quest to collect all six Infinity Stones and erase half of all life in the universe. The Avengers and Guardians unite but ultimately fail to stop him, ending with the devastating Snap that changes the fate of the entire MCU.', poster_url: '/posters/avengers-infinity-war.webp' },
  { id: 70, title: 'Deadpool 2', sagas: ['mutant'], importance: 'essential', meta: 'Fox Era', why_watch_this: 'Deadpool protects a young mutant named Russell from the time-travelling Cable and assembles X-Force to stop him. The film expands Deadpool’s place in the Fox universe while introducing Cable and further developing the mutant characters surrounding him.', poster_url: '/posters/deadpool-2.webp' },
  { id: 20, title: 'Ant-Man and the Wasp', sagas: ['infinity'], importance: 'essential', meta: 'Phase 3', why_watch_this: 'Scott Lang teams up with Hope van Dyne as they attempt to rescue Janet van Dyne from the Quantum Realm. Scott becomes trapped there during Thanos’ Snap, making the Quantum Realm a crucial piece of the events that lead into Endgame.', poster_url: '/posters/ant-man-and-the-wasp.webp' },
  { id: 91, title: 'Venom', sagas: ['spiderverse'], importance: 'recommended', meta: 'Sony Legacy', why_watch_this: 'Investigative journalist Eddie Brock becomes bonded with an alien symbiote called Venom, giving him extraordinary abilities while the pair battle a rival symbiote threatening Earth.', poster_url: '/posters/venom.webp' },
  { id: 92, title: 'Spider-Man: Into the Spider-Verse', sagas: ['spiderverse'], importance: 'recommended', meta: 'Sony Legacy', why_watch_this: 'Teenager Miles Morales becomes Spider-Man and discovers that multiple versions of Spider-Man from different realities have been pulled into his world. It introduces the concept of Spider-People crossing between dimensions and establishes one of Marvel’s most important animated multiverse stories.', poster_url: '/posters/spider-man-into-the-spider-verse.webp' },
  { id: 21, title: 'Captain Marvel', sagas: ['infinity'], importance: 'essential', meta: 'Phase 3', why_watch_this: 'Carol Danvers discovers the truth about her past and unlocks her full powers after being caught between the Kree and Skrull conflict. The film reveals the origins of her connection to the Tesseract and establishes the hero Nick Fury contacts when Earth faces its greatest crisis.', poster_url: '/posters/captain-marvel.webp' },
  { id: 22, title: 'Avengers: Endgame', sagas: ['infinity'], importance: 'essential', meta: 'Phase 3', why_watch_this: 'After Thanos wipes out half of all life, the surviving Avengers attempt one final mission to undo the Snap. The team travels through time, retrieves the Infinity Stones and makes the ultimate sacrifice, bringing the Infinity Saga to its conclusion.', poster_url: '/posters/avengers-endgame.webp' },
  { id: 71, title: 'Dark Phoenix', sagas: ['mutant'], importance: 'optional', meta: 'Fox Era', why_watch_this: 'Jean Grey becomes overwhelmed by a cosmic force that dramatically amplifies her powers, forcing the X-Men to confront one of their own. It serves as the final mainline chapter of the Fox X-Men saga.', poster_url: '/posters/dark-phoenix.webp' },
  { id: 23, title: 'Spider-Man: Far From Home', sagas: ['infinity', 'spiderverse'], importance: 'recommended', meta: 'Phase 3', why_watch_this: 'Peter Parker tries to enjoy a school trip while dealing with the loss of Tony Stark, only to be recruited by Mysterio to fight a series of elemental creatures. The film explores the aftermath of Endgame and introduces the idea of alternate Earths to the MCU.', poster_url: '/posters/spider-man-far-from-home.webp' },

  // 6. PHASE 4 & CONCURRENT MULTIVERSE (2020 - 2022)
  { id: 72, title: 'The New Mutants', sagas: ['mutant'], importance: 'optional', meta: 'Fox Era', why_watch_this: 'Five young mutants are held in a secret facility where they must confront both their powers and the terrifying forces hunting them.', poster_url: '/posters/the-new-mutants.webp' },
  { id: 24, title: 'WandaVision', sagas: ['multiverse'], importance: 'essential', meta: 'Phase 4 (Series)', why_watch_this: 'Wanda Maximoff creates a reality of her own in the town of Westview while unknowingly trapping its residents inside her grief. The series transforms Wanda into the Scarlet Witch and establishes the emotional and magical storyline that directly continues into Doctor Strange in the Multiverse of Madness.', poster_url: '/posters/wandavision.webp' },
  { id: 25, title: 'The Falcon & Winter Soldier', sagas: ['multiverse'], importance: 'optional', meta: 'Phase 4 (Series)', why_watch_this: 'Sam Wilson and Bucky Barnes struggle with the legacy of Steve Rogers while confronting a new group of super-soldiers and the controversial government-appointed Captain America. The series ultimately establishes Sam as the new Captain America.', poster_url: '/posters/the-falcon-and-the-winter-soldier.webp' },
  { id: 26, title: 'Loki (S1 & S2)', sagas: ['multiverse'], importance: 'essential', meta: 'Phase 4/5 (Series)', why_watch_this: 'A variant of Loki escapes with the Tesseract and is recruited by the Time Variance Authority, an organization that monitors branching timelines. Loki’s journey eventually transforms the structure of time itself, making the series one of the foundational stories of the Multiverse Saga and the TVA.', poster_url: '/posters/loki.webp' },
  { id: 27, title: 'Black Widow', sagas: ['multiverse'], importance: 'optional', meta: 'Phase 4', why_watch_this: 'Set after Civil War, Natasha Romanoff returns to her past and reunites with her former family of spies while confronting the Red Room and its mysterious leader.', poster_url: '/posters/black-widow.webp' },
  { id: 28, title: 'What If...?', sagas: ['multiverse'], importance: 'recommended', meta: 'Phase 4-6 (Series)', why_watch_this: 'The Watcher observes countless alternate realities where familiar MCU events unfold differently, introducing new variants of heroes and entirely different timelines. It expands the concept of the Marvel Multiverse far beyond the main MCU timeline.', poster_url: '/posters/what-if.webp' },
  { id: 29, title: 'Shang-Chi', sagas: ['multiverse'], importance: 'essential', meta: 'Phase 4', why_watch_this: 'Shang-Chi is pulled back into the criminal organization controlled by his father, Wenwu, and discovers a hidden mystical world beyond his family’s past. The film introduces Shang-Chi and the mysterious Ten Rings, establishing another powerful force within the MCU.', poster_url: '/posters/shang-chi-and-the-legend-of-the-ten-rings.webp' },
  { id: 93, title: 'Venom: Let There Be Carnage', sagas: ['spiderverse'], importance: 'optional', meta: 'Sony Legacy', why_watch_this: 'Eddie Brock and Venom face serial killer Cletus Kasady after he bonds with another symbiote, creating the deadly Carnage.', poster_url: '/posters/venom-let-there-be-carnage.webp' },
  { id: 30, title: 'Eternals', sagas: ['multiverse'], importance: 'recommended', meta: 'Phase 4', why_watch_this: 'Ancient immortal beings who have secretly lived on Earth for thousands of years reunite to stop a cosmic event that threatens the planet.', poster_url: '/posters/eternals.webp' },
  { id: 31, title: 'Hawkeye', sagas: ['multiverse'], importance: 'recommended', meta: 'Phase 4 (Series)', why_watch_this: 'Clint Barton teams up with young archer Kate Bishop while dealing with enemies from his past. The series also brings Wilson Fisk back into the MCU and continues the street-level corner of Marvel.', poster_url: '/posters/hawkeye.webp' },
  { id: 32, title: 'Spider-Man: No Way Home', sagas: ['multiverse', 'spiderverse'], importance: 'essential', meta: 'Phase 4', why_watch_this: 'After Peter Parker asks Doctor Strange to make the world forget his identity, the spell goes wrong and opens the door to villains from other universes. Tobey Maguire and Andrew Garfield’s Spider-Men cross into the MCU, making this one of the biggest multiversal events in the saga.', poster_url: '/posters/spider-man-no-way-home.webp' },
  { id: 33, title: 'Moon Knight', sagas: ['multiverse'], importance: 'optional', meta: 'Phase 4 (Series)', why_watch_this: 'Steven Grant discovers that he shares his body with mercenary Marc Spector and becomes involved in a conflict between ancient Egyptian gods.', poster_url: '/posters/moon-knight.webp' },
  { id: 94, title: 'Morbius', sagas: ['spiderverse'], importance: 'optional', meta: 'Sony Legacy', why_watch_this: 'Scientist Michael Morbius experiments with a cure for his rare blood disease and accidentally transforms himself into a living vampire.', poster_url: '/posters/morbius.webp' },
  { id: 34, title: 'Doctor Strange: Multiverse of Madness', sagas: ['multiverse'], importance: 'essential', meta: 'Phase 4', why_watch_this: 'Doctor Strange encounters America Chavez, a teenager capable of traveling across universes, while Wanda Maximoff hunts her power. Strange is forced to confront incursions, alternate realities and the dangers of uncontrolled multiversal travel, directly expanding the Multiverse Saga.', poster_url: '/posters/doctor-strange-in-the-multiverse-of-madness.webp' },
  { id: 35, title: 'Ms. Marvel', sagas: ['multiverse'], importance: 'optional', meta: 'Phase 4 (Series)', why_watch_this: 'Teenager Kamala Khan discovers that her family’s mysterious bangle unlocks extraordinary abilities and begins her journey toward becoming Ms. Marvel.', poster_url: '/posters/ms-marvel.webp' },
  { id: 36, title: 'Thor: Love and Thunder', sagas: ['multiverse'], importance: 'optional', meta: 'Phase 4', why_watch_this: 'Thor reunites with Jane Foster, who has become the Mighty Thor, as they face Gorr the God Butcher and his plan to eliminate the gods.', poster_url: '/posters/thor-love-and-thunder.webp' },
  { id: 37, title: 'I Am Groot', sagas: ['multiverse'], importance: 'optional', meta: 'Phase 4/5 (Shorts)', why_watch_this: 'Baby Groot gets into a series of small but chaotic adventures while exploring the galaxy with the Guardians.', poster_url: '/posters/i-am-groot.webp' },
  { id: 38, title: 'She-Hulk: Attorney at Law', sagas: ['multiverse'], importance: 'optional', meta: 'Phase 4 (Series)', why_watch_this: 'Jennifer Walters becomes She-Hulk after receiving Bruce Banner’s blood and tries to balance her new powers with her career as a lawyer. The series also brings Daredevil back into the MCU.', poster_url: '/posters/she-hulk-attorney-at-law.webp' },
  { id: 39, title: 'Werewolf by Night', sagas: ['multiverse'], importance: 'optional', meta: 'Phase 4 (Special)', why_watch_this: 'A group of monster hunters gathers for a deadly hunt after the death of a legendary hunter, introducing the darker supernatural side of the MCU.', poster_url: '/posters/werewolf-by-night.webp' },
  { id: 40, title: 'Black Panther: Wakanda Forever', sagas: ['multiverse'], importance: 'essential', meta: 'Phase 4', why_watch_this: 'Following T’Challa’s death, Wakanda struggles to protect itself from global powers and the underwater kingdom of Talokan, led by Namor. Shuri ultimately takes up the Black Panther mantle, while the film expands Wakanda’s role in the MCU.', poster_url: '/posters/black-panther-wakanda-forever.webp' },
  { id: 41, title: 'GotG Holiday Special', sagas: ['multiverse'], importance: 'optional', meta: 'Phase 4 (Special)', why_watch_this: 'The Guardians travel to Earth to give Peter Quill a memorable Christmas, while the team discovers an unexpected connection to his past. The special leads directly into the events of Guardians of the Galaxy Vol. 3.', poster_url: '/posters/the-guardians-of-the-galaxy-holiday-special.webp' },

  // 7. PHASE 5 & CONCURRENT MULTIVERSE (2023 - 2024)
  { id: 42, title: 'Ant-Man and the Wasp: Quantumania', sagas: ['multiverse'], importance: 'recommended', meta: 'Phase 5', why_watch_this: 'Scott Lang and his family are pulled into the Quantum Realm, where they encounter Kang the Conqueror and his vast empire. The film introduces one of the Multiverse Saga’s major threats and establishes Kang’s connection to the Quantum Realm.', poster_url: '/posters/ant-man-and-the-wasp-quantumania.webp' },
  { id: 43, title: 'Guardians of the Galaxy Vol. 3', sagas: ['multiverse'], importance: 'recommended', meta: 'Phase 5', why_watch_this: 'The Guardians race to save Rocket after he is critically wounded, forcing the team to confront his painful past and the High Evolutionary. The film brings the Guardians’ original journey to an emotional conclusion.', poster_url: '/posters/guardians-of-the-galaxy-vol-3.webp' },
  { id: 95, title: 'Spider-Man: Across the Spider-Verse', sagas: ['spiderverse'], importance: 'recommended', meta: 'Sony Legacy', why_watch_this: 'Miles Morales encounters hundreds of Spider-People and learns that their lives are connected by events that shape their respective universes. His journey expands the Spider-Verse into a massive network of alternate realities.', poster_url: '/posters/spider-man-across-the-spider-verse.webp' },
  { id: 44, title: 'Secret Invasion', sagas: ['multiverse'], importance: 'optional', meta: 'Phase 5 (Series)', why_watch_this: 'Nick Fury returns to Earth when he discovers that a faction of Skrulls has secretly infiltrated governments and powerful institutions around the world.', poster_url: '/posters/secret-invasion.webp' },
  { id: 45, title: 'The Marvels', sagas: ['multiverse'], importance: 'recommended', meta: 'Phase 5', why_watch_this: 'Carol Danvers, Kamala Khan and Monica Rambeau become mysteriously linked through their powers and are forced to work together against the Kree revolutionary Dar-Benn. Their story expands the cosmic side of the MCU and the consequences of Captain Marvel’s actions.', poster_url: '/posters/the-marvels.webp' },
  { id: 46, title: 'Echo', sagas: ['multiverse', 'defenders'], importance: 'optional', meta: 'Phase 5 (Series)', why_watch_this: 'Maya Lopez returns to her hometown after the events of Hawkeye and confronts her complicated relationship with Wilson Fisk while reconnecting with her Choctaw heritage and its supernatural elements.', poster_url: '/posters/echo.webp' },
  { id: 96, title: 'Madame Web', sagas: ['spiderverse'], importance: 'optional', meta: 'Sony Legacy', why_watch_this: 'Cassie Webb develops the ability to see possible futures and must protect three young women from a mysterious Spider-Man-connected threat seeking to kill them.', poster_url: '/posters/madame-web.webp' },
  { id: 47, title: 'Deadpool & Wolverine', sagas: ['multiverse', 'mutant'], importance: 'essential', meta: 'Phase 5', why_watch_this: 'Deadpool is recruited by the TVA and pulled into a multiversal crisis that forces him to find Wolverine. The film brings Deadpool, Wolverine and several Fox-era characters into direct contact with the MCU, making it a major bridge between the Fox universe and the Multiverse Saga.', poster_url: '/posters/deadpool-wolverine.webp' },
  { id: 48, title: 'Agatha All Along', sagas: ['multiverse'], importance: 'recommended', meta: 'Phase 5 (Series)', why_watch_this: 'After the events of WandaVision, Agatha Harkness escapes her magical imprisonment and joins a mysterious coven on the dangerous Witches’ Road. The series expands the supernatural side of the MCU and continues the magical story surrounding Wanda.', poster_url: '/posters/agatha-all-along.webp' },
  { id: 97, title: 'Venom: The Last Dance', sagas: ['spiderverse'], importance: 'recommended', meta: 'Sony Legacy', why_watch_this: 'Eddie Brock and Venom are hunted by enemies from both Earth and their symbiote homeworld, forcing the unlikely pair into one final fight for survival as their journey reaches its conclusion.', poster_url: '/posters/venom-the-last-dance.webp' },
  { id: 98, title: 'Kraven the Hunter', sagas: ['spiderverse'], importance: 'optional', meta: 'Sony Legacy', why_watch_this: 'Sergei Kravinoff is shaped into a ruthless hunter by his violent father and eventually develops a deadly obsession with proving himself as the world’s greatest predator.', poster_url: '/posters/kraven-the-hunter.webp' },
  { id: 49, title: 'Your Friendly Neighborhood Spider-Man', sagas: ['multiverse', 'spiderverse'], importance: 'optional', meta: 'Phase 5 (Series)', why_watch_this: 'An alternate Peter Parker begins his journey as Spider-Man in a reality where Norman Osborn becomes his mentor instead of Tony Stark.', poster_url: '/posters/your-friendly-neighborhood-spider-man.webp' },
  { id: 50, title: 'Captain America: Brave New World', sagas: ['multiverse'], importance: 'essential', meta: 'Phase 5', why_watch_this: 'Sam Wilson fully embraces the Captain America mantle and becomes caught in an international conspiracy involving President Ross, the mysterious Leader and a dangerous new threat. The film establishes the world and political landscape surrounding the MCU’s new Captain America.', poster_url: '/posters/captain-america-brave-new-world.webp' },
  { id: 51, title: 'Daredevil: Born Again [S1 & S2]', sagas: ['multiverse', 'defenders'], importance: 'essential', meta: 'Phase 5/6 (Series)', why_watch_this: 'Matt Murdock returns to Hell’s Kitchen as Daredevil while Wilson Fisk rises into political power and attempts to reshape New York City. The series continues the Netflix characters within the MCU and brings the street-level corner of Marvel firmly into the current universe.', poster_url: '/posters/daredevil-born-again.webp' },
  { id: 52, title: 'Thunderbolts*', sagas: ['multiverse'], importance: 'essential', meta: 'Phase 5', why_watch_this: 'A group of damaged heroes and former villains—including Yelena Belova, Bucky Barnes, Red Guardian and U.S. Agent—are forced together for a dangerous mission. The team becomes the Thunderbolts*, establishing a new group of MCU heroes and anti-heroes.', poster_url: '/posters/thunderbolts.webp' },
  { id: 53, title: 'Ironheart', sagas: ['multiverse'], importance: 'optional', meta: 'Phase 5 (Series)', why_watch_this: 'After the events of Wakanda Forever, young inventor Riri Williams returns to Chicago and builds her own path as Ironheart while becoming entangled in a conflict between technology and magic.', poster_url: '/posters/ironheart.webp' },

  // 8. PHASE 6 (2025+)
  { id: 54, title: 'The Fantastic Four: First Steps', sagas: ['multiverse', 'origins'], importance: 'essential', meta: 'Phase 6', why_watch_this: 'On retro-futuristic Earth-828, Reed Richards, Sue Storm, Johnny Storm and Ben Grimm must protect their world from Galactus while preparing for the birth of Franklin Richards. The Fantastic Four return in Avengers: Doomsday, while the film’s mid-credits scene directly sets up Doom’s arrival.', poster_url: '/posters/the-fantastic-four-first-steps.webp' },
  { id: 55, title: 'Eyes of Wakanda', sagas: ['multiverse'], importance: 'optional', meta: 'Phase 6 (Series)', why_watch_this: 'Across different periods of history, elite Wakandan warriors known as the Hatut Zeraze travel the world on dangerous missions to recover stolen Vibranium artifacts.', poster_url: '/posters/eyes-of-wakanda.webp' },
  { id: 56, title: 'Marvel Zombies', sagas: ['multiverse'], importance: 'optional', meta: 'Phase 6 (Series)', why_watch_this: 'In the alternate reality introduced in What If...?, a new generation of survivors fights through a devastated world overrun by zombified versions of Marvel’s most powerful heroes.', poster_url: '/posters/marvel-zombies.webp' },
  { id: 57, title: 'Wonder Man', sagas: ['multiverse'], importance: 'optional', meta: 'Phase 6 (Series)', why_watch_this: 'Aspiring actor Simon Williams befriends struggling performer Trevor Slattery as they compete for roles in a Hollywood remake of the superhero film Wonder Man.', poster_url: '/posters/wonder-man.webp' },
  { id: 58, title: 'The Punisher: One Last Kill', sagas: ['multiverse', 'defenders'], importance: 'recommended', meta: 'Phase 6 (Special)', why_watch_this: 'Years of violence and revenge have left Frank Castle searching for meaning, until crime boss Ma Gnucci puts a target on his back and drags the Punisher into another brutal war. The story continues Frank’s MCU journey before his appearance alongside Peter Parker in Spider-Man: Brand New Day.', poster_url: '/posters/the-punisher-one-last-kill.webp' },
  { id: 59, title: 'Spider-Man: Brand New Day', sagas: ['multiverse', 'spiderverse'], importance: 'essential', meta: 'Phase 6', why_watch_this: 'Four years after No Way Home, Peter Parker lives completely alone in a world that no longer remembers him, devoting his entire life to being Spider-Man. As a new pattern of crime spreads through New York, the pressure of being Spider-Man triggers a mysterious physical evolution that threatens Peter himself.', poster_url: '/posters/spider-man-brand-new-day.webp' }
];

const IMPORTANCE_STYLES = {
  essential:   'text-emerald-300 border-emerald-400/30 bg-emerald-950/80',
  recommended: 'text-emerald-100/70 border-white/20 bg-black/60',
  optional:    'text-white/50 border-white/10 bg-black/60',
};

function PosterFallback({ title, sagaCode }) {
  const initials = title.split(' ').filter(w => w.length > 2 || /^[A-Z]/.test(w)).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-950/40 via-black to-black">
      <span className="absolute top-2 left-2 text-[9px] font-['JetBrains_Mono'] text-emerald-400/40 tracking-widest">{sagaCode}</span>
      <span className="text-2xl font-['Chakra_Petch'] font-semibold text-emerald-400/30 tracking-widest">{initials}</span>
    </div>
  );
}

/* INFINITY GAUNTLET */

function Gem({ saga, pct }) {
  const colors = GEM_COLORS[saga.id];
  const clipId = `gem-clip-${saga.id}`;
  const gradId = `gem-grad-${saga.id}`;
  const full = pct >= 100;

  return (
    <div className="flex flex-col items-center gap-4 w-[50px] min-[375px]:w-10 sm:w-[60px] md:w-[72px] shrink-0">
      <div
        className={`relative w-12 h-12 min-[375px]:w-10 min-[375px]:h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 transition-all duration-500 ${full ? 'scale-110 opacity-100 drop-shadow-[0_0_12px_currentColor]' : 'scale-100 opacity-80'}`}
        style={{ color: colors.hex }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-lg">
          <defs>
            <linearGradient id={gradId} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor={colors.from} />
              <stop offset="100%" stopColor={colors.to} />
            </linearGradient>
            <clipPath id={clipId}>
              <rect x="0" y={100 - pct} width="100" height={pct + 1} />
            </clipPath>
          </defs>
          
          <polygon
            points="50,0 100,25 80,100 20,100 0,25"
            fill="rgba(255,255,255,0.02)"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          <g clipPath={`url(#${clipId})`}>
            <polygon
              points="50,0 100,25 80,100 20,100 0,25"
              fill={`url(#${gradId})`}
              stroke={colors.hex}
              strokeWidth="1"
              strokeLinejoin="round"
            />
          </g>

          <polygon
            points="50,0 100,25 80,100 20,100 0,25"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="text-center w-full">
        <p className="text-[9px] sm:text-[10px] md:text-[11px] font-['JetBrains_Mono'] font-bold uppercase tracking-[0.2em] min-[375px]:tracking-[0.05em] mb-1" style={{ color: colors.hex }}>
          {saga.stone.replace(' Stone', '')}
        </p>
        <p className="text-[12px] sm:text-[13px] md:text-[15px] font-['Chakra_Petch'] font-semibold text-white/80">{pct}%</p>
      </div>
    </div>
  );
}

function InfinityGauntlet({ sagaStats, overallPct }) {
  const [snapping, setSnapping] = useState(false);
  const wasCompleteRef = useRef(false);

  useEffect(() => {
    if (overallPct === 100 && !wasCompleteRef.current) {
      wasCompleteRef.current = true;
      setSnapping(true);
      const t = setTimeout(() => setSnapping(false), 1500);
      return () => clearTimeout(t);
    }
    if (overallPct < 100) {
      wasCompleteRef.current = false;
    }
  }, [overallPct]);

  return (
    <div className="relative p-6 md:px-10 md:py-8 rounded-[24px] bg-black/40 backdrop-blur-xl border border-white/10 overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">

      {snapping && (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
          <div className="absolute inset-0 bg-white" style={{ animation: 'snapFlash 1.5s ease-out forwards' }} />
          <div className="absolute w-6 h-6 rounded-full border-emerald-300" style={{ animation: 'shockwave 1.2s ease-out forwards' }} />
        </div>
      )}

      <div className="flex flex-col items-center lg:items-start text-center lg:text-left shrink-0 relative z-10">
        <p className="text-[15px] font-['JetBrains_Mono'] text-white/60 tracking-[0.3em] uppercase mb-2">The Gauntlet</p>
        <h2 className="font-['Chakra_Petch'] font-bold text-3xl md:text-4xl text-white mb-2 tracking-wide">Stone Convergence</h2>
        <div className="flex items-baseline gap-2 justify-center lg:justify-start">
          <p className="font-['Chakra_Petch'] font-bold text-4xl text-emerald-400 leading-none">{overallPct}%</p>
          <p className="text-[12px] font-['JetBrains_Mono'] text-white/40 uppercase tracking-widest font-semibold">Assembled</p>
        </div>
        
        {overallPct === 100 && !snapping && (
          <p className="mt-4 text-emerald-400 font-['JetBrains_Mono'] text-xs tracking-[0.2em] uppercase animate-pulse">
            Doomsday awaits.
          </p>
        )}
      </div>

      <div className="flex items-end justify-start min-[375px]:justify-center gap-3 min-[375px]:gap-1.5 sm:gap-4 md:gap-6 relative z-10 flex-1 w-full lg:w-auto overflow-x-auto min-[375px]:overflow-visible hide-scrollbar">
        {sagaStats.map(s => (
          <Gem key={s.id} saga={s} pct={s.pct} />
        ))}
      </div>
    </div>
  );
}

/* ACHIEVEMENT TOASTS */

function ToastStack({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  
  return (
    <div className="fixed top-6 right-6 z-[90] flex flex-col gap-3 w-[calc(100vw-3rem)] max-w-sm">
      {toasts.map(t => {
        const stoneColor = GEM_COLORS[t.key]?.hex || '#34d399';
        
        return (
          <div
            key={t.id}
            className="animate-toast-in p-4 rounded-2xl bg-[#080a09]/95 backdrop-blur-xl border flex items-start gap-3 transition-all duration-300"
            style={{ 
              borderColor: `${stoneColor}40`,
              boxShadow: `0 10px 40px ${stoneColor}20` 
            }}
          >
            <div 
              className="w-2 h-2 rounded-full mt-1.5 shrink-0" 
              style={{ 
                backgroundColor: stoneColor,
                boxShadow: `0 0 10px ${stoneColor}90` 
              }} 
            />
            
            <div className="flex-1 min-w-0">
              <p 
                className="text-[13px] font-['Inter'] tracking-[0.2em] uppercase"
                style={{ 
                  color: stoneColor, 
                  textShadow: `0 0 8px ${stoneColor}40` 
                }}
              >
                {t.title}
              </p>
              <p className="text-[16px] text-white/70 font-light mt-1">{t.subtitle}</p>
            </div>
            
            <button 
              onClick={() => onDismiss(t.id)} 
              className="shrink-0 transition-all duration-300"
              style={{ color: `${stoneColor}50` }}
              onMouseEnter={(e) => e.currentTarget.style.color = stoneColor}
              onMouseLeave={(e) => e.currentTarget.style.color = `${stoneColor}50`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}

function RevealOnScroll({ children, className = "" }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              observer.unobserve(entry.target);
            }
          },
          { threshold: 0, rootMargin: '200px' } 
        );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${className} ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
      {children}
    </div>
  );
}

/* SYSTEM TERMINAL FEED */

function SystemTerminalFeed() {
  const [headlines, setHeadlines] = useState([
    "WARNING: DOOMSDAY SPECIAL LOOK REVEALED AT D23",
    "ALERT: MARVEL OFFICIALLY REVEALS ITS NEW X-MEN CAST",
    "ANOMALY DETECTED: VISIONQUEST OFFICIALLY ANNOUNCED",
    "INTERCEPTED: DOOMSDAY TRAILER TEASES X-MEN, FANTASTIC FOUR & AVENGERS",
    "WARNING: SACRED TIMELINE BRANCHING AT UNPRECEDENTED RATE",
  ]);
  
  const [text, setText] = useState('');
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Fetch real news from backend
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/marvel-news/`);
        if (response.data && response.data.length > 0) {
          const formatted = response.data.map(item => `> INTERCEPTED TRANSMISSION: ${item.title.toUpperCase()}`);
          setHeadlines(formatted);
        }
      } catch (error) {
        console.log("Terminal operating offline. Using localized cache.");
      }
    };
    
    fetchNews();
    const interval = setInterval(fetchNews, 300000); // Refreshes every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // 2. Typewriter Effect Logic
  useEffect(() => {
    const currentHeadline = headlines[index % headlines.length];
    const typeSpeed = isDeleting ? 20 : 50; 

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setText(currentHeadline.substring(0, text.length + 1));
        if (text.length === currentHeadline.length) {
          setTimeout(() => setIsDeleting(true), 4000); 
        }
      } else {
        setText(currentHeadline.substring(0, text.length - 1));
        if (text.length === 0) {
          setIsDeleting(false);
          setIndex((prev) => prev + 1);
        }
      }
    }, typeSpeed);

    return () => clearTimeout(timer);
  }, [text, isDeleting, index, headlines]);

  return (
    <div className="relative w-full overflow-hidden border border-white/10 rounded-xl bg-[#020403] h-12 mb-16 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
      
      <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center gap-2 pl-4 md:px-5 md:bg-black/60 md:border-r border-white/10 md:backdrop-blur-md">
        <div className="w-2 h-2 rounded-sm bg-red-500 animate-pulse shrink-0 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
        <span className="hidden md:inline text-red-500 text-[11px] font-['JetBrains_Mono'] tracking-[0.25em] uppercase font-bold whitespace-nowrap">
          SYSTEM LOG
        </span>
      </div>
      
      <div className="hidden md:block absolute left-[145px] top-0 bottom-0 w-8 bg-gradient-to-r from-black/60 to-transparent z-10 pointer-events-none" />

      <div className="flex items-center h-full pl-[36px] md:pl-[175px] pr-4 md:pr-6">
        <span className="text-emerald-400 text-[10px] md:text-[13px] font-['JetBrains_Mono'] tracking-wide drop-shadow-md">
          {text}
          <span className="cursor-blink"></span>
        </span>
      </div>
      
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px)]" style={{ backgroundSize: '100% 3px' }} />
    </div>
  );
}

/* CASE FILES — cast dossier */

function CastCard({ member }) {
  const initials = member.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const [imgError, setImgError] = useState(false);

  return (
    <div className="shrink-0 w-[115px] md:w-[160px] snap-start group flex flex-col gap-2">
      
      {/* Image Card */}
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-[#050706] md:group-hover:border-emerald-500/50 transition-all duration-500 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
        
        {member.imageUrl && !imgError ? (
          <img 
            src={member.imageUrl} 
            alt={member.name}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500 grayscale-[60%] group-hover:grayscale-0"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-950/40 via-black to-black">
            <span className="text-3xl md:text-4xl font-['Chakra_Petch'] font-semibold text-emerald-400/15 tracking-widest">
              {initials}
            </span>
          </div>
        )}

        <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-500" />
        <div className="hidden md:block absolute inset-0 bg-emerald-500/10 mix-blend-overlay group-hover:bg-emerald-500/0 transition-colors duration-500 pointer-events-none" />

        <div className="hidden md:block absolute top-3 left-3 text-[9px] font-['JetBrains_Mono'] text-emerald-400/80 tracking-widest bg-black/60 px-2 py-1 rounded-md border border-emerald-500/20 backdrop-blur-md">
          {member.code}
        </div>
        
        <div className="hidden md:flex absolute inset-x-0 bottom-0 p-4 translate-y-7 group-hover:translate-y-0 transition-transform duration-500 ease-out flex-col justify-end h-1/2">
          <p className="font-['Chakra_Petch'] font-semibold text-[15px] text-white leading-tight drop-shadow-md">
            {member.name}
          </p>
          <p className="text-[11px] text-emerald-400 font-['JetBrains_Mono'] mt-1 drop-shadow-md">
            {member.role}
          </p>
          
          <p className="text-[9px] text-white/50 font-['JetBrains_Mono'] uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 border-t border-white/10 pt-2">
            {member.tag}
          </p>
        </div>
      </div>

      <div className="md:hidden px-1 flex flex-col mt-0.5">
        <h3 className="font-['Chakra_Petch'] font-medium text-[16px] text-white/90 line-clamp-2 leading-tight">{member.name}</h3>
        <p className="text-[11.5px] text-emerald-400/80 font-['JetBrains_Mono'] line-clamp-2 mt-0.5 leading-tight">{member.role}</p>
      </div>

    </div>
  );
}

function CastDossier({ cast }) {
  return (
    <div className="relative group/dossier">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: 'pulseGlow 2s ease-in-out infinite' }} />
        <p className="text-emerald-400/80 text-[13px] font-['JetBrains_Mono'] tracking-[0.3em] uppercase">TVA Case Files</p>
      </div>
      <h2 className="font-['Chakra_Petch'] font-semibold text-3xl text-white mb-6">Variant Roster</h2>
      
      <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory hide-scrollbar -mx-6 md:mx-0">
        
        <div className="w-2 shrink-0 snap-start md:hidden"></div>
        
        {cast.map((m, i) => <CastCard key={i} member={m} />)}
        
        <div className="w-2 shrink-0 md:hidden"></div>

      </div>
      
      <div className="hidden md:block absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050706] to-transparent pointer-events-none z-10" />
    </div>
  );
}

/* TRANSMISSION LOG */

function MediaVault({ items }) {
  const [active, setActive] = useState(items[0]);

  return (
    <div className="relative flex flex-col items-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-6xl h-[350px] bg-emerald-500/25 blur-[90px] rounded-[100%] pointer-events-none z-0" />

      <div className="flex items-center gap-3 mb-9 relative z-10 self-center">
        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse drop-shadow-[0_0_5px_rgba(220,38,38,0.8)]" />
        <span className="text-rose-500/90 text-[15px] font-['JetBrains_Mono'] tracking-[0.3em] uppercase font-semibold">
          COUNTDOWN TO COLLISION
        </span>
      </div>

      <div className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden border border-emerald-500/20 shadow-[0_0_60px_rgba(16,185,129,0.15)] relative bg-black/50 backdrop-blur-sm group z-10">
        <div className="absolute inset-0 border border-emerald-400/30 rounded-2xl pointer-events-none z-10 transition-all duration-500 group-hover:border-emerald-400/70" />
        <iframe
          key={active.id}
          className="absolute top-0 left-0 w-full h-full z-0"
          src={`https://www.youtube.com/embed/${active.id}?autoplay=1&mute=1&modestbranding=1`}
          title={active.label}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      {items.length > 1 && (
        <div className="w-full max-w-5xl flex gap-3 mt-5 relative z-10 overflow-x-auto hide-scrollbar">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => setActive(item)}
              className={`shrink-0 w-40 rounded-xl overflow-hidden border transition-all duration-300 text-left ${
                active.id === item.id ? 'border-emerald-400/70 shadow-[0_0_15px_rgba(16,185,129,0.25)]' : 'border-white/10 hover:border-emerald-400/30'
              }`}
            >
              <div className="aspect-video bg-black relative">
                <img
                  src={`https://img.youtube.com/vi/${item.id}/hqdefault.jpg`}
                  alt={item.label}
                  className="w-full h-full object-cover opacity-80"
                />
                {active.id === item.id && (
                  <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                    <span className="text-[9px] font-['JetBrains_Mono'] text-emerald-300 tracking-widest uppercase bg-black/60 px-2 py-0.5 rounded-full">Now Playing</span>
                  </div>
                )}
              </div>
              <div className="px-2 py-1.5 bg-black/60">
                <p className="text-[9px] text-emerald-400/70 font-['JetBrains_Mono'] uppercase tracking-widest">{item.kind}</p>
                <p className="text-[11px] text-white/80 font-['Chakra_Petch'] truncate">{item.label}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* APPLE MUSIC PANEL */

function AppleMusicPanel({ embedUrl, title, subtitle }) {
  return (
    <div className="relative p-5 md:p-8 rounded-[24px] md:rounded-[28px] bg-[#050706] backdrop-blur-xl border border-white/10 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[80px] pointer-events-none rounded-full" />

      <div className="flex items-center gap-3 mb-1 relative z-10">
        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" style={{ animation: 'pulseGlow 2s ease-in-out infinite' }} />
        <p className="text-rose-500/90 text-[13px] md:text-[15px] font-['JetBrains_Mono'] tracking-[0.3em] uppercase">Score Frequency</p>
      </div>
      
      <h2 className="font-['Chakra_Petch'] font-semibold text-xl md:text-2xl text-white mb-1 relative z-10">{title}</h2>
      <p className="text-white/50 text-[13px] md:text-sm font-light mb-6 md:mb-8 relative z-10">{subtitle}</p>
      
      <div className="rounded-2xl overflow-hidden border border-white/5 relative z-10 bg-black/50">
        <iframe
          allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
          frameBorder="0"
          className="h-[280px] md:h-[450px]"
          style={{ width: '100%', maxWidth: '100%', overflow: 'hidden', background: 'transparent' }}
          sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
          src={embedUrl}
        ></iframe>
      </div>
    </div>
  );
}

export default function App() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watched, setWatched] = useState(() => new Set());
  const [filter, setFilter] = useState('all'); 
  const [hoveredSaga, setHoveredSaga] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);
  const [sharing, setSharing] = useState(false);
  const unlockedRef = useRef(new Set());
  const [showAuth, setShowAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePopup, setActivePopup] = useState(null);

  useEffect(() => {
    const username = localStorage.getItem('username');
    
    if (username) {
      setIsAuthenticated(true);
      
      // Fetch their saved timeline from Django
      axios.get(`${API_URL}/api/progress/sync/?username=${username}`)
        .then(res => {
          // Convert the saved array back into a React Set
          if (res.data.watched_ids) {
            setWatched(new Set(res.data.watched_ids));
          }
        })
        .catch(err => console.error("Error loading timeline", err));
    }
  }, [isAuthenticated]);

  const pushToast = useCallback((toast) => {
    const id = `${toast.key}-${Date.now()}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    // Force React to use DEMO_DATA directly while building the frontend
    setEntries(DEMO_DATA);
    setLoading(false);

    let metaTheme = document.querySelector("meta[name=theme-color]");
    if (!metaTheme) {
      metaTheme = document.createElement("meta");
      metaTheme.name = "theme-color";
      document.head.appendChild(metaTheme);
    }
    metaTheme.content = "#050706";
  }, []);

  const toggleWatched = (id) => {
    if (!isAuthenticated) {
      pushToast({
        key: 'multiverse',
        title: 'ACCESS DENIED',
        subtitle: 'You must sign in to modify the Sacred Timeline.',
      });
      return;
    }

    setWatched(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      
      const username = localStorage.getItem('username');
      if (username) {
        axios.post(`${API_URL}/api/progress/sync/`, {
          username: username,
          watched_ids: Array.from(next)
        }).catch(() => {});
      }

      return next;
    });
  };

  const overall = useMemo(() => {
    const total = entries.length;
    const done = entries.filter(e => watched.has(e.id)).length;
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [entries, watched]);

  const timelineStatus = useMemo(() => {
    if (overall.pct < 40) {
      return {
        text: 'WARNING: SEVERE BRANCHING',
        color: 'text-red-500',
        glow: 'bg-red-500/10',
        bar: 'from-red-600 to-red-400',
        border: 'border-red-500/30',
        glitch: true
      };
    } else if (overall.pct < 80) {
      return {
        text: 'MULTIVERSE STABILIZING',
        color: 'text-amber-400',
        glow: 'bg-amber-400/10',
        bar: 'from-amber-600 to-amber-400',
        border: 'border-amber-400/20',
        glitch: false
      };
    }
    return {
      text: 'SACRED TIMELINE STABLE',
      color: 'text-emerald-400',
      glow: 'bg-emerald-400/10',
      bar: 'from-emerald-600 to-emerald-400',
      border: 'border-emerald-400/20',
      glitch: false
    };
  }, [overall.pct]);

  const sagaStats = useMemo(() => {
    return SAGAS.map(s => {
      const items = entries.filter(e => e.sagas && e.sagas.includes(s.id));
      const done = items.filter(e => watched.has(e.id)).length;
      return { ...s, total: items.length, done, pct: items.length ? Math.round((done / items.length) * 100) : 0 };
    });
  }, [entries, watched]);

  const visibleEntries = useMemo(() => {
    return entries.filter(e => {
      // 1. Category Filter (All / Remaining / Watched)
      if (filter === 'watched' && !watched.has(e.id)) return false;
      if (filter === 'remaining' && watched.has(e.id)) return false;
      
      // 2. Search Filter (Real-time title & meta matching)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = e.title.toLowerCase().includes(query);
        const matchesMeta = (e.meta || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesMeta) return false;
      }
      
      return true;
    });
  }, [entries, filter, watched, searchQuery]);

  const scrollRow = (id, direction) => {
    const container = document.getElementById(`saga-row-${id}`);
    if (container) {
      container.scrollBy({ left: direction === 'left' ? -800 : 800, behavior: 'smooth' });
    }
  };

  // ACHIEVEMENT DETECTION
  useEffect(() => {
    sagaStats.forEach(s => {
      if (s.total > 0 && s.pct === 100 && !unlockedRef.current.has(s.id)) {
        unlockedRef.current.add(s.id);
        pushToast({
          key: s.id,
          title: `${s.name.toUpperCase()} COMPLETE`,
          subtitle: `All ${s.total} realities pruned. The ${s.stone} is secure.`,
        });
      }
    });
    if (overall.total > 0 && overall.pct === 100 && !unlockedRef.current.has('ALL')) {
      unlockedRef.current.add('ALL');
      pushToast({
        key: 'ALL',
        title: 'DOOMSDAY PROTOCOL COMPLETE',
        subtitle: "Every branch watched. You're ready for December 18.",
      });
    }
  }, [sagaStats, overall, pushToast]);

  // PROGRESS CARD
  const shareProgress = useCallback(async () => {
    // 1. FIRST check: Are they logged in?
    if (!isAuthenticated) {
      pushToast({
        key: 'multiverse', 
        title: 'ACCESS DENIED',
        subtitle: 'You must sign in to share timeline data.',
      });
      return;
    }

    // 2. SECOND check: Do they have at least 1 movie checked?
    if (watched.size === 0) { 
      pushToast({
        key: 'time', 
        title: 'EMPTY TIMELINE',
        subtitle: 'You need to watch at least one movie before generating a report.',
      });
      return;
    }

    // 3. If logged in AND have progress, proceed as normal
    if (sharing) return;
    setSharing(true);
    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      const width = 1080;
      const height = 1350;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#050706';
      ctx.fillRect(0, 0, width, height);

      const glow = ctx.createRadialGradient(width / 2, 260, 40, width / 2, 260, 620);
      glow.addColorStop(0, 'rgba(16,185,129,0.28)');
      glow.addColorStop(1, 'rgba(16,185,129,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(52,211,153,0.9)';
      ctx.font = "600 22px 'JetBrains Mono', monospace";
      ctx.fillText('INCURSION TRACKER', width / 2, 130);

      ctx.fillStyle = '#ffffff';
      ctx.font = "600 68px 'Chakra Petch', sans-serif";
      ctx.fillText('DOOMSDAY', width / 2, 220);
      ctx.fillStyle = '#059669';
      ctx.fillText('PROTOCOL', width / 2, 296);

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = "500 20px 'JetBrains Mono', monospace";
      ctx.fillText('CONVERGENCE', width / 2, 410);

      ctx.fillStyle = '#ffffff';
      ctx.font = "700 160px 'Chakra Petch', sans-serif";
      ctx.fillText(`${overall.pct}%`, width / 2, 570);

      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = "400 24px 'JetBrains Mono', monospace";
      ctx.fillText(`${overall.done} / ${overall.total} WATCHED`, width / 2, 620);

      const barX = 110;
      const barWidth = width - barX * 2;
      let barY = 700;
      sagaStats.forEach(s => {
        const colors = GEM_COLORS[s.id];
        ctx.textAlign = 'left';
        ctx.fillStyle = colors.hex;
        ctx.font = "600 22px 'Chakra Petch', sans-serif";
        ctx.fillText(s.name, barX, barY);

        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = "400 18px 'JetBrains Mono', monospace";
        ctx.fillText(`${s.done}/${s.total}`, barX + barWidth, barY);

        const trackY = barY + 16;
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.beginPath();
        ctx.roundRect(barX, trackY, barWidth, 10, 5);
        ctx.fill();

        ctx.fillStyle = colors.hex;
        ctx.beginPath();
        ctx.roundRect(barX, trackY, barWidth * (s.pct / 100), 10, 5);
        ctx.fill();

        barY += 74;
      });

      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = "400 18px 'JetBrains Mono', monospace";
      ctx.fillText('DATA LOGGED FOR MULTIVERSAL TRACKING', width / 2, height - 90);
      ctx.fillStyle = 'rgba(52,211,153,0.7)';
      ctx.font = "600 20px 'JetBrains Mono', monospace";
      ctx.fillText('INITIATED BY HEMANTH', width / 2, height - 55);

      canvas.toBlob(async (blob) => {
        if (!blob) { setSharing(false); return; }
        const file = new File([blob], 'doomsday-protocol-progress.png', { type: 'image/png' });

        // 1. INSTANT DOWNLOAD
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'doomsday-protocol-progress.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        // 2. NATIVE SHARE MENU
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ 
              files: [file], 
              title: 'Doomsday Protocol', 
              text: `I'm ${overall.pct}% ready for Avengers: Doomsday.` 
            });
          } catch (err) {
          }
        }

        // 3. Reset the button state
        setSharing(false);
      }, 'image/png');
    } catch (err) {
      console.error('Failed to generate progress card:', err);
      setSharing(false);
    }
  }, [overall, sagaStats, sharing, isAuthenticated, watched]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-black text-emerald-400/60 flex items-center justify-center text-[11px] md:text-lg font-['JetBrains_Mono'] tracking-[0.3em] uppercase text-center px-8 leading-relaxed">
        <FontImport />
        <span className="animate-pulse">Detecting Multiversal Incursions...</span>
      </div>
    );
  }

  if (showAuth) {
    return (
      <div className="min-h-[100dvh] bg-[#050706] text-white font-['Inter'] relative overflow-x-clip">
        <FontImport />
        <AuthGateway 
          onBack={() => setShowAuth(false)} 
          onLogin={() => {
            setIsAuthenticated(true);
            setShowAuth(false);
            pushToast({
              key: 'time',
              title: 'AUTH SUCCESS',
              subtitle: 'Welcome back, Agent. Timeline access granted.',
            });
          }}
        />
      </div>
    );
  }

  return (
    <div className="bg-[#050706] text-white font-['Inter'] relative w-full overflow-x-clip pb-[env(safe-area-inset-bottom)]">
      <FontImport />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <div className="fixed inset-0 w-full h-[100dvh] z-0 pointer-events-none bg-[#050706]">
        
        <div className={`absolute inset-0 transition-colors duration-1000 ease-in-out ${AMBIENT_THEMES[hoveredSaga]?.tint || AMBIENT_THEMES.default.tint}`} />
        
        <div 
          className={`absolute top-[-10%] left-[-5%] w-[60vw] h-[60vw] rounded-full blur-[120px] mix-blend-screen transition-all duration-1000 ease-in-out ${
            AMBIENT_THEMES[hoveredSaga]?.blob1 || AMBIENT_THEMES.default.blob1
          }`} 
        />
        <div 
          className={`absolute bottom-[-10%] right-[-5%] w-[60vw] h-[60vw] rounded-full blur-[120px] mix-blend-screen transition-all duration-1000 ease-in-out ${
            AMBIENT_THEMES[hoveredSaga]?.blob2 || AMBIENT_THEMES.default.blob2
          }`} 
        />
        
        <div 
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out mix-blend-overlay ${hoveredSaga === 'spiderverse' ? 'opacity-30' : 'opacity-0'}`}
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 20px), repeating-linear-gradient(-45deg, #fff 0px, #fff 1px, transparent 1px, transparent 20px)' }}
        />

        <div 
          className="absolute inset-0 opacity-[0.04]" 
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '48px 48px' }} 
        />
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050706_120%)] opacity-90" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-32 md:py-20">

        {/* SIGN IN / SIGN OUT BUTTON */}
        <div className="absolute top-6 right-6 z-50">
          {isAuthenticated ? (
            <button 
              onClick={() => {
                setIsAuthenticated(false);
                setWatched(new Set());
                localStorage.removeItem('username');
                pushToast({ key: 'multiverse', title: 'DISCONNECTED', subtitle: 'Timeline anchor severed.' });
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 text-sm font-['Inter'] font-medium rounded-full backdrop-blur-xl transition-all duration-300"
            >
              <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          ) : (
            <button 
              onClick={() => setShowAuth(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/20 text-white/80 hover:text-white text-sm font-['Inter'] font-medium rounded-full backdrop-blur-xl transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
            >
              <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Sign In
            </button>
          )}
        </div>

        {/* HEADER & STATS */}
        <header className="mb-12 mt-6 md:mt-2 flex flex-col md:flex-row md:items-end md:justify-between gap-8 animate-fade-in-up">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: 'pulseGlow 2s ease-in-out infinite' }} />
              <span className="text-emerald-400/100 text-[15px] font-['JetBrains_Mono'] tracking-[0.35em] uppercase">
                Incursion Tracker
              </span>
            </div>
            <h1 className="font-['Chakra_Petch'] font-semibold text-5xl md:text-6xl tracking-tight text-white leading-[0.95]">
              DOOMSDAY<br /><span className="text-emerald-700">PROTOCOL</span>
            </h1>
            <p className="text-white/70 text-base font-light mt-4 max-w-md leading-relaxed">
              Every saga colliding into December. Track what you've seen, what's left, before the multiverse runs out of road.
            </p>
          </div>

          {/* RIGHT COLUMN: STATUS WIDGET + SHARE BUTTON */}
          <div className="shrink-0 w-full md:w-64 flex flex-col gap-3">
            
            <div className={`w-full p-5 rounded-[24px] bg-white/[0.02] border backdrop-blur-md relative overflow-hidden transition-colors duration-700 ${timelineStatus.border}`}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50" style={{ animation: 'scan 4s linear infinite' }} />
              <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[60px] pointer-events-none transition-colors duration-700 ${timelineStatus.glow}`} style={{ animation: 'breathe 5s ease-in-out infinite' }} />
              <p className={`text-[12px] font-['JetBrains_Mono'] tracking-[0.2em] uppercase mb-1 transition-colors duration-700 ${timelineStatus.color} ${timelineStatus.glitch ? 'animate-glitch drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : ''}`}>
                {timelineStatus.text}
              </p>
              <div className="flex items-end gap-2 mb-3">
                <span className="font-['Chakra_Petch'] font-semibold text-5xl text-white leading-none">
                  {overall.pct}
                </span>
                <span className={`text-2xl font-['Chakra_Petch'] mb-0.5 transition-colors duration-700 ${timelineStatus.color}`}>
                  %
                </span>
              </div>
              <div className="h-1 rounded-full bg-white/10 overflow-hidden mb-2">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out ${timelineStatus.bar}`} 
                  style={{ width: `${overall.pct}%` }} 
                />
              </div>
              <p className="text-sm font-['JetBrains_Mono'] text-white/70">
                {overall.done} / {overall.total} watched
              </p>
            </div>

            {/* SHARE BUTTON */}
            <button
              onClick={shareProgress}
              disabled={sharing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-emerald-400/30 bg-emerald-400/5 hover:bg-emerald-400/15 text-emerald-300 text-[14px] font-['JetBrains_Mono'] tracking-[0.2em] uppercase transition-all duration-300 disabled:opacity-50"
            >
              {sharing ? (
                'Generating...'
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342a3 3 0 100-2.684m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share Progress
                </>
              )}
            </button>
          </div>
        </header>

        <SystemTerminalFeed />

        {/* Saga Progress Trackers */}
        <RevealOnScroll className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-16 mb-12 md:mb-20">
          {sagaStats.map(s => (
            <div
              key={s.id}
              className={`group p-5 rounded-[20px] bg-black/40 backdrop-blur-xl border ${s.theme.border} ${s.theme.bg} ${s.theme.shadow} transition-all duration-500 relative overflow-hidden`}
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className={`text-xl font-['JetBrains_Mono'] ${s.theme.text} drop-shadow-md`}>{s.code}</span>
                <span className="text-sm font-['JetBrains_Mono'] text-white/60">{s.done}/{s.total}</span>
              </div>
              
              <h3 className="font-['Chakra_Petch'] font-medium text-2xl text-white mb-1 relative z-10">{s.name}</h3>
              
              <div className="flex justify-between items-center mb-5 relative z-10">
                <p className="text-white/60 text-sm font-light">{s.tag}</p>
                <span className={`text-[9px] uppercase tracking-[0.2em] font-['JetBrains_Mono'] ${s.theme.text} opacity-80 border border-current/30 rounded-full px-2 py-0.5`}>
                  {s.stone}
                </span>
              </div>

              <div className="h-1.5 rounded-full bg-black/50 overflow-hidden relative z-10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] border border-white/5">
                <div 
                  className={`h-full rounded-full ${s.theme.progress} transition-all duration-1000 ease-out`} 
                  style={{ width: `${s.pct}%` }} 
                />
              </div>
            </div>
          ))}
        </RevealOnScroll>

        {/* Infinity Gauntlet */}
        <RevealOnScroll className="mt-12 mb-24">
          <InfinityGauntlet sagaStats={sagaStats} overallPct={overall.pct} />
        </RevealOnScroll>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 relative z-10">
          
          <div className="flex gap-2 flex-wrap">
            {['all', 'remaining', 'watched'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full border text-[12px] font-['JetBrains_Mono'] tracking-widest uppercase transition-all duration-300 ${
                  filter === f 
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-emerald-400/40 group-focus-within:text-emerald-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <input
              type="text"
              placeholder="SEARCH TIMELINE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/30 rounded-full py-2 pl-9 pr-4 text-[13px] font-['JetBrains_Mono'] text-white placeholder-white/50 focus:outline-none focus:border-emerald-500/40 focus:bg-emerald-950/20 transition-all duration-300 shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)]"
            />
            
            <div className="absolute inset-0 rounded-full bg-emerald-500/0 group-focus-within:bg-emerald-500/10 blur-md -z-10 transition-all duration-500 pointer-events-none" />
          </div>

        </div>

        {/* Saga Rows */}
        <div className="flex flex-col gap-1 md:gap-1 animate-fade-in-up delay-300">
          
          {visibleEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-white/5 rounded-2xl bg-white/[0.02] backdrop-blur-md px-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  searchQuery.trim() !== '' ? 'bg-red-600 drop-shadow-[0_0_5px_rgba(220,38,38,0.8)]' : 
                  filter === 'watched' ? 'bg-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]' : 
                  'bg-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]'
                }`} />
                <span className={`text-[14px] font-['JetBrains_Mono'] tracking-[0.3em] uppercase font-semibold ${
                  searchQuery.trim() !== '' ? 'text-red-500' : 
                  filter === 'watched' ? 'text-amber-400' : 
                  'text-emerald-400'
                }`}>
                  {searchQuery.trim() !== '' 
                    ? 'NO TIMELINE VARIANT FOUND' 
                    : filter === 'watched'
                      ? 'ZERO WATCH HISTORY DETECTED'
                      : 'ALL PROTOCOLS COMPLETED'}
                </span>
              </div>
              <p className="text-white/50 font-['JetBrains_Mono'] text-[13px] tracking-wide max-w-md leading-relaxed">
                {searchQuery.trim() !== '' 
                  ? 'Adjust your search parameters to locate the target.' 
                  : filter === 'watched'
                    ? "You haven't marked any titles as watched yet. Return to the timeline and begin tracking your progress."
                    : "You have pruned every variant. The Sacred Timeline is completely secure."}
              </p>
            </div>
          ) : (
            SAGAS.map(saga => {
            const sagaEntries = visibleEntries.filter(e => e.sagas && e.sagas.includes(saga.id));
            if (sagaEntries.length === 0) return null;

            return (
              <RevealOnScroll key={saga.id} className="delay-200">
                <section 
                  className="relative group/section"
                  onMouseEnter={() => setHoveredSaga(saga.id)}
                  onMouseLeave={() => setHoveredSaga(null)}
                >
                <div className="flex items-end justify-between mb-4 px-2">
                  <div>
                    <h2 className="font-['Chakra_Petch'] text-2xl text-white/90 font-medium tracking-wide flex items-baseline gap-2">
                      {saga.name}
                      {saga.id === 'defenders' && (
                        <span className="text-[18px] font-['Inter'] text-white/50 tracking-normal font-normal">
                          (in watch order)
                        </span>
                      )}
                    </h2>
                    <p className="text-[15px] font-['JetBrains_Mono'] text-emerald-400/80 uppercase tracking-widest mt-1">
                      {saga.tag}
                    </p>
                  </div>
                </div>

                <div className="relative">
                  
                  <button
                  onClick={() => scrollRow(saga.id, 'left')}
                  className="absolute -left-2 md:-left-6 top-[35%] -translate-y-1/2 z-30 w-11 h-11 flex items-center justify-center bg-black/80 hover:bg-emerald-500/90 border border-white/10 hover:border-emerald-400 text-white rounded-full opacity-0 group-hover/section:opacity-100 transition-all duration-300 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.8)] hidden md:flex"
                  >
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div id={`saga-row-${saga.id}`} className="flex-1 flex overflow-x-auto gap-4 pt-6 pb-20 -mt-6 snap-x snap-mandatory hide-scrollbar -mx-6 md:mx-0">
                    
                    <div className="w-4 shrink-0 snap-start md:hidden"></div>

                    {sagaEntries.map((entry, index) => {
                      const isWatched = watched.has(entry.id);
                      const isFirst = index === 0;
                      const isLast = index === sagaEntries.length - 1;
                      let popupPosition = "left-1/2 -translate-x-1/2 origin-top";
                      
                      if (isFirst) {
                        popupPosition = "left-0 origin-top-left";
                      } else if (isLast) {
                        popupPosition = "right-0 origin-top-right";
                      }

                      return (
                        <div
                          key={entry.id} 
                          className="relative w-[140px] md:w-[170px] lg:w-[190px] shrink-0 snap-start group flex flex-col gap-3 cursor-pointer"
                          onClick={() => setActivePopup(activePopup === entry.id ? null : entry.id)}
                        >
                          
                          {/* Base Card */}
                          <div className={`relative aspect-[2/3] rounded-xl overflow-hidden border bg-white/5 md:group-hover:opacity-0 md:group-hover:invisible md:group-hover:pointer-events-none ${
                            activePopup === entry.id ? 'opacity-0 invisible pointer-events-none duration-0' : 'transition-all duration-300'
                            } ${isWatched ? 'border-emerald-500/20' : 'border-white/10'}`}>
                              {entry.poster_url ? (
                                <img src={entry.poster_url} alt={entry.title} className={`w-full h-full object-cover text-transparent transition-all duration-300 ${isWatched ? 'opacity-30 grayscale-[50%]' : 'opacity-90'}`} />
                            ) : (
                              <PosterFallback title={entry.title} sagaCode={saga.code} />
                            )}
                            <div className="absolute top-2 left-2 z-10 pointer-events-none">
                              <span className={`px-2 py-1 rounded-md backdrop-blur-md border text-[10px] font-bold uppercase tracking-[0.1em] font-['JetBrains_Mono'] ${IMPORTANCE_STYLES[entry.importance] || IMPORTANCE_STYLES.optional}`}>
                                {entry.importance}
                              </span>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation(); 
                                toggleWatched(entry.id);
                              }} 
                              className={`absolute top-2 right-2 w-8 h-8 rounded-full border backdrop-blur-md flex items-center justify-center transition-all duration-300 z-20 ${isWatched ? 'bg-emerald-500/80 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-black/50 border-white/30 text-white/70 hover:bg-emerald-500/40 hover:border-emerald-400 hover:text-white'}`}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isWatched ? 2.5 : 1.5} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          </div>

                          {/* Base Text */}
                          <div className={`px-1 mt-1 md:group-hover:opacity-0 md:group-hover:invisible md:group-hover:pointer-events-none ${
                            activePopup === entry.id ? 'opacity-0 invisible pointer-events-none duration-0' : 'transition-opacity duration-300'
                            }`}>
                              <h3 className="font-['Chakra_Petch'] font-medium text-[18px] md:text-[20px] line-clamp-2 leading-tight">{entry.title}</h3>
                              <p className="text-[12px] md:text-[13.5px] text-emerald-400/80 font-['JetBrains_Mono'] truncate mt-1 mb-1.5">{entry.meta}</p>
                              <p className="text-white/70 text-[13px] md:text-[14px] font-light line-clamp-4 md:line-clamp-2 leading-relaxed">{entry.why_watch_this}</p>
                          </div>

                          {/* Pop-up (triggered by hover on desktop, tap on mobile) */}
                          <div 
                            onClick={(e) => e.stopPropagation()} 
                            className={`absolute ${popupPosition} top-0 md:top-2 w-[260px] md:w-[320px] h-max bg-[#121614] border border-white/10 rounded-xl overflow-hidden transition-all duration-300 z-50 shadow-[0_25px_50px_-12px_rgba(0,0,0,1)] flex flex-col ${
                              activePopup === entry.id 
                                ? 'opacity-100 visible scale-100' 
                                : 'opacity-0 invisible scale-95 md:group-hover:opacity-100 md:group-hover:visible md:group-hover:scale-100'
                            }`}
                          >
                            
                            <div className="w-full aspect-video relative bg-[#0a0d0b] overflow-hidden border-b border-white/5">
                              
                              {/* Mobile Close Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActivePopup(null);
                                }}
                                className="absolute top-3 right-3 z-30 w-7 h-7 flex items-center justify-center rounded-full bg-black/60 border border-white/20 text-white/80 hover:text-white backdrop-blur-md md:hidden"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>

                              {entry.poster_url ? (
                                <>
                                  <img
                                    src={entry.poster_url} 
                                    alt="" 
                                    aria-hidden="true" 
                                    className={`absolute inset-0 w-full h-full object-cover blur-xl opacity-30 scale-125 text-transparent transition-all duration-300 ${isWatched ? 'grayscale-[50%]' : ''}`} 
                                  />
                                  <img 
                                    src={entry.poster_url} 
                                    alt={entry.title} 
                                    className={`relative z-0 w-full h-full object-contain pt-3 pb-1 text-transparent transition-all duration-300 ${isWatched ? 'opacity-30 grayscale-[50%]' : 'opacity-100 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]'}`} 
                                  />
                                </>
                              ) : (
                                <PosterFallback title={entry.title} sagaCode={saga.code} />
                              )}
                              
                              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#121614] via-[#121614]/50 to-transparent pointer-events-none z-10" />

                              {/* Importance Badge */}
                              <div className="absolute top-3 left-3 z-20 pointer-events-none">
                                <span className={`px-2 py-1 rounded-md backdrop-blur-md border text-[10px] font-bold uppercase tracking-[0.1em] font-['JetBrains_Mono'] ${IMPORTANCE_STYLES[entry.importance] || IMPORTANCE_STYLES.optional}`}>
                                  {entry.importance}
                                </span>
                              </div>
                            </div>
                            
                            {/* Info Container */}
                            <div className="flex flex-col px-4 pt-2 pb-4 relative z-10">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <h3 className="font-['Chakra_Petch'] font-semibold text-[18px] md:text-[20px] text-white leading-tight">
                                  {entry.title}
                                </h3>
                                
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleWatched(entry.id);
                                  }}
                                  className={`shrink-0 w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-300 mt-0.5 ${
                                    isWatched
                                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                                      : 'bg-white/5 border-white/30 text-white/70 hover:bg-emerald-500/40 hover:border-emerald-400 hover:text-white'
                                  }`}
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isWatched ? 2.5 : 1.5} d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                              </div>
                              
                              <p className="text-[12px] text-emerald-400 font-['JetBrains_Mono'] mb-3">
                                {entry.meta}
                              </p>
                              
                              <p className="text-white/70 text-[13px] font-light leading-relaxed">
                                {entry.why_watch_this}
                              </p>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                    <div className="w-2 shrink-0 md:hidden"></div>
                  </div>

                  {/* Right Navigation Arrow */}
                  <button
                  onClick={() => scrollRow(saga.id, 'right')}
                  className="absolute -right-2 md:-right-6 top-[35%] -translate-y-1/2 z-30 w-11 h-11 flex items-center justify-center bg-black/80 hover:bg-emerald-500/90 border border-white/10 hover:border-emerald-400 text-white rounded-full opacity-0 group-hover/section:opacity-100 transition-all duration-300 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.8)] hidden md:flex"
                  >
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                </div>
              </section>
            </RevealOnScroll>
            );
          })
        )}
        </div>

        {/* CASE FILES — CAST DOSSIER */}
        <RevealOnScroll className="mt-4 md:mt-18">
          <CastDossier cast={CAST} />
        </RevealOnScroll>

        {/* TRANSMISSION LOG */}
        <RevealOnScroll className="mt-25 mb-25">
          <MediaVault items={MEDIA_ITEMS} />
        </RevealOnScroll>

        {/* APPLE MUSIC SCORE FREQUENCY */}
        <RevealOnScroll className="mb-10">
          <div className="max-w-4xl mx-auto">
            <AppleMusicPanel 
              title="The Sound of the Collision"
              subtitle="The official cinematic themes of the Multiverse."
              embedUrl="https://embed.music.apple.com/in/playlist/earth-616-radio/pl.u-DdANrXes0d66dX1?theme=dark" 
            />
          </div>
        </RevealOnScroll>

        {/* Footer / Credits Section */}
        <footer className="mt-15 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in-up delay-400">
          
          {/* Branding & Disclaimer */}
          <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
            <span className="text-emerald-400/60 font-['Chakra_Petch'] font-semibold tracking-widest text-s uppercase drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]">
              Doomsday Protocol
            </span>
            <span className="text-[11px] md:text-[12px] font-['JetBrains_Mono'] text-white/60 tracking-widest uppercase mt-1">
              Data logged for multiversal tracking. Not affiliated with Marvel Studios.
            </span>
          </div>

          {/* Credits */}
          <div className="flex items-center gap-2 text-[14px] font-['JetBrains_Mono'] tracking-widest uppercase">
            <span className="text-white/60">Initiated by</span>
            <a 
              href="https://hemanthdev.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-600 font-semibold hover:text-emerald-400 transition-colors duration-300 hover:underline underline-offset-4"
            >
              Hemanth
            </a>
          </div>

        </footer>

      </div>
    </div>
  );
}