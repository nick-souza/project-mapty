"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

//Getting the Geolocation from the API
//It takes to callback functions as arguments, the first will be executed if we can get the users location, and the other will only run wih we get an error (user no allowing location for example):
//It returns an object with the latitude and longitude as poperties:
if (navigator.geolocation)
	navigator.geolocation.getCurrentPosition(
		(position) => {
			//Using destructuring to get the properties from the object:
			const { latitude } = position.coords;
			const { longitude } = position.coords;
			//Creating google map link with the coords
			console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

			//Creating an array with the coords that will be used by the leaflet
			const coords = [latitude, longitude];

			//So L is the main namespace from Leaflet, and the .map is a method from it. Whereas the "map" is the html id name;
			//The setView method is where the map will first load, using the coords array, where the second number is the zoom;
			const map = L.map("map").setView(coords, 13);

			//With this method we can change the appearance of the map, by changing the url;
			L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			}).addTo(map);

			//Where the marker will load, using the coords array
			L.marker(coords)
				.addTo(map)
				.bindPopup("A pretty CSS3 popup.<br> Easily customizable.")
				.openPopup();
		},
		() => alert("Could not get your location.")
	);
