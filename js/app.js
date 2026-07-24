document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // DOM Elements
    const searchBtn = document.getElementById('search-btn');
    const locationBtn = document.getElementById('location-btn');
    const cityInput = document.getElementById('city-input');
    const mainContent = document.querySelector('.main-content');
    const unitToggle = document.createElement('button');
    
    // Add unit toggle button
    unitToggle.id = 'unit-toggle';
    unitToggle.innerHTML = '<i class="fas fa-exchange-alt"></i> °C/°F';
    document.querySelector('.search-container').appendChild(unitToggle);
    
    let isCelsius = true;

    // Event Listeners
    searchBtn.addEventListener('click', searchWeather);
    locationBtn.addEventListener('click', getLocationWeather);
    cityInput.addEventListener('keypress', e => e.key === 'Enter' && searchWeather());
    unitToggle.addEventListener('click', toggleTemperatureUnit);

    // Default city on load with fade-in animation
    setTimeout(() => fetchWeather('London'), 500);

    // Functions
    function searchWeather() {
        const city = cityInput.value.trim();
        if (city) {
            animateTransition(() => fetchWeather(city));
            cityInput.value = '';
        } else {
            showError('Please enter a city name');
        }
    }

    function getLocationWeather() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    animateTransition(() => fetchWeatherByCoords(latitude, longitude));
                },
                error => {
                    showError('Unable to retrieve your location. Please enable location services.');
                }
            );
        } else {
            showError('Geolocation is not supported by your browser.');
        }
    }

    async function fetchWeather(city) {
        try {
            showLoading(true);
            
            const [currentData, forecastData] = await Promise.all([
                WeatherService.getCurrentWeather(city),
                WeatherService.getForecast(city)
            ]);
            
            displayWeather(currentData, forecastData);
        } catch (error) {
            showError('Error fetching weather data. Please check the city name.');
        } finally {
            showLoading(false);
        }
    }

    async function fetchWeatherByCoords(lat, lon) {
        try {
            showLoading(true);
            const { current, forecast } = await WeatherService.getWeatherByCoords(lat, lon);
            displayWeather(current, forecast);
        } catch (error) {
            showError('Error fetching weather for your location.');
        } finally {
            showLoading(false);
        }
    }

    function displayWeather(current, forecast) {
        displayCurrentWeather(current);
        displayHourlyForecast(forecast.list);
        displayForecast(forecast);
        updateBackground(current.weather[0].main);
    }

    function displayCurrentWeather(data) {
        const temp = isCelsius ? Math.round(data.main.temp) : Math.round((data.main.temp * 9/5) + 32);
        const feelsLike = isCelsius ? Math.round(data.main.feels_like) : Math.round((data.main.feels_like * 9/5) + 32);
        
        animateElement(document.getElementById('current-city'), `${data.name}, ${data.sys.country}`);
        animateElement(document.getElementById('current-temp'), temp);
        animateElement(document.getElementById('current-desc'), data.weather[0].description);
        
        // Weather icon animation
        const icon = document.getElementById('current-icon');
        icon.style.transform = 'scale(0)';
        setTimeout(() => {
            icon.src = WeatherService.getIconUrl(data.weather[0].icon);
            icon.style.transform = 'scale(1)';
        }, 300);
        
        document.getElementById('feels-like').textContent = `Feels like: ${feelsLike}°${isCelsius ? 'C' : 'F'}`;
        document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
        document.getElementById('wind').textContent = `Wind: ${Math.round(data.wind.speed * 3.6)} km/h`;
        document.getElementById('visibility').textContent = `Visibility: ${(data.visibility / 1000).toFixed(1)} km`;
    }

    function displayHourlyForecast(list) {
        const hourlyContainer = document.getElementById('hourly-container');
        hourlyContainer.innerHTML = '';
        
        const hourlyData = WeatherService.getHourlyForecast(list);
        
        hourlyData.forEach((hour, index) => {
            const temp = isCelsius ? hour.temp : Math.round((hour.temp * 9/5) + 32);
            
            const hourlyItem = document.createElement('div');
            hourlyItem.className = 'hourly-item';
            hourlyItem.style.opacity = '0';
            hourlyItem.style.transform = 'translateY(20px)';
            hourlyItem.style.transition = `all 0.5s ease ${index * 0.1}s`;
            
            hourlyItem.innerHTML = `
                <div class="hourly-time">${hour.time}</div>
                <div class="hourly-icon">
                    <img src="${WeatherService.getIconUrl(hour.icon)}" alt="Hourly weather">
                </div>
                <div class="hourly-temp">${temp}°</div>
                ${hour.pop > 0 ? `<div class="hourly-pop">${hour.pop}%</div>` : ''}
            `;
            
            hourlyContainer.appendChild(hourlyItem);
            
            // Trigger animation
            setTimeout(() => {
                hourlyItem.style.opacity = '1';
                hourlyItem.style.transform = 'translateY(0)';
            }, 100);
        });
    }

    function displayForecast(data) {
        const forecastContainer = document.getElementById('forecast-container');
        forecastContainer.innerHTML = '';
        
        // Group forecast by day
        const dailyForecast = {};
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000).toLocaleDateString();
            if (!dailyForecast[date]) dailyForecast[date] = [];
            dailyForecast[date].push(item);
        });
        
        // Get the next 5 days (skip today)
        const dates = Object.keys(dailyForecast).slice(1, 6);
        
        dates.forEach((date, index) => {
            const dayData = dailyForecast[date];
            const dayTemp = dayData.reduce((acc, curr) => acc + curr.main.temp, 0) / dayData.length;
            const nightTemp = dayData[0].main.temp;
            
            const tempMax = isCelsius ? Math.round(dayTemp) : Math.round((dayTemp * 9/5) + 32);
            const tempMin = isCelsius ? Math.round(nightTemp) : Math.round((nightTemp * 9/5) + 32);
            
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            forecastItem.style.opacity = '0';
            forecastItem.style.transform = 'translateY(20px)';
            forecastItem.style.transition = `all 0.5s ease ${index * 0.1}s`;
            
            forecastItem.innerHTML = `
                <div class="forecast-day">${WeatherService.formatDate(dayData[0].dt)}</div>
                <div class="forecast-icon">
                    <img src="${WeatherService.getIconUrl(dayData[0].weather[0].icon)}" alt="${dayData[0].weather[0].description}">
                </div>
                <div class="forecast-desc">${dayData[0].weather[0].description}</div>
                <div class="forecast-temp">
                    <span class="temp-max">${tempMax}°</span>
                    <span class="temp-min">${tempMin}°</span>
                </div>
            `;
            
            forecastContainer.appendChild(forecastItem);
            
            // Trigger animation
            setTimeout(() => {
                forecastItem.style.opacity = '1';
                forecastItem.style.transform = 'translateY(0)';
            }, 100);
        });
    }

    function toggleTemperatureUnit() {
        isCelsius = !isCelsius;
        unitToggle.innerHTML = `<i class="fas fa-exchange-alt"></i> °${isCelsius ? 'C' : 'F'}`;
        
        // Refresh display with new units
        const currentCity = document.getElementById('current-city').textContent;
        if (currentCity !== 'Current Location') {
            animateTransition(() => {
                const city = currentCity.split(',')[0].trim();
                fetchWeather(city);
            });
        }
    }

    function updateBackground(weatherCondition) {
        const conditions = {
            'Clear': 'linear-gradient(135deg, #56CCF2, #2F80ED)',
            'Clouds': 'linear-gradient(135deg, #BBD2C5, #536976)',
            'Rain': 'linear-gradient(135deg, #0F2027, #203A43, #2C5364)',
            'Snow': 'linear-gradient(135deg, #E6DADA, #274046)',
            'Thunderstorm': 'linear-gradient(135deg, #0F0C29, #302B63, #24243E)',
            'Drizzle': 'linear-gradient(135deg, #3a7bd5, #00d2ff)',
            'Mist': 'linear-gradient(135deg, #606c88, #3f4c6b)',
            'default': 'linear-gradient(135deg, #667eea, #764ba2)'
        };
        
        const background = conditions[weatherCondition] || conditions['default'];
        document.body.style.backgroundImage = background;
    }

    function animateElement(element, newValue) {
        element.style.transform = 'scale(0.9)';
        element.style.opacity = '0.5';
        element.textContent = newValue;
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.opacity = '1';
            element.style.transition = 'all 0.3s ease';
        }, 10);
    }

    function animateTransition(callback) {
        mainContent.style.animation = 'fadeOut 0.3s forwards';
        
        setTimeout(() => {
            callback();
            mainContent.style.animation = 'fadeIn 0.5s forwards';
        }, 300);
    }

    function showLoading(show) {
        const loader = document.querySelector('.loading') || createLoader();
        
        if (show) {
            loader.style.display = 'block';
            mainContent.style.opacity = '0.5';
            mainContent.style.filter = 'blur(2px)';
        } else {
            loader.style.display = 'none';
            mainContent.style.opacity = '1';
            mainContent.style.filter = 'none';
        }
    }

    function createLoader() {
        const loader = document.createElement('div');
        loader.className = 'loading';
        loader.innerHTML = '<div class="spinner"></div>';
        document.querySelector('.container').appendChild(loader);
        return loader;
    }

    function showError(message) {
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.textContent = message;
        
        document.body.appendChild(errorEl);
        
        setTimeout(() => {
            errorEl.style.opacity = '1';
            errorEl.style.transform = 'translateY(0)';
        }, 10);
        
        setTimeout(() => {
            errorEl.style.opacity = '0';
            errorEl.style.transform = 'translateY(-20px)';
            setTimeout(() => errorEl.remove(), 300);
        }, 3000);
    }
});