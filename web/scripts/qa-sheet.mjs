// node sheet.mjs out.png width cols name1 name2 ... (reads ../qa/<name>.png, trims empty bottom)
import sharp from 'sharp'
const [out, w, cols, ...names] = process.argv.slice(2)
const W = Number(w), C = Number(cols)
const tiles = []
for (const n of names) {
  const img = sharp(`../qa/${n}.png`)
  const { data, info } = await img.clone().raw().toBuffer({ resolveWithObject: true })
  // find last row that is not page-background (#fafaf7)
  let last = info.height - 1
  outer: for (; last > 0; last--) for (let x = 0; x < info.width; x += 7) {
    const i = (last * info.width + x) * info.channels
    if (Math.abs(data[i] - 250) + Math.abs(data[i + 1] - 250) + Math.abs(data[i + 2] - 247) > 12) break outer
  }
  const buf = await sharp(`../qa/${n}.png`).extract({ left: 0, top: 0, width: info.width, height: last + 1 }).resize(W).toBuffer({ resolveWithObject: true })
  tiles.push(buf)
}
const rowH = []
for (let r = 0; r < Math.ceil(tiles.length / C); r++) rowH.push(Math.max(...tiles.slice(r * C, r * C + C).map((t) => t.info.height)))
const comp = []
tiles.forEach((t, i) => comp.push({ input: t.data, left: (i % C) * (W + 12), top: rowH.slice(0, Math.floor(i / C)).reduce((a, b) => a + b + 12, 0) }))
await sharp({ create: { width: C * (W + 12), height: rowH.reduce((a, b) => a + b + 12, 0), channels: 3, background: '#7a7a7a' } }).composite(comp).png().toFile(`../qa/${out}`)
console.log('sheet', out)
