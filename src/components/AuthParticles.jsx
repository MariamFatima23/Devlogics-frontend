import { useEffect, useRef } from 'react'

// Lazy-load Three.js only if WebGL available
export default function AuthParticles() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // Test WebGL support before loading Three.js
    const testCanvas = document.createElement('canvas')
    const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')
    if (!gl) {
      console.warn('AuthParticles: WebGL not supported, skipping 3D animation.')
      return
    }

    let animId
    let renderer

    import('three').then((THREE) => {
      try {
        const W = mount.clientWidth || window.innerWidth
        const H = mount.clientHeight || window.innerHeight

        const scene  = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000)
        camera.position.z = 5

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setSize(W, H)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setClearColor(0x000000, 0)
        mount.appendChild(renderer.domElement)

        const DOT_COUNT  = 120
        const dotPositions = []
        const posArr     = new Float32Array(DOT_COUNT * 3)
        const dotGeo     = new THREE.BufferGeometry()

        for (let i = 0; i < DOT_COUNT; i++) {
          const x = (Math.random() - 0.5) * 14
          const y = (Math.random() - 0.5) * 10
          const z = (Math.random() - 0.5) * 4
          posArr[i * 3] = x; posArr[i * 3 + 1] = y; posArr[i * 3 + 2] = z
          dotPositions.push({ x, y, z, vx: (Math.random() - 0.5) * 0.003, vy: (Math.random() - 0.5) * 0.003 })
        }
        dotGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3))
        const dots = new THREE.Points(dotGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.06, transparent: true, opacity: 0.7 }))
        scene.add(dots)

        const lineGroup    = new THREE.Group()
        const CONNECT_DIST = 2.2
        scene.add(lineGroup)

        const rebuildLines = () => {
          while (lineGroup.children.length) lineGroup.remove(lineGroup.children[0])
          for (let i = 0; i < DOT_COUNT; i++) {
            for (let j = i + 1; j < DOT_COUNT; j++) {
              const dx = dotPositions[i].x - dotPositions[j].x
              const dy = dotPositions[i].y - dotPositions[j].y
              const dz = dotPositions[i].z - dotPositions[j].z
              const dist = Math.sqrt(dx*dx + dy*dy + dz*dz)
              if (dist < CONNECT_DIST) {
                const geo = new THREE.BufferGeometry().setFromPoints([
                  new THREE.Vector3(dotPositions[i].x, dotPositions[i].y, dotPositions[i].z),
                  new THREE.Vector3(dotPositions[j].x, dotPositions[j].y, dotPositions[j].z),
                ])
                lineGroup.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: (1 - dist / CONNECT_DIST) * 0.25 })))
              }
            }
          }
        }
        rebuildLines()

        let frameCount = 0
        const animate = () => {
          animId = requestAnimationFrame(animate)
          frameCount++
          for (let i = 0; i < DOT_COUNT; i++) {
            dotPositions[i].x += dotPositions[i].vx
            dotPositions[i].y += dotPositions[i].vy
            if (Math.abs(dotPositions[i].x) > 7) dotPositions[i].vx *= -1
            if (Math.abs(dotPositions[i].y) > 5) dotPositions[i].vy *= -1
            posArr[i * 3] = dotPositions[i].x; posArr[i * 3 + 1] = dotPositions[i].y; posArr[i * 3 + 2] = dotPositions[i].z
          }
          dotGeo.attributes.position.needsUpdate = true
          if (frameCount % 3 === 0) rebuildLines()
          renderer.render(scene, camera)
        }
        animate()

        const handleResize = () => {
          if (!mount) return
          camera.aspect = mount.clientWidth / mount.clientHeight
          camera.updateProjectionMatrix()
          renderer.setSize(mount.clientWidth, mount.clientHeight)
        }
        window.addEventListener('resize', handleResize)

        // Store cleanup in mount's dataset for the return function
        mount._cleanup = () => {
          cancelAnimationFrame(animId)
          window.removeEventListener('resize', handleResize)
          try { renderer.dispose() } catch {}
          try { if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement) } catch {}
        }
      } catch (err) {
        console.warn('AuthParticles: Error during init, skipping.', err.message)
      }
    }).catch(() => {
      console.warn('AuthParticles: Three.js failed to load.')
    })

    return () => {
      if (animId) cancelAnimationFrame(animId)
      if (mount._cleanup) { mount._cleanup(); delete mount._cleanup }
    }
  }, [])

  return <div ref={mountRef} className="absolute inset-0 z-0" style={{ pointerEvents: 'none' }} />
}
