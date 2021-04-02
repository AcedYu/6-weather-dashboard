// My javascript here
// Grab the parts on the html
var searchHistory = $('#search-history');
var weatherDisplay = $('#weather-display');
var forecastDisplay = $('#forecast');
var searchForm = $('form');
var searchQuery = $('input[name = "city-search"]');

// getWeather api call function
var getWeather = (city) => {
  var weatherApi = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=caf23bfda5d554d1a104091b1f51e063&units=imperial`;
  $.ajax({
    url: weatherApi,
    method: 'GET',
    error: () => alert("Please input a valid city name.")
  }).then(function (response) {
    renderWeather(response)
    addHistory(response.name);
  });
}

// getForecast api call function
var getForecast = (lat, lon) => {
  var forecastApi = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=caf23bfda5d554d1a104091b1f51e063&units=imperial`;
  $.ajax({
    url: forecastApi,
    method: 'GET',
    error: () => console.log("The process for grabbing forecast data has failed.")
  }).then(function (response) {
    renderForecast(response)
  });
}

// get UV Index that accepts the latitude and longitude of the city coordinates
var getUVIndex = (lat, lon) => {
  var uvurl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=caf23bfda5d554d1a104091b1f51e063`;
  $.ajax({
    url: uvurl,
    method: 'GET',
    error: () => console.log("Failed to obatain UV Index")
  }).then((response) => {
    renderUVIndex(response.current.uvi);
  })
}

// render weather data function
var renderWeather = (city) => {
  weatherDisplay.empty();
  forecastDisplay.empty();
  // turn the unix formatted date into a more standard format
  var date = moment.unix(city.dt).format("(M/D/YYYY)");
  // obtain the URL for the weather icon
  var iconURL = `http://openweathermap.org/img/wn/${city.weather[0].icon}@2x.png`
  // obtain the UV index which needs another API call to obtain.
  var lat = city.coord.lat;
  var lon = city.coord.lon;
  // generate the entire element
  var weather = $(`
  <h2>${city.name} ${date}<img src="${iconURL}"></h2>
  <p>Temperature: ${city.main.temp} °F</p>
  <p>Humidity: ${city.main.humidity}%</p>
  <p>Wind Speed: ${city.wind.speed} MPH</p>
  `);

  // append to page
  weatherDisplay.append(weather);
  // invoke get UVIndex
  getUVIndex(lat, lon);
  getForecast(lat, lon);
}

// render forecast data function
var renderForecast = (city) => {
  // Create and append the forecast title
  var forecastTitle = $(`
  <div class = "row">
  <h2>5 Day Forecast: </h2>
  </div>
  `);
  forecastDisplay.append(forecastTitle);
  var container = $('<div class = "row"></div>')
  for (var i = 1; i <= 5; i++) {
    // Define our necessary data
    var date = moment.unix(city.daily[i].dt).format("M/D/YYYY");
    var iconURL = `http://openweathermap.org/img/wn/${city.daily[i].weather[0].icon}@2x.png`
    var temperature = city.daily[i].temp.day;
    var humidity = city.daily[i].humidity;

    // Create element
    var forecastEntry = $(`
    <div class="card text-white bg-primary mb-3 col m-3" style="max-width: 18rem;">
      <div class="card-body">
        <h5 class="card-title">${date}</h5>
        <img src="${iconURL}">
        <p class="card-text">Temp: ${temperature} °F</p>
        <p class="card-text">Humidity: ${humidity}%</p>
      </div>
    </div>
    `);

    // Append element to page
    container.append(forecastEntry);
  }
  forecastDisplay.append(container);
}

var renderUVIndex = (index) => {
  // add the background color class based the the uv index value
  var indicator;
  if (index >= 0 && index < 3) {
    indicator = 'bg-success';
  } else if (index <= 6) {
    indicator = 'bg-warning';
  } else if (index <= 8) {
    indicator = 'orange';
  } else if (index <= 11) {
    indicator = 'bg-danger';
  } else {
    indicator = 'violet';
  }
  // Generate the UV index portion of our section
  var uvi = $(`
  <ul class = "list-inline">
    <li class="list-inline-item">UV Index: </li>
    <li class="list-inline-item p-2 rounded-pill ${indicator}">${index}</li>
  </ul>
  `);
  // append to page
  weatherDisplay.append(uvi);
}

// Define our search history as a global variable
var searched = JSON.parse(localStorage.getItem("searches"));
if (!searched) {
  searched = [];
}
// Search history function
var addHistory = (city) => {
  // If duplicate is found, do not add it to history again.
  for (var i = 0; i < searched.length; i++) {
    if (city === searched[i]) {
      return;
    }
  }
  // Add new items to the front of the array, similarly to how browser organizes it for history
  searched.unshift(city);
  localStorage.setItem("searches", JSON.stringify(searched));
  renderList();
}

// Render List function
var renderList = () => {
  searchHistory.empty();
  for (var i = 0; i < searched.length; i++) {
    var li = $(`<li class="list-group-item">${searched[i]}</li>`);
    li.on('click', (event) => {
      var target = $(event.target);
      getWeather(target.text());
    });
    searchHistory.append(li);
  }
}
// searchForm on submit event listener
searchForm.on('submit', (event) => {
  event.preventDefault();
  var city = searchQuery.val();
  searchQuery.val('');
  getWeather(city);
});

// initialize with the list rendered
renderList();