import { useState } from 'react'

const galleryImages = [
  {
    src: '/gallery/logo2.png',
    title: 'IUB Main Entrance Gate',
    category: 'Campus',
  },
  {
    src: '/gallery/bagdad.png',
    title: 'Baghdad-ul-Jadeed Campus',
    category: 'Campus',
  },
  {
    src: '/gallery/universitycampus.png',
    title: 'University Campus View',
    category: 'Campus',
  },
  {
    src: '/gallery/faculty.png',
    title: 'Faculty Building',
    category: 'Campus',
  },
  {
    src: '/gallery/campus1.jpg',
    title: 'IUB Campus',
    category: 'Campus',
  },
  {
    src: '/gallery/campus2.jpg',
    title: 'University Building',
    category: 'Campus',
  },
  {
    src: '/gallery/Sirdasdiqlibaray.jpg',
    title: 'Sir Sadiq Muhammad Khan Library',
    category: 'Library',
  },
  {
    src: '/gallery/Multimediaroom.jpg',
    title: 'Multimedia Room',
    category: 'Classrooms',
  },
  {
    src: '/gallery/images (2).jpg',
    title: 'Student Life at IUB',
    category: 'Student Life',
  },
  {
    src: '/gallery/image.png',
    title: 'IUB Event',
    category: 'Events',
  },
  {
    src: '/event.png',
    title: 'University Event',
    category: 'Events',
  },
]

const categories = ['All', 'Campus', 'Library', 'Classrooms', 'Student Life', 'Events']

export default function Gallery({ images = galleryImages }) {
  const [active, setActive] = useState('All')
  const [lightbox, setLightbox] = useState(null)

  const filtered = active === 'All'
    ? images
    : images.filter(img => img.category === active)

  return (
    <section id="gallery" className="bg-white px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 text-center sm:mb-10">
          <span className="rounded-full bg-primary-pale px-4 py-1 text-xs font-bold text-primary">
            CAMPUS GALLERY
          </span>
          <h2 className="mt-3 text-2xl font-extrabold text-gray-900 sm:text-3xl lg:text-4xl">
            Our services
          </h2>
          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Environment, classrooms, events and student life photos.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-7 flex flex-wrap justify-center gap-2 overflow-x-auto px-1 pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`rounded-full px-5 py-1.5 text-sm font-semibold transition ${
                active === cat
                  ? 'text-white shadow-md'
                  : 'border border-primary-pale bg-white text-primary hover:bg-primary-ice'
              }`}
              style={active === cat
                ? { background: 'var(--theme-grad-primary)' }
                : {}
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 sm:gap-3">
          {filtered.map((img, i) => (
            <div
              key={i}
              onClick={() => setLightbox(img)}
              className="group relative cursor-pointer overflow-hidden rounded-xl shadow-sm ring-1 ring-gray-100 sm:rounded-2xl"
            >
              <img
                src={img.src}
                alt={img.title}
                className="h-36 w-full object-cover transition-transform duration-500 group-hover:scale-110 sm:h-44 lg:h-52"
                onError={(e) => {
                  e.target.src = `https://placehold.co/600x440/04065c/48cae4?text=${encodeURIComponent(img.title)}`
                }}
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="mb-1 w-fit rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                  {img.category}
                </span>
                <p className="text-sm font-bold leading-tight text-white">{img.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* View More */}
        <div className="mt-10 text-center">
          <a
            href="https://www.iub.edu.pk/galleries"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-primary px-7 py-3 font-bold text-primary transition hover:bg-primary hover:text-white"
          >
            View Full Gallery on IUB Website ↗
          </a>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative w-full max-w-3xl"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={lightbox.src}
              alt={lightbox.title}
              className="w-full rounded-2xl object-contain shadow-2xl max-h-[80vh]"
              onError={(e) => {
                e.target.src = `https://placehold.co/800x560/04065c/48cae4?text=${encodeURIComponent(lightbox.title)}`
              }}
            />
            <div className="mt-3 text-center">
              <p className="text-lg font-bold text-white">{lightbox.title}</p>
              <span className="mt-1 inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs font-batchibold text-white">
                {lightbox.category}
              </span>
            </div>
            {/* Close button */}
            <button
              onClick={() => setLightbox(null)}
              className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-bold text-gray-900 shadow-lg hover:bg-gray-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
