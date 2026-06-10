// lib/mongodb.ts
// ─────────────────────────────────────────────────────────────────────────────
// This file exports a single helper — connectDB() — that every API route calls
// before touching the database.
//
// WHY a separate file?
//   Next.js runs in a Node.js environment where the module cache persists across
//   requests *within the same process*.  If we called mongoose.connect() inside
//   every route handler the function would try to open a brand-new TCP connection
//   on every request, which is wasteful and will exhaust your Atlas free-tier
//   connection limit within seconds under any real load.
//
//   The trick: we store the connection promise on the Node.js global object.
//   Because globals survive hot-reload in dev and are shared across all modules
//   in the same process in production, we end up with exactly one active
//   connection to MongoDB no matter how many route handlers are running.
// ─────────────────────────────────────────────────────────────────────────────

import mongoose from "mongoose"

// The connection string lives in .env.local (never commit that file).
const MONGODB_URI = process.env.MONGODB_URI as string

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is missing. Add it to your .env.local file — see .env.example for reference."
  )
}

// We attach the cached connection to Node's global so hot-reload in dev
// doesn't open a new connection on every file change.
type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// TypeScript doesn't know about our custom global property, so we declare it.
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null }
global.mongooseCache = cached

export async function connectDB() {
  // Return the existing connection immediately — no work needed.
  if (cached.conn) return cached.conn

  // If a connection attempt is already in flight, wait for it instead of
  // starting a second one.
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      // bufferCommands: false tells Mongoose to throw immediately if a query
      // is executed before the connection is ready, instead of silently
      // queuing it.  Makes bugs much easier to spot.
      bufferCommands: false,
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}
