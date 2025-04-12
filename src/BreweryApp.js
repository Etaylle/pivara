import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Timer, Thermometer, ArrowUp, Star, GlassWater } from 'lucide-react';

// Simulate live data
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

// Generate historical data
const generateHistoricalData = (process) => {
  const data = [];
  const maxPoints = 24;
  
  for (let i = maxPoints; i >= 0; i--) {
    if (process === 'hopfenkochen') {
      data.push({
        time: `${i*15}min`,
        temperature: Math.floor(95 + Math.sin(i / 3) * 3),
        pressure: Math.floor(1.5 + Math.cos(i / 4) * 0.3),
      });
    } else if (process === 'maischen') {
      data.push({
        time: `${i*20}min`,
        temperature: Math.floor(60 + Math.sin(i / 2) * 15),
        pressure: Math.floor(1 + Math.cos(i / 3) * 0.4),
      });
    }
  }
  
  return data;
};

export default function BreweryApp() {
  const [currentData, setCurrentData] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState('live');
  const [historicalData, setHistoricalData] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(127);
  const [averageRating, setAverageRating] = useState(4.2);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Update live data every 5 minutes (simulated as 5 seconds for demo)
  useEffect(() => {
    // Initialize with some data points
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
    }, 5000); // Every 5 seconds for demo (would be 5 minutes in production)
    
    return () => clearInterval(interval);
  }, []);
  
  // Update historical data when process changes
  useEffect(() => {
    if (selectedProcess !== 'live') {
      setHistoricalData(generateHistoricalData(selectedProcess));
    }
  }, [selectedProcess]);
  
  const handleRating = (rating) => {
    setUserRating(rating);
    // In a real app, this would send the rating to a server
    // For demo, we'll just update the average
    const newTotal = totalRatings + 1;
    const newAverage = ((averageRating * totalRatings) + rating) / newTotal;
    setTotalRatings(newTotal);
    setAverageRating(newAverage);
  };
  
  const currentBeer = {
    name: "Wiener Lager",
    description: "Ein goldenes Lager mit ausgewogener Malzsüße und sanfter Hopfenbittere. Charakteristisch ist die subtile Karamellnote und der saubere, erfrischende Abgang.",
    originalGravity: "12.5° Plato",
    alcohol: "5.2% vol.",
    ibu: "25",
    recipe: {
      malts: "Wiener Malz, Pilsner Malz, Karamellmalz",
      hops: "Hallertauer Mittelfrüh, Tettnanger",
      yeast: "Untergärige Lager-Hefe"
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-amber-800 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">FH Brauerei Wien</h1>
          <p className="opacity-80">Live-Einblick in unseren Brauprozess</p>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto p-4 flex-grow">
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-amber-900">Live Braudaten</h2>
            <div className="flex items-center text-sm text-gray-500">
              <Timer size={16} className="mr-1" />
              <span>Zuletzt aktualisiert: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>
          
          {/* Process Selector */}
          <div className="flex space-x-2 mb-4">
            <button 
              onClick={() => setSelectedProcess('live')}
              className={`px-3 py-1 rounded ${selectedProcess === 'live' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'}`}
            >
              Live Daten
            </button>
            <button 
              onClick={() => setSelectedProcess('hopfenkochen')}
              className={`px-3 py-1 rounded ${selectedProcess === 'hopfenkochen' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'}`}
            >
              Hopfenkochen
            </button>
            <button 
              onClick={() => setSelectedProcess('maischen')}
              className={`px-3 py-1 rounded ${selectedProcess === 'maischen' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'}`}
            >
              Maischen
            </button>
          </div>
          
          {/* Brew Data Visualization */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={selectedProcess === 'live' ? currentData : historicalData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 4]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="temperature" 
                    name="Temperatur (°C)" 
                    stroke="#d97706" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="pressure" 
                    name="Druck (bar)" 
                    stroke="#0284c7" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Current Values */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-amber-100 p-3 rounded-lg flex items-center">
                <Thermometer size={24} className="text-amber-600 mr-2" />
                <div>
                  <p className="text-sm text-amber-800">Temperatur</p>
                  <p className="text-xl font-bold text-amber-900">
                    {selectedProcess === 'live' ? 
                      currentData[currentData.length - 1]?.temperature : 
                      historicalData[historicalData.length - 1]?.temperature}°C
                  </p>
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg flex items-center">
                <ArrowUp size={24} className="text-blue-600 mr-2" />
                <div>
                  <p className="text-sm text-blue-800">Druck</p>
                  <p className="text-xl font-bold text-blue-900">
                    {selectedProcess === 'live' ? 
                      currentData[currentData.length - 1]?.pressure : 
                      historicalData[historicalData.length - 1]?.pressure} bar
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Current Beer Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-2xl font-bold text-amber-900 mb-4">Aktuelles Bier</h2>
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/3 mb-4 md:mb-0 flex justify-center">
                <div className="w-32 h-64 bg-amber-200 rounded-lg relative overflow-hidden">
                  <div className="absolute bottom-0 w-full h-2/3 bg-amber-400 rounded-b-lg"></div>
                  <div className="absolute top-0 w-full flex justify-center pt-2">
                    <GlassWater size={32} className="text-amber-700" />
                  </div>
                </div>
              </div>
              <div className="w-full md:w-2/3 md:pl-4">
                <h3 className="text-xl font-bold text-amber-800">{currentBeer.name}</h3>
                <p className="text-gray-600 mb-4">{currentBeer.description}</p>
                
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-amber-50 p-2 rounded text-center">
                    <p className="text-xs text-amber-800">Stammwürze</p>
                    <p className="font-bold text-amber-900">{currentBeer.originalGravity}</p>
                  </div>
                  <div className="bg-amber-50 p-2 rounded text-center">
                    <p className="text-xs text-amber-800">Alkohol</p>
                    <p className="font-bold text-amber-900">{currentBeer.alcohol}</p>
                  </div>
                  <div className="bg-amber-50 p-2 rounded text-center">
                    <p className="text-xs text-amber-800">Bittere</p>
                    <p className="font-bold text-amber-900">{currentBeer.ibu} IBU</p>
                  </div>
                </div>
                
                <h4 className="font-bold text-amber-800 mt-2">Rezept:</h4>
                <ul className="text-sm text-gray-700">
                  <li><span className="font-medium">Malz:</span> {currentBeer.recipe.malts}</li>
                  <li><span className="font-medium">Hopfen:</span> {currentBeer.recipe.hops}</li>
                  <li><span className="font-medium">Hefe:</span> {currentBeer.recipe.yeast}</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Voting System */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-2xl font-bold text-amber-900 mb-4">Bier bewerten</h2>
            <div className="flex flex-col items-center">
              <p className="text-gray-600 mb-4">Wie schmeckt Ihnen unser {currentBeer.name}?</p>
              
              <div className="flex mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    onClick={() => handleRating(star)}
                    className="text-3xl mx-1 focus:outline-none"
                  >
                    <Star 
                      size={36} 
                      fill={star <= userRating ? "#f59e0b" : "none"} 
                      stroke={star <= userRating ? "#f59e0b" : "#d1d5db"} 
                    />
                  </button>
                ))}
              </div>
              
              {userRating > 0 && (
                <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-4 text-center">
                  Vielen Dank für Ihre Bewertung!
                </div>
              )}
              
              <div className="w-full bg-amber-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-amber-800 mb-2 text-center">Gesamtbewertung</h3>
                <div className="flex justify-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={24} 
                      fill={star <= Math.round(averageRating) ? "#f59e0b" : "none"} 
                      stroke={star <= Math.round(averageRating) ? "#f59e0b" : "#d1d5db"} 
                      className="mx-1" 
                    />
                  ))}
                </div>
                <p className="text-center text-amber-900 font-bold">{averageRating.toFixed(1)} / 5</p>
                <p className="text-center text-sm text-gray-600">({totalRatings} Bewertungen)</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-amber-900 text-amber-100 p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} FH Campus Wien Brauerei</p>
          <p className="text-sm opacity-75">Alle Daten werden alle 5 Minuten aktualisiert.</p>
        </div>
      </footer>
    </div>
  );
}