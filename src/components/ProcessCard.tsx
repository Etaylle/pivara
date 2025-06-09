import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Thermometer, Droplets, Star, Activity, TrendingUp, Zap
} from 'lucide-react';

// Tooltip styles
const customTooltipStyles = {
  backgroundColor: 'rgba(255,255,255,0.15)',
  border: '1px solid rgba(255,255,255,0.2)',
  padding: '12px',
  borderRadius: '8px',
  color: '#ffffff',
};

// Data types
interface ChartDataPoint {
  time: number;
  temperatur: number;
  druck: number;
  pressure: number;
  ph: number;
}

interface SensorData {
  temperatur?: number;
  druck?: number;
  ph?: number;
  temperature?: number;
  pressure?: number;
}

type ProcessType = 'gaerung' | 'maischen' | 'hopfenkochen';

// Process configuration
const processNames: Record<ProcessType, string> = {
  gaerung: 'Fermentation',
  maischen: 'Mashing',
  hopfenkochen: 'Hop Boiling',
};
const processIcons: Record<ProcessType, React.ReactNode> = {
  gaerung: <Activity className="w-6 h-6" />,
  maischen: <Droplets className="w-6 h-6" />,
  hopfenkochen: <Zap className="w-6 h-6" />,
};
const processColors: Record<ProcessType, string> = {
  gaerung: 'from-red-500 to-pink-600',
  maischen: 'from-blue-500 to-cyan-600',
  hopfenkochen: 'from-yellow-500 to-orange-600',
};

const formatTime = (timestamp: string | number | undefined): string => {
  if (!timestamp) return 'No Data';
  const date = typeof timestamp === 'string' ? new Date(Date.parse(timestamp)) : new Date(timestamp);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const getPressureValue = (data: any): number => data?.druck ?? data?.pressure ?? 0;
const getTemperatureValue = (data: any): number => data?.temperatur ?? data?.temperature ?? 0;

const ProcessCard: React.FC<{
  process: ProcessType;
  data: SensorData | undefined;
  historical: ChartDataPoint[] | undefined;
  isActive: boolean;
}> = ({ process, data, historical, isActive }) => {
  const latestPoint = historical?.[historical?.length - 1] || { temperatur: 0, druck: 0, pressure: 0, ph: 0 };
  const previousPoint = historical?.[historical?.length - 2] || latestPoint;

  const currentTemp = getTemperatureValue(latestPoint) || getTemperatureValue(data) || 0;
  const currentPressure = getPressureValue(latestPoint) || getPressureValue(data) || 0;
  const currentPh = latestPoint.ph || data?.ph || 0;

  const previousTemp = getTemperatureValue(previousPoint);
  const previousPressure = getPressureValue(previousPoint);

  const tempTrend = currentTemp - previousTemp;
  const pressureTrend = currentPressure - previousPressure;

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl backdrop-blur-xl border border-white/20 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${
        isActive
          ? 'bg-gradient-to-br from-white/30 to-white/10 shadow-xl'
          : 'bg-gradient-to-br from-white/20 to-white/5 hover:from-white/25 hover:to-white/15'
      }`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${processColors[process]} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      <div className="relative p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div
              className={`p-3 rounded-2xl bg-gradient-to-br ${processColors[process]} text-white shadow-lg`}
            >
              {processIcons[process]}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white/90">{processNames[process]}</h3>
              <p className="text-white/60 text-sm">{formatTime(historical?.[historical?.length - 1]?.time)}</p>
            </div>
          </div>
          <div
            className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'} shadow-lg`}
          />
        </div>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Thermometer className="w-4 h-4 text-red-400" />
              <span className="text-white/70 text-sm font-medium">Temperature</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-white">{currentTemp.toFixed(1)}</span>
              <span className="text-white/60">°C</span>
              <div
                className={`flex items-center text-xs ${tempTrend > 0 ? 'text-green-400' : 'text-red-400'}`}
              >
                <TrendingUp className={`w-3 h-3 ${tempTrend < 0 ? 'rotate-180' : ''}`} />
                <span>{Math.abs(tempTrend).toFixed(1)}</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-white/70 text-sm font-medium">Pressure</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-white">{currentPressure.toFixed(2)}</span>
              <span className="text-white/60">bar</span>
              <div
                className={`flex items-center text-xs ${pressureTrend > 0 ? 'text-green-400' : 'text-red-400'}`}
              >
                <TrendingUp className={`w-3 h-3 ${pressureTrend < 0 ? 'rotate-180' : ''}`} />
                <span>{Math.abs(pressureTrend).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="h-32 rounded-2xl overflow-hidden bg-black/20 backdrop-blur-sm p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historical?.map(point => ({
              time: point.time,
              temperature: getTemperatureValue(point),
              pressure: getPressureValue(point),
              ph: point.ph
            })) || []}>
              <defs>
                <linearGradient id={`temp-gradient-${process}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff4b4b" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#ff4b4b" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id={`pressure-gradient-${process}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#ff4b4b"
                strokeWidth={2}
                fill={`url(#temp-gradient-${process})`}
                dot={{ fill: '#ff4b4b' }}
                name="Temperature"
              />
              <Line
                type="monotone"
                dataKey="pressure"
                stroke="#3b82f6"
                strokeWidth={2}
                fill={`url(#pressure-gradient-${process})`}
                dot={{ fill: '#3b82f6' }}
                name="Pressure"
              />
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis
                dataKey="time"
                tickFormatter={(value) => formatTime(value)}
                stroke="#ffffff80"
              />
              <YAxis stroke="#ffffff80" />
              <Tooltip
                contentStyle={customTooltipStyles}
                formatter={(value: string | number, name: string) => {
                  if (name === 'time') {
                    return [formatTime(value), name];
                  }
                  return [value, name];
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <span className="text-white/70 text-sm">pH Level</span>
          <div className="flex items-center space-x-2">
            <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full transition-all duration-1000"
                style={{ width: `${(currentPh / 7) * 100}%` }}
              />
            </div>
            <span className="text-white font-bold text-sm">{currentPh.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessCard;
