// The TshedzaWebDev wordmark: "Tshedza", the beam, "WebDev" (brand guideline 1.0, owner's decision of
// 23 Nov 2026; the files are in the tshedzawebdev-brand repo, kit/marks). The beam is the only thing in the
// brand that glows, and only on dark. On light it is flat teal. Its sizes are the guideline's, in em.

interface LogoProps {
  inverted?: boolean
  className?: string
}

const BEAM = {
  width: '0.078em',
  height: '1.08em',
  margin: '0 0.09em 0 0.1em',
  borderRadius: '0.039em',
  flex: 'none' as const,
}
const ON_DARK = {
  background: 'linear-gradient(180deg, #f2fdff 0%, #a9ecfa 45%, #63cfe9 100%)',
  boxShadow: '0 0 0.14em rgba(190,243,253,0.95), 0 0 0.55em rgba(69,194,224,0.75), 0 0 1.5em rgba(29,161,194,0.45)',
}
const ON_LIGHT = { background: '#1da1c2' }

export function Logo({ inverted = false, className }: LogoProps) {
  return (
    <span className={`inline-flex items-center text-[1.125rem] font-semibold tracking-[-0.02em] sm:text-[1.1875rem] ${inverted ? 'text-white' : 'text-ink'} ${className ?? ''}`}>
      Tshedza
      <span aria-hidden="true" style={{ ...BEAM, ...(inverted ? ON_DARK : ON_LIGHT) }} />
      <span className={inverted ? 'text-teal-500' : 'text-teal-700'}>WebDev</span>
    </span>
  )
}
