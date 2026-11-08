// Bindings and settings (wrangler.toml [vars], secrets, D1).
export interface Env {
  DB: D1Database
  ALLOWED_ORIGINS: string
  OWNER_EMAIL: string
  MAIL_FROM: string
  API_PUBLIC_URL: string
  MAIL_TRANSPORT: 'resend' | 'outbox'
  IP_SALT: string
  WALL_SECRET: string
  RESEND_API_KEY?: string
}
