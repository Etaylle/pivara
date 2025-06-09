import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Star, Award, Activity, TrendingUp, Droplets, Zap, Thermometer,
  AlertTriangle, CheckCircle, Clock, BarChart3, Settings, Power
} from 'lucide-react';

// Types
interface ChartDataPoint {
  time: number;
  temperatur: number;
  temperature: number;
  druck: number;
  pressure: number;
  ph: number;
  timestamp: string;
}

interface SensorData {
  temperatur?: number;
  temperature?: number;
  druck?: number;
  pressure?: number;
  ph?: number;
  lastUpdate: string;
  status: 'online' | 'offline' | 'warning';
}

interface Beer {
  name: string;
  type: string;
  status: 'active' | 'fermenting' | 'completed';
  batchId: string;
  brewDate: string;
}

interface ReviewsSummary {
  durchschnitt: number;
  anzahl: number;
  recent: Array<{
    rating: number;
    timestamp: string;
    comment?: string;
  }>;
}

type ProcessType = 'gaerung' | 'maischen' | 'hopfenkoehen';

// Mock Data Generator
class MockDataGenerator {
  private baseTemp = { gaerung: 18, maischen: 65, hopfenkoehen: 100 };
  private basePressure = { gaerung: 1.2, maischen: 1.0, hopfenkoehen: 1.8 };
  private basePh = { gaerung: 4.5, maischen: 5.2, hopfenkoehen: 5.8 };
  private dataHistory: Record<ProcessType, ChartDataPoint[]> = {
    gaerung: [],
    maischen: [],
    hopfenkoehen: []
  };

  constructor() {
    this.initializeHistoricalData();
  }

  private initializeHistoricalData() {
    const now = Date.now();
    const processes: ProcessType[] = ['gaerung', 'maischen', 'hopfenkoehen'];
    processes.forEach(process => {
      for (let i = 50; i >= 0; i--) {
        const timestamp = now - (i * 60000); // Every minute for last 50 minutes
        this.dataHistory[process].push(this.generateDataPoint(process, timestamp));
      }
    });
  }

  private generateDataPoint(process: ProcessType, timestamp: number): ChartDataPoint {
    const baseTemp = this.baseTemp[process];
    const basePressure = this.basePressure[process];
    const basePh = this.basePh[process];
    const tempVariation = (Math.random() - 0.5) * 4;
    const pressureVariation = (Math.random() - 0.5) * 0.3;
    const phVariation = (Math.random() - 0.5) * 0.6;
    const temperature = Math.max(0, baseTemp + tempVariation);
    const pressure = Math.max(0, basePressure + pressureVariation);
    const ph = Math.max(0, Math.min(14, basePh + phVariation));
    return {
      time: timestamp,
      temperatur: temperature,
      temperature: temperature,
      druck: pressure,
      pressure: pressure,
      ph: ph,
      timestamp: new Date(timestamp).toISOString()
    };
  }

  generateCurrentSensorData(process: ProcessType): SensorData {
    const latest = this.dataHistory[process][this.dataHistory[process].length - 1];
    const isOnline = Math.random() > 0.1; // 90% uptime
    const hasWarning = Math.random() > 0.8; // 20% chance of warning
    return {
      temperatur: latest.temperature,
      temperature: latest.temperature,
      druck: latest.pressure,
      pressure: latest.pressure,
      ph: latest.ph,
      lastUpdate: new Date().toISOString(),
      status: !isOnline ? 'offline' : hasWarning ? 'warning' : 'online'
    };
  }

  updateLiveData(): Record<ProcessType, ChartDataPoint[]> {
    const now = Date.now();
    const processes: ProcessType[] = ['gaerung', 'maischen', 'hopfenkoehen'];
    processes.forEach(process => {
      const newPoint = this.generateDataPoint(process, now);
      this.dataHistory[process].push(newPoint);
      if (this.dataHistory[process].length > 50) {
        this.dataHistory[process].shift();
      }
    });
    return { ...this.dataHistory };
  }

  getHistoricalData(): Record<ProcessType, ChartDataPoint[]> {
    return { ...this.dataHistory };
  }

  generateBeerData(): Beer {
    const beerNames = ['Wiener Märzen', 'Alpiner Weissbier', 'Donau Gold', 'Kaiserbock', 'Helles Original'];
    const beerTypes = ['Märzen', 'Weissbier', 'Lager', 'Bock', 'Helles'];
    const statuses: Beer['status'][] = ['active', 'fermenting', 'completed'];
    const randomIndex = Math.floor(Math.random() * beerNames.length);
    return {
      name: beerNames[randomIndex],
      type: beerTypes[randomIndex],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      batchId: `BATCH-${Date.now().toString().slice(-6)}`,
      brewDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  generateReviewsData(): ReviewsSummary {
    const reviewCount = Math.floor(Math.random() * 50) + 10;
    const averageRating = 3 + Math.random() * 2; // 3-5 stars
    const recentReviews = Array.from({ length: Math.min(5, reviewCount) }, (_, i) => ({
      rating: Math.floor(Math.random() * 5) + 1,
      timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      comment: Math.random() > 0.5 ? 'Excellent brew!' : undefined
    }));
    return {
      durchschnitt: Math.round(averageRating * 10) / 10,
      anzahl: reviewCount,
      recent: recentReviews
    };
  }
}

// Process Configuration
const processNames: Record<ProcessType, string> = {
  gaerung: 'Gärung',
  maischen: 'Maischen',
  hopfenkoehen: 'Hopfenkochen',
};

const processIcons: Record<ProcessType, React.ReactNode> = {
  gaerung: <Activity className="w-6 h-6" />,
  maischen: <Droplets className="w-6 h-6" />,
  hopfenkoehen: <Zap className="w-6 h-6" />,
};

const processColors: Record<ProcessType, string> = {
  gaerung: 'from-red-500 to-pink-600',
  maischen: 'from-blue-500 to-cyan-600',
  hopfenkoehen: 'from-yellow-500 to-orange-600',
};

// Utility Functions
const formatTime = (timestamp: string | number | undefined): string => {
  if (!timestamp) return 'Keine Daten';
  const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
  if (isNaN(date.getTime())) return 'Ungültiges Datum';
  return date.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const getTemperatureValue = (data: any): number => {
  const temp = data?.temperatur ?? data?.temperature ?? 0;
  return parseFloat(temp.toFixed(1));
};

const getPressureValue = (data: any): number => {
  const pressure = data?.druck ?? data?.pressure ?? 0;
  return parseFloat(pressure.toFixed(2));
};

const getPhValue = (data: any): number => {
  const ph = data?.ph ?? 0;
  return parseFloat(ph.toFixed(1));
};

// Star Rating Component
const StarRating: React.FC<{
  rating: number;
  onRate: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}> = ({ rating, onRate, size = 'md', interactive = true }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };
  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`${sizeClasses[size]} transition-all duration-200 ${
            interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          } ${
            index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/30 hover:text-yellow-400/50'
          }`}
          onClick={() => interactive && onRate(index + 1)}
        />
      ))}
    </div>
  );
};

// Process Card Component
const ProcessCard: React.FC<{
  process: ProcessType;
  data: SensorData | undefined;
  historical: ChartDataPoint[] | undefined;
  isActive: boolean;
}> = ({ process, data, historical, isActive }) => {
  const latestPoint = historical?.[historical?.length - 1];
  const previousPoint = historical?.[historical?.length - 2];

  const currentTemp = latestPoint ? getTemperatureValue(latestPoint) : (data ? getTemperatureValue(data) : 0);
  const currentPressure = latestPoint ? getPressureValue(latestPoint) : (data ? getPressureValue(data) : 0);
  const currentPh = latestPoint ? getPhValue(latestPoint) : (data ? getPhValue(data) : 0);

  const previousTemp = previousPoint ? getTemperatureValue(previousPoint) : currentTemp;
  const previousPressure = previousPoint ? getPressureValue(previousPoint) : currentPressure;

  const tempTrend = currentTemp - previousTemp;
  const pressureTrend = currentPressure - previousPressure;

  const getStatusIcon = () => {
    switch (data?.status) {
      case 'online': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'offline': return <Power className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const customTooltipStyles = {
    backgroundColor: 'rgba(0,0,0,0.8)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    padding: '12px',
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl backdrop-blur-xl border border-white/20 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${
        isActive
          ? 'bg-gradient-to-br from-white/30 to-white/10 shadow-xl ring-2 ring-white/30'
          : 'bg-gradient-to-br from-white/15 to-white/5 hover:from-white/25 hover:to-white/15'
      }`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${processColors[process]} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
      />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${processColors[process]} text-white shadow-lg`}>
              {processIcons[process]}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white/90">{processNames[process]}</h3>
              <div className="flex items-center space-x-2 mt-1">
                {getStatusIcon()}
                <span className="text-white/60 text-sm">
                  {data?.lastUpdate ? formatTime(data.lastUpdate) : 'Keine Daten'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
            } shadow-lg`} />
            <Settings className="w-4 h-4 text-white/40 hover:text-white/80 cursor-pointer transition-colors" />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Thermometer className="w-4 h-4 text-red-400" />
              <span className="text-white/70 text-sm">Temperatur</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-white">{currentTemp}</span>
              <span className="text-white/60 text-sm">°C</span>
            </div>
            <div className={`flex items-center text-xs mt-1 ${
              tempTrend > 0 ? 'text-green-400' : tempTrend < 0 ? 'text-red-400' : 'text-gray-400'
            }`}>
              <TrendingUp className={`w-3 h-3 mr-1 ${tempTrend < 0 ? 'rotate-180' : ''}`} />
              <span>{Math.abs(tempTrend).toFixed(1)}</span>
            </div>
          </div>

          <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-white/70 text-sm">Druck</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-white">{currentPressure}</span>
              <span className="text-white/60 text-sm">bar</span>
            </div>
            <div className={`flex items-center text-xs mt-1 ${
              pressureTrend > 0 ? 'text-green-400' : pressureTrend < 0 ? 'text-red-400' : 'text-gray-400'
            }`}>
              <TrendingUp className={`w-3 h-3 mr-1 ${pressureTrend < 0 ? 'rotate-180' : ''}`} />
              <span>{Math.abs(pressureTrend).toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span className="text-white/70 text-sm">pH-Wert</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-white">{currentPh}</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, (currentPh / 7) * 100)}%` }}
              />
            </div>
          </div>
        </div>
        {/* Chart  */}
        <div className="h-40 rounded-2xl overflow-hidden bg-black/20 backdrop-blur-sm p-4">
        <ResponsiveContainer width="100%" height="100%">
  {(historical && historical.length > 0) ? (
    <LineChart data={historical.slice(-20)}>
      <defs>
        <linearGradient id={`temp-gradient-${process}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
          <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1} />
        </linearGradient>
        <linearGradient id={`pressure-gradient-${process}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
      <XAxis
        dataKey="time"
        tickFormatter={(value) =>
          new Date(value).toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit'
          })
        }
        stroke="#ffffff60"
        fontSize={10}
      />
      <YAxis stroke="#ffffff60" fontSize={10} />
      <Tooltip
        contentStyle={customTooltipStyles}
        labelFormatter={(value) => formatTime(value)}
        formatter={(value: any, name: string) => [
          typeof value === 'number' ? value.toFixed(2) : value,
          name === 'temperature'
            ? 'Temperatur (°C)'
            : name === 'pressure'
            ? 'Druck (bar)'
            : 'pH-Wert'
        ]}
      />
      <Legend />
      <Line
        type="monotone"
        dataKey="temperature"
        stroke="#ef4444"
        strokeWidth={2}
        fill={`url(#temp-gradient-${process})`}
        dot={false}
        name="Temperatur (°C)"
        key={`line-temperature-${process}`}
      />
      <Line
        type="monotone"
        dataKey="pressure"
        stroke="#3b82f6"
        strokeWidth={2}
        fill={`url(#pressure-gradient-${process})`}
        dot={false}
        name="Druck (bar)"
        key={`line-pressure-${process}`}
      />
      <Line
        type="monotone"
        dataKey="ph"
        stroke="#a855f7"
        strokeWidth={2}
        dot={false}
        name="pH-Wert"
        key={`line-ph-${process}`}
      />
    </LineChart>
  ) : (
    <div
      style={{
        color: "#fff",
        textAlign: "center",
        paddingTop: 60,
        opacity: 0.6,
        fontSize: 16,
        background: "rgba(0,0,0,0.2)",
        borderRadius: 16,
        width: "100%",
        height: "100%",
      }}
    >
      Keine Daten verfügbar
    </div>
  )}
</ResponsiveContainer>



        </div>
      </div>
    </div>
  );
};

export {
  MockDataGenerator,
  ProcessCard,
  StarRating,
  formatTime,
  getTemperatureValue,
  getPressureValue,
  getPhValue,
  processNames,
  processIcons,
  processColors
};
