// The TshedzaWebDev wordmark. Text only: there is no separate icon mark
// (the owner's brand has none; do not invent one).

interface LogoProps {
  inverted?: boolean
  className?: string
}

export function Logo({ inverted = false, className }: LogoProps) {
  return (
    <span className={`inline-flex items-center text-[1.125rem] font-semibold tracking-[-0.02em] sm:text-[1.1875rem] ${inverted ? 'text-white' : 'text-ink'} ${className ?? ''}`}>
      Tshedza<span className={inverted ? 'text-teal-500' : 'text-teal-700'}>WebDev</span>
    </span>
  )
}
