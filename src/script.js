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

//Main class app to handle the private events:
class App {
	//Defining the private instance properties to use with the leaflet library:
	#map;
	#mapEvent;

	//Using the underscore notation to show that these methods show not be handled outside this class:
	//Empty arguments in the constructor because we dont need any input for our application;
	//Since this methods is called as soon as the create the app object, we can put call the other private methods we want to run when the page loads here:
	constructor() {
		this._getPosistion();

		//Attaching the event listeners to the constructor because it is called first:
		//Adding event listener to the input fields so we can submit without a button:
		//So the _newWorkout .this keyword will point to the DOM element, in this case the form, not the calss App, so we need to fix it manually using bind:
		form.addEventListener("submit", this._newWorkout.bind(this));

		//Switching between elevation and cadence:
		inputType.addEventListener("change", this._toggleElevationField);
	}

	_getPosistion() {
		if (navigator.geolocation)
			//Getting the Geolocation from the API
			//It takes to callback functions as arguments, the first will be executed if we can get the users location, and the other will only run wih we get an error (user no allowing location for example):
			//It returns an object with the latitude and longitude as poperties:
			//Since we are calling the _loadMap as a normal function, not a methods, the .this keyword is automatically set to undefined. So we have to manually bind the .this:
			navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () =>
				alert("Could not get your location.")
			);
	}

	_loadMap(position) {
		//Using destructuring to get the properties from the object:
		const { latitude } = position.coords;
		const { longitude } = position.coords;
		//Creating google map link with the coords
		//console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

		//Creating an array with the coords that will be used by the leaflet
		const coords = [latitude, longitude];

		//So L is the main namespace from Leaflet, and the .map is a method from it. Whereas the "map" is the html id name;
		//The setView method is where the map will first load, using the coords array, where the second number is the zoom;
		//Also reassigning to the global map variable:
		//Calling this.map because it is a property of the App class:
		this.#map = L.map("map").setView(coords, 13);

		//With this method we can change the appearance of the map, by changing the url;
		L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(this.#map);

		//Special event method from the leaflet library to handle where the map was clicked, returning an object;
		//The this keyword of the _showForm method also points to the DOM element, not the App, so we have to manually fix it:
		this.#map.on("click", this._showForm.bind(this));
	}

	_showForm(mapE) {
		//Also reassignin the parameter we get from clicking the map to the global variable so we can use it in other functions:
		this.#mapEvent = mapE;
		//Creating the form to enter the workout details when the map is clicked:
		form.classList.remove("hidden");
		//Focusin the inpu field:
		inputDistance.focus();
	}

	_toggleElevationField() {
		inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
		inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
	}

	_newWorkout(e) {
		//Preventing the submit forms to realod the page:
		e.preventDefault();

		//Clearing the input fields;
		// prettier-ignore

		inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = "";

		//Now we display the marker when the user is done typing:
		//Assignin the lat and lng to variables using destructuring:
		const { lat, lng } = this.#mapEvent.latlng;

		//Creating a marker where the user has clicked:
		//We can also set custom properties to the marker, creating an object in the bindPopup argument:
		L.marker([lat, lng])
			.addTo(this.#map)
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
	}
}

//Creating an object app:
const app = new App();
