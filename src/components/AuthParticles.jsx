import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function AuthParticles() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const W = mount.clientWidth
    const H = mount.clientHeight

    // Scene
    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000)
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ── DOTS / PARTICLES ──────────────────────────────────────────
    const DOT_COUNT = 120
    const dotPositions = []
    const dotGeo = new THREE.BufferGeometry()
    const posArr = new Float32Array(DOT_COUNT * 3)

    for (let i = 0; i < DOT_COUNT; i++) {
      const x = (Math.random() - 0.5) * 14
      const y = (Math.random() - 0.5) * 10
      const z = (Math.random() - 0.5) * 4
      posArr[i * 3]     = x
      posArr[i * 3 + 1] = y
      posArr[i * 3 + 2] = z
      dotPositions.push({ x, y, z, vx: (Math.random() - 0.5) * 0.003, vy: (Math.random() - 0.5) * 0.003 })
    }

    dotGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3))
    const dotMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.06, transparent: true, opacity: 0.7 })
    const dots   = new THREE.Points(dotGeo, dotMat)
    scene.add(dots)

    // ── LINES between nearby dots ─────────────────────────────────
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 })
    const lineGroup = new THREE.Group()
    scene.add(lineGroup)

    const CONNECT_DIST = 2.2  // max distance to draw a line

    function rebuildLines() {
      // Clear old lines
      while (lineGroup.children.length) lineGroup.remove(lineGroup.children[0])

      for (let i = 0; i < DOT_COUNT; i++) {
        for (let j = i + 1; j < DOT_COUNT; j++) {
          const dx = dotPositions[i].x - dotPositions[j].x
          const dy = dotPositions[i].y - dotPositions[j].y
          const dz = dotPositions[i].z - dotPositions[j].z
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz)
          if (dist < CONNECT_DIST) {
            const opacity = (1 - dist / CONNECT_DIST) * 0.25
            const geo = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(dotPositions[i].x, dotPositions[i].y, dotPositions[i].z),
              new THREE.Vector3(dotPositions[j].x, dotPositions[j].y, dotPositions[j].z),
            ])
            const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity })
            lineGroup.add(new THREE.Line(geo, mat))
          }
        }
      }
    }

    rebuildLines()

    // ── ANIMATE ───────────────────────────────────────────────────
    let animId
    let frameCount = 0

    const animate = () => {
      animId = requestAnimationFrame(animate)
      frameCount++

      // Move dots
      for (let i = 0; i < DOT_COUNT; i++) {
        dotPositions[i].x += dotPositions[i].vx
        dotPositions[i].y += dotPositions[i].vy

        // Bounce
        if (Math.abs(dotPositions[i].x) > 7)  dotPositions[i].vx *= -1
        if (Math.abs(dotPositions[i].y) > 5)  dotPositions[i].vy *= -1

        posArr[i * 3]     = dotPositions[i].x
        posArr[i * 3 + 1] = dotPositions[i].y
        posArr[i * 3 + 2] = dotPositions[i].z
      }

      dotGeo.attributes.position.needsUpdate = true

      // Rebuild lines every 3 frames for performance
      if (frameCount % 3 === 0) rebuildLines()

      renderer.render(scene, camera)
    }

    animate()

    // Resize
    const handleResize = () => {
      if (!mount) return
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-0"
      style={{ pointerEvents: 'none' }}
    />
  )
}
