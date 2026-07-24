// API configuration
const API_KEY = '5d419f48ced35da0b3acf86a6f0d793b';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache

class WeatherService {
    static cache = {};

    static async fetchWithCache(url) {
        const now = Date.now();
        
        // Check cache
        if (this.cache[url] && now - this.cache[url].timestamp < CACHE_DURATION) {
            return this.cache[url].data;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            const data = await response.json();
            
            // Update cache
            this.cache[url] = {
                data,
                timestamp: now
            };
            
            return data;
        } catch (error) {
            console.error('API Request Failed:', error);
            throw error;
        }
    }

    static async getCurrentWeather(city) {
        const url = `${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`;
        return this.fetchWithCache(url);
    }

    static async getForecast(city) {
        const url = `${BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}&cnt=40`;
        return this.fetchWithCache(url);
    }

    static async getWeatherByCoords(lat, lon) {
        const currentUrl = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
        const forecastUrl = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}&cnt=40`;
        
        const [current, forecast] = await Promise.all([
            this.fetchWithCache(currentUrl),
            this.fetchWithCache(forecastUrl)
        ]);
        
        return { current, forecast };
    }

    static getIconUrl(iconCode) {
        return `images/icons/${iconCode}.png`;
    }

    static formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        return new Intl.DateTimeFormat('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
        }).format(date);
    }

    static getHourlyForecast(list) {
        return list.slice(0, 8).map(item => ({
            time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit' }),
            temp: Math.round(item.main.temp),
            icon: item.weather[0].icon,
            pop: Math.round(item.pop * 100) // Probability of precipitation
        }));
    }
}