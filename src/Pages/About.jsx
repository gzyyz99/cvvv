import React, { useEffect, useState, memo, useMemo } from "react"
import { FileText, Code, Award, Globe, ArrowUpRight, Sparkles, UserCheck } from "lucide-react"
import AOS from 'aos'
import 'aos/dist/aos.css'

// Memoized Components
const Header = memo(() => (
  <div className="text-center lg:mb-8 mb-2 px-[5%]">
    <div className="inline-block relative group">
      <h2 
        className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-[#06b6d4]" 
        data-aos="zoom-in-up"
        data-aos-duration="600"
      >
        About Me
      </h2>
    </div>
    <p 
      className="mt-2 text-gray-400 max-w-2xl mx-auto text-base sm:text-lg flex items-center justify-center gap-2"
      data-aos="zoom-in-up"
      data-aos-duration="800"
    >
      <Sparkles className="w-5 h-5 text-purple-400" />
      Transforming ideas into digital experiences
      <Sparkles className="w-5 h-5 text-purple-400" />
    </p>
  </div>
));

import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';

// Kartu ID Interaktif — Bisa di-drag & snap kembali ke posisi awal
// Kartu ID Interaktif — Drag untuk reveal Spiderman!
const ProfileImage = memo(() => {
  // Nilai posisi drag
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  // Nilai tilt saat hover (terpisah dari drag)
  const hoverX = useMotionValue(0);
  const hoverY = useMotionValue(0);

  const hoverXSpring = useSpring(hoverX, { stiffness: 200, damping: 20 });
  const hoverYSpring = useSpring(hoverY, { stiffness: 200, damping: 20 });

  const rotateX = useTransform(hoverYSpring, [-0.5, 0.5], ["14deg", "-14deg"]);
  const rotateY = useTransform(hoverXSpring, [-0.5, 0.5], ["-14deg", "14deg"]);

  // Opacity Spiderman berdasarkan seberapa jauh kartu ditarik ke kanan
  // drag 0px → opacity 0 (tersembunyi), drag 150px ke kanan → opacity 1 (penuh terlihat)
  const spidermanOpacity = useTransform(dragX, [0, 150], [0, 1]);
  // Opacity foto normal kebalikannya
  const normalOpacity = useTransform(dragX, [0, 150], [1, 0]);

  // Glow cyan saat ditarik
  const glowOpacity = useTransform(dragX, [0, 150], [0, 0.6]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    hoverX.set((e.clientX - rect.left) / rect.width - 0.5);
    hoverY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    hoverX.set(0);
    hoverY.set(0);
  };

  // Saat drag selesai, snap balik ke posisi 0,0 dengan animasi spring
  const handleDragEnd = () => {
    animate(dragX, 0, { type: "spring", stiffness: 200, damping: 20 });
    animate(dragY, 0, { type: "spring", stiffness: 200, damping: 20 });
  };

  return (
    <div 
      className="flex justify-center lg:justify-end items-center sm:p-12 sm:py-0 sm:pb-0 p-0 py-2 pb-2"
      data-aos="fade-up"
      data-aos-duration="1000"
    >
      <div className="relative flex flex-col items-center justify-start h-[500px] sm:h-[540px] w-full mt-8 select-none" style={{ perspective: 1200 }}>
        
        {/* Tali Lanyard */}
        <div className="w-1.5 h-20 sm:h-24 bg-gradient-to-b from-cyan-900/60 to-gray-800 rounded-t-full shadow-lg absolute -top-12 z-0"></div>
        {/* Penjepit */}
        <div className="w-10 h-4 border-2 border-gray-600 rounded-full absolute top-7 z-0 bg-gray-900/80"></div>

        {/* Kartu Utama — Draggable */}
        <motion.div
          drag
          dragMomentum={false}
          style={{ x: dragX, y: dragY, rotateX, rotateY, transformStyle: "preserve-3d" }}
          onDragEnd={handleDragEnd}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileDrag={{ scale: 1.05, cursor: "grabbing" }}
          className="relative z-10 cursor-grab w-[240px] h-[380px] sm:w-[280px] sm:h-[440px] bg-gradient-to-b from-[#0f172a] to-[#0a0f1e] backdrop-blur-xl rounded-2xl border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col items-center mt-14 overflow-hidden"
        >
          {/* Kilau Glow Merah Spiderman (muncul saat ditarik) */}
          <motion.div 
            className="absolute inset-0 rounded-2xl bg-red-500/20 pointer-events-none z-10"
            style={{ opacity: glowOpacity }}
          />

          {/* Kilau Cahaya di atas kartu */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none z-10" />

          {/* Lubang tali */}
          <div className="w-14 h-3 bg-[#020b18] rounded-full mt-4 mb-3 shadow-inner border border-white/10 z-20 relative"></div>
          
          {/* Label Badge */}
          <div className="text-[9px] text-cyan-400 font-mono tracking-[0.3em] uppercase mb-2 opacity-70 z-20 relative">
            Portfolio — 2026
          </div>

          {/* Container Foto (posisi relative agar overlay bisa di atas) */}
          <div className="w-40 h-48 sm:w-48 sm:h-56 overflow-hidden rounded-xl border border-white/10 relative z-20">
            
            {/* Foto Normal */}
            <motion.img 
              src="/Photo.jpg" 
              alt="Bagir Ramadhan" 
              style={{ opacity: normalOpacity }}
              className="absolute inset-0 w-full h-full object-cover scale-105"
              loading="lazy"
              draggable="false"
            />

            {/* Foto Spiderman (muncul saat ditarik ke kanan) */}
            <motion.img 
              src="/spiderman.jpg"
              alt="Spiderman" 
              style={{ opacity: spidermanOpacity }}
              className="absolute inset-0 w-full h-full object-cover scale-105"
              loading="lazy"
              draggable="false"
              onError={(e) => { e.target.style.display = 'none'; }}
            />

            {/* Overlay gradasi nama */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/95 via-[#0a0f1e]/10 to-transparent z-10"></div>
            <div className="absolute bottom-3 left-3 text-white leading-none z-20">
              <motion.div 
                className="text-base sm:text-lg font-bold uppercase tracking-widest"
                style={{
                  // Nama ikut berubah saat ditarik
                  color: useTransform(dragX, [0, 150], ["#ffffff", "#ef4444"])
                }}
              >
                Bagir
              </motion.div>
              <motion.div 
                className="text-base sm:text-lg font-bold uppercase tracking-widest"
                style={{
                  color: useTransform(dragX, [0, 150], ["rgba(34,211,238,0.7)", "#ef4444"])
                }}
              >
                Ramadhan
              </motion.div>
            </div>
          </div>

          {/* Info Detail */}
          <div className="w-full px-5 mt-4 flex flex-col gap-1 z-20 relative">
            <span className="text-[9px] text-cyan-400/60 font-mono tracking-[0.25em] uppercase">Jabatan</span>
            <span className="text-xs sm:text-sm font-semibold text-white/90 tracking-wide">IT Network & Python Dev</span>
          </div>

          {/* Footer Kartu */}
          <div className="w-full px-5 mt-auto mb-4 pt-3 border-t border-white/8 flex items-center justify-between z-20 relative">
            <div className="flex gap-1.5 items-center">
               <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]"></div>
               <span className="text-[9px] text-cyan-400/60 font-mono tracking-wider uppercase">Active</span>
            </div>
            {/* Barcode */}
            <div 
              className="h-5 w-24 rounded-sm opacity-30" 
              style={{ backgroundImage: 'repeating-linear-gradient(to right, white 0, white 2px, transparent 2px, transparent 5px, white 5px, white 6px, transparent 6px, transparent 8px)' }}
            ></div>
          </div>
        </motion.div>

        {/* Hint teks di bawah kartu */}
        <p className="mt-4 text-[10px] text-gray-600 font-mono tracking-wider animate-pulse">
          → drag kanan untuk reveal 🕷️
        </p>
      </div>
    </div>
  );
});


const StatCard = memo(({ icon: Icon, color, value, label, description, animation }) => (
  <div data-aos={animation} data-aos-duration={1300} className="relative group">
    <div className="relative z-10 bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-white/10 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl h-full flex flex-col justify-between">
      <div className={`absolute -z-10 inset-0 bg-gradient-to-br ${color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/10 transition-transform group-hover:rotate-6">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <span 
          className="text-4xl font-bold text-white"
          data-aos="fade-up-left"
          data-aos-duration="1500"
          data-aos-anchor-placement="top-bottom"
        >
          {value}
        </span>
      </div>

      <div>
        <p 
          className="text-sm uppercase tracking-wider text-gray-300 mb-2"
          data-aos="fade-up"
          data-aos-duration="800"
          data-aos-anchor-placement="top-bottom"
        >
          {label}
        </p>
        <div className="flex items-center justify-between">
          <p 
            className="text-xs text-gray-400"
            data-aos="fade-up"
            data-aos-duration="1000"
            data-aos-anchor-placement="top-bottom"
          >
            {description}
          </p>
          <ArrowUpRight className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
        </div>
      </div>
    </div>
  </div>
));

const AboutPage = () => {
  // Memoized calculations
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalCertificates: 0,
    YearExperience: 0,
  });

  useEffect(() => {
    const updateStats = () => {
      const storedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
      const storedCertificates = JSON.parse(localStorage.getItem("certificates") || "[]");
      
      const startDate = new Date("2021-11-06");
      const today = new Date();
      const experience = today.getFullYear() - startDate.getFullYear() -
        (today < new Date(today.getFullYear(), startDate.getMonth(), startDate.getDate()) ? 1 : 0);

      setStats({
        totalProjects: storedProjects.length,
        totalCertificates: storedCertificates.length,
        YearExperience: experience
      });
    };

    updateStats();

    window.addEventListener('storage', updateStats);
    window.addEventListener('portfolioDataUpdated', updateStats);

    return () => {
      window.removeEventListener('storage', updateStats);
      window.removeEventListener('portfolioDataUpdated', updateStats);
    };
  }, []);

  const { totalProjects, totalCertificates, YearExperience } = stats;

  // Optimized AOS initialization
  useEffect(() => {
    const initAOS = () => {
      AOS.init({
        once: false, 
      });
    };

    initAOS();
    
    // Debounced resize handler
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initAOS, 250);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  // Memoized stats data
  const statsData = useMemo(() => [
    {
      icon: Code,
      color: "from-[#0ea5e9] to-[#06b6d4]",
      value: totalProjects,
      label: "Total Projects",
      description: "Innovative web solutions crafted",
      animation: "fade-right",
    },
    {
      icon: Award,
      color: "from-[#06b6d4] to-[#0ea5e9]",
      value: totalCertificates,
      label: "Certificates",
      description: "Professional skills validated",
      animation: "fade-up",
    },
    {
      icon: Globe,
      color: "from-[#0ea5e9] to-[#06b6d4]",
      value: YearExperience,
      label: "Years of Experience",
      description: "Continuous learning journey",
      animation: "fade-left",
    },
  ], [totalProjects, totalCertificates, YearExperience]);

  return (
    <div
      className="h-auto pb-[10%] text-white overflow-hidden px-[5%] sm:px-[5%] lg:px-[10%] mt-10 sm-mt-0" 
      id="About"
     itemScope
  itemType="https://schema.org/Person"

    >
      <Header />

      <div className="w-full mx-auto pt-8 sm:pt-12 relative">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <h2 
              className="text-3xl sm:text-4xl lg:text-5xl font-bold"
              data-aos="fade-right"
              data-aos-duration="1000"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-[#06b6d4]">
                Hello, I'm
              </span>
              <span 
                className="block mt-2 text-gray-200"
                data-aos="fade-right"
                data-aos-duration="1300"
                itemProp="name"
              >
                Raden Muhamad Bagir Ramadhan
              </span>
            </h2>
            
            <p 
              className="text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed text-justify pb-4 sm:pb-0"
              data-aos="fade-right"
              data-aos-duration="1500"
            >
              Saya adalah lulusan SMK jurusan Teknik Komputer dan Jaringan (TKJ) dari SMKN 3 Bogor yang memiliki minat besar di bidang teknologi informasi, khususnya pemrograman dan kecerdasan buatan. Berpengalaman sebagai Teknisi IT dalam menangani troubleshooting perangkat keras & jaringan, instalasi sistem LAN/WLAN, serta merancang aplikasi cerdas menggunakan Python dan Computer Vision (OpenCV).
            </p>

               {/* Quote Section */}
      <div 
        className="relative bg-gradient-to-br from-[#0ea5e9]/5 via-transparent to-[#06b6d4]/5 border border-gradient-to-r border-[#0ea5e9]/30 rounded-2xl p-4 my-6 backdrop-blur-md shadow-2xl overflow-hidden"
        data-aos="fade-up"
        data-aos-duration="1700"
      >
        {/* Floating orbs background */}
        <div className="absolute top-2 right-4 w-16 h-16 bg-gradient-to-r from-[#0ea5e9]/20 to-[#06b6d4]/20 rounded-full blur-xl"></div>
        <div className="absolute -bottom-4 -left-2 w-12 h-12 bg-gradient-to-r from-[#06b6d4]/20 to-[#0ea5e9]/20 rounded-full blur-lg"></div>
        
        {/* Quote icon */}
        <div className="absolute top-3 left-4 text-[#0ea5e9] opacity-30">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
          </svg>
        </div>
        
        <blockquote className="text-gray-300 text-center lg:text-left italic font-medium text-sm relative z-10 pl-6">
          "Mengubah ide kompleks menjadi sistem digital yang fungsional, dari infrastruktur jaringan hingga Artificial Intelligence."
        </blockquote>
      </div>

            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 lg:gap-4 lg:px-0 w-full">
              <a href="https://wa.me/6283106847721" target="_blank" rel="noopener noreferrer" className="w-full lg:w-auto">
              <button 
                data-aos="fade-up"
                data-aos-duration="800"
                className="w-full lg:w-auto sm:px-6 py-2 sm:py-3 rounded-lg bg-gradient-to-r from-[#0ea5e9] to-[#06b6d4] text-white font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center lg:justify-start gap-2 shadow-lg hover:shadow-xl "
              >
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> Kontak & CV
              </button>
              </a>
              <a href="#Portofolio" className="w-full lg:w-auto">
              <button 
                data-aos="fade-up"
                data-aos-duration="1000"
                className="w-full lg:w-auto sm:px-6 py-2 sm:py-3 rounded-lg border border-[#06b6d4]/50 text-[#06b6d4] font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center lg:justify-start gap-2 hover:bg-[#06b6d4]/10 "
              >
                <Code className="w-4 h-4 sm:w-5 sm:h-5" /> View Projects
              </button>
              </a>
            </div>
          </div>

          <ProfileImage />
        </div>

        <a href="#Portofolio">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 cursor-pointer">
            {statsData.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </a>
      </div>

      <div className="w-full mt-16 overflow-hidden relative" data-aos="fade-up" data-aos-duration="1000">
        <div className="absolute left-0 top-0 w-12 sm:w-20 h-full bg-gradient-to-r from-[#020b18] to-transparent z-10"></div>
        <div className="absolute right-0 top-0 w-12 sm:w-20 h-full bg-gradient-to-l from-[#020b18] to-transparent z-10"></div>
        
        <p className="text-sm uppercase tracking-widest text-cyan-400/80 mb-6 text-center font-mono">Tech Stack & Tools</p>
        
        <div className="flex w-[200%] sm:w-[150%] animate-scroll hover:[animation-play-state:paused]">
          {[
            { name: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
            { name: "OpenCV", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg" },
            { name: "Linux", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg" },
            { name: "HTML5", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
            { name: "CSS3", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
            { name: "React", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
            { name: "Tailwind", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" },
            { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
            // Duplikasi agar efek infinite scroll berjalan mulus
            { name: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
            { name: "OpenCV", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg" },
            { name: "Linux", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg" },
            { name: "HTML5", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
            { name: "CSS3", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
            { name: "React", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
            { name: "Tailwind", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" },
            { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
          ].map((tech, index) => (
            <div key={index} className="flex flex-col items-center justify-center w-[120px] sm:w-[150px] flex-shrink-0 gap-2 group opacity-50 hover:opacity-100 transition-all duration-300">
              <img src={tech.icon} alt={tech.name} className="w-10 h-10 sm:w-12 sm:h-12 object-contain filter grayscale group-hover:grayscale-0 group-hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-all duration-300" />
              <span className="text-[10px] sm:text-xs font-mono text-gray-500 group-hover:text-cyan-400">{tech.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes spin-slower {
          to { transform: rotate(360deg); }
        }
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        .animate-pulse-slow {
          animation: pulse 3s infinite;
        }
        .animate-spin-slower {
          animation: spin-slower 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default memo(AboutPage);