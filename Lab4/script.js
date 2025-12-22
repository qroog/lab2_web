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