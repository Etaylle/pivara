import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Timer, Thermometer, ArrowUp, Star, GlassWater, Sun, Moon, Share2, Globe, QrCode, Calendar, ArrowLeft, ArrowRight } from 'lucide-react';

// Simuliere Live-Daten
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

// Generiere historische Daten
const generateHistoricalData = (process, day = 0) => {
  const data = [];
  const maxPoints = 24;
  
  for (let i = maxPoints; i >= 0; i--) {
    const seed = i + (day * 17); // Unterschiedliche Daten für verschiedene Tage
    
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

// QR-Code Komponente (Platzhalter)
const QRCodeDisplay = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
      <QrCode size={180} className="text-amber-900 mb-4" />
      <p className="text-center text-gray-700">Scannen Sie diesen QR-Code, um die Brauerei-App auf Ihrem Mobilgerät zu öffnen</p>
    </div>
  );
};

// Hauptkomponente
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
  
  const chartRef = useRef(null);
  
  // Text-Übersetzungen
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
    }
  };
  
  const t = translations[language];
  
  // Aktuelles Bier
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
    }
  };
  
  // Aktualisiere Live-Daten alle 5 Minuten (simuliert als 5 Sekunden für Demo)
  useEffect(() => {
    // Initialisiere mit Datenpunkten
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
    }, 5000); // Alle 5 Sekunden für Demo (wäre 5 Minuten in Produktion)
    
    return () => clearInterval(interval);
  }, []);
  
  // Aktualisiere historische Daten bei Prozessänderung
  useEffect(() => {
    if (selectedProcess !== 'live') {
      setHistoricalData(generateHistoricalData(selectedProcess, historicalDay));
    }
  }, [selectedProcess, historicalDay]);
  
  // Dark Mode Einstellungen
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);
  
  // Rating Handler
  const handleRating = (rating) => {
    setUserRating(rating);
    // In einer echten App würde dies die Bewertung an einen Server senden
    // Für die Demo aktualisieren wir nur den Durchschnitt
    const newTotal = totalRatings + 1;
    const newAverage = ((averageRating * totalRatings) + rating) / newTotal;
    setTotalRatings(newTotal);
    setAverageRating(newAverage);
  };
  
  // Teilen-Funktion
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
  
  // Benachrichtigung anzeigen
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };
  
  // Wechsle Tag für historische Daten
  const changeHistoricalDay = (delta) => {
    setHistoricalDay(prev => {
      const newDay = prev + delta;
      return newDay >= 0 && newDay <= 6 ? newDay : prev; // Maximal 7 Tage Historie
    });
  };
  
  // CSS-Klassen für dunklen/hellen Modus
  const getThemeClasses = () => {
    return {
      bgMain: darkMode ? 'bg-gray-900' : 'bg-amber-50',
      bgHeader: darkMode ? 'bg-amber-900' : 'bg-amber-800',
      bgCard: darkMode ? 'bg-gray-800' : 'bg-white',
      textPrimary: darkMode ? 'text-white' : 'text-amber-900',
      textSecondary: darkMode ? 'text-gray-300' : 'text-gray-600',
      textMuted: darkMode ? 'text-gray-400' : 'text-gray-500',
      bgHighlight: darkMode ? 'bg-amber-900/30' : 'bg-amber-50',
      bgStatsCard: darkMode ? 'bg-gray-700' : 'bg-amber-100',
      bgFooter: darkMode ? 'bg-gray-800' : 'bg-amber-900',
      textFooter: darkMode ? 'text-gray-300' : 'text-amber-100',
      buttonPrimary: darkMode ? 'bg-amber-700 text-white hover:bg-amber-600' : 'bg-amber-600 text-white hover:bg-amber-500',
      buttonSecondary: darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-amber-100 text-amber-800 hover:bg-amber-200',
      borderColor: darkMode ? 'border-gray-700' : 'border-amber-100',
    };
  };
  
  const theme = getThemeClasses();
  
  // Animation für Datenaktualisierung
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
    <div className={`flex flex-col min-h-screen ${theme.bgMain} transition-colors duration-300`}>
      <style jsx>{`
        .pulse-animation {
          animation: pulse 1s ease-in-out;
        }
        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.9; }
        }
        .dark-mode {
          color-scheme: dark;
        }
        .beer-glass {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 16px 16px 0 0;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .beer-foam {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 25%;
          background-color: #f5f5f4;
          border-radius: 16px 16px 0 0;
          z-index: 1;
        }
        .beer-liquid {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 75%;
          background: linear-gradient(to bottom, #f59e0b, #d97706);
          z-index: 0;
          animation: bubbles 4s infinite ease-in;
        }
        .beer-bubble {
          position: absolute;
          bottom: 10%;
          background-color: rgba(255,255,255,0.6);
          border-radius: 50%;
          animation: rise 3s infinite ease-in;
        }
        .beer-bubble:nth-child(1) {
          left: 20%;
          width: 8px;
          height: 8px;
          animation-delay: 0.2s;
        }
        .beer-bubble:nth-child(2) {
          left: 60%;
          width: 6px;
          height: 6px;
          animation-delay: 1s;
        }
        .beer-bubble:nth-child(3) {
          left: 80%;
          width: 4px;
          height: 4px;
          animation-delay: 0.5s;
        }
        @keyframes rise {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-100px); opacity: 0; }
        }
        @keyframes bubbles {
          0% { background-position: 0 0; }
          50% { background-position: 0 5px; }
          100% { background-position: 0 0; }
        }
        .notification {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          padding: 12px 20px;
          background-color: rgba(0,0,0,0.8);
          color: white;
          border-radius: 8px;
          z-index: 1000;
          animation: fadeIn 0.3s, fadeOut 0.3s 2.7s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translate(-50%, 0); }
          to { opacity: 0; transform: translate(-50%, -20px); }
        }
      `}</style>
      
      {/* Header */}
      <header className={`${theme.bgHeader} text-white p-4 shadow-md transition-colors duration-300`}>
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="opacity-80">{t.subtitle}</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className="p-2 rounded-full bg-opacity-20 bg-black hover:bg-opacity-30 transition-all"
              aria-label={darkMode ? t.lightMode : t.darkMode}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => setLanguage(language === 'de' ? 'en' : 'de')} 
              className="p-2 rounded-full bg-opacity-20 bg-black hover:bg-opacity-30 transition-all"
              aria-label={t.changeLang}
            >
              <Globe size={20} />
            </button>
            <button 
              onClick={() => setShowQRCode(!showQRCode)} 
              className="p-2 rounded-full bg-opacity-20 bg-black hover:bg-opacity-30 transition-all"
              aria-label={showQRCode ? t.hideQRCode : t.showQRCode}
            >
              <QrCode size={20} />
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto p-4 flex-grow">
        {/* QR Code Modal */}
        {showQRCode && (
          <div className="mb-6">
            <QRCodeDisplay />
          </div>
        )}
        
        <div className={`mb-6 ${theme.bgCard} rounded-lg shadow p-4 transition-colors duration-300`}>
          <div className="flex flex-wrap justify-between items-center mb-4">
            <h2 className={`text-2xl font-bold ${theme.textPrimary}`}>{t.liveData}</h2>
            <div className={`flex items-center text-sm ${theme.textMuted}`}>
              <Timer size={16} className="mr-1" />
              <span>{t.lastUpdated}: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>
          
          {/* Process Selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button 
              onClick={() => setSelectedProcess('live')}
              className={`px-3 py-1 rounded transition-colors ${selectedProcess === 'live' ? theme.buttonPrimary : theme.buttonSecondary}`}
            >
              {t.liveDataBtn}
            </button>
            <button 
              onClick={() => setSelectedProcess('hopfenkochen')}
              className={`px-3 py-1 rounded transition-colors ${selectedProcess === 'hopfenkochen' ? theme.buttonPrimary : theme.buttonSecondary}`}
            >
              {t.hopfenkochenBtn}
            </button>
            <button 
              onClick={() => setSelectedProcess('maischen')}
              className={`px-3 py-1 rounded transition-colors ${selectedProcess === 'maischen' ? theme.buttonPrimary : theme.buttonSecondary}`}
            >
              {t.maischenBtn}
            </button>
            <button 
              onClick={() => setSelectedProcess('gaerung')}
              className={`px-3 py-1 rounded transition-colors ${selectedProcess === 'gaerung' ? theme.buttonPrimary : theme.buttonSecondary}`}
            >
              {t.gaerungBtn}
            </button>
          </div>
          
          {/* Historische Datensteuerung */}
          {selectedProcess !== 'live' && (
            <div className="flex items-center justify-between mb-4 p-2 rounded bg-opacity-50 border border-opacity-50 transition-colors duration-300 bg-amber-50 border-amber-200">
              <button 
                onClick={() => changeHistoricalDay(-1)}
                disabled={historicalDay === 0}
                className={`p-1 rounded ${historicalDay === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-100'}`}
              >
                <ArrowLeft size={20} className={theme.textPrimary} />
              </button>
              
              <div className="flex items-center">
                <Calendar size={16} className="mr-2" />
                <span className={`font-medium ${theme.textPrimary}`}>
                  {t.historicalData}: {t.day} {historicalDay + 1}
                </span>
              </div>
              
              <button 
                onClick={() => changeHistoricalDay(1)}
                disabled={historicalDay === 6}
                className={`p-1 rounded ${historicalDay === 6 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-100'}`}
              >
                <ArrowRight size={20} className={theme.textPrimary} />
              </button>
            </div>
          )}
          
          {/* Brew Data Visualization */}
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg transition-colors duration-300`} ref={chartRef}>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={selectedProcess === 'live' ? currentData : historicalData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#ccc'} />
                  <XAxis 
                    dataKey="time" 
                    stroke={darkMode ? '#aaa' : '#666'} 
                  />
                  <YAxis 
                    yAxisId="left" 
                    orientation="left" 
                    stroke={darkMode ? '#f59e0b' : '#d97706'} 
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    domain={[0, 4]} 
                    stroke={darkMode ? '#60a5fa' : '#0284c7'} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#333' : '#fff', 
                      borderColor: darkMode ? '#555' : '#ddd',
                      color: darkMode ? '#eee' : '#333'
                    }} 
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="temperature" 
                    name={`${t.temperature} (°C)`} 
                    stroke="#d97706" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                    dot={{ stroke: '#d97706', strokeWidth: 1, r: 3, fill: darkMode ? '#333' : '#fff' }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="pressure" 
                    name={`${t.pressure} (bar)`}
                    stroke="#0284c7" 
                    strokeWidth={2}
                    dot={{ stroke: '#0284c7', strokeWidth: 1, r: 3, fill: darkMode ? '#333' : '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Current Values */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className={`${darkMode ? 'bg-amber-900/30' : 'bg-amber-100'} p-3 rounded-lg flex items-center transition-colors duration-300`}>
                <Thermometer size={24} className="text-amber-600 mr-2" />
                <div>
                  <p className={`text-sm ${darkMode ? 'text-amber-200' : 'text-amber-800'}`}>{t.temperature}</p>
                  <p className={`text-xl font-bold ${darkMode ? 'text-amber-100' : 'text-amber-900'}`}>
                    {selectedProcess === 'live' ? 
                      currentData[currentData.length - 1]?.temperature : 
                      historicalData[historicalData.length - 1]?.temperature}°C
                  </p>
                </div>
              </div>
              <div className={`${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'} p-3 rounded-lg flex items-center transition-colors duration-300`}>
                <ArrowUp size={24} className="text-blue-600 mr-2" />
                <div>
                  <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>{t.pressure}</p>
                  <p className={`text-xl font-bold ${darkMode ? 'text-blue-100' : 'text-blue-900'}`}>
                    {selectedProcess === 'live' ? 
                      currentData[currentData.length - 1]?.pressure : 
                      historicalData[historicalData.length - 1]?.pressure} bar
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Current Beer Info and Rating */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Current Beer */}
          <div className={`${theme.bgCard} rounded-lg shadow p-4 transition-colors duration-300`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-2xl font-bold ${theme.textPrimary}`}>{t.currentBeer}</h2>
              <div className="relative">
                <button 
                  onClick={() => setShowShareOptions(!showShareOptions)}
                  className={`p-2 rounded-full ${theme.bgHighlight} hover:bg-opacity-80 transition-all`}
                  aria-label={t.share}
                >
                  <Share2 size={20} className={theme.textPrimary} />
                </button>
                
                {showShareOptions && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-10 ${theme.bgCard} border ${theme.borderColor}`}>
                    <div className={`px-4 py-2 border-b ${theme.borderColor}`}>
                      <p className={`text-sm font-medium ${theme.textPrimary}`}>{t.shareTitle}</p>
                    </div>
                    <button 
                      className={`block px-4 py-2 text-sm w-full text-left hover:bg-opacity-10 hover:bg-amber-500 ${theme.textSecondary}`}
                      onClick={() => handleShare('copy')}
                    >
                      Copy Link
                    </button>
                    <button 
                      className={`block px-4 py-2 text-sm w-full text-left hover:bg-opacity-10 hover:bg-amber-500 ${theme.textSecondary}`}
                      onClick={() => handleShare('twitter')}
                    >
                      Twitter
                    </button>
                    <button 
                      className={`block px-4 py-2 text-sm w-full text-left hover:bg-opacity-10 hover:bg-amber-500 ${theme.textSecondary}`}
                      onClick={() => handleShare('facebook')}
                    >
                      Facebook
                    </button>
                    <button 
                      className={`block px-4 py-2 text-sm w-full text-left hover:bg-opacity-10 hover:bg-amber-500 ${theme.textSecondary}`}
                      onClick={() => handleShare('whatsapp')}
                    >
                      WhatsApp
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/3 mb-4 md:mb-0 flex justify-center">
              <div className="w-32 h-64 rounded-lg border-2 border-amber-300 overflow-hidden relative beer-glass">
                  <div className="beer-foam"></div>
                  <div className="beer-liquid">
                    <div className="beer-bubble"></div>
                    <div className="beer-bubble"></div>
                    <div className="beer-bubble"></div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-2/3 md:pl-4">
                <h3 className={`text-xl font-bold ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>{currentBeer.name}</h3>
                <p className={`${theme.textSecondary} mb-4`}>{currentBeer.description}</p>
                
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className={`${theme.bgHighlight} p-2 rounded text-center transition-colors duration-300`}>
                    <p className={`text-xs ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>{t.originalGravity}</p>
                    <p className={`font-bold ${theme.textPrimary}`}>{currentBeer.originalGravity}</p>
                  </div>
                  <div className={`${theme.bgHighlight} p-2 rounded text-center transition-colors duration-300`}>
                    <p className={`text-xs ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>{t.alcohol}</p>
                    <p className={`font-bold ${theme.textPrimary}`}>{currentBeer.alcohol}</p>
                  </div>
                  <div className={`${theme.bgHighlight} p-2 rounded text-center transition-colors duration-300`}>
                    <p className={`text-xs ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>{t.bitterness}</p>
                    <p className={`font-bold ${theme.textPrimary}`}>{currentBeer.ibu} IBU</p>
                  </div>
                </div>
                
                <h4 className={`font-bold ${darkMode ? 'text-amber-300' : 'text-amber-800'} mt-2`}>{t.recipe}:</h4>
                <ul className={`text-sm ${theme.textSecondary}`}>
                  <li className="mb-1"><span className="font-medium">{t.malt}:</span> {currentBeer.recipe.malts}</li>
                  <li className="mb-1"><span className="font-medium">{t.hops}:</span> {currentBeer.recipe.hops}</li>
                  <li><span className="font-medium">{t.yeast}:</span> {currentBeer.recipe.yeast}</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Voting System */}
          <div className={`${theme.bgCard} rounded-lg shadow p-4 transition-colors duration-300`}>
            <h2 className={`text-2xl font-bold ${theme.textPrimary} mb-4`}>{t.rateBeer}</h2>
            <div className="flex flex-col items-center">
              <p className={`${theme.textSecondary} mb-4`}>{t.howTastes} {currentBeer.name}?</p>
              
              <div className="flex mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    onClick={() => handleRating(star)}
                    className="text-3xl mx-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      size={36} 
                      fill={star <= userRating ? "#f59e0b" : "none"} 
                      stroke={star <= userRating ? "#f59e0b" : darkMode ? "#6b7280" : "#d1d5db"} 
                    />
                  </button>
                ))}
              </div>
              
              {userRating > 0 && (
                <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-4 text-center">
                  {t.thankYou}
                </div>
              )}
              
              <div className={`w-full ${theme.bgHighlight} p-4 rounded-lg transition-colors duration-300`}>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-amber-300' : 'text-amber-800'} mb-2 text-center`}>{t.overallRating}</h3>
                <div className="flex justify-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={24} 
                      fill={star <= Math.round(averageRating) ? "#f59e0b" : "none"} 
                      stroke={star <= Math.round(averageRating) ? "#f59e0b" : darkMode ? "#6b7280" : "#d1d5db"} 
                      className="mx-1" 
                    />
                  ))}
                </div>
                <p className="text-center text-amber-500 font-bold">{averageRating.toFixed(1)} / 5</p>
                <p className={`text-center text-sm ${theme.textMuted}`}>({totalRatings} {t.ratings})</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className={`${theme.bgFooter} ${theme.textFooter} p-4 mt-8 transition-colors duration-300`}>
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} {t.title}</p>
          <p className="text-sm opacity-75">{t.footer}</p>
        </div>
      </footer>
      
      {/* Benachrichtigung */}
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}
    </div>
  );
}