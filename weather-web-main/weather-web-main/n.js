document.getElementById("searchBtn").addEventListener("click", function() {
    const city = document.getElementById("city").value;
    if (city) {
        getWeather(city);
        document.getElementById("forecast-info").style.display = "none"; // Hide forecast info when searching for a new city
        document.getElementById("fullForecastBtn").style.display = "none"; // Hide 5-day forecast button
    } else {
        alert("Please enter a city name");
    }
});

function getWeather(city) {
    const apiKey = 'ffaf13be2ebb140a939f88c2e5b399fd';
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== 200) {
                alert("City not found!");
                return;
            }
            displayWeatherPopup(data);
            getFiveDayForecast(city); // Fetch the 5-day forecast after getting today's weather
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
            alert("Error fetching data.");
        });
}

function getFiveDayForecast(city) {
    const apiKey = 'ffaf13be2ebb140a939f88c2e5b399fd';
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== '200') {
                alert("Forecast data not found!");
                return;
            }
            displayForecast(data);
        })
        .catch(error => {
            console.error("Error fetching forecast data:", error);
            alert("Error fetching forecast data.");
        });
}

function displayWeatherPopup(data) {
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    const todayWeatherHtml = `
        <h3>Today's Weather</h3>
        <div>
            <img src="${iconUrl}" alt="Weather Icon">
            <p>${data.name}, ${data.sys.country}</p>
            <p>Temperature: ${data.main.temp}°C</p>
            <p>${data.weather[0].description}</p>
            <p>Humidity: ${data.main.humidity}%</p>
        </div>
    `;
    
    document.getElementById("today-weather-info").innerHTML = todayWeatherHtml;
    document.getElementById("today-weather-info").style.display = "block"; // Show today's weather section
    document.getElementById("fullForecastBtn").style.display = "inline-block"; // Show the 5-day forecast button
}

function displayForecast(data) {
    let forecastHtml = '';
    let cardDelay = 0;

    data.list.forEach((forecast, index) => {
        if (index % 8 === 0) { 
            const iconCode = forecast.weather[0].icon;
            const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
            const date = new Date(forecast.dt * 1000);
            const day = date.toLocaleDateString();

            forecastHtml += `
                <div class="forecast-card" style="animation-delay: ${cardDelay}s;">
                    <p><strong>${day}</strong></p>
                    <img src="${iconUrl}" alt="Weather Icon">
                    <p>Temp: ${forecast.main.temp}°C</p>
                    <p>${forecast.weather[0].description}</p>
                </div>
            `;
            cardDelay += 0.3;
        }
    });

    document.getElementById("forecast-info").innerHTML = forecastHtml;
}

document.getElementById("fullForecastBtn").addEventListener("click", function() {
    document.getElementById("forecast-info").style.display = "flex"; // Show 5-day forecast when button is clicked
});

