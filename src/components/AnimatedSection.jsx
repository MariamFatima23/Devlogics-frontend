import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

/**
 * Wraps children with a scroll-triggered fade+slide animation.
 * direction: 'up' | 'down' | 'left' | 'right'
 */
export default function AnimatedSection({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  duration = 0.7,
  once = true,
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin: '-80px 0px' })

  const variants = {
    hidden: {
      opacity: 0,
      x: direction === 'left' ? -50 : direction === 'right' ? 50 : 0,
      y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration, delay, ease: [0.22, 1, 0.36, 1] },
    },
  }

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  )
}
