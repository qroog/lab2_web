const state = { 
  locations: [], 
  activeLocationIndex: 0 
};

const el = {
  geoModal: document.getElementById('geoModal'),
  manualCityModal: document.getElementById('manualCityModal'),
  allowGeoBtn: document.getElementById('allowGeoBtn'),
  denyGeoBtn: document.getElementById('denyGeoBtn'),
  cityInput: document.getElementById('cityInput'),
  cityDropdown: document.getElementById('cityDropdown'),
  cityError: document.getElementById('cityError'),
  manualCityInput: document.getElementById('manualCityInput'),
  manualCityDropdown: document.getElementById('manualCityDropdown'),
  manualCityError: document.getElementById('manualCityError'),
  confirmManualCity: document.getElementById('confirmManualCity'),
  refreshBtn: document.getElementById('refreshBtn'),
  cityTabs: document.getElementById('cityTabs'),
  weatherContent: document.getElementById('weatherContent')
};

const icons = {
  0: 'wi wi-day-sunny', 1: 'wi wi-day-cloudy', 2: 'wi wi-day-cloudy',
  3: 'wi wi-cloudy', 45: 'wi wi-fog', 48: 'wi wi-fog',
  51: 'wi wi-sprinkle', 53: 'wi wi-sprinkle', 55: 'wi wi-rain',
  61: 'wi wi-rain', 63: 'wi wi-rain', 65: 'wi wi-rain-wind',
  71: 'wi wi-snow', 73: 'wi wi-snow', 75: 'wi wi-snow-wind',
  77: 'wi wi-snow', 80: 'wi wi-showers', 81: 'wi wi-showers',
  82: 'wi wi-rain', 85: 'wi wi-snow', 86: 'wi wi-snow-wind',
  95: 'wi wi-thunderstorm', 96: 'wi wi-thunderstorm', 99: 'wi wi-thunderstorm'
};

const descriptions = {
  0: 'Ясно', 1: 'Преимущественно ясно', 2: 'Переменная облачность', 3: 'Облачно',
  45: 'Туман', 48: 'Изморозь', 51: 'Небольшая морось', 53: 'Морось', 55: 'Сильная морось',
  61: 'Небольшой дождь', 63: 'Дождь', 65: 'Сильный дождь', 71: 'Небольшой снег',
  73: 'Снег', 75: 'Сильный снег', 77: 'Снежные зерна', 80: 'Ливень',
  81: 'Сильный ливень', 82: 'Очень сильный ливень', 85: 'Снегопад',
  86: 'Сильный снегопад', 95: 'Гроза', 96: 'Гроза с градом', 99: 'Сильная гроза с градом'
};

const create = (tag, className, text) => {
  const elem = document.createElement(tag);
  if (className) elem.className = className;
  if (text) elem.textContent = text;
  return elem;
};

const createIconBlock = (containerClass, iconClass, text) => {
  const block = create('div', containerClass);
  block.appendChild(create('i', iconClass));
  block.appendChild(document.createTextNode(text));
  return block;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date().toDateString();
  const tomorrow = new Date(Date.now() + 86400000).toDateString();
  if (date.toDateString() === today) return 'Сегодня';
  if (date.toDateString() === tomorrow) return 'Завтра';
  return date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' });
};

const showError = (elem, msg) => {
  elem.textContent = msg;
  elem.classList.add('active');
  setTimeout(() => elem.classList.remove('active'), 3000);
};

const storage = {
  save: () => {
    localStorage.setItem('weatherAppLocations', JSON.stringify(state.locations));
    localStorage.setItem('weatherAppActiveIndex', state.activeLocationIndex);
  },
  load: () => {
    const loc = localStorage.getItem('weatherAppLocations');
    const idx = localStorage.getItem('weatherAppActiveIndex');
    if (loc) state.locations = JSON.parse(loc);
    if (idx) state.activeLocationIndex = parseInt(idx);
  }
};

const getWeather = async (lat, lon) => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_sum&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Не удалось получить данные о погоде');
  return await res.json();
};

const searchCities = async (query) => {
  if (query.length < 2) return [];
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=ru&format=json`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results?.map(city => ({
      name: city.name,
      lat: city.latitude,
      lon: city.longitude,
      country: city.country_code || city.country || '',
      admin: city.admin1 || ''
    })) || [];
  } catch (error) {
    console.error('Ошибка поиска городов:', error);
    return [];
  }
};

const showLoader = () => {
  el.weatherContent.textContent = '';
  const loader = create('div', 'loader');
  loader.appendChild(create('div', 'loader__spinner'));
  loader.appendChild(create('p', '', 'Загрузка...'));
  el.weatherContent.appendChild(loader);
};

const showErrorMsg = (msg) => {
  el.weatherContent.textContent = '';
  const error = create('div', 'error-message');
  error.appendChild(create('h2', 'error-message__title', 'Ошибка'));
  error.appendChild(create('p', 'error-message__text', msg));
  el.weatherContent.appendChild(error);
};

const renderWeather = (loc, data) => {
  el.weatherContent.textContent = '';
  const weather = create('div', 'weather');
  weather.appendChild(create('h2', 'weather__location', loc.isGeo ? 'Текущее местоположение' : loc.name));

  const current = create('div', 'weather__current');
  current.appendChild(create('div', 'weather__temp', `${Math.round(data.current.temperature_2m)}°C`));

  const details = create('div', 'weather__details');
  details.appendChild(create('i', `weather__icon ${icons[data.current.weather_code] || 'wi wi-day-sunny'}`));
  details.appendChild(create('div', 'weather__detail', descriptions[data.current.weather_code] || 'Неизвестно'));
  
  details.appendChild(createIconBlock('weather__detail', 'wi wi-humidity', ` Влажность: ${data.current.relative_humidity_2m}%`));
  details.appendChild(createIconBlock('weather__detail', 'wi wi-strong-wind', ` Ветер: ${Math.round(data.current.wind_speed_10m)} км/ч`));
  
  current.appendChild(details);
  weather.appendChild(current);

  const forecast = create('div', 'weather__forecast');
  for (let i = 0; i < 3; i++) {
    const card = create('div', 'forecast-card');
    card.appendChild(create('div', 'forecast-card__date', formatDate(data.daily.time[i])));
    card.appendChild(create('i', `forecast-card__icon ${icons[data.daily.weather_code[i]] || 'wi wi-day-sunny'}`));
    card.appendChild(create('div', 'forecast-card__temp',
      `${Math.round(data.daily.temperature_2m_max[i])}° / ${Math.round(data.daily.temperature_2m_min[i])}°`));
    
    const info = create('div', 'forecast-card__info');
    info.appendChild(createIconBlock('', 'wi wi-strong-wind', ` ${Math.round(data.daily.wind_speed_10m_max[i])} км/ч`));
    info.appendChild(createIconBlock('', 'wi wi-raindrops', ` ${data.daily.precipitation_sum[i]} мм`));
    
    card.appendChild(info);
    forecast.appendChild(card);
  }

  weather.appendChild(forecast);
  el.weatherContent.appendChild(weather);
};

const renderTabs = () => {
  el.cityTabs.textContent = '';
  state.locations.forEach((loc, idx) => {
    const tab = create('div', 'tab');
    if (idx === state.activeLocationIndex) tab.classList.add('active');
    tab.appendChild(create('span', '', loc.isGeo ? 'Текущее' : loc.name));
    
    const close = create('span', 'tab__close', '×');
    close.onclick = (e) => {
      e.stopPropagation();
      removeLocation(idx);
    };
    tab.appendChild(close);
    tab.onclick = () => switchLocation(idx);
    el.cityTabs.appendChild(tab);
  });
};

const renderDropdown = (cities, dropdown, onSelect) => {
  dropdown.textContent = '';
  if (!cities.length) {
    dropdown.classList.remove('active');
    return;
  }

  cities.forEach(city => {
    const text = city.admin ? `${city.name}, ${city.admin}, ${city.country}` : `${city.name}, ${city.country}`;
    const item = create('div', 'add-city__dropdown-item', text);
    item.onclick = () => onSelect(city);
    dropdown.appendChild(item);
  });
  dropdown.classList.add('active');
};

const requestGeo = async () => {
  el.geoModal.classList.remove('active');
  try {
    showLoader();
    const pos = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000, enableHighAccuracy: true });
    });
    state.locations.push({ isGeo: true, lat: pos.coords.latitude, lon: pos.coords.longitude, name: 'Текущее местоположение' });
    state.activeLocationIndex = 0;
    await loadWeather();
    renderTabs();
    storage.save();
  } catch (error) {
    showErrorMsg('Не удалось получить геолокацию');
    setTimeout(() => el.manualCityModal.classList.add('active'), 1500);
  }
};

const loadWeather = async () => {
  if (!state.locations.length) return;
  const loc = state.locations[state.activeLocationIndex];
  try {
    showLoader();
    const data = await getWeather(loc.lat, loc.lon);
    renderWeather(loc, data);
  } catch (error) {
    showErrorMsg('Не удалось загрузить данные о погоде');
  }
};

const switchLocation = (idx) => {
  state.activeLocationIndex = idx;
  renderTabs();
  loadWeather();
  storage.save();
};

const removeLocation = (idx) => {
  state.locations.splice(idx, 1);
  if (!state.locations.length) {
    state.activeLocationIndex = 0;
    el.weatherContent.textContent = '';
    el.manualCityModal.classList.add('active');
  } else {
    if (state.activeLocationIndex >= state.locations.length) {
      state.activeLocationIndex = state.locations.length - 1;
    }
    loadWeather();
  }
  renderTabs();
  storage.save();
};

const addCity = async (city) => {
  if (state.locations.some(loc => !loc.isGeo && loc.lat === city.lat && loc.lon === city.lon)) {
    showError(el.cityError, 'Этот город уже добавлен');
    return;
  }
  if (state.locations.filter(loc => !loc.isGeo).length >= 10) {
    showError(el.cityError, 'Можно добавить максимум 10 дополнительных городов');
    return;
  }

  state.locations.push({ isGeo: false, lat: city.lat, lon: city.lon, name: city.name });
  state.activeLocationIndex = state.locations.length - 1;
  await loadWeather();
  renderTabs();
  storage.save();
  el.cityInput.value = '';
  el.cityDropdown.classList.remove('active');
};

let searchTimeout;

const handleCityInput = (input, dropdown, onSelect) => {
    clearTimeout(searchTimeout);
    if (input.value.trim().length < 2) {
        dropdown.classList.remove('active');
        return;
    }

    searchTimeout = setTimeout(async () => {
        const cities = await searchCities(input.value);
        renderDropdown(cities, dropdown, onSelect);
    }, 300);
};

const init = () => {
    storage.load();
    if (state.locations.length > 0) {
        renderTabs();
        loadWeather();
    } else {
        el.geoModal.classList.add('active');
    }

    el.allowGeoBtn.onclick = requestGeo;
    el.denyGeoBtn.onclick = () => {
        el.geoModal.classList.remove('active');
        el.manualCityModal.classList.add('active');
    };

    el.cityInput.oninput = () => handleCityInput(el.cityInput, el.cityDropdown, addCity);
    el.cityInput.onblur = () => setTimeout(() => el.cityDropdown.classList.remove('active'), 200);

    el.manualCityInput.oninput = () => {
        handleCityInput(el.manualCityInput, el.manualCityDropdown, (city) => {
            el.manualCityInput.value = city.name;
            el.manualCityInput.dataset.lat = city.lat;
            el.manualCityInput.dataset.lon = city.lon;
            el.manualCityDropdown.classList.remove('active');
        });
    };
    el.manualCityInput.onblur = () => setTimeout(() => el.manualCityDropdown.classList.remove('active'), 200);

    el.confirmManualCity.onclick = async () => {
        const { value: cityName, dataset: { lat, lon } } = el.manualCityInput;
        if (!cityName.trim() || !lat || !lon) {
            showError(el.manualCityError, 'Пожалуйста, выберите город из списка');
            return;
        }

        el.manualCityModal.classList.remove('active');
        state.locations.push({ isGeo: false, lat: parseFloat(lat), lon: parseFloat(lon), name: cityName });
        state.activeLocationIndex = 0;
        await loadWeather();
        renderTabs();
        storage.save();
        el.manualCityInput.value = '';
        delete el.manualCityInput.dataset.lat;
        delete el.manualCityInput.dataset.lon;
    };

    el.refreshBtn.onclick = async () => {
        el.refreshBtn.classList.add('rotating');
        await loadWeather();
        setTimeout(() => el.refreshBtn.classList.remove('rotating'), 600);
    };

    el.manualCityModal.onclick = (e) => {
        if (e.target === el.manualCityModal && state.locations.length > 0) {
            el.manualCityModal.classList.remove('active');
        }
    };
};

document.addEventListener('DOMContentLoaded', init);