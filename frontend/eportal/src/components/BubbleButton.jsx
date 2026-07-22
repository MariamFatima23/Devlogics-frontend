import { motion } from 'framer-motion'

const BUBBLES = [
  { left:'10%', size:10, delay:0   },
  { left:'28%', size:6,  delay:0.1 },
  { left:'50%', size:12, delay:0.2 },
  { left:'70%', size:7,  delay:0.3 },
  { left:'88%', size:5,  delay:0.4 },
]

/**
 * BubbleButton — drop-in replacement for any CTA button/link.
 *
 * Props:
 *   as       — 'button' | 'a' | any tag (default: 'button')
 *   children — button text
 *   className — extra classes (optional)
 *   ...rest  — all other props (onClick, href, to, type, disabled, etc.)
 *
 * For react-router <Link>, pass: as={Link} to="/register"
 */
export default function BubbleButton({ as: Tag = 'button', children, className = '', ...rest }) {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      className="inline-block"
      style={{ display: 'inline-flex' }}
    >
      <Tag
        className={`relative overflow-hidden rounded-xl border-2 border-primary bg-white px-6 py-2.5 text-sm font-bold text-primary transition-colors duration-200 hover:border-primary-cyan hover:bg-primary-cyan ${className}`}
        {...rest}
      >
        {/* Bubble particles */}
        {BUBBLES.map((b, i) => (
          <motion.span
            key={i}
            className="pointer-events-none absolute rounded-full bg-primary-blue/40"
            style={{ left: b.left, bottom: -20, width: b.size, height: b.size }}
            variants={{
              rest: { y: 0, opacity: 0, scale: 0 },
              hover: {
                y: -80,
                opacity: [0, 0.7, 0],
                scale: [0.3, 1, 1.3],
                transition: {
                  duration: 1.2,
                  delay: b.delay,
                  repeat: Infinity,
                  ease: 'easeOut',
                },
              },
            }}
          />
        ))}

        {/* Label */}
        <span className="relative z-10">{children}</span>
      </Tag>
    </motion.div>
  )
}
