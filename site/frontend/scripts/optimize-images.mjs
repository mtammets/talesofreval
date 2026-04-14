import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const imgDir = join(__dirname, '..', 'src', 'img');

const images = [
  'home-bg.png',
  'bgcontact.png',
  'storybg.png',
  'virtual-bg.png',
  'virtual-image-phones.png',
  'mobile-virtual-phone.png',
  'team.png',
  'private.png',
  'quick.png',
  'destination.png',
  'pulmad.png',
  'gps-game.png',
  'person1.png',
  'person2.png',
  'person3.png',
  'team-background.png',
  'privatebg.png',
  'destinationbg.png',
  'quickbg.png',
  'weddingbg.jpg',
  'team-teamwork.png',
  'team-connections.png',
  'team-experiences.png',
  'private-story.png',
  'private-deliver.png',
  'private-revelation.png',
  'quick-minutes.png',
  'quick-heart.png',
  'quick-imagine.png',
  'destination-adventures.png',
  'destination-await.png',
  'destination-shows.png',
  'weddings-fantasy.png',
  'weddings-hosts.png',
  'weddings-champions.png',
  'june2019.png',
  'may2019.png',
  'november2019.png',
];

const largeBackgrounds = new Set([
  'home-bg.png',
  'bgcontact.png',
  'storybg.png',
  'virtual-bg.png',
  'team-background.png',
  'privatebg.png',
  'destinationbg.png',
  'quickbg.png',
  'weddingbg.jpg',
]);

await mkdir(imgDir, { recursive: true });

for (const filename of images) {
  const source = join(imgDir, filename);
  const output = join(imgDir, filename.replace(/\.(png|jpe?g)$/i, '.webp'));
  const width = largeBackgrounds.has(filename) ? 1800 : 1200;
  const quality = largeBackgrounds.has(filename) ? 82 : 80;

  await sharp(source)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 6 })
    .toFile(output);

  console.log(`optimized ${filename} -> ${output.split('/').pop()}`);
}
