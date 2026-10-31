import fs from 'fs';
import zlib from 'zlib';

function createPNG(size, bgR, bgG, bgB, accentR, accentG, accentB) {
  const width = size;
  const height = size;
  // Raw image data: height rows, each row has 1 filter byte (0) + width * 4 bytes RGBA
  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowBytes);

  const cx = width / 2;
  const cy = height / 2;
  const rLimit = size * 0.42;

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type: None
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Squircle distance
      const nx = Math.abs(dx) / (size * 0.44);
      const ny = Math.abs(dy) / (size * 0.44);
      const squircle = Math.pow(nx, 4) + Math.pow(ny, 4);

      if (squircle > 1.05) {
        // Outside squircle
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
      } else if (squircle > 0.98) {
        // Border ring
        rawData[offset++] = 0;
        rawData[offset++] = 245;
        rawData[offset++] = 212;
        rawData[offset++] = 255;
      } else {
        // Inside shape
        const isRunnerBody = (Math.abs(dx) < size * 0.15 && Math.abs(dy) < size * 0.28) ||
                             (dist < size * 0.18);
        const isStreak = (y > cy - size * 0.05 && y < cy + size * 0.05 && x > cx - size * 0.35 && x < cx + size * 0.35);

        if (isRunnerBody || isStreak) {
          rawData[offset++] = accentR;
          rawData[offset++] = accentG;
          rawData[offset++] = accentB;
          rawData[offset++] = 255;
        } else {
          // Gradient dark background
          const grad = Math.min(1, Math.max(0, (y / height) * 0.5 + 0.3));
          rawData[offset++] = Math.round(bgR * grad);
          rawData[offset++] = Math.round(bgG * grad);
          rawData[offset++] = Math.round(bgB * grad);
          rawData[offset++] = 255;
        }
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT chunk
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crc32Table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const crc32Table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crc32Table[i] = c;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

if (!fs.existsSync('/public')) {
  fs.mkdirSync('/public', { recursive: true });
}

fs.writeFileSync('/public/icon-192.png', createPNG(192, 14, 18, 48, 0, 245, 212));
fs.writeFileSync('/public/icon-512.png', createPNG(512, 14, 18, 48, 0, 245, 212));
console.log('Icons generated successfully!');
