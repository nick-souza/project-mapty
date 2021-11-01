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

//Creating the global variable map to use with the leaflet library:
let map;
let mapEvent;

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
			//Also reassigning to the global map variable:
			map = L.map("map").setView(coords, 13);

			//With this method we can change the appearance of the map, by changing the url;
			L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			}).addTo(map);

			//Special event method from the leaflet library to handle where the map was clicked, returning an object;
			map.on("click", (mapE) => {
				//Also reassignin the parameter we get from clicking the map to the global variable so we can use it in other functions:
				mapEvent = mapE;
				//Creating the form to enter the workout details when the map is clicked:
				form.classList.remove("hidden");
				//Focusin the inpu field:
				inputDistance.focus();
			});
		},
		() => alert("Could not get your location.")
	);

//Adding event listener to the input fields so we can submit without a button:
form.addEventListener("submit", (e) => {
	//Preventing the submit forms to realod the page:
	e.preventDefault();

	//Clearing the input fields;
	// prettier-ignore
	inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = "";

	//Now we display the marker when the user is done typing:
	//Assignin the lat and lng to variables using destructuring:
	const { lat, lng } = mapEvent.latlng;

	//Creating a marker where the user has clicked:
	//We can also set custom properties to the marker, creating an object in the bindPopup argument:
	L.marker([lat, lng])
		.addTo(map)
		.bindPopup(
			L.popup({
				maxWidth: 250,
				minWidth: 100,
				autoClose: false,
				closeOnClick: false,
				// We can also set a className, so we can customize it in the css file:
				className: "cycling-popup",
			})
		)
		.setPopupContent("Workout")
		.openPopup();
});

//Switching between elevation and cadence:
inputType.addEventListener("change", () => {
	inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
	inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
});
