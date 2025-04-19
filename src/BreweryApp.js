import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Timer, Thermometer, ArrowUp, Star, Sun, Moon, Share2, Globe, QrCode, Calendar, ArrowLeft, ArrowRight, Droplets, Wheat, Award } from 'lucide-react';

// Simulate Live Data
const generateMockData = (timeOffset = 0) => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - timeOffset);
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return {
    time: timeString,
    temperature: Math.floor(65 + Math.sin(timeOffset / 10) * 5),
    pressure: Math.floor(2 + Math.cos(timeOffset / 8) * 0.5),
  };
};

// Generate Historical Data
const generateHistoricalData = (process, day = 0) => {
  const data = [];
  const maxPoints = 24;
  
  for (let i = maxPoints; i >= 0; i--) {
    const seed = i + (day * 17);
    if (process === 'hopfenkochen') {
      data.push({
        time: `${i*15}min`,
        temperature: Math.floor(95 + Math.sin(seed / 3) * 3),
        pressure: Math.floor(1.5 + Math.cos(seed / 4) * 0.3),
      });
    } else if (process === 'maischen') {
      data.push({
        time: `${i*20}min`,
        temperature: Math.floor(60 + Math.sin(seed / 2) * 15),
        pressure: Math.floor(1 + Math.cos(seed / 3) * 0.4),
      });
    } else if (process === 'gaerung') {
      data.push({
        time: `${i*30}min`,
        temperature: Math.floor(18 + Math.sin(seed / 5) * 2),
        pressure: Math.floor(0.8 + Math.cos(seed / 6) * 0.2),
      });
    }
  }
  return data;
};

// QR-Code Component
const QRCodeDisplay = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border border-amber-100 dark:border-amber-900/30">
      <QrCode size={180} className="text-amber-900 mb-4" />
      <p className="text-center text-gray-700 dark:text-gray-300">Scannen Sie diesen QR-Code, um die Brauerei-App auf Ihrem Mobilgerät zu öffnen</p>
    </div>
  );
};

// Beer Glass Component
const BeerGlass = ({ className }) => {
  return (
    <div className={`beer-glass ${className}`}>
      <div className="beer-foam">
        <div className="beer-foam-bubble beer-foam-bubble-1"></div>
        <div className="beer-foam-bubble beer-foam-bubble-2"></div>
        <div className="beer-foam-bubble beer-foam-bubble-3"></div>
      </div>
      <div className="beer-liquid">
        <div className="beer-bubble beer-bubble-1"></div>
        <div className="beer-bubble beer-bubble-2"></div>
        <div className="beer-bubble beer-bubble-3"></div>
        <div className="beer-bubble beer-bubble-4"></div>
        <div className="beer-bubble beer-bubble-5"></div>
        <div className="beer-highlight"></div>
      </div>
    </div>
  );
};

// Main Component
export default function BreweryApp() {
  const [currentData, setCurrentData] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState('live');
  const [historicalData, setHistoricalData] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(127);
  const [averageRating, setAverageRating] = useState(4.2);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [language, setLanguage] = useState('de');
  const [darkMode, setDarkMode] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [historicalDay, setHistoricalDay] = useState(0);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [notification, setNotification] = useState(null);
  const [animateHero, setAnimateHero] = useState(false);
  
  const chartRef = useRef(null);
  
  // Text Translations
  const translations = {
    de: {
      title: "FH Brauerei Wien",
      subtitle: "Live-Einblick in unseren Brauprozess",
      liveData: "Live Braudaten",
      lastUpdated: "Zuletzt aktualisiert",
      liveDataBtn: "Live Daten",
      hopfenkochenBtn: "Hopfenkochen",
      maischenBtn: "Maischen",
      gaerungBtn: "Gärung",
      temperature: "Temperatur",
      pressure: "Druck",
      currentBeer: "Aktuelles Bier",
      originalGravity: "Stammwürze",
      alcohol: "Alkohol",
      bitterness: "Bittere",
      recipe: "Rezept",
      malt: "Malz",
      hops: "Hopfen",
      yeast: "Hefe",
      rateBeer: "Bier bewerten",
      howTastes: "Wie schmeckt Ihnen unser",
      thankYou: "Vielen Dank für Ihre Bewertung!",
      overallRating: "Gesamtbewertung",
      ratings: "Bewertungen",
      footer: "Alle Daten werden alle 5 Minuten aktualisiert.",
      changeLang: "Switch to English",
      showQRCode: "QR-Code anzeigen",
      hideQRCode: "QR-Code ausblenden",
      share: "Teilen",
      darkMode: "Nachtmodus",
      lightMode: "Tagmodus",
      historicalData: "Historische Daten",
      previous: "Vorheriger Tag",
      next: "Nächster Tag",
      day: "Tag",
      copied: "Link in die Zwischenablage kopiert!",
      shareTitle: "Teilen über",
      slogan: "Tradition trifft Innovation",
      viewProcess: "Brauprozess einsehen",
      brewingSince: "Bierbraukunst seit 1785",
      qualityPromise: "Höchste Qualität garantiert",
      awardWinning: "Preisgekröntes Bier",
      ourTradition: "Unsere Tradition",
      visitUs: "Besuchen Sie uns",
      learnMore: "Mehr erfahren",
      subscribeNewsletter: "Newsletter abonnieren"
    },
    en: {
      title: "FH Brewery Vienna",
      subtitle: "Live insight into our brewing process",
      liveData: "Live Brewing Data",
      lastUpdated: "Last updated",
      liveDataBtn: "Live Data",
      hopfenkochenBtn: "Hop Boiling",
      maischenBtn: "Mashing",
      gaerungBtn: "Fermentation",
      temperature: "Temperature",
      pressure: "Pressure",
      currentBeer: "Current Beer",
      originalGravity: "Original Gravity",
      alcohol: "Alcohol",
      bitterness: "Bitterness",
      recipe: "Recipe",
      malt: "Malt",
      hops: "Hops",
      yeast: "Yeast",
      rateBeer: "Rate this Beer",
      howTastes: "How do you like our",
      thankYou: "Thank you for your rating!",
      overallRating: "Overall Rating",
      ratings: "ratings",
      footer: "All data is updated every 5 minutes.",
      changeLang: "Zu Deutsch wechseln",
      showQRCode: "Show QR Code",
      hideQRCode: "Hide QR Code",
      share: "Share",
      darkMode: "Dark Mode",
      lightMode: "Light Mode",
      historicalData: "Historical Data",
      previous: "Previous Day",
      next: "Next Day",
      day: "Day",
      copied: "Link copied to clipboard!",
      shareTitle: "Share via",
      slogan: "Tradition meets Innovation",
      viewProcess: "View brewing process",
      brewingSince: "Brewing excellence since 1785",
      qualityPromise: "Highest quality guaranteed",
      awardWinning: "Award-winning beer",
      ourTradition: "Our Tradition",
      visitUs: "Visit Us",
      learnMore: "Learn More",
      subscribeNewsletter: "Subscribe to newsletter"
    }
  };
  
  const t = translations[language];
  
  // Current Beer
  const currentBeer = {
    name: "Wiener Lager",
    description: language === 'de' ? 
      "Ein goldenes Lager mit ausgewogener Malzsüße und sanfter Hopfenbittere. Charakteristisch ist die subtile Karamellnote und der saubere, erfrischende Abgang." : 
      "A golden lager with balanced malt sweetness and gentle hop bitterness. Characteristic is the subtle caramel note and the clean, refreshing finish.",
    originalGravity: "12.5° Plato",
    alcohol: "5.2% vol.",
    ibu: "25",
    recipe: {
      malts: language === 'de' ? "Wiener Malz, Pilsner Malz, Karamellmalz" : "Vienna Malt, Pilsner Malt, Caramel Malt",
      hops: language === 'de' ? "Hallertauer Mittelfrüh, Tettnanger" : "Hallertauer Mittelfrüh, Tettnanger",
      yeast: language === 'de' ? "Untergärige Lager-Hefe" : "Bottom-fermenting Lager Yeast"
    },
    awards: ["Vienna Beer Festival 2024", "European Beer Star 2023"]
  };

  // Update Live Data every 5 seconds (simulated for demo)
  useEffect(() => {
    const initialData = [];
    for (let i = 12; i >= 0; i--) {
      initialData.push(generateMockData(i * 5));
    }
    setCurrentData(initialData);
    
    const interval = setInterval(() => {
      setCurrentData(prevData => {
        const newData = [...prevData.slice(1), generateMockData()];
        setLastUpdated(new Date());
        return newData;
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Hero Animation
  useEffect(() => {
    setAnimateHero(true);
  }, []);
  
  // Update Historical Data on Process Change
  useEffect(() => {
    if (selectedProcess !== 'live') {
      setHistoricalData(generateHistoricalData(selectedProcess, historicalDay));
    }
  }, [selectedProcess, historicalDay]);
  
  // Dark Mode Settings
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);
  
  // Scroll Animation for Sections
  useEffect(() => {
    const sections = document.querySelectorAll('.fade-in-section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    sections.forEach(section => observer.observe(section));
    
    return () => sections.forEach(section => observer.unobserve(section));
  }, []);
  
  // Rating Handler
  const handleRating = (rating) => {
    setUserRating(rating);
    const newTotal = totalRatings + 1;
    const newAverage = ((averageRating * totalRatings) + rating) / newTotal;
    setTotalRatings(newTotal);
    setAverageRating(newAverage);
  };
  
  // Share Function
  const handleShare = (platform) => {
    const shareUrl = window.location.href;
    let shareLink = "";
    
    switch(platform) {
      case 'copy':
        navigator.clipboard.writeText(shareUrl).then(() => {
          showNotification(t.copied);
        });
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${currentBeer.name} - ${t.overallRating}: ${averageRating.toFixed(1)}/5 - ${shareUrl}`)}`;
        window.open(shareLink, '_blank');
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(shareLink, '_blank');
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodeURIComponent(`${currentBeer.name} - ${t.overallRating}: ${averageRating.toFixed(1)}/5 - ${shareUrl}`)}`;
        window.open(shareLink, '_blank');
        break;
    }
    
    setShowShareOptions(false);
  };
  
  // Show Notification
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };
  
  // Change Day for Historical Data
  const changeHistoricalDay = (delta) => {
    setHistoricalDay(prev => {
      const newDay = prev + delta;
      return newDay >= 0 && newDay <= 6 ? newDay : prev;
    });
  };
  
  // CSS Classes for Dark/Light Mode
  const getThemeClasses = () => {
    return {
      bgMain: darkMode ? 'bg-gradient-to-b from-gray-900 to-amber-950' : 'bg-gradient-to-b from-amber-50 to-amber-200',
      bgHeader: darkMode ? 'bg-amber-900/70' : 'bg-amber-700/70', // Adjusted for transparency
      bgCard: darkMode ? 'bg-gray-800/90' : 'bg-white/90',
      textPrimary: darkMode ? 'text-white' : 'text-amber-100', // Changed to lighter color for contrast
      textSecondary: darkMode ? 'text-gray-300' : 'text-gray-600',
      textMuted: darkMode ? 'text-gray-400' : 'text-gray-500',
      bgHighlight: darkMode ? 'bg-amber-900/30' : 'bg-amber-50',
      bgStatsCard: darkMode ? 'bg-gray-700' : 'bg-amber-100',
      bgFooter: darkMode ? 'bg-gray-800/90' : 'bg-amber-900/90',
      textFooter: darkMode ? 'text-gray-300' : 'text-amber-100',
      buttonPrimary: darkMode ? 'bg-amber-700 text-white hover:bg-amber-600' : 'bg-amber-600 text-white hover:bg-amber-500',
      buttonSecondary: darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-amber-100 text-amber-800 hover:bg-amber-200',
      borderColor: darkMode ? 'border-gray-700' : 'border-amber-100',
      gradientText: darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500' : 'text-transparent bg-clip-text bg-gradient-to-r from-amber-800 to-amber-600'
    };
  };
  
  const theme = getThemeClasses();
  
  // Animation for Data Update
  const animateChart = () => {
    if (chartRef.current) {
      chartRef.current.classList.add('pulse-animation');
      setTimeout(() => {
        if (chartRef.current) {
          chartRef.current.classList.remove('pulse-animation');
        }
      }, 1000);
    }
  };
  
  useEffect(() => {
    animateChart();
  }, [currentData, historicalData]);

  return (
    <div className={`flex flex-col min-h-screen ${theme.bgMain} transition-colors duration-500 overflow-hidden relative`}>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600&display=swap');

        @keyframes pulse {
          0% { opacity: 0.8; transform: scale(0.98); }
          50% { opacity: 1; transform: scale(1.02); }
          100% { opacity: 0.8; transform: scale(0.98); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-20px); }
        }
        @keyframes rise {
          0% { transform: translateY(0); opacity: 0.8; }
          50% { transform: translateY(-100px); opacity: 0.4; }
          100% { transform: translateY(-200px); opacity: 0; }
        }
        @keyframes foam {
          0% { transform: translateY(0); }
          50% { transform: translateY(2px); }
          100% { transform: translateY(0); }
        }
        @keyframes shine {
          0% { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }
        
        .pulse-animation {
          animation: pulse 1s ease-in-out;
        }
        .dark-mode {
          color-scheme: dark;
        }
        .beer-glass {
          position: relative;
          width: 100%;
          max-width: 140px;
          height: 280px;
          border-radius: 16px 16px 12px 12px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2), inset 0 0 10px rgba(255,255,255,0.1);
          transform: perspective(1000px) rotateX(-5deg);
          transition: transform 0.3s ease;
        }
        .beer-glass:hover {
          transform: perspective(1000px) rotateX(0deg) scale(1.05);
        }
        .beer-foam {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 25%;
          background: linear-gradient(to bottom, #fff 20%, #f5f5f4 100%);
          border-radius: 16px 16px 0 0;
          z-index: 1;
          box-shadow: inset 0 -5px 15px -5px rgba(0,0,0,0.1);
          animation: foam 6s infinite ease-in-out;
        }
        .beer-foam-bubble {
          position: absolute;
          background: rgba(255,255,255,0.9);
          border-radius: 50%;
          animation: foam 4s infinite ease-in-out;
        }
        .beer-foam-bubble-1 {
          width: 20px;
          height: 15px;
          top: 15%;
          left: 25%;
          animation-delay: 0.2s;
        }
        .beer-foam-bubble-2 {
          width: 15px;
          height: 10px;
          top: 30%;
          left: 50%;
          animation-delay: 0.5s;
        }
        .beer-foam-bubble-3 {
          width: 25px;
          height: 20px;
          top: 20%;
          right: 20%;
          animation-delay: 0.8s;
        }
        .beer-liquid {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 75%;
          background: radial-gradient(circle at 50% 30%, #f59e0b 20%, #d97706 100%);
          z-index: 0;
          box-shadow: inset 0 -10px 30px -10px rgba(0,0,0,0.5);
        }
        .beer-bubble {
          position: absolute;
          bottom: 5%;
          background: radial-gradient(circle at 20% 20%, rgba(255,255,255,0.9), rgba(255,255,255,0.3));
          border-radius: 50%;
          animation: rise 4s infinite ease-in;
          box-shadow: 0 0 6px rgba(255,255,255,0.7);
        }
        .beer-bubble-1 { left: 15%; width: 10px; height: 10px; animation-delay: 0s; }
        .beer-bubble-2 { left: 35%; width: 8px; height: 8px; animation-delay: 0.8s; }
        .beer-bubble-3 { left: 55%; width: 6px; height: 6px; animation-delay: 1.2s; }
        .beer-bubble-4 { left: 75%; width: 9px; height: 9px; animation-delay: 0.4s; }
        .beer-bubble-5 { left: 25%; width: 7px; height: 7px; animation-delay: 1.6s; }
        .beer-highlight {
          position: absolute;
          top: 10%;
          left: 15%;
          width: 40%;
          height: 60%;
          background: radial-gradient(ellipse at center, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
          transform: rotate(-20deg);
        }
        .notification {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          padding: 12px 20px;
          background: rgba(0,0,0,0.8);
          color: white;
          border-radius: 8px;
          z-index: 1000;
          animation: fadeIn 0.3s, fadeOut 0.3s 2.7s;
          backdrop-filter: blur(8px);
        }
        .grain-pattern {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d97706' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          opacity: 0.6;
          z-index: -1;
        }
        .hero-section {
          position: relative;
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 2rem;
          border-radius: 0 0 30px 30px;
          box-shadow: 0 10px 30px -5px rgba(0,0,0,0.2);
        }
        .hero-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: -1;
          filter: brightness(0.7);
          transform: scale(1.05);
          transition: transform 10s ease-in-out;
        }
        .hero-section:hover .hero-image {
          transform: scale(1.15);
        }
        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.8) 100%);
          z-index: -1;
        }
        .hero-content {
          text-align: center;
          padding: 2rem;
          max-width: 800px;
          z-index: 1;
          transition: all 1s ease-out;
        }
        .hero-content.animate {
          opacity: 1;
          transform: translateY(0);
        }
        .cta-button {
          margin-top: 2rem;
          padding: 0.75rem 1.5rem;
          font-size: 1.1rem;
          font-weight: 600;
          border-radius: 50px;
          background: linear-gradient(to right, #d97706, #f59e0b);
          color: white;
          border: none;
          box-shadow: 0 4px 15px rgba(217, 119, 6, 0.4);
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(217, 119, 6, 0.5);
        }
        .cta-button:after {
          content: '';
          position: absolute;
          width: 30px;
          height: 200px;
          background: rgba(255,255,255,0.3);
          top: -50%;
          left: -100px;
          transform: rotate(45deg);
          transition: all 0.6s ease;
        }
        .cta-button:hover:after {
          left: 120%;
        }
        .fade-in-section {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 1s ease-out, transform 1s ease-out;
        }
        .fade-in-section.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .card-3d-effect {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          transform: perspective(1000px) rotateX(0) rotateY(0);
        }
        .card-3d-effect:hover {
          transform: perspective(1000px) rotateX(2deg) rotateY(2deg);
          box-shadow: 0 15px 35px rgba(0,0,0,0.2);
        }
        .glass-effect {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        .section-title {
          position: relative;
          display: inline-block;
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          font-family: 'Playfair Display', serif;
        }
        .section-title:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 3px;
          background: linear-gradient(to right, #d97706, #f59e0b);
          border-radius: 3px;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(to right, #d97706, #b45309);
          border-radius: 50px;
          box-shadow: 0 2px 10px rgba(217, 119, 6, 0.3);
          margin: 0.5rem;
          font-family: 'Inter', sans-serif;
        }
        .badge svg {
          margin-right: 0.5rem;
        }
        .award-badge {
          background: linear-gradient(to right, #f59e0b, #d97706);
          color: white;
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          margin: 0.3rem;
          display: inline-flex;
          align-items: center;
          font-family: 'Inter', sans-serif;
        }
        .award-badge svg {
          margin-right: 0.25rem;
        }
        .chart-container:hover {
          transform: scale(1.02);
          transition: transform 0.3s ease;
        }
        .header-container {
          position: relative;
          background-image: url('https://images.unsplash.com/photo-1571690412283-a0b0b3dc1521?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&h=200');
          background-size: cover;
          background-position: center;
          background-blend-mode: overlay;
          backdrop-filter: blur(10px);
        }
        .header-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: ${darkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)'};
          z-index: 0;
        }
        .header-content {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
        }
      `}</style>
      
      {/* Decorative Background Elements */}
      <div className="grain-pattern dark:opacity-20"></div>
      
      {/* Hero Section with Brewery Panorama */}
      <div className="hero-section">
        <img 
          src="https://github.com/Etaylle/fh-brauerei/blob/f16344b96fe70020fdc46161ae1b752b64b71225/public/panorama.jpeg" 
          alt="Vienna Brewery Panorama" 
          className="hero-image"
        />
        <div className="hero-overlay"></div>
        <div className={`hero-content ${animateHero ? 'animate' : ''}`}>
          <h1 className={`text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight ${theme.gradientText} font-['Playfair_Display']`}>
            {t.title}
          </h1>
          <p className="text-2xl text-amber-100 mb-8 italic font-['Inter']">{t.slogan}</p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="badge">
              <Droplets size={20} />
              {t.brewingSince}
            </div>
            <div className="badge">
              <Wheat size={20} />
              {t.qualityPromise}
            </div>
            <div className="badge">
              <Award size={20} />
              {t.awardWinning}
            </div>
          </div>
          <button 
            className="cta-button" 
            onClick={() => document.getElementById('brewData').scrollIntoView({ behavior: 'smooth' })}
          >
            {t.viewProcess}
          </button>
        </div>
      </div>
      
      {/* Sticky Header with Background Image */}
      <header className={`sticky top-0 z-50 ${theme.bgHeader} text-white shadow-lg transition-all duration-300 glass-effect header-container`}>
        <div className="header-content container mx-auto">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold font-['Playfair_Display'] text-shadow">{t.title}</h2>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className="p-2 rounded-full bg-amber-600/30 hover:bg-amber-600/50 transition-all"
              aria-label={darkMode ? t.lightMode : t.darkMode}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => setLanguage(language === 'de' ? 'en' : 'de')} 
              className="p-2 rounded-full bg-amber-600/30 hover:bg-amber-600/50 transition-all"
              aria-label={t.changeLang}
            >
              <Globe size={20} />
            </button>
            <button 
              onClick={() => setShowQRCode(!showQRCode)} 
              className="p-2 rounded-full bg-amber-600/30 hover:bg-amber-600/50 transition-all"
              aria-label={showQRCode ? t.hideQRCode : t.showQRCode}
            >
              <QrCode size={20} />
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 flex-grow relative">
        {/* QR Code Modal */}
        {showQRCode && (
          <div className="mb-8 fade-in-section visible">
            <QRCodeDisplay />
          </div>
        )}
        
        <div id="brewData" className="mb-8 fade-in-section card-3d-effect glass-effect">
          <div className="p-6 rounded-2xl">
            <h2 className={`section-title text-3xl font-bold ${theme.textPrimary} font-['Playfair_Display']`}>{t.liveData}</h2>
            <div className={`flex items-center text-sm ${theme.textMuted} mb-6`}>
              <Timer size={18} className="mr-2" />
              <span>{t.lastUpdated}: {lastUpdated.toLocaleTimeString()}</span>
            </div>
            
            {/* Process Selector */}
            <div className="flex flex-wrap gap-3 mb-6">
              {['live', 'hopfenkochen', 'maischen', 'gaerung'].map(process => (
                <button 
                  key={process}
                  onClick={() => setSelectedProcess(process)}
                  className={`px-4 py-2 rounded-full font-medium transition-all transform hover:scale-105 ${selectedProcess === process ? theme.buttonPrimary : theme.buttonSecondary} font-['Inter']`}
                >
                  {t[`${process}Btn`]}
                </button>
              ))}
            </div>
            
            {/* Historical Data Controls */}
            {selectedProcess !== 'live' && (
              <div className="flex items-center justify-between mb-6 p-3 rounded-xl bg-amber-100/50 dark:bg-amber-900/20 border ${theme.borderColor} transition-all">
                <button 
                  onClick={() => changeHistoricalDay(-1)}
                  disabled={historicalDay === 0}
                  className={`p-2 rounded-full ${historicalDay === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-200/50 dark:hover:bg-amber-800/50'} transition-all`}
                >
                  <ArrowLeft size={22} className={theme.textPrimary} />
                </button>
                <div className="flex items-center">
                  <Calendar size={18} className="mr-2" />
                  <span className={`font-medium ${theme.textPrimary} font-['Inter']`}>
                    {t.historicalData}: {t.day} {historicalDay + 1}
                  </span>
                </div>
                <button 
                  onClick={() => changeHistoricalDay(1)}
                  disabled={historicalDay === 6}
                  className={`p-2 rounded-full ${historicalDay === 6 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-200/50 dark:hover:bg-amber-800/50'} transition-all`}
                >
                  <ArrowRight size={22} className={theme.textPrimary} />
                </button>
              </div>
            )}
            
            {/* Brew Data Visualization */}
            <div className={`${theme.bgCard} p-6 rounded-2xl transition-all chart-container`} ref={chartRef}>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={selectedProcess === 'live' ? currentData : historicalData}
                    margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#ddd'} />
                    <XAxis 
                      dataKey="time" 
                      stroke={darkMode ? '#aaa' : '#666'} 
                      fontFamily="'Inter', sans-serif"
                    />
                    <YAxis 
                      yAxisId="left" 
                      orientation="left" 
                      stroke="#d97706" 
                      fontFamily="'Inter', sans-serif"
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      domain={[0, 4]} 
                      stroke="#0284c7" 
                      fontFamily="'Inter', sans-serif"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: darkMode ? 'rgba(51, 51, 51, 0.9)' : 'rgba(255, 255, 255, 0.9)', 
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                        fontFamily: "'Inter', sans-serif",
                        color: darkMode ? '#eee' : '#333'
                      }} 
                    />
                    <Legend wrapperStyle={{ fontFamily: "'Inter', sans-serif" }} />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="temperature" 
                      name={`${t.temperature} (°C)`} 
                      stroke="#d97706" 
                      activeDot={{ r: 10, fill: '#d97706', stroke: '#fff' }} 
                      strokeWidth={3}
                      dot={{ stroke: '#d97706', strokeWidth: 2, r: 4, fill: darkMode ? '#333' : '#fff' }}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="pressure" 
                      name={`${t.pressure} (bar)`}
                      stroke="#0284c7" 
                      strokeWidth={3}
                      dot={{ stroke: '#0284c7', strokeWidth: 2, r: 4, fill: darkMode ? '#333' : '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Current Values */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                <div className={`${theme.bgHighlight} p-4 rounded-xl flex items-center transition-all glass-effect`}>
                  <Thermometer size={28} className="text-amber-600 mr-3" />
                  <div>
                    <p className={`text-sm ${theme.textSecondary} font-['Inter']`}>{t.temperature}</p>
                    <p className={`text-2xl font-bold ${theme.textPrimary} font-['Inter']`}>
                      {(selectedProcess === 'live' ? 
                        currentData[currentData.length - 1]?.temperature : 
                        historicalData[historicalData.length - 1]?.temperature) || '--'}°C
                    </p>
                  </div>
                </div>
                <div className={`${theme.bgHighlight} p-4 rounded-xl flex items-center transition-all glass-effect`}>
                  <ArrowUp size={28} className="text-blue-600 mr-3" />
                  <div>
                    <p className={`text-sm ${theme.textSecondary} font-['Inter']`}>{t.pressure}</p>
                    <p className={`text-2xl font-bold ${theme.textPrimary} font-['Inter']`}>
                      {(selectedProcess === 'live' ? 
                        currentData[currentData.length - 1]?.pressure : 
                        historicalData[historicalData.length - 1]?.pressure) || '--'} bar
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Current Beer Info and Rating */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Current Beer */}
          <div className="fade-in-section card-3d-effect glass-effect">
            <div className="p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`section-title text-3xl font-bold ${theme.textPrimary} font-['Playfair_Display']`}>{t.currentBeer}</h2>
                <div className="relative">
                  <button 
                    onClick={() => setShowShareOptions(!showShareOptions)}
                    className={`p-2 rounded-full ${theme.bgHighlight} hover:bg-amber-600/50 transition-all transform hover:scale-110`}
                    aria-label={t.share}
                  >
                    <Share2 size={22} className={theme.textPrimary} />
                  </button>
                  {showShareOptions && (
                    <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-2xl py-2 z-20 ${theme.bgCard} border ${theme.borderColor} glass-effect`}>
                      <div className={`px-4 py-2 border-b ${theme.borderColor}`}>
                        <p className={`text-sm font-medium ${theme.textPrimary} font-['Inter']`}>{t.shareTitle}</p>
                      </div>
                      {['copy', 'twitter', 'facebook', 'whatsapp'].map(platform => (
                        <button 
                          key={platform}
                          className={`block px-4 py-2 text-sm w-full text-left hover:bg-amber-500/10 ${theme.textSecondary} font-['Inter'] transition-all`}
                          onClick={() => handleShare(platform)}
                        >
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/3 mb-6 md:mb-0 flex justify-center">
                  <BeerGlass className="w-36 h-72" />
                </div>
                <div className="w-full md:w-2/3 md:pl-6">
                  <h3 className={`text-2xl font-bold ${theme.gradientText} mb-2 font-['Playfair_Display']`}>{currentBeer.name}</h3>
                  <div className="flex flex-wrap mb-3">
                    {currentBeer.awards.map(award => (
                      <span key={award} className="award-badge">
                        <Award size={14} />
                        {award}
                      </span>
                    ))}
                  </div>
                  <p className={`${theme.textSecondary} mb-6 font-['Inter'] leading-relaxed`}>{currentBeer.description}</p>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className={`${theme.bgHighlight} p-3 rounded-xl text-center glass-effect`}>
                      <p className={`text-xs ${theme.textSecondary} font-['Inter']`}>{t.originalGravity}</p>
                      <p className={`font-bold ${theme.textPrimary} font-['Inter']`}>{currentBeer.originalGravity}</p>
                    </div>
                    <div className={`${theme.bgHighlight} p-3 rounded-xl text-center glass-effect`}>
                      <p className={`text-xs ${theme.textSecondary} font-['Inter']`}>{t.alcohol}</p>
                      <p className={`font-bold ${theme.textPrimary} font-['Inter']`}>{currentBeer.alcohol}</p>
                    </div>
                    <div className={`${theme.bgHighlight} p-3 rounded-xl text-center glass-effect`}>
                      <p className={`text-xs ${theme.textSecondary} font-['Inter']`}>{t.bitterness}</p>
                      <p className={`font-bold ${theme.textPrimary} font-['Inter']`}>{currentBeer.ibu} IBU</p>
                    </div>
                  </div>
                  <h4 className={`font-bold ${theme.textPrimary} mb-2 font-['Inter']`}>{t.recipe}:</h4>
                  <ul className={`text-sm ${theme.textSecondary} font-['Inter']`}>
                    <li className="mb-1"><span className="font-medium">{t.malt}:</span> {currentBeer.recipe.malts}</li>
                    <li className="mb-1"><span className="font-medium">{t.hops}:</span> {currentBeer.recipe.hops}</li>
                    <li><span className="font-medium">{t.yeast}:</span> {currentBeer.recipe.yeast}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Voting System */}
          <div className="fade-in-section card-3d-effect glass-effect">
            <div className="p-6 rounded-2xl">
              <h2 className={`section-title text-3xl font-bold ${theme.textPrimary} mb-6 font-['Playfair_Display']`}>{t.rateBeer}</h2>
              <div className="flex flex-col items-center">
                <p className={`${theme.textSecondary} mb-6 font-['Inter']`}>{t.howTastes} {currentBeer.name}?</p>
                <div className="flex mb-8">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      onClick={() => handleRating(star)}
                      className="text-4xl mx-2 focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        size={40} 
                        fill={star <= userRating ? "#f59e0b" : "none"} 
                        stroke={star <= userRating ? "#f59e0b" : darkMode ? "#6b7280" : "#d1d5db"} 
                      />
                    </button>
                  ))}
                </div>
                {userRating > 0 && (
                  <div className="bg-green-100/80 dark:bg-green-900/50 text-green-800 dark:text-green-200 p-4 rounded-xl mb-6 text-center font-['Inter'] glass-effect">
                    {t.thankYou}
                  </div>
                )}
                <div className={`${theme.bgHighlight} p-6 rounded-xl w-full text-center glass-effect`}>
                  <h3 className={`text-xl font-bold ${theme.textPrimary} mb-3 font-['Inter']`}>{t.overallRating}</h3>
                  <div className="flex justify-center mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={28} 
                        fill={star <= Math.round(averageRating) ? "#f59e0b" : "none"} 
                        stroke={star <= Math.round(averageRating) ? "#f59e0b" : darkMode ? "#6b7280" : "#d1d5db"} 
                        className="mx-1" 
                      />
                    ))}
                  </div>
                  <p className={`text-amber-500 font-bold text-2xl font-['Inter']`}>{averageRating.toFixed(1)} / 5</p>
                  <p className={`text-sm ${theme.textMuted} font-['Inter']`}>({totalRatings} {t.ratings})</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className={`${theme.bgFooter} ${theme.textFooter} py-8 px-6 mt-12 transition-all duration-300 glass-effect`}>
        <div className="container mx-auto text-center">
          <h3 className={`text-2xl font-bold ${theme.textPrimary} mb-4 font-['Playfair_Display']`}>© {new Date().getFullYear()} {t.title}</h3>
          <p className="text-sm opacity-80 mb-4 font-['Inter']">{t.footer}</p>
          <div className="flex justify-center gap-4">
            <a href="#" className={`text-sm ${theme.textFooter} hover:text-amber-300 transition-all font-['Inter']`}>Impressum</a>
            <a href="#" className={`text-sm ${theme.textFooter} hover:text-amber-300 transition-all font-['Inter']`}>Datenschutz</a>
            <a href="#" className={`text-sm ${theme.textFooter} hover:text-amber-300 transition-all font-['Inter']`}>Kontakt</a>
          </div>
        </div>
      </footer>
      
      {/* Notification */}
      {notification && (
        <div className="notification font-['Inter']">
          {notification}
        </div>
      )}
    </div>
  );
}