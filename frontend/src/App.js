import axios from "axios";
import { useState } from "react";
import "./App.css";

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [city, setCity] = useState("");
  const [unit, setUnit] = useState("metric");
  const [error, setError] = useState("");
  const [allWeatherData, setAllWeatherData] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const apiKey = "<Api Key Here>";

  const handleCityChange = (event) => {
    setCity(event.target.value);
  };

  const handleUnitChange = (event) => {
    setUnit(event.target.value);
  };

  const isValidCity = (cityName) => {
    const cityRegex = /^[a-zA-Z\s]+$/;
    return cityRegex.test(cityName);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!city) {
      setError("City name cannot be empty.");
      return;
    }

    if (!isValidCity(city)) {
      setError("Invalid city name. Please enter letters only.");
      return;
    }

    setError("");

    try {
      const response = await axios.get(
        `<Put your weather api link here from respective api provider website>`
      );
      const { temp } = response.data.main;
      const description = response.data.weather[0].description;
      const weather = {
        temp,
        description,
        city: response.data.name,
        unit: unit === "metric" ? "°C" : "°F",
      };

      await axios.post("http://localhost:5000/postWeather", {
        city: weather.city,
        unit: unit,
        temp: weather.temp,
        description: weather.description,
      });

      setWeatherData(weather);
      setError("");
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("Invalid city name or unable to fetch weather data. Please try again.");
      setWeatherData(null);
    }
  };

  const fetchAllWeatherData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/getWeather");
      const fetchedData = response.data;

      if (fetchedData.length === 0) {
        setAlertMessage("No data available in the database.");
      } else {
        setAlertMessage("");
      }

      setAllWeatherData(fetchedData);
    } catch (error) {
      console.error("Error fetching all weather data:", error);
    }
  };

  const deleteHandler = async (cityToDelete) => {
    try {
      await axios.delete(`http://localhost:5000/deleteWeather/${cityToDelete}`);
      setAllWeatherData(allWeatherData.filter((data) => data.city !== cityToDelete));
    } catch (error) {
      console.error("Error deleting data: ", error);
    }
  };

  return (
    <div align="center">
      <br />
      <form onSubmit={handleSubmit}>
        <label>Enter the city: </label>
        <input type="text" value={city} onChange={handleCityChange} />
        <br />

        <label>Select unit: </label>
        <select value={unit} onChange={handleUnitChange}>
          <option value="metric">Celsius (°C)</option>
          <option value="imperial">Fahrenheit (°F)</option>
        </select>
        <br />

        <button type="submit">Get Weather</button>
      </form>

      <button onClick={fetchAllWeatherData}>Fetch All Weather Data</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {alertMessage && <p style={{ color: "orange" }}>{alertMessage}</p>}

      {weatherData && (
        <table>
          <tbody>
            <tr>
              <th colSpan="2">Weather in {weatherData.city}</th>
            </tr>
            <tr>
              <td>Temperature:</td>
              <td>{weatherData.temp}{weatherData.unit}</td>
            </tr>
            <tr>
              <td>Condition:</td>
              <td>{weatherData.description}</td>
            </tr>
          </tbody>
        </table>
      )}

      {allWeatherData.length > 0 && (
        <div>
          <h2>All Weather Data:</h2>
          <table>
            <thead>
              <tr>
                <th>City</th>
                <th>Temperature</th>
                <th>Description</th>
                <th>Unit</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {allWeatherData.map((data, index) => (
                <tr key={index}>
                  <td>{data.city}</td>
                  <td>{data.temp} {data.unit}</td>
                  <td>{data.description}</td>
                  <td>{data.unit}</td>
                  <td>
                    <button onClick={() => deleteHandler(data.city)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
