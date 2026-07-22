import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function HeroParticles() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // Scene setup
    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.z = 8

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const pointLight1 = new THREE.PointLight(0xa78bfa, 2, 20)
    pointLight1.position.set(5, 5, 5)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0x6d28d9, 1.5, 15)
    pointLight2.position.set(-5, -3, 3)
    scene.add(pointLight2)

    // Create 35 floating spheres
    const spheres = []
    const colors  = [0x7c3aed, 0xddd6fe, 0xa78bfa, 0x6d28d9, 0xede9fe, 0xc4b5fd, 0x4c1d95]

    for (let i = 0; i < 35; i++) {
      const geo  = new THREE.SphereGeometry(Math.random() * 0.22 + 0.06, 16, 16)
      const mat  = new THREE.MeshStandardMaterial({
        color:       colors[Math.floor(Math.random() * colors.length)],
        transparent: true,
        opacity:     Math.random() * 0.5 + 0.25,
        roughness:   0.4,
        metalness:   0.1,
      })
      const mesh = new THREE.Mesh(geo, mat)

      mesh.position.set(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 5
      )

      scene.add(mesh)
      spheres.push({
        mesh,
        speed:  Math.random() * 0.4 + 0.1,
        offset: Math.random() * Math.PI * 2,
        ox:     mesh.position.x,
        oy:     mesh.position.y,
      })
    }

    // Two large glow orbs
    const orbGeo = new THREE.SphereGeometry(1.4, 32, 32)

    const orb1Mesh = new THREE.Mesh(orbGeo, new THREE.MeshStandardMaterial({ color: 0x3b1fa8, transparent: true, opacity: 0.18, roughness: 0, metalness: 0.6 }))
    orb1Mesh.position.set(-3, 1, -3)
    scene.add(orb1Mesh)

    const orb2Mesh = new THREE.Mesh(new THREE.SphereGeometry(1.1, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.14, roughness: 0, metalness: 0.6 }))
    orb2Mesh.position.set(3, -1, -2)
    scene.add(orb2Mesh)

    // Animation loop
    let animId
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      spheres.forEach(s => {
        s.mesh.position.y = s.oy + Math.sin(t * s.speed + s.offset) * 0.55
        s.mesh.position.x = s.ox + Math.cos(t * s.speed * 0.7 + s.offset) * 0.35
        s.mesh.rotation.x = t * 0.15
        s.mesh.rotation.y = t * 0.2
      })

      orb1Mesh.position.x = -3 + Math.sin(t * 0.2) * 1.8
      orb1Mesh.position.y =  1 + Math.cos(t * 0.15) * 1.2

      orb2Mesh.position.x = 3 + Math.cos(t * 0.18) * 2.2
      orb2Mesh.position.y = -1 + Math.sin(t * 0.13) * 1.5

      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!mount) return
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
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
