import 'dotenv/config'
import express, { type Request, type Response, type NextFunction } from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const { Pool } = pg
const isProd = process.env.NODE_ENV === 'production'

// Refuse to start in production without a real JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'uap-secret-change-in-production'
if (isProd && JWT_SECRET === 'uap-secret-change-in-production') {
  console.error('FATAL: JWT_SECRET env var must be set in production')
  process.exit(1)
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://uap_user:uap_pass@localhost:5434/uap_db',
  max: 10,
})

// ── Auth middleware ───────────────────────────────────────────────────────────

interface AuthRequest extends Request {
  user?: { id: number; email: string; username: string }
}

function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' })
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as { id: number; email: string; username: string }
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// ── Multer setup ──────────────────────────────────────────────────────────────

const uploadsDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB (photos & audio)
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav', 'audio/mpeg']
    cb(null, allowed.includes(file.mimetype))
  },
})

const uploadVideo = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB for video
  fileFilter: (_req, file, cb) => {
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mpeg']
    cb(null, allowed.includes(file.mimetype))
  },
})

// ── NASA Fireball cache ───────────────────────────────────────────────────────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

interface Fireball {
  date: string
  lat: number
  lon: number
}

let fireballCache: { data: Fireball[]; fetchedAt: number } | null = null

async function getFireballs(): Promise<Fireball[]> {
  const ONE_DAY = 24 * 60 * 60 * 1000
  if (fireballCache && Date.now() - fireballCache.fetchedAt < ONE_DAY) {
    return fireballCache.data
  }
  try {
    const resp = await fetch('https://ssd.jpl.nasa.gov/fireball/query.api?date-min=2020-01-01&req-loc=true')
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const json = await resp.json() as { fields: string[]; data: (string | null)[][] }
    const fields = json.fields
    const dateIdx = fields.indexOf('date')
    const latIdx = fields.indexOf('lat')
    const latDirIdx = fields.indexOf('lat-dir')
    const lonIdx = fields.indexOf('lon')
    const lonDirIdx = fields.indexOf('lon-dir')
    const fireballs: Fireball[] = []
    for (const row of (json.data ?? [])) {
      const lat = parseFloat(row[latIdx] as string)
      const lon = parseFloat(row[lonIdx] as string)
      if (isNaN(lat) || isNaN(lon)) continue
      fireballs.push({
        date: (row[dateIdx] as string).slice(0, 10),
        lat: (row[latDirIdx] as string) === 'S' ? -lat : lat,
        lon: (row[lonDirIdx] as string) === 'W' ? -lon : lon,
      })
    }
    fireballCache = { data: fireballs, fetchedAt: Date.now() }
    console.log(`✓ NASA fireball cache: ${fireballs.length} events`)
    return fireballs
  } catch (err) {
    console.warn('NASA fireball fetch failed:', (err as Error).message)
    return fireballCache?.data ?? []
  }
}

// ── DB init ───────────────────────────────────────────────────────────────────

async function initDB() {
  for (let i = 0; i < 10; i++) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          username VARCHAR(100) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS sightings (
          id SERIAL PRIMARY KEY,
          case_number VARCHAR(20) UNIQUE NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          latitude DECIMAL(9,6) NOT NULL,
          longitude DECIMAL(9,6) NOT NULL,
          sighting_date DATE NOT NULL,
          sighting_time VARCHAR(10),
          shape VARCHAR(100),
          duration VARCHAR(100),
          altitude VARCHAR(100),
          witness_name VARCHAR(255) DEFAULT 'Anonymous',
          location_name VARCHAR(255),
          weather VARCHAR(255),
          status VARCHAR(50) DEFAULT 'UNDER INVESTIGATION',
          saw_this_too_count INTEGER DEFAULT 0,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS comments (
          id SERIAL PRIMARY KEY,
          sighting_id INTEGER REFERENCES sightings(id) ON DELETE CASCADE,
          author VARCHAR(255) NOT NULL DEFAULT 'Anonymous',
          content TEXT NOT NULL,
          saw_this_too BOOLEAN DEFAULT FALSE,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS astronomical_events (
          id SERIAL PRIMARY KEY,
          name VARCHAR(200) NOT NULL,
          event_type VARCHAR(50) NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          peak_date DATE,
          description TEXT,
          global BOOLEAN DEFAULT true
        );
      `)

      // Add columns if they don't exist (safe ALTER TABLE)
      await pool.query(`ALTER TABLE sightings ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500)`)
      await pool.query(`ALTER TABLE sightings ADD COLUMN IF NOT EXISTS audio_url VARCHAR(500)`)
      await pool.query(`ALTER TABLE sightings ADD COLUMN IF NOT EXISTS video_url VARCHAR(500)`)
      await pool.query(`ALTER TABLE sightings ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL`)
      await pool.query(`ALTER TABLE comments ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL`)
      await pool.query(`ALTER TABLE sightings ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'`)
      await pool.query(`ALTER TABLE sightings ADD COLUMN IF NOT EXISTS intelligence JSONB`)
      await pool.query(`ALTER TABLE sightings ADD COLUMN IF NOT EXISTS verdict VARCHAR(100)`)
      await pool.query(`ALTER TABLE sightings ADD COLUMN IF NOT EXISTS verdict_explanation_id INTEGER`)
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500)`)
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE`)
      await pool.query(`ALTER TABLE sightings ADD COLUMN IF NOT EXISTS is_historic BOOLEAN DEFAULT FALSE`)
      await pool.query(`ALTER TABLE sightings ADD COLUMN IF NOT EXISTS historic_ref VARCHAR(100)`)

      // Explanations feature
      await pool.query(`
        CREATE TABLE IF NOT EXISTS explanations (
          id SERIAL PRIMARY KEY,
          sighting_id INTEGER REFERENCES sightings(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          author VARCHAR(255) NOT NULL DEFAULT 'Anonymous',
          category VARCHAR(100) NOT NULL,
          note TEXT,
          upvotes INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `)
      await pool.query(`
        CREATE TABLE IF NOT EXISTS explanation_votes (
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          explanation_id INTEGER NOT NULL REFERENCES explanations(id) ON DELETE CASCADE,
          PRIMARY KEY (user_id, explanation_id)
        )
      `)

      // Seed astronomical events if table is empty
      const evtCount = await pool.query('SELECT COUNT(*) FROM astronomical_events')
      if (parseInt(evtCount.rows[0].count) === 0) await seedAstroEvents()

      // Seed historic cases if not already present
      const histCount = await pool.query(`SELECT COUNT(*) FROM sightings WHERE is_historic = TRUE`)
      if (parseInt(histCount.rows[0].count) === 0) await seedHistoricCases()

      console.log('✓ Database ready')
      const count = await pool.query('SELECT COUNT(*) FROM sightings')
      if (parseInt(count.rows[0].count) === 0) await seedData()
      return
    } catch (err) {
      console.log(`DB attempt ${i + 1}/10 failed, retrying in 2s...`)
      await new Promise(r => setTimeout(r, 2000))
    }
  }
  throw new Error('Could not connect to database after 10 attempts')
}

async function seedData() {
  const seeds = [
    ['UAP-2024-00001', 'Silent Triangle Over Nevada Desert', 'Three amber lights in a perfect triangle formation, completely silent. Hovered for approximately 4 minutes before accelerating vertically at impossible speed. No sound, no exhaust trail.', 36.1699, -115.1398, '2024-03-15', '02:47', 'Triangle', '4 minutes', '~2000ft', 'John M.', 'Las Vegas, NV', 'Clear, calm'],
    ['UAP-2024-00002', 'Metallic Disc Over Pacific Coast', 'Disc-shaped object reflecting sunlight. Performed 90-degree turns at high speed. Several beachgoers witnessed the event. Object disappeared into cloud bank and never re-emerged.', 37.7749, -122.4194, '2024-05-22', '16:12', 'Disk', '8 minutes', 'Unknown', 'Sarah K.', 'San Francisco, CA', 'Partly cloudy'],
    ['UAP-2024-00003', 'Orb Fleet Over English Channel', 'Fleet of 12-15 luminous orbs travelling in formation. Observed by multiple ship crews. Objects descended to sea level and then re-ascended. Radar contact confirmed by ATC.', 51.0, 1.5, '2024-07-04', '22:15', 'Sphere', '12 minutes', 'Variable', 'R. Hargreaves', 'English Channel', 'Overcast, light fog'],
    ['UAP-2024-00004', 'Chevron Craft Near Phoenix', 'Massive V-shaped craft, estimated wingspan 1 mile. Multiple witnesses across 3 cities. Dead silent. Moving impossibly slow for its size. Police received 200+ calls.', 33.4484, -112.0740, '2024-01-08', '20:30', 'Chevron', '20 minutes', '~1500ft', 'Anonymous', 'Phoenix, AZ', 'Clear'],
    ['UAP-2024-00005', 'Cylinder Object Over Tokyo', 'Elongated silver cylinder hovering above Shinjuku district. Visible to thousands of commuters. Livestreamed on social media. Object split into two smaller objects before disappearing.', 35.6762, 139.6503, '2024-09-11', '08:45', 'Cylinder', '6 minutes', '~800ft', 'T. Yamamoto', 'Tokyo, Japan', 'Clear, sunny'],
  ]
  for (const s of seeds) {
    await pool.query(
      `INSERT INTO sightings (case_number,title,description,latitude,longitude,sighting_date,sighting_time,shape,duration,altitude,witness_name,location_name,weather)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT DO NOTHING`, s
    )
  }
  await pool.query(`UPDATE sightings SET saw_this_too_count=47  WHERE case_number='UAP-2024-00001'`)
  await pool.query(`UPDATE sightings SET saw_this_too_count=124 WHERE case_number='UAP-2024-00002'`)
  await pool.query(`UPDATE sightings SET saw_this_too_count=89  WHERE case_number='UAP-2024-00003'`)
  await pool.query(`UPDATE sightings SET saw_this_too_count=312 WHERE case_number='UAP-2024-00004'`)
  await pool.query(`UPDATE sightings SET saw_this_too_count=203 WHERE case_number='UAP-2024-00005'`)

  const sightings = await pool.query('SELECT id FROM sightings ORDER BY id')
  const ids = sightings.rows.map((r: { id: number }) => r.id)
  if (ids.length > 0) {
    await pool.query(`INSERT INTO comments (sighting_id,author,content,saw_this_too) VALUES ($1,'Retired USAF Pilot','I was stationed nearby on that date. We were ordered not to discuss what we saw. This report is accurate.',true)`, [ids[0]])
    await pool.query(`INSERT INTO comments (sighting_id,author,content,saw_this_too) VALUES ($1,'Local Resident','Saw the same thing from my backyard. My phone compass went haywire while it was overhead.',true)`, [ids[0]])
    await pool.query(`INSERT INTO comments (sighting_id,author,content,saw_this_too) VALUES ($1,'Amateur Astronomer','I had my telescope out that night. This was no satellite or conventional aircraft.',false)`, [ids[1]])
    await pool.query(`INSERT INTO comments (sighting_id,author,content,saw_this_too) VALUES ($1,'Cargo Ship Captain','Our entire crew witnessed this event. Radar showed the objects but ATC denied having any contacts.',true)`, [ids[2]])
  }
  console.log('✓ Sample data seeded')
}

async function seedAstroEvents() {
  const events: [string, string, string, string, string | null, string][] = [
    // Perseids (peak Aug 11–13, active Jul 17 – Aug 24)
    ['Perseid Meteor Shower 2020', 'meteor_shower', '2020-07-17', '2020-08-24', '2020-08-12', 'One of the most prolific annual meteor showers, produced by Comet Swift-Tuttle debris. Up to 100 meteors/hr at peak.'],
    ['Perseid Meteor Shower 2021', 'meteor_shower', '2021-07-17', '2021-08-24', '2021-08-12', 'Annual Perseid shower. Radiant in Perseus constellation.'],
    ['Perseid Meteor Shower 2022', 'meteor_shower', '2022-07-17', '2022-08-24', '2022-08-13', 'Annual Perseid shower. Radiant in Perseus constellation.'],
    ['Perseid Meteor Shower 2023', 'meteor_shower', '2023-07-17', '2023-08-24', '2023-08-13', 'Annual Perseid shower. Radiant in Perseus constellation.'],
    ['Perseid Meteor Shower 2024', 'meteor_shower', '2024-07-17', '2024-08-24', '2024-08-12', 'Annual Perseid shower. Radiant in Perseus constellation.'],
    ['Perseid Meteor Shower 2025', 'meteor_shower', '2025-07-17', '2025-08-24', '2025-08-12', 'Annual Perseid shower. Radiant in Perseus constellation.'],
    ['Perseid Meteor Shower 2026', 'meteor_shower', '2026-07-17', '2026-08-24', '2026-08-12', 'Annual Perseid shower. Radiant in Perseus constellation.'],
    // Leonids (peak Nov 17–18, active Nov 6–30)
    ['Leonid Meteor Shower 2020', 'meteor_shower', '2020-11-06', '2020-11-30', '2020-11-17', 'Annual Leonids, debris from Comet Tempel-Tuttle. Radiant in Leo.'],
    ['Leonid Meteor Shower 2021', 'meteor_shower', '2021-11-06', '2021-11-30', '2021-11-17', 'Annual Leonids. Radiant in Leo.'],
    ['Leonid Meteor Shower 2022', 'meteor_shower', '2022-11-06', '2022-11-30', '2022-11-17', 'Annual Leonids. Radiant in Leo.'],
    ['Leonid Meteor Shower 2023', 'meteor_shower', '2023-11-06', '2023-11-30', '2023-11-17', 'Annual Leonids. Radiant in Leo.'],
    ['Leonid Meteor Shower 2024', 'meteor_shower', '2024-11-06', '2024-11-30', '2024-11-17', 'Annual Leonids. Radiant in Leo.'],
    ['Leonid Meteor Shower 2025', 'meteor_shower', '2025-11-06', '2025-11-30', '2025-11-17', 'Annual Leonids. Radiant in Leo.'],
    ['Leonid Meteor Shower 2026', 'meteor_shower', '2026-11-06', '2026-11-30', '2026-11-17', 'Annual Leonids. Radiant in Leo.'],
    // Geminids (peak Dec 13–14, active Dec 4–20)
    ['Geminid Meteor Shower 2020', 'meteor_shower', '2020-12-04', '2020-12-20', '2020-12-14', 'One of the best annual showers, up to 120 meteors/hr. Debris from asteroid 3200 Phaethon.'],
    ['Geminid Meteor Shower 2021', 'meteor_shower', '2021-12-04', '2021-12-20', '2021-12-14', 'Annual Geminids. Radiant in Gemini.'],
    ['Geminid Meteor Shower 2022', 'meteor_shower', '2022-12-04', '2022-12-20', '2022-12-13', 'Annual Geminids. Radiant in Gemini.'],
    ['Geminid Meteor Shower 2023', 'meteor_shower', '2023-12-04', '2023-12-20', '2023-12-14', 'Annual Geminids. Radiant in Gemini.'],
    ['Geminid Meteor Shower 2024', 'meteor_shower', '2024-12-04', '2024-12-20', '2024-12-13', 'Annual Geminids. Radiant in Gemini.'],
    ['Geminid Meteor Shower 2025', 'meteor_shower', '2025-12-04', '2025-12-20', '2025-12-14', 'Annual Geminids. Radiant in Gemini.'],
    ['Geminid Meteor Shower 2026', 'meteor_shower', '2026-12-04', '2026-12-20', '2026-12-14', 'Annual Geminids. Radiant in Gemini.'],
    // Quadrantids (peak Jan 3–4, active Dec 28 – Jan 12)
    ['Quadrantid Meteor Shower 2020', 'meteor_shower', '2019-12-28', '2020-01-12', '2020-01-04', 'Intense but brief annual shower, up to 120 meteors/hr. Radiant near Boötes.'],
    ['Quadrantid Meteor Shower 2021', 'meteor_shower', '2020-12-28', '2021-01-12', '2021-01-03', 'Annual Quadrantids. Radiant near Boötes.'],
    ['Quadrantid Meteor Shower 2022', 'meteor_shower', '2021-12-28', '2022-01-12', '2022-01-03', 'Annual Quadrantids. Radiant near Boötes.'],
    ['Quadrantid Meteor Shower 2023', 'meteor_shower', '2022-12-28', '2023-01-12', '2023-01-04', 'Annual Quadrantids. Radiant near Boötes.'],
    ['Quadrantid Meteor Shower 2024', 'meteor_shower', '2023-12-28', '2024-01-12', '2024-01-04', 'Annual Quadrantids. Radiant near Boötes.'],
    ['Quadrantid Meteor Shower 2025', 'meteor_shower', '2024-12-28', '2025-01-12', '2025-01-03', 'Annual Quadrantids. Radiant near Boötes.'],
    ['Quadrantid Meteor Shower 2026', 'meteor_shower', '2025-12-28', '2026-01-12', '2026-01-04', 'Annual Quadrantids. Radiant near Boötes.'],
    // Lyrids (peak Apr 22–23, active Apr 14 – Apr 30)
    ['Lyrid Meteor Shower 2020', 'meteor_shower', '2020-04-14', '2020-04-30', '2020-04-22', 'Annual Lyrids, debris from Comet Thatcher. Radiant in Lyra.'],
    ['Lyrid Meteor Shower 2021', 'meteor_shower', '2021-04-14', '2021-04-30', '2021-04-22', 'Annual Lyrids. Radiant in Lyra.'],
    ['Lyrid Meteor Shower 2022', 'meteor_shower', '2022-04-14', '2022-04-30', '2022-04-22', 'Annual Lyrids. Radiant in Lyra.'],
    ['Lyrid Meteor Shower 2023', 'meteor_shower', '2023-04-14', '2023-04-30', '2023-04-23', 'Annual Lyrids. Radiant in Lyra.'],
    ['Lyrid Meteor Shower 2024', 'meteor_shower', '2024-04-14', '2024-04-30', '2024-04-22', 'Annual Lyrids. Radiant in Lyra.'],
    ['Lyrid Meteor Shower 2025', 'meteor_shower', '2025-04-14', '2025-04-30', '2025-04-22', 'Annual Lyrids. Radiant in Lyra.'],
    ['Lyrid Meteor Shower 2026', 'meteor_shower', '2026-04-14', '2026-04-30', '2026-04-22', 'Annual Lyrids. Radiant in Lyra.'],
    // Eta Aquariids (peak May 5–6, active Apr 19 – May 28)
    ['Eta Aquariid Meteor Shower 2020', 'meteor_shower', '2020-04-19', '2020-05-28', '2020-05-06', 'Debris from Halley\'s Comet. Up to 60 meteors/hr in Southern Hemisphere. Radiant in Aquarius.'],
    ['Eta Aquariid Meteor Shower 2021', 'meteor_shower', '2021-04-19', '2021-05-28', '2021-05-05', 'Annual Eta Aquariids. Radiant in Aquarius.'],
    ['Eta Aquariid Meteor Shower 2022', 'meteor_shower', '2022-04-19', '2022-05-28', '2022-05-06', 'Annual Eta Aquariids. Radiant in Aquarius.'],
    ['Eta Aquariid Meteor Shower 2023', 'meteor_shower', '2023-04-19', '2023-05-28', '2023-05-06', 'Annual Eta Aquariids. Radiant in Aquarius.'],
    ['Eta Aquariid Meteor Shower 2024', 'meteor_shower', '2024-04-19', '2024-05-28', '2024-05-05', 'Annual Eta Aquariids. Radiant in Aquarius.'],
    ['Eta Aquariid Meteor Shower 2025', 'meteor_shower', '2025-04-19', '2025-05-28', '2025-05-06', 'Annual Eta Aquariids. Radiant in Aquarius.'],
    ['Eta Aquariid Meteor Shower 2026', 'meteor_shower', '2026-04-19', '2026-05-28', '2026-05-05', 'Annual Eta Aquariids. Radiant in Aquarius.'],
    // Solar eclipses
    ['Total Solar Eclipse', 'eclipse', '2024-04-08', '2024-04-08', '2024-04-08', 'Total solar eclipse visible across Mexico, United States, and Canada. Path of totality crossed 13 US states.'],
    ['Annular Solar Eclipse', 'eclipse', '2023-10-14', '2023-10-14', '2023-10-14', 'Annular "ring of fire" solar eclipse visible across the Americas.'],
    ['Annular Solar Eclipse', 'eclipse', '2021-06-10', '2021-06-10', '2021-06-10', 'Annular solar eclipse visible from parts of Canada, Greenland, and Russia.'],
    // Great conjunction
    ['Jupiter-Saturn Great Conjunction', 'conjunction', '2020-12-16', '2020-12-25', '2020-12-21', 'Closest visible Jupiter-Saturn conjunction since 1623. The two planets appeared separated by only 0.1 degrees, creating a "Christmas Star" effect.'],
    // Supermoons
    ['Supermoon', 'satellite', '2020-04-07', '2020-04-08', '2020-04-08', 'Super Pink Moon — the largest and brightest full moon of 2020.'],
    ['Supermoon', 'satellite', '2021-05-26', '2021-05-26', '2021-05-26', 'Super Flower Blood Moon — total lunar eclipse coinciding with a supermoon.'],
    ['Supermoon', 'satellite', '2022-07-13', '2022-07-13', '2022-07-13', 'Super Buck Moon — largest supermoon of 2022.'],
    ['Supermoon', 'satellite', '2023-08-01', '2023-08-01', '2023-08-01', 'Super Sturgeon Moon — full supermoon.'],
    ['Supermoon', 'satellite', '2024-09-17', '2024-09-18', '2024-09-18', 'Super Harvest Moon — partial lunar eclipse coinciding with a supermoon.'],
  ]

  for (const [name, type, start, end, peak, desc] of events) {
    await pool.query(
      `INSERT INTO astronomical_events (name, event_type, start_date, end_date, peak_date, description, global)
       VALUES ($1,$2,$3,$4,$5,$6,true) ON CONFLICT DO NOTHING`,
      [name, type, start, end, peak, desc]
    )
  }
  console.log('✓ Astronomical events seeded')
}

async function seedHistoricCases() {
  const cases = [
    {
      case_number: 'SS-HIST-1980-001',
      title: 'Rendlesham Forest Incident',
      description: `Over three nights in late December 1980, United States Air Force personnel stationed at RAF Bentwaters and RAF Woodbridge reported a series of unexplained lights and a landed craft in Rendlesham Forest, Suffolk, England.\n\nOn the night of 25–26 December, a triangular metallic object was encountered at close range by Staff Sgt Jim Penniston and Airman John Burroughs. Penniston reportedly touched the craft and sketched hieroglyphic-like symbols on its hull. The object emitted a blinding white light before silently departing at high speed.\n\nOn the night of 27–28 December, Deputy Base Commander Lt Col Charles Halt led a second investigation team into the forest. He recorded the entire encounter on a personal audio tape — which survives to this day. The team documented physical landing impressions in the soil, elevated radiation readings at the site, and bright pulsating lights that manoeuvred between the trees and appeared to send beams of light down toward the ground.\n\nThe incident was formally reported to the UK Ministry of Defence by Wing Commander Gordon Williams. The MoD's response — that the event had "no defence significance" — has been disputed by witnesses ever since.\n\nRendlesham Forest remains one of the most thoroughly documented and credible UAP encounters in history, involving multiple trained military witnesses, physical trace evidence, and recorded testimony.`,
      latitude: 52.0897,
      longitude: 1.4436,
      sighting_date: '1980-12-26',
      sighting_time: '03:00',
      shape: 'Triangle',
      duration: '3 nights',
      altitude: 'Ground level',
      witness_name: 'USAF Personnel — RAF Bentwaters',
      location_name: 'Rendlesham Forest, Suffolk, England',
      weather: 'Clear, cold',
      tags: ['military', 'multiple-witnesses', 'physical-evidence', 'declassified', 'close-encounter'],
      historic_ref: 'MoD File DEFE 24/1948',
    },
  ]

  for (const c of cases) {
    await pool.query(
      `INSERT INTO sightings
        (case_number, title, description, latitude, longitude, sighting_date, sighting_time,
         shape, duration, altitude, witness_name, location_name, weather,
         tags, is_historic, historic_ref, saw_this_too_count)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,TRUE,$15,0)
       ON CONFLICT (case_number) DO NOTHING`,
      [c.case_number, c.title, c.description, c.latitude, c.longitude, c.sighting_date,
       c.sighting_time, c.shape, c.duration, c.altitude, c.witness_name, c.location_name,
       c.weather, c.tags, c.historic_ref]
    )
  }
  console.log('✓ Historic cases seeded')
}

function generateCaseNumber() {
  const year = new Date().getFullYear()
  const num = Math.floor(Math.random() * 99999).toString().padStart(5, '0')
  return `UAP-${year}-${num}`
}

// ── App ───────────────────────────────────────────────────────────────────────

const app = express()

// CORS — locked to configured origin in production
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3333',
  credentials: true,
}))

// Rate limiting
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false })
const authLimiter    = rateLimit({ windowMs: 15 * 60 * 1000, max: 20,  standardHeaders: true, legacyHeaders: false, message: { error: 'Too many attempts, please try again later' } })
const uploadLimiter  = rateLimit({ windowMs: 60 * 60 * 1000, max: 30,  standardHeaders: true, legacyHeaders: false, message: { error: 'Upload limit reached, please try again later' } })

app.use(generalLimiter)
app.use(express.json())

// Serve uploaded photos as static files
app.use('/uploads', express.static(uploadsDir))

// ── Auth routes ───────────────────────────────────────────────────────────────

app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { email, username, password } = req.body
    if (!email || !username || !password) return res.status(400).json({ error: 'Email, username and password are required' })
    if (username.trim().length < 2) return res.status(400).json({ error: 'Username must be at least 2 characters' })
    if (username.trim().length > 50) return res.status(400).json({ error: 'Username must be 50 characters or fewer' })
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])
    if (exists.rows.length) return res.status(409).json({ error: 'An account with that email already exists' })

    const hash = await bcrypt.hash(password, 12)
    const result = await pool.query(
      'INSERT INTO users (email, username, password_hash) VALUES ($1,$2,$3) RETURNING id, email, username, avatar_url',
      [email.toLowerCase(), username, hash]
    )
    const user = result.rows[0]
    const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '30d' })
    res.json({ token, user: { id: user.id, email: user.email, username: user.username, avatar_url: user.avatar_url ?? null } })
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' })
  }
})

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()])
    const user = result.rows[0]
    if (!user) return res.status(401).json({ error: 'Invalid email or password' })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' })

    const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '30d' })
    res.json({ token, user: { id: user.id, email: user.email, username: user.username, avatar_url: user.avatar_url ?? null } })
  } catch (err) {
    res.status(500).json({ error: 'Login failed' })
  }
})

app.get('/api/auth/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query('SELECT id, email, username, avatar_url FROM users WHERE id = $1', [req.user!.id])
    res.json({ user: result.rows[0] })
  } catch { res.status(500).json({ error: 'Failed to fetch user' }) }
})

// ── Avatar ────────────────────────────────────────────────────────────────────

const PRESET_AVATARS = ['shape-orb', 'shape-chevron', 'shape-cylinder', 'shape-triangle', 'shape-tic-tac', 'shape-diamond']

const uploadAvatar = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    cb(null, allowed.includes(file.mimetype))
  },
})

app.put('/api/users/me/avatar', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { preset } = req.body
    if (!preset || !PRESET_AVATARS.includes(preset)) {
      return res.status(400).json({ error: 'Invalid preset name' })
    }
    const avatarUrl = `/${preset}.png`
    await pool.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatarUrl, req.user!.id])
    res.json({ avatar_url: avatarUrl })
  } catch { res.status(500).json({ error: 'Failed to update avatar' }) }
})

app.post('/api/users/me/avatar/upload', requireAuth, uploadLimiter, uploadAvatar.single('avatar'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' })
    const avatarUrl = `/uploads/${req.file.filename}`
    await pool.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatarUrl, req.user!.id])
    res.json({ avatar_url: avatarUrl })
  } catch { res.status(500).json({ error: 'Failed to upload avatar' }) }
})

// ── Sightings ─────────────────────────────────────────────────────────────────

app.get('/api/sightings', async (req, res) => {
  try {
    const limit  = Math.min(Math.max(1, parseInt(req.query.limit  as string) || 200), 500)
    const offset = Math.max(0, parseInt(req.query.offset as string) || 0)
    const result = await pool.query(`
      SELECT s.*,
        (SELECT COUNT(*) FROM comments c WHERE c.sighting_id = s.id) as comment_count
      FROM sightings s ORDER BY s.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset])
    res.json(result.rows)
  } catch { res.status(500).json({ error: 'Failed to fetch sightings' }) }
})

app.post('/api/sightings', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, description, latitude, longitude, sighting_date, sighting_time, shape, duration, altitude, witness_name, location_name, weather } = req.body
    if (!title || !description || !latitude || !longitude || !sighting_date)
      return res.status(400).json({ error: 'Missing required fields' })
    if (title.trim().length > 200) return res.status(400).json({ error: 'Title must be 200 characters or fewer' })
    if (/<[^>]+>/.test(title)) return res.status(400).json({ error: 'Title cannot contain HTML' })
    if (description.trim().length > 5000) return res.status(400).json({ error: 'Description must be 5000 characters or fewer' })
    const reportedDate = new Date(sighting_date)
    if (isNaN(reportedDate.getTime()) || reportedDate > new Date())
      return res.status(400).json({ error: 'Sighting date cannot be in the future' })

    for (let attempt = 0; attempt < 10; attempt++) {
      const caseNumber = generateCaseNumber()
      try {
        const result = await pool.query(
          `INSERT INTO sightings (case_number,title,description,latitude,longitude,sighting_date,sighting_time,shape,duration,altitude,witness_name,location_name,weather,user_id)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
          [caseNumber, title, description, latitude, longitude, sighting_date, sighting_time || null, shape || null, duration || null, altitude || null, witness_name || req.user!.username, location_name || null, weather || null, req.user!.id]
        )
        const sighting = result.rows[0]

        // ── Auto-tagging: collect astronomical + fireball tags ──────────────
        const allTags: string[] = []

        // 1. Astronomical events from DB
        try {
          const astroResult = await pool.query(
            `SELECT name FROM astronomical_events
             WHERE (
               (event_type = 'meteor_shower' AND peak_date IS NOT NULL AND ABS(peak_date - $1::date) <= 5)
               OR
               (event_type != 'meteor_shower' AND start_date <= $1 AND end_date >= $1)
             )`,
            [sighting_date]
          )
          for (const row of astroResult.rows) allTags.push(row.name)
        } catch { /* skip */ }

        // 2. NASA fireballs within 500km and ±2 days
        try {
          const fireballs = await getFireballs()
          const sightingMs = new Date(sighting_date).getTime()
          const TWO_DAYS = 2 * 24 * 60 * 60 * 1000
          for (const fb of fireballs) {
            if (Math.abs(new Date(fb.date).getTime() - sightingMs) > TWO_DAYS) continue
            const dist = haversineKm(Number(latitude), Number(longitude), fb.lat, fb.lon)
            if (dist <= 500) {
              allTags.push(`NASA Fireball (${fb.date}, ~${Math.round(dist)}km away)`)
            }
          }
        } catch { /* skip */ }

        // Update tags if any were found
        if (allTags.length > 0) {
          await pool.query(`UPDATE sightings SET tags = $1 WHERE id = $2`, [allTags, sighting.id])
        }

        // Always return full row with comment_count
        const full = await pool.query(
          `SELECT s.*, (SELECT COUNT(*) FROM comments c WHERE c.sighting_id = s.id) as comment_count FROM sightings s WHERE s.id = $1`,
          [sighting.id]
        )
        return res.json(full.rows[0])
      } catch (err: unknown) {
        if ((err as { code?: string }).code !== '23505') throw err
      }
    }
    res.status(500).json({ error: 'Failed to generate unique case number' })
  } catch { res.status(500).json({ error: 'Failed to create sighting' }) }
})

app.get('/api/sightings/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, (SELECT COUNT(*) FROM comments c WHERE c.sighting_id = s.id) as comment_count FROM sightings s WHERE s.id = $1`,
      [req.params.id]
    )
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' })
    res.json(result.rows[0])
  } catch { res.status(500).json({ error: 'Failed to fetch sighting' }) }
})

// Delete sighting — owner or admin only
app.delete('/api/sightings/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const sighting = await pool.query('SELECT user_id FROM sightings WHERE id = $1', [req.params.id])
    if (!sighting.rows[0]) return res.status(404).json({ error: 'Not found' })

    const user = await pool.query('SELECT is_admin FROM users WHERE id = $1', [req.user!.id])
    const isAdmin = user.rows[0]?.is_admin === true
    const isOwner = sighting.rows[0].user_id === req.user!.id

    if (!isAdmin && !isOwner) return res.status(403).json({ error: 'Not authorised' })

    await pool.query('DELETE FROM sightings WHERE id = $1', [req.params.id])
    res.json({ ok: true })
  } catch { res.status(500).json({ error: 'Failed to delete sighting' }) }
})

// ── Astronomical events ───────────────────────────────────────────────────────

app.get('/api/astronomical-events', async (req, res) => {
  try {
    const { date } = req.query
    if (!date || typeof date !== 'string') {
      return res.status(400).json({ error: 'date query parameter required (YYYY-MM-DD)' })
    }
    const result = await pool.query(
      `SELECT * FROM astronomical_events
       WHERE (
         -- Meteor showers: only flag within 5 days of peak, not the whole active window
         (event_type = 'meteor_shower' AND peak_date IS NOT NULL AND ABS(peak_date - $1::date) <= 5)
         OR
         -- One-time events (eclipses, conjunctions, etc): use exact date range
         (event_type != 'meteor_shower' AND start_date <= $1 AND end_date >= $1)
       )
       ORDER BY start_date`,
      [date]
    )
    res.json(result.rows)
  } catch { res.status(500).json({ error: 'Failed to fetch astronomical events' }) }
})

// ── Photo upload ──────────────────────────────────────────────────────────────

app.post('/api/sightings/:id/photo', requireAuth, uploadLimiter, upload.single('photo'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No photo uploaded' })
    const photoUrl = `/uploads/${req.file.filename}`
    const result = await pool.query(
      `UPDATE sightings SET photo_url = $1 WHERE id = $2 RETURNING *`,
      [photoUrl, req.params.id]
    )
    if (!result.rows[0]) return res.status(404).json({ error: 'Sighting not found' })
    res.json(result.rows[0])
  } catch { res.status(500).json({ error: 'Failed to upload photo' }) }
})

app.post('/api/sightings/:id/audio', requireAuth, uploadLimiter, upload.single('audio'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio uploaded' })
    const audioUrl = `/uploads/${req.file.filename}`
    const result = await pool.query(
      `UPDATE sightings SET audio_url = $1 WHERE id = $2 RETURNING *`,
      [audioUrl, req.params.id]
    )
    if (!result.rows[0]) return res.status(404).json({ error: 'Sighting not found' })
    res.json(result.rows[0])
  } catch { res.status(500).json({ error: 'Failed to upload audio' }) }
})

app.post('/api/sightings/:id/video', requireAuth, uploadLimiter, uploadVideo.single('video'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No video uploaded' })
    const videoUrl = `/uploads/${req.file.filename}`
    const result = await pool.query(
      `UPDATE sightings SET video_url = $1 WHERE id = $2 RETURNING *`,
      [videoUrl, req.params.id]
    )
    if (!result.rows[0]) return res.status(404).json({ error: 'Sighting not found' })
    res.json(result.rows[0])
  } catch { res.status(500).json({ error: 'Failed to upload video' }) }
})

app.post('/api/sightings/:id/saw-this-too', requireAuth, async (req: AuthRequest, res) => {
  try {
    const sightingId = parseInt(req.params.id)
    const { name, note } = req.body

    // Prevent duplicate witness entries from same user
    const already = await pool.query(
      'SELECT 1 FROM comments WHERE sighting_id = $1 AND user_id = $2 AND saw_this_too = true',
      [sightingId, req.user!.id]
    )
    if (already.rows.length > 0) {
      const result = await pool.query('SELECT saw_this_too_count FROM sightings WHERE id = $1', [sightingId])
      return res.json({ count: result.rows[0].saw_this_too_count, already: true })
    }

    await pool.query('UPDATE sightings SET saw_this_too_count = saw_this_too_count + 1 WHERE id = $1', [sightingId])
    await pool.query(
      `INSERT INTO comments (sighting_id, author, content, saw_this_too, user_id) VALUES ($1,$2,$3,true,$4)`,
      [sightingId, name || req.user!.username, note || 'I witnessed this too.', req.user!.id]
    )
    const result = await pool.query('SELECT saw_this_too_count FROM sightings WHERE id = $1', [sightingId])
    res.json({ count: result.rows[0].saw_this_too_count })
  } catch { res.status(500).json({ error: 'Failed to record witness' }) }
})

app.get('/api/sightings/:id/comments', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM comments WHERE sighting_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    )
    res.json(result.rows)
  } catch { res.status(500).json({ error: 'Failed to fetch comments' }) }
})

app.post('/api/sightings/:id/comments', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { content } = req.body
    if (!content?.trim()) return res.status(400).json({ error: 'Content required' })
    if (content.trim().length > 2000) return res.status(400).json({ error: 'Comment must be 2000 characters or fewer' })
    const result = await pool.query(
      `INSERT INTO comments (sighting_id, author, content, user_id) VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.params.id, req.user!.username, content, req.user!.id]
    )
    res.json(result.rows[0])
  } catch { res.status(500).json({ error: 'Failed to add comment' }) }
})

// ── User profile ──────────────────────────────────────────────────────────────

app.get('/api/users/me/sightings', requireAuth, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*,
        (SELECT COUNT(*) FROM comments c WHERE c.sighting_id = s.id) as comment_count
       FROM sightings s
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC`,
      [req.user!.id]
    )
    res.json(result.rows)
  } catch { res.status(500).json({ error: 'Failed to fetch user sightings' }) }
})

// ── Intelligence endpoint ─────────────────────────────────────────────────────

interface IntelData {
  aircraft:      { count: number; callsigns: string[]; available: boolean; time_unknown?: boolean; error?: string }
  iss:           { overhead: boolean; distance_km: number | null; error?: string }
  space_weather: { kp_index: number | null; kp_level: string; storm: boolean; error?: string }
  twilight:      { condition: 'day'|'civil'|'nautical'|'astronomical'|'night'|'unknown'; label: string; sunrise: string|null; sunset: string|null; error?: string }
  nearby:        { airports: Array<{name:string;distance_km:number}>; military: Array<{name:string;distance_km:number}>; error?: string }
  routes:        { nearby: Array<{src:string;dst:string;airline:string;distance_km:number}>; error?: string }
}

const intelCache = new Map<number, { data: IntelData; at: number }>()
const INTEL_TTL  = 60 * 60 * 1000 // 1 hour

const OPENSKY_USER = process.env.OPENSKY_USER ?? ''
const OPENSKY_PASS = process.env.OPENSKY_PASS ?? ''

function kpLabel(k: number) {
  if (k < 2)  return 'Quiet'
  if (k < 4)  return 'Unsettled'
  if (k < 5)  return 'Active'
  if (k < 6)  return 'Minor storm (G1)'
  if (k < 7)  return 'Moderate storm (G2)'
  if (k < 8)  return 'Strong storm (G3)'
  return 'Severe storm (G4+)'
}

async function intelAircraft(lat: number, lon: number, unix: number, timeKnown: boolean): Promise<IntelData['aircraft']> {
  if (!timeKnown) return { count: 0, callsigns: [], available: false, time_unknown: true }
  const age = Math.floor(Date.now() / 1000) - unix
  if (age > 30 * 86400) return { count: 0, callsigns: [], available: false }
  try {
    const d = 1.0
    const url = `https://opensky-network.org/api/states/all?time=${unix}&lamin=${lat-d}&lomin=${lon-d}&lamax=${lat+d}&lomax=${lon+d}`
    const auth = Buffer.from(`${OPENSKY_USER}:${OPENSKY_PASS}`).toString('base64')
    const r = await fetch(url, { headers: { Authorization: `Basic ${auth}` }, signal: AbortSignal.timeout(8000) })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const json = await r.json() as { states?: (string|number|boolean|null)[][] }
    const airborne = (json.states ?? []).filter(s => !s[8])
    const callsigns = [...new Set(airborne.map(s => ((s[1] as string) ?? '').trim()).filter(Boolean))].slice(0, 8)
    return { count: airborne.length, callsigns, available: true }
  } catch (e) { return { count: 0, callsigns: [], available: true, error: (e as Error).message } }
}

async function intelIss(lat: number, lon: number, unix: number): Promise<IntelData['iss']> {
  try {
    const r = await fetch(
      `https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps=${unix}&units=kilometers`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const json = await r.json() as Array<{ latitude: number; longitude: number }>
    if (!json[0]) throw new Error('empty')
    const dist = Math.round(haversineKm(lat, lon, json[0].latitude, json[0].longitude))
    return { overhead: dist < 2250, distance_km: dist }
  } catch (e) { return { overhead: false, distance_km: null, error: (e as Error).message } }
}

async function intelKp(date: string): Promise<IntelData['space_weather']> {
  try {
    const r = await fetch(
      `https://kp.gfz-potsdam.de/api/v1/kp/?start=${date}T00:00:00Z&end=${date}T23:59:59Z`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const json = await r.json() as { Kp?: number[]; kp?: number[] }
    const vals = json.Kp ?? json.kp ?? []
    if (!vals.length) throw new Error('no data')
    const max = Math.max(...vals)
    return { kp_index: Math.round(max * 10) / 10, kp_level: kpLabel(max), storm: max >= 5 }
  } catch (e) { return { kp_index: null, kp_level: 'Unknown', storm: false, error: (e as Error).message } }
}

async function intelTwilight(lat: number, lon: number, date: string, time: string | null): Promise<IntelData['twilight']> {
  try {
    const r = await fetch(
      `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${date}&formatted=0`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const json = await r.json() as {
      status: string
      results: { sunrise:string; sunset:string; civil_twilight_begin:string; civil_twilight_end:string; nautical_twilight_begin:string; nautical_twilight_end:string; astronomical_twilight_begin:string; astronomical_twilight_end:string }
    }
    if (json.status !== 'OK') throw new Error('API error')
    const { sunrise, sunset,
      civil_twilight_begin: cb, civil_twilight_end: ce,
      nautical_twilight_begin: nb, nautical_twilight_end: ne,
      astronomical_twilight_begin: ab, astronomical_twilight_end: ae } = json.results
    if (!time) return { condition: 'unknown', label: 'No time recorded', sunrise, sunset }
    const t = new Date(`${date}T${time.length === 5 ? time + ':00' : time}Z`).getTime()
    const in_ = (a: string, b: string) => t >= new Date(a).getTime() && t <= new Date(b).getTime()
    let condition: IntelData['twilight']['condition'] = 'night'
    let label = 'Night'
    if      (in_(sunrise, sunset)) { condition = 'day';          label = 'Daytime' }
    else if (in_(cb, ce))          { condition = 'civil';        label = 'Civil twilight' }
    else if (in_(nb, ne))          { condition = 'nautical';     label = 'Nautical twilight' }
    else if (in_(ab, ae))          { condition = 'astronomical'; label = 'Astronomical twilight' }
    return { condition, label, sunrise, sunset }
  } catch (e) { return { condition: 'unknown', label: 'Unknown', sunrise: null, sunset: null, error: (e as Error).message } }
}

// ── OurAirports static DB (replaces Overpass — no rate limits, global coverage) ──

interface AirportRecord { name: string; lat: number; lon: number; type: string; iata: string; icao: string }
let airportDb: AirportRecord[] | null = null
let airportDbLoading: Promise<AirportRecord[]> | null = null

const airportByIata = new Map<string, AirportRecord>()
const airportByIcao = new Map<string, AirportRecord>()

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let cur = ''
  let inQuote = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') { inQuote = !inQuote }
    else if (ch === ',' && !inQuote) { result.push(cur); cur = '' }
    else { cur += ch }
  }
  result.push(cur)
  return result
}

async function loadAirportDb(): Promise<AirportRecord[]> {
  if (airportDb) return airportDb
  if (airportDbLoading) return airportDbLoading
  airportDbLoading = (async () => {
    const r = await fetch('https://davidmegginson.github.io/ourairports-data/airports.csv', { signal: AbortSignal.timeout(20000) })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const text = await r.text()
    const lines = text.trim().split('\n')
    const header = parseCSVLine(lines[0])
    const iName = header.indexOf('name')
    const iLat  = header.indexOf('latitude_deg')
    const iLon  = header.indexOf('longitude_deg')
    const iType = header.indexOf('type')
    const iIata = header.indexOf('iata_code')
    const iIcao = header.indexOf('ident')
    const wantTypes = new Set(['large_airport', 'medium_airport', 'small_airport'])
    const airports: AirportRecord[] = []
    for (const line of lines.slice(1)) {
      const p = parseCSVLine(line)
      if (!wantTypes.has(p[iType] ?? '')) continue
      const lat = parseFloat(p[iLat] ?? '')
      const lon = parseFloat(p[iLon] ?? '')
      if (isNaN(lat) || isNaN(lon)) continue
      airports.push({ name: p[iName] ?? 'Unknown Airport', lat, lon, type: p[iType] ?? '', iata: p[iIata] ?? '', icao: p[iIcao] ?? '' })
      if (p[iIata]) airportByIata.set(p[iIata], airports[airports.length - 1])
      if (p[iIcao]) airportByIcao.set(p[iIcao], airports[airports.length - 1])
    }
    airportDb = airports
    console.log(`✓ Airport DB: ${airports.length} airports loaded`)
    return airports
  })()
  return airportDbLoading
}

interface RouteRecord { airline: string; src: AirportRecord; dst: AirportRecord }
let routeDb: RouteRecord[] | null = null
let routeDbLoading: Promise<RouteRecord[]> | null = null

async function loadRouteDb(): Promise<RouteRecord[]> {
  if (routeDb) return routeDb
  if (routeDbLoading) return routeDbLoading
  routeDbLoading = (async () => {
    await loadAirportDb() // ensure airport maps are populated
    const r = await fetch('https://raw.githubusercontent.com/jpatokal/openflights/master/data/routes.dat', { signal: AbortSignal.timeout(20000) })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const text = await r.text()
    const routes: RouteRecord[] = []
    for (const line of text.trim().split('\n')) {
      const parts = line.split(',')
      if (parts.length < 8) continue
      const stops = parts[7]
      if (stops !== '0') continue // direct flights only
      const airline = parts[0]
      const srcCode = parts[2]
      const dstCode = parts[4]
      const src = airportByIata.get(srcCode) || airportByIcao.get(srcCode)
      const dst = airportByIata.get(dstCode) || airportByIcao.get(dstCode)
      if (!src || !dst) continue
      routes.push({ airline, src, dst })
    }
    routeDb = routes
    console.log(`✓ Route DB: ${routes.length} routes loaded`)
    return routes
  })()
  return routeDbLoading
}

function distToArcKm(pLat: number, pLon: number, aLat: number, aLon: number, bLat: number, bLon: number): number {
  const toXYZ = (lat: number, lon: number): [number,number,number] => {
    const φ = lat * Math.PI / 180, λ = lon * Math.PI / 180
    return [Math.cos(φ)*Math.cos(λ), Math.cos(φ)*Math.sin(λ), Math.sin(φ)]
  }
  const cross = (a: [number,number,number], b: [number,number,number]): [number,number,number] =>
    [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]
  const dot = (a: [number,number,number], b: [number,number,number]) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2]
  const norm = (v: [number,number,number]): [number,number,number] => {
    const m = Math.sqrt(v[0]**2+v[1]**2+v[2]**2)
    return m < 1e-10 ? [1,0,0] : [v[0]/m, v[1]/m, v[2]/m]
  }
  const arcDist = (a: [number,number,number], b: [number,number,number]) =>
    Math.acos(Math.max(-1, Math.min(1, dot(a, b)))) * 6371

  const P = toXYZ(pLat, pLon), A = toXYZ(aLat, aLon), B = toXYZ(bLat, bLon)
  const N = norm(cross(A, B))
  const d = dot(P, N)
  const C = norm([P[0]-d*N[0], P[1]-d*N[1], P[2]-d*N[2]])
  const onArc = dot(N, cross(A, C)) >= -1e-9 && dot(N, cross(C, B)) >= -1e-9
  return onArc ? arcDist(P, C) : Math.min(arcDist(P, A), arcDist(P, B))
}

async function intelRoutes(lat: number, lon: number): Promise<IntelData['routes']> {
  try {
    const routes = await loadRouteDb()
    const seen = new Set<string>()
    const nearby: Array<{ src: string; dst: string; airline: string; distance_km: number }> = []
    for (const r of routes) {
      const dSrc = haversineKm(lat, lon, r.src.lat, r.src.lon)
      const dDst = haversineKm(lat, lon, r.dst.lat, r.dst.lon)
      if (dSrc > 400 && dDst > 400) continue
      // Deduplicate by route pair (bidirectional)
      const a = r.src.icao || r.src.iata, b = r.dst.icao || r.dst.iata
      const key = [a, b].sort().join('-')
      if (seen.has(key)) continue
      seen.add(key)
      const dist = Math.round(distToArcKm(lat, lon, r.src.lat, r.src.lon, r.dst.lat, r.dst.lon))
      if (dist <= 30) {
        nearby.push({ src: r.src.name, dst: r.dst.name, airline: r.airline, distance_km: dist })
      }
    }
    nearby.sort((a, b) => a.distance_km - b.distance_km)
    return { nearby: nearby.slice(0, 8) }
  } catch (e) { return { nearby: [], error: (e as Error).message } }
}

async function intelNearby(lat: number, lon: number): Promise<IntelData['nearby']> {
  try {
    const db = await loadAirportDb()
    const nearby = db
      .map(a => ({ name: a.name, distance_km: Math.round(haversineKm(lat, lon, a.lat, a.lon)) }))
      .filter(a => a.distance_km <= 75)
      .sort((a, b) => a.distance_km - b.distance_km)
      .slice(0, 8)
    return { airports: nearby, military: [] }
  } catch (e) { return { airports: [], military: [], error: (e as Error).message } }
}

app.get('/api/sightings/:id/intelligence', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' })

    const refresh = req.query.refresh === 'true'

    // 1. In-memory cache (sub-second) — skip if refresh requested
    if (!refresh) {
      const cached = intelCache.get(id)
      if (cached && Date.now() - cached.at < INTEL_TTL) return res.json(cached.data)
    }

    // 2. DB — already fetched for this sighting? (skip if refresh requested)
    const row = await pool.query('SELECT * FROM sightings WHERE id = $1', [id])
    if (!row.rows[0]) return res.status(404).json({ error: 'Not found' })
    const s = row.rows[0]

    if (!refresh && s.intelligence) {
      const data = s.intelligence as IntelData
      intelCache.set(id, { data, at: Date.now() })
      return res.json(data)
    }

    // 3. First time — call all APIs, store permanently in DB
    const lat  = Number(s.latitude)
    const lon  = Number(s.longitude)
    const date = (s.sighting_date instanceof Date ? s.sighting_date : new Date(s.sighting_date)).toISOString().slice(0, 10)
    const time = s.sighting_time as string | null
    const unix = Math.floor(new Date(`${date}T${time ?? '12:00'}:00Z`).getTime() / 1000)

    // Date-aware feature flags
    const sightingYear = parseInt(date.slice(0, 4))
    const issLaunchYear = 1998  // ISS first module launched Nov 1998
    const issExists = sightingYear >= issLaunchYear
    const openSkyAge = (Date.now() / 1000) - unix
    const aircraftAvailable = openSkyAge <= 30 * 86400  // OpenSky only keeps 30 days

    const [aircraft, iss, kp, twilight, nearby, routes] = await Promise.allSettled([
      aircraftAvailable
        ? intelAircraft(lat, lon, unix, time !== null)
        : Promise.resolve<IntelData['aircraft']>({ count: 0, callsigns: [], available: false }),
      issExists
        ? intelIss(lat, lon, unix)
        : Promise.resolve<IntelData['iss']>({ overhead: false, distance_km: null, error: 'pre-iss' }),
      intelKp(date),
      intelTwilight(lat, lon, date, time),
      intelNearby(lat, lon),
      intelRoutes(lat, lon),
    ])
    const data: IntelData = {
      aircraft:      aircraft.status === 'fulfilled'  ? aircraft.value  : { count: 0, callsigns: [], available: false, error: 'Failed' },
      iss:           iss.status === 'fulfilled'       ? iss.value       : { overhead: false, distance_km: null, error: 'Failed' },
      space_weather: kp.status === 'fulfilled'        ? kp.value        : { kp_index: null, kp_level: 'Unknown', storm: false, error: 'Failed' },
      twilight:      twilight.status === 'fulfilled'  ? twilight.value  : { condition: 'unknown', label: 'Unknown', sunrise: null, sunset: null, error: 'Failed' },
      nearby:        nearby.status === 'fulfilled'    ? nearby.value    : { airports: [], military: [], error: 'Failed' },
      routes:        routes.status === 'fulfilled'    ? routes.value    : { nearby: [], error: 'Failed' },
    }

    // Only persist to DB if nearby succeeded (guards against caching a bad Overpass result forever)
    if (!data.nearby.error) {
      pool.query('UPDATE sightings SET intelligence = $1 WHERE id = $2', [JSON.stringify(data), id])
        .catch(err => console.warn('Failed to persist intelligence:', err.message))
    }

    intelCache.set(id, { data, at: Date.now() })
    res.json(data)
  } catch { res.status(500).json({ error: 'Intelligence fetch failed' }) }
})

// ── Explanations ──────────────────────────────────────────────────────────────

const VALID_CATEGORIES = ['aircraft', 'military', 'starlink', 'iss', 'meteor', 'planet', 'drone', 'balloon', 'lantern', 'natural', 'unexplained']

app.get('/api/sightings/:id/explanations', async (req, res) => {
  try {
    const sightingId = parseInt(req.params.id)
    if (isNaN(sightingId)) return res.status(400).json({ error: 'Invalid ID' })

    // Optionally read the requesting user from Authorization header
    let requestingUserId: number | null = null
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as { id: number }
        requestingUserId = payload.id
      } catch { /* no-op */ }
    }

    const result = await pool.query(
      `SELECT e.id, e.sighting_id, e.author, e.category, e.note, e.upvotes, e.created_at,
        ${requestingUserId != null
          ? `EXISTS(SELECT 1 FROM explanation_votes ev WHERE ev.explanation_id = e.id AND ev.user_id = $2) as user_voted`
          : `false as user_voted`
        }
       FROM explanations e
       WHERE e.sighting_id = $1
       ORDER BY e.upvotes DESC, e.created_at ASC`,
      requestingUserId != null ? [sightingId, requestingUserId] : [sightingId]
    )
    res.json(result.rows)
  } catch { res.status(500).json({ error: 'Failed to fetch explanations' }) }
})

app.post('/api/sightings/:id/explanations', requireAuth, async (req: AuthRequest, res) => {
  try {
    const sightingId = parseInt(req.params.id)
    if (isNaN(sightingId)) return res.status(400).json({ error: 'Invalid ID' })

    const { category, note } = req.body
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` })
    }
    if (note && note.trim().length > 1000) return res.status(400).json({ error: 'Theory note must be 1000 characters or fewer' })

    // One explanation per user per sighting
    const existing = await pool.query(
      'SELECT id FROM explanations WHERE sighting_id = $1 AND user_id = $2',
      [sightingId, req.user!.id]
    )
    if (existing.rows.length > 0) return res.status(409).json({ error: 'You have already submitted an explanation for this sighting' })

    const result = await pool.query(
      `INSERT INTO explanations (sighting_id, user_id, author, category, note)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [sightingId, req.user!.id, req.user!.username, category, note || null]
    )
    const explanation = { ...result.rows[0], user_voted: false }
    res.json(explanation)
  } catch { res.status(500).json({ error: 'Failed to submit explanation' }) }
})

app.post('/api/explanations/:id/vote', requireAuth, async (req: AuthRequest, res) => {
  try {
    const explanationId = parseInt(req.params.id)
    if (isNaN(explanationId)) return res.status(400).json({ error: 'Invalid ID' })

    // Get the explanation first (to find sighting_id)
    const expRow = await pool.query('SELECT * FROM explanations WHERE id = $1', [explanationId])
    if (!expRow.rows[0]) return res.status(404).json({ error: 'Explanation not found' })
    const sightingId = expRow.rows[0].sighting_id

    // Prevent self-voting
    if (expRow.rows[0].user_id === req.user!.id) {
      return res.status(403).json({ error: 'You cannot vote on your own theory' })
    }

    // Toggle vote
    const voteCheck = await pool.query(
      'SELECT 1 FROM explanation_votes WHERE user_id = $1 AND explanation_id = $2',
      [req.user!.id, explanationId]
    )
    let voted: boolean
    if (voteCheck.rows.length > 0) {
      await pool.query('DELETE FROM explanation_votes WHERE user_id = $1 AND explanation_id = $2', [req.user!.id, explanationId])
      voted = false
    } else {
      await pool.query('INSERT INTO explanation_votes (user_id, explanation_id) VALUES ($1, $2)', [req.user!.id, explanationId])
      voted = true
    }

    // Recalculate upvotes
    const countResult = await pool.query(
      'UPDATE explanations SET upvotes = (SELECT COUNT(*) FROM explanation_votes WHERE explanation_id = $1) WHERE id = $1 RETURNING upvotes',
      [explanationId]
    )
    const upvotes = parseInt(countResult.rows[0].upvotes)

    // Check if any explanation for this sighting has >= 3 upvotes → set verdict + status
    const topResult = await pool.query(
      `SELECT id, category, upvotes FROM explanations WHERE sighting_id = $1 ORDER BY upvotes DESC LIMIT 1`,
      [sightingId]
    )
    const top = topResult.rows[0]
    if (top && top.upvotes >= 3) {
      await pool.query(
        'UPDATE sightings SET verdict = $1, verdict_explanation_id = $2 WHERE id = $3',
        [top.category, top.id, sightingId]
      )
    } else {
      await pool.query(
        'UPDATE sightings SET verdict = NULL, verdict_explanation_id = NULL WHERE id = $1',
        [sightingId]
      )
    }

    res.json({ upvotes, voted })
  } catch { res.status(500).json({ error: 'Failed to vote' }) }
})

// ── Tonight's Sky ─────────────────────────────────────────────────────────────

function getMoonPhase(date: Date): { phase: number; phase_name: string; illumination: number } {
  const knownNewMoon = new Date('2000-01-06T18:14:00Z')
  const synodicMonth = 29.53058867
  const daysSince = (date.getTime() - knownNewMoon.getTime()) / 86400000
  const phase = ((daysSince % synodicMonth) + synodicMonth) % synodicMonth
  const normalized = phase / synodicMonth
  const illumination = Math.round((1 - Math.cos(normalized * 2 * Math.PI)) / 2 * 100)

  let phase_name: string
  if (normalized < 0.03 || normalized > 0.97) phase_name = 'New Moon'
  else if (normalized < 0.22) phase_name = 'Waxing Crescent'
  else if (normalized < 0.28) phase_name = 'First Quarter'
  else if (normalized < 0.47) phase_name = 'Waxing Gibbous'
  else if (normalized < 0.53) phase_name = 'Full Moon'
  else if (normalized < 0.72) phase_name = 'Waning Gibbous'
  else if (normalized < 0.78) phase_name = 'Third Quarter'
  else phase_name = 'Waning Crescent'

  return { phase: normalized, phase_name, illumination }
}

// Cache Starlink launch data for 2 hours (rate limit: 15 req/hour)
let starlinkCache: { data: StarlinkData; at: number } | null = null
const STARLINK_TTL = 2 * 60 * 60 * 1000

interface StarlinkData {
  recent_launch: boolean
  launch_name: string | null
  days_ago: number | null
  note: string
  error?: string
}

async function fetchStarlinkData(now: Date): Promise<StarlinkData> {
  if (starlinkCache && Date.now() - starlinkCache.at < STARLINK_TTL) return starlinkCache.data
  try {
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000).toISOString().slice(0, 10)
    const r = await fetch(
      `https://ll.thespacedevs.com/2.2.0/launch/?search=starlink&net__gte=${fourteenDaysAgo}&ordering=-net&limit=5`,
      { signal: AbortSignal.timeout(8000), headers: { 'User-Agent': 'StrangeSkies/1.0' } }
    )
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const json = await r.json() as { results: Array<{ name: string; net: string; status: { name: string } }> }
    const successful = json.results.filter(l => l.status.name.toLowerCase().includes('success'))
    if (successful.length === 0) {
      const data: StarlinkData = { recent_launch: false, launch_name: null, days_ago: null, note: '' }
      starlinkCache = { data, at: Date.now() }
      return data
    }
    const latest = successful[0]
    const daysAgo = Math.floor((now.getTime() - new Date(latest.net).getTime()) / 86400000)
    const data: StarlinkData = {
      recent_launch: true,
      launch_name: latest.name,
      days_ago: daysAgo,
      note: daysAgo <= 5
        ? 'Satellites still in tight formation — look for a chain of bright moving lights shortly after sunset or before sunrise.'
        : 'Satellites spreading out but may still be visible as bright individual moving points.',
    }
    starlinkCache = { data, at: Date.now() }
    return data
  } catch (e) {
    return { recent_launch: false, launch_name: null, days_ago: null, note: '', error: (e as Error).message }
  }
}

app.get('/api/sky', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string)
    const lon = parseFloat(req.query.lon as string)
    if (isNaN(lat) || isNaN(lon)) return res.status(400).json({ error: 'lat and lon required' })

    const now = new Date()
    const today = now.toISOString().slice(0, 10)

    // 1. ISS: current position + sample next 6 hours every 5 min (72 samples)
    const nowUnix = Math.floor(now.getTime() / 1000)
    const futureTimestamps = Array.from({ length: 18 }, (_, i) => nowUnix + i * 1200) // every 20 min, 6h
    const issUrl = `https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps=${futureTimestamps.join(',')}&units=kilometers`

    let issData: { current: { lat: number; lon: number; distance_km: number; overhead: boolean }; next_pass_minutes: number | null } = {
      current: { lat: 0, lon: 0, distance_km: 0, overhead: false },
      next_pass_minutes: null,
    }
    try {
      const issRes = await fetch(issUrl, { signal: AbortSignal.timeout(10000) })
      if (issRes.ok) {
        const positions = await issRes.json() as Array<{ latitude: number; longitude: number }>
        if (positions[0]) {
          const currentDist = Math.round(haversineKm(lat, lon, positions[0].latitude, positions[0].longitude))
          issData.current = { lat: positions[0].latitude, lon: positions[0].longitude, distance_km: currentDist, overhead: currentDist < 2250 }
          // Find next pass
          for (let i = 1; i < positions.length; i++) {
            const dist = haversineKm(lat, lon, positions[i].latitude, positions[i].longitude)
            if (dist < 2250) {
              issData.next_pass_minutes = Math.round(i * 20)
              break
            }
          }
        }
      }
    } catch { /* ISS unavailable */ }

    // 2. Moon phase
    const moon = getMoonPhase(now)

    // 3. Twilight (today + tomorrow for darkness window)
    let twilight = { sunrise: null as string | null, sunset: null as string | null, darkness_start: null as string | null, darkness_end: null as string | null }
    try {
      const twRes = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${today}&formatted=0`, { signal: AbortSignal.timeout(8000) })
      if (twRes.ok) {
        const twJson = await twRes.json() as { status: string; results: { sunrise: string; sunset: string; astronomical_twilight_end: string; astronomical_twilight_begin: string } }
        if (twJson.status === 'OK') {
          twilight.sunrise = twJson.results.sunrise
          twilight.sunset = twJson.results.sunset
          twilight.darkness_start = twJson.results.astronomical_twilight_end
          const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1)
          const tomorrowStr = tomorrow.toISOString().slice(0, 10)
          const twTomRes = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${tomorrowStr}&formatted=0`, { signal: AbortSignal.timeout(8000) })
          if (twTomRes.ok) {
            const twTomJson = await twTomRes.json() as { status: string; results: { astronomical_twilight_begin: string } }
            if (twTomJson.status === 'OK') twilight.darkness_end = twTomJson.results.astronomical_twilight_begin
          }
        }
      }
    } catch { /* twilight unavailable */ }

    // 4. Active meteor showers and upcoming events from DB
    const showerRows = await pool.query(
      `SELECT name, peak_date, start_date, end_date FROM astronomical_events
       WHERE event_type = 'meteor_shower' AND start_date <= $1 AND end_date >= $1
       ORDER BY ABS(peak_date - $1::date)
       LIMIT 3`,
      [today]
    )
    const meteor_showers = showerRows.rows.map((r: { name: string; peak_date: Date | string; start_date: Date | string; end_date: Date | string }) => {
      const peakDate = r.peak_date instanceof Date ? r.peak_date : new Date(r.peak_date)
      return {
        name: r.name,
        peak_date: peakDate.toISOString().slice(0, 10),
        days_to_peak: Math.round((peakDate.getTime() - now.getTime()) / 86400000),
        active: true,
      }
    })

    const eventRows = await pool.query(
      `SELECT name, event_type, start_date FROM astronomical_events
       WHERE event_type != 'meteor_shower' AND start_date >= $1
       ORDER BY start_date LIMIT 4`,
      [today]
    )
    const upcoming_events = eventRows.rows.map((r: { name: string; event_type: string; start_date: Date | string }) => {
      const startDate = r.start_date instanceof Date ? r.start_date : new Date(r.start_date)
      return {
        name: r.name,
        event_type: r.event_type,
        start_date: startDate.toISOString().slice(0, 10),
        days_away: Math.round((startDate.getTime() - now.getTime()) / 86400000),
      }
    })

    // 5. Starlink recent launches
    const starlink = await fetchStarlinkData(now)

    res.json({ iss: issData, moon, twilight, meteor_showers, upcoming_events, starlink })
  } catch { res.status(500).json({ error: 'Failed to fetch sky data' }) }
})

// ─────────────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001
initDB().then(() => {
  app.listen(PORT, () => console.log(`✓ Server on http://localhost:${PORT}`))
  getFireballs().catch(() => {})   // warm fireball cache on startup
  loadAirportDb().catch(() => {})  // warm airport DB on startup
  loadRouteDb().catch(() => {})    // warm route DB on startup
}).catch(err => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
