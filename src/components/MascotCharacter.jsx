import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

// If mascot.png exists, use it. Otherwise show SVG fallback.
function CharacterImage({ loginSuccess, userName }) {
  const [imgOk, setImgOk] = useState(true)

  if (imgOk) {
    return (
      <motion.div
        animate={!loginSuccess ? { y:[0,-10,0] } : { rotate:[0,3,-3,2,0] }}
        transition={{ repeat: Infinity, duration: loginSuccess ? 1.2 : 3.5, ease:'easeInOut' }}
        style={{ width: 280, position:'relative' }}
      >
        <img
          src="/mascot.png"
          alt="mascot"
          style={{ width:'100%', height:'auto', filter:'drop-shadow(0 20px 40px rgba(0,0,0,0.4))' }}
          onError={() => setImgOk(false)}
        />
      </motion.div>
    )
  }

  // SVG fallback
  return <SVGCharacter loginSuccess={loginSuccess} />
}

function SVGCharacter({ loginSuccess }) {
  const [eyeOpen, setEyeOpen] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setEyeOpen(false)
      setTimeout(() => setEyeOpen(true), 130)
    }, 3500 + Math.random() * 1500)
    return () => clearInterval(id)
  }, [])

  const ey = eyeOpen ? 1 : 0.05

  return (
    <AnimatePresence mode="wait">
      {!loginSuccess ? <LeanPose key="lean" ey={ey} eyeOpen={eyeOpen} /> : <WavePose key="wave" />}
    </AnimatePresence>
  )
}

function LeanPose({ ey, eyeOpen }) {
  return (
    <motion.svg width="220" height="360" viewBox="0 0 220 360" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }}
      exit={{ opacity:0, x:40 }} transition={{ duration:0.5, type:'spring' }}
      style={{ overflow:'visible', filter:'drop-shadow(0 16px 32px rgba(0,0,0,0.35))' }}
    >
      {/* Body sway */}
      <motion.g animate={{ rotate:[0,1.5,0,-1,0] }}
        transition={{ repeat:Infinity, duration:5, ease:'easeInOut' }}
        style={{ originX:'110px', originY:'230px' }}>

        {/* Shadow */}
        <ellipse cx="115" cy="348" rx="48" ry="9" fill="rgba(0,0,0,0.18)" />

        {/* Back leg straight */}
        <rect x="110" y="230" width="24" height="76" rx="12" fill="#1e3a5f" />
        <ellipse cx="122" cy="310" rx="22" ry="10" fill="#0f172a" />
        <rect x="103" y="302" width="38" height="13" rx="6.5" fill="#111827" />
        {/* Shoe lace detail */}
        <line x1="107" y1="306" x2="137" y2="306" stroke="white" strokeWidth="1" opacity="0.3" />

        {/* Front leg crossed */}
        <motion.g animate={{ rotate:[0,1.5,0] }}
          transition={{ repeat:Infinity, duration:4.5, ease:'easeInOut' }}
          style={{ originX:'98px', originY:'232px' }}>
          <rect x="83" y="228" width="24" height="42" rx="12" fill="#2563eb"
            transform="rotate(-15 95 238)" />
          <rect x="68" y="260" width="22" height="40" rx="11" fill="#1d4ed8"
            transform="rotate(13 79 272)" />
          <ellipse cx="66" cy="302" rx="20" ry="9" fill="#0f172a"
            transform="rotate(11 66 302)" />
          <rect x="49" y="295" width="34" height="12" rx="6" fill="#111827"
            transform="rotate(11 66 302)" />
          <line x1="52" y1="299" x2="80" y2="299" stroke="white" strokeWidth="1"
            opacity="0.3" transform="rotate(11 66 302)" />
        </motion.g>

        {/* Torso hoodie */}
        <rect x="74" y="155" width="72" height="88" rx="24" fill="#0047AB" />
        {/* Hoodie zip */}
        <rect x="107" y="155" width="7" height="88" rx="3.5" fill="#003380" />
        {/* Hoodie pocket */}
        <rect x="83" y="202" width="46" height="26" rx="12" fill="#003380" />
        <text x="92" y="219" fontSize="11" fill="#48cae4" fontWeight="900"
          fontFamily="Arial, sans-serif">DEV</text>
        {/* Hoodie hood */}
        <path d="M88 155 Q110 172 132 155" fill="#003380" />
        {/* Hoodie drawstrings */}
        <line x1="103" y1="168" x2="99" y2="190" stroke="#48cae4" strokeWidth="1.5" opacity="0.6" />
        <line x1="117" y1="168" x2="121" y2="190" stroke="#48cae4" strokeWidth="1.5" opacity="0.6" />

        {/* Left arm crossed */}
        <motion.g animate={{ rotate:[0,2,0] }}
          transition={{ repeat:Infinity, duration:4, ease:'easeInOut' }}
          style={{ originX:'78px', originY:'172px' }}>
          <rect x="42" y="162" width="48" height="18" rx="9" fill="#0047AB"
            transform="rotate(16 66 171)" />
          <ellipse cx="43" cy="178" rx="13" ry="12" fill="#FDDBB4" />
          {/* Knuckle details */}
          <ellipse cx="36" cy="174" rx="4.5" ry="5" fill="#f0c99a" />
          <ellipse cx="35" cy="181" rx="4.5" ry="4.5" fill="#f0c99a" />
          <ellipse cx="38" cy="187" rx="4" ry="4" fill="#f0c99a" />
        </motion.g>

        {/* Right arm crossed */}
        <motion.g animate={{ rotate:[0,-2,0] }}
          transition={{ repeat:Infinity, duration:4, delay:0.6, ease:'easeInOut' }}
          style={{ originX:'132px', originY:'172px' }}>
          <rect x="130" y="160" width="48" height="18" rx="9" fill="#0047AB"
            transform="rotate(-12 154 169)" />
          <ellipse cx="175" cy="172" rx="13" ry="12" fill="#FDDBB4" />
          <ellipse cx="182" cy="168" rx="4.5" ry="5" fill="#f0c99a" />
          <ellipse cx="183" cy="175" rx="4.5" ry="4.5" fill="#f0c99a" />
          <ellipse cx="180" cy="181" rx="4" ry="4" fill="#f0c99a" />
        </motion.g>

        {/* Neck */}
        <rect x="99" y="135" width="20" height="24" rx="10" fill="#FDDBB4" />

        {/* Head */}
        <ellipse cx="110" cy="110" rx="37" ry="39" fill="#FDDBB4" />
        {/* Head highlight */}
        <ellipse cx="98" cy="93" rx="14" ry="10" fill="rgba(255,255,255,0.12)" />

        {/* Hair */}
        <path d="M74 104 C74 69 89 57 110 55 C131 53 146 69 146 104" fill="#1a0800" />
        {/* Hair spikes */}
        <path d="M84 70 Q87 53 92 68" fill="#1a0800"/>
        <path d="M97 63 Q100 46 104 62" fill="#1a0800"/>
        <path d="M110 60 Q112 43 116 60" fill="#1a0800"/>
        <path d="M122 64 Q128 48 128 64" fill="#1a0800"/>
        <path d="M76 88 Q70 72 78 84" fill="#1a0800"/>
        <path d="M144 88 Q150 72 142 84" fill="#1a0800"/>

        {/* Cap */}
        <ellipse cx="110" cy="88" rx="37" ry="11" fill="#003380" />
        <rect x="73" y="79" width="74" height="17" rx="7" fill="#003380" />
        <rect x="73" y="85" width="74" height="6" rx="3" fill="#0047AB" />
        {/* Cap brim */}
        <rect x="66" y="93" width="88" height="9" rx="4.5" fill="#003380" />
        {/* Cap badge */}
        <circle cx="110" cy="87" r="9" fill="#0077b6" />
        <circle cx="110" cy="87" r="7" fill="#48cae4" />
        <text x="106" y="91" fontSize="9" fill="#003380" fontWeight="900"
          fontFamily="Arial, sans-serif">D</text>

        {/* Eye whites */}
        <ellipse cx="96" cy="111" rx="9" ry={9*ey} fill="#fff" />
        <ellipse cx="124" cy="111" rx="9" ry={9*ey} fill="#fff" />
        {/* Eye outline */}
        <ellipse cx="96" cy="111" rx="9" ry={9*ey} fill="none"
          stroke="#d4a96a" strokeWidth="1.2" />
        <ellipse cx="124" cy="111" rx="9" ry={9*ey} fill="none"
          stroke="#d4a96a" strokeWidth="1.2" />
        {/* Pupils */}
        {eyeOpen && <>
          <ellipse cx="97" cy="112" rx="5" ry="5" fill="#1a0800" />
          <ellipse cx="125" cy="112" rx="5" ry="5" fill="#1a0800" />
          {/* Shine */}
          <circle cx="99" cy="110" r="1.8" fill="white" />
          <circle cx="127" cy="110" r="1.8" fill="white" />
        </>}

        {/* Eyebrows */}
        <path d="M87 100 Q96 97 105 100" stroke="#1a0800" strokeWidth="3"
          fill="none" strokeLinecap="round"/>
        <path d="M115 100 Q124 97 133 100" stroke="#1a0800" strokeWidth="3"
          fill="none" strokeLinecap="round"/>

        {/* Nose */}
        <ellipse cx="110" cy="120" rx="3.5" ry="2.5" fill="#e8a87c" />

        {/* Mouth — cool smirk */}
        <path d="M100 130 Q109 137 120 133" stroke="#c07850" strokeWidth="2.5"
          fill="none" strokeLinecap="round"/>

        {/* Cheeks */}
        <ellipse cx="85" cy="122" rx="9" ry="5.5" fill="#f4a88a" opacity="0.4"/>
        <ellipse cx="135" cy="122" rx="9" ry="5.5" fill="#f4a88a" opacity="0.4"/>

      </motion.g>
    </motion.svg>
  )
}

function WavePose() {
  return (
    <motion.svg width="220" height="360" viewBox="0 0 220 360" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }}
      exit={{ opacity:0 }} transition={{ duration:0.5, type:'spring' }}
      style={{ overflow:'visible', filter:'drop-shadow(0 16px 32px rgba(0,0,0,0.35))' }}
    >
      {/* Shadow */}
      <ellipse cx="110" cy="348" rx="48" ry="9" fill="rgba(0,0,0,0.18)" />

      {/* Confetti */}
      {[{cx:30,cy:60,r:6,c:'#48cae4'},{cx:185,cy:52,r:5,c:'#fbbf24'},
        {cx:20,cy:155,r:4,c:'#f87171'},{cx:195,cy:148,r:5,c:'#a78bfa'},
        {cx:52,cy:42,r:4,c:'#34d399'},{cx:168,cy:90,r:5,c:'#fb923c'}
      ].map((c,i)=>(
        <motion.circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill={c.c}
          initial={{ opacity:0 }}
          animate={{ opacity:[0,1,1,0], y:[-5,-28,-55], x:[0,i%2===0?14:-14] }}
          transition={{ repeat:Infinity, duration:2.3, delay:i*0.3 }}
        />
      ))}

      {/* Legs straight */}
      <rect x="87" y="230" width="24" height="76" rx="12" fill="#1e3a5f" />
      <rect x="109" y="230" width="24" height="76" rx="12" fill="#1e3a5f" />
      {/* Left shoe */}
      <ellipse cx="99" cy="310" rx="22" ry="10" fill="#0f172a" />
      <rect x="80" y="302" width="38" height="13" rx="6.5" fill="#111827" />
      <line x1="83" y1="306" x2="113" y2="306" stroke="white" strokeWidth="1" opacity="0.3"/>
      {/* Right shoe */}
      <ellipse cx="121" cy="310" rx="22" ry="10" fill="#0f172a" />
      <rect x="103" y="302" width="38" height="13" rx="6.5" fill="#111827" />
      <line x1="106" y1="306" x2="136" y2="306" stroke="white" strokeWidth="1" opacity="0.3"/>

      {/* Torso */}
      <rect x="74" y="155" width="72" height="88" rx="24" fill="#0047AB" />
      <rect x="107" y="155" width="7" height="88" rx="3.5" fill="#003380" />
      <rect x="83" y="202" width="46" height="26" rx="12" fill="#003380" />
      <text x="92" y="219" fontSize="11" fill="#48cae4" fontWeight="900"
        fontFamily="Arial, sans-serif">DEV</text>
      <path d="M88 155 Q110 172 132 155" fill="#003380" />
      <line x1="103" y1="168" x2="99" y2="190" stroke="#48cae4" strokeWidth="1.5" opacity="0.6"/>
      <line x1="117" y1="168" x2="121" y2="190" stroke="#48cae4" strokeWidth="1.5" opacity="0.6"/>

      {/* Left arm down */}
      <rect x="52" y="162" width="24" height="58" rx="12" fill="#0047AB" />
      <ellipse cx="64" cy="228" rx="13" ry="12" fill="#FDDBB4" />

      {/* Right arm waving */}
      <motion.g style={{ originX:'145px', originY:'165px' }}
        animate={{ rotate:[0,-35,0,-30,0,-32,0] }}
        transition={{ repeat:Infinity, duration:1.1, ease:'easeInOut' }}>
        <rect x="143" y="155" width="24" height="55" rx="12" fill="#0047AB"
          transform="rotate(-42 155 162)" />
        {/* Open hand */}
        <ellipse cx="172" cy="117" rx="14" ry="13" fill="#FDDBB4" />
        {/* Fingers */}
        <rect x="164" y="103" width="8" height="17" rx="4" fill="#FDDBB4" />
        <rect x="174" y="100" width="8" height="19" rx="4" fill="#FDDBB4" />
        <rect x="184" y="104" width="8" height="17" rx="4" fill="#FDDBB4" />
        <rect x="192" y="110" width="7" height="14" rx="3.5" fill="#FDDBB4" />
        <rect x="158" y="109" width="7" height="12" rx="3.5" fill="#FDDBB4" />
        {/* Hand highlight */}
        <ellipse cx="170" cy="113" rx="5" ry="3" fill="rgba(255,255,255,0.2)" />
      </motion.g>

      {/* Neck */}
      <rect x="99" y="135" width="20" height="24" rx="10" fill="#FDDBB4" />

      {/* Head */}
      <ellipse cx="110" cy="110" rx="37" ry="39" fill="#FDDBB4" />
      <ellipse cx="98" cy="93" rx="14" ry="10" fill="rgba(255,255,255,0.12)" />

      {/* Hair */}
      <path d="M74 104 C74 69 89 57 110 55 C131 53 146 69 146 104" fill="#1a0800"/>
      <path d="M84 70 Q87 53 92 68" fill="#1a0800"/>
      <path d="M97 63 Q100 46 104 62" fill="#1a0800"/>
      <path d="M110 60 Q112 43 116 60" fill="#1a0800"/>
      <path d="M122 64 Q128 48 128 64" fill="#1a0800"/>

      {/* Cap */}
      <ellipse cx="110" cy="88" rx="37" ry="11" fill="#003380"/>
      <rect x="73" y="79" width="74" height="17" rx="7" fill="#003380"/>
      <rect x="73" y="85" width="74" height="6" rx="3" fill="#0047AB"/>
      <rect x="66" y="93" width="88" height="9" rx="4.5" fill="#003380"/>
      <circle cx="110" cy="87" r="9" fill="#0077b6"/>
      <circle cx="110" cy="87" r="7" fill="#48cae4"/>
      <text x="106" y="91" fontSize="9" fill="#003380" fontWeight="900"
        fontFamily="Arial, sans-serif">D</text>

      {/* Eyes happy squint */}
      <path d="M87 111 Q96 104 105 111" stroke="#1a0800" strokeWidth="4"
        fill="none" strokeLinecap="round"/>
      <path d="M115 111 Q124 104 133 111" stroke="#1a0800" strokeWidth="4"
        fill="none" strokeLinecap="round"/>

      {/* Eyebrows raised */}
      <path d="M87 99 Q96 94 105 97" stroke="#1a0800" strokeWidth="3"
        fill="none" strokeLinecap="round"/>
      <path d="M115 97 Q124 94 133 99" stroke="#1a0800" strokeWidth="3"
        fill="none" strokeLinecap="round"/>

      {/* Nose */}
      <ellipse cx="110" cy="120" rx="3.5" ry="2.5" fill="#e8a87c"/>

      {/* Big smile + teeth */}
      <path d="M91 130 Q110 148 129 130" stroke="#c07850" strokeWidth="2.5"
        fill="none" strokeLinecap="round"/>
      <path d="M95 131 Q110 145 125 131" fill="white" opacity="0.9"/>

      {/* Cheeks flushed */}
      <ellipse cx="85" cy="124" rx="11" ry="7" fill="#f4a88a" opacity="0.6"/>
      <ellipse cx="135" cy="124" rx="11" ry="7" fill="#f4a88a" opacity="0.6"/>

    </motion.svg>
  )
}

export default function MascotCharacter({ mode='register', userName='', loginSuccess=false }) {
  return (
    <div className="relative flex flex-col items-center justify-end select-none"
      style={{ width:280, minHeight:380 }}>

      {/* Welcome bubble on success */}
      <AnimatePresence>
        {loginSuccess && (
          <motion.div
            initial={{ opacity:0, scale:0.7, y:10 }}
            animate={{ opacity:1, scale:1, y:0 }}
            exit={{ opacity:0 }}
            transition={{ type:'spring', stiffness:260, damping:18, delay:0.4 }}
            className="absolute top-0 right-0 z-20 rounded-2xl px-4 py-2.5 shadow-2xl"
            style={{
              background:'rgba(255,255,255,0.15)',
              backdropFilter:'blur(14px)',
              border:'1.5px solid rgba(255,255,255,0.35)',
              minWidth:140
            }}
          >
            <p className="text-xs font-black text-white">Welcome</p>
            <p className="text-base font-black" style={{ color:'#48cae4' }}>
              {userName||'Student'}! 👋
            </p>
            <p className="text-[10px] text-white/70 mt-0.5">
              Redirecting to your portal 🚀
            </p>
            <div className="absolute -left-2.5 top-4 w-0 h-0"
              style={{
                borderTop:'6px solid transparent',
                borderBottom:'6px solid transparent',
                borderRight:'10px solid rgba(255,255,255,0.25)'
              }}/>
          </motion.div>
        )}
      </AnimatePresence>

      <CharacterImage loginSuccess={loginSuccess} userName={userName} />
    </div>
  )
}
