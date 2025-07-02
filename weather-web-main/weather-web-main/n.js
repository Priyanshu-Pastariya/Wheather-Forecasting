document.getElementById("city").addEventListener("keypress", function(event) {
    // Check if the pressed key is "Enter" (keyCode 13)
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent form submission if inside a form
        getWeather(); // Trigger the weather fetch function
    }
});

document.getElementById("searchBtn").addEventListener("click", getWeather);

document.getElementById("micBtn").addEventListener("click", startListening);

let recognition;

function initializeSpeechRecognition() {
    // Initialize speech recognition if the browser supports it
    if (!('webkitSpeechRecognition' in window)) {
        alert("Speech recognition is not supported in this browser.");
        return;
    }
    
    recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US'; // Set language to English
    recognition.interimResults = false; // Don't show interim results
    recognition.maxAlternatives = 1; // Only take the best match
    
    recognition.onstart = () => {
        document.getElementById("micBtn").textContent = "Listening...";
        document.getElementById("micBtn").disabled = true; // Disable mic button while listening
    };
    
    recognition.onerror = (event) => {
        console.error("Speech recognition error", event);
        document.getElementById("micBtn").textContent = "Start Listening";
        document.getElementById("micBtn").disabled = false;
    };
    
    recognition.onend = () => {
        document.getElementById("micBtn").textContent = "Start Listening";
        document.getElementById("micBtn").disabled = false; // Re-enable mic button
    };
    
    recognition.onresult = (event) => {
        const city = event.results[0][0].transcript; // Get the city name from the speech input
        const cleanCity = city.replace(/\.$/, ''); // Remove the trailing dot (.) if it exists
        document.getElementById("city").value = city; // Put the city name in the input field
        getWeather(); // Fetch weather based on the city name
    };
}

function startListening() {
    if (!recognition) {
        initializeSpeechRecognition(); // Initialize recognition if not already done
    }
    recognition.start(); // Start listening
}

function getWeather() {
    let city = document.getElementById("city").value;
    if (city === "") {
        alert("Please enter a city name.");
        return;
    }

    // Show loading message
    document.getElementById("loading").style.display = "block";

    const apiKey = "ffaf13be2ebb140a939f88c2e5b399fd"; // Your OpenWeatherMap API Key
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Hide loading message
            document.getElementById("loading").style.display = "none";
            
            if (data.cod === "404") {
                alert("City not found.");
            } else {
                displayWeather(data);
            }
        })
        .catch(err => {
            console.error("Error fetching data:", err);
            document.getElementById("loading").style.display = "none"; // Hide loading on error
            alert("Error fetching weather data. Please try again later.");
        });
}

function displayWeather(data) {
    // Display current weather
    document.getElementById("city-name").textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById("temperature").textContent = `Temperature: ${data.main.temp}°C`;
    document.getElementById("description").textContent = `Description: ${data.weather[0].description}`;
    document.getElementById("humidity").textContent = `Humidity: ${data.main.humidity}%`;

    // Change background based on the weather condition
    changeBackground(data.weather[0].main.toLowerCase());

    // Show the button for 5 day forecast
    document.querySelector(".view-forecast-btn").style.display = "block";

    // Additional info: Wind speed and UV index (Example)
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude=hourly,daily&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("wind-speed").textContent = `Wind Speed: ${data.current.wind_speed} m/s`;
            document.getElementById("uv-index").textContent = `UV Index: ${data.current.uvi}`;
            document.querySelector(".additional-info").style.display = "block";
        });
}

function changeBackground(weather) {
    const backgrounds = {
        clear: "wc.jpg",
        rain: "wr.jpg",
        snow: "ws.jpg",
        clouds: "wpc.jpg",
        thunderstorm: "wt.jpg",
        drizzle: "wd.jpg",
    };
    const body = document.getElementById("body");
    body.style.backgroundImage = `url('${backgrounds[weather] || "w.jpg"}')`;
}

function show5DayForecast() {
    const city = document.getElementById("city").value;
    const apiKey = "ffaf13be2ebb140a939f88c2e5b399fd";
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const forecastContainer = document.querySelector(".forecast-cards");
            forecastContainer.innerHTML = ""; // Clear previous forecast cards

            data.list.forEach((forecast, index) => {
                if (index % 8 === 0) {  // Show forecast every 24 hours (8 data points per day)
                    const card = document.createElement("div");
                    card.classList.add("forecast-card");
                    card.innerHTML = `
                        <h4>${new Date(forecast.dt * 1000).toLocaleDateString()}</h4>
                        <p>Temp: ${forecast.main.temp}°C</p>
                        <p>${forecast.weather[0].description}</p>
                    `;
                    forecastContainer.appendChild(card);
                }
            });

            // Show the forecast section
            document.querySelector(".forecast-container").style.display = "block";
        })
        .catch(err => {
            console.error("Error fetching forecast:", err);
            alert("Error fetching the 5-day forecast. Please try again later.");
        });
}
