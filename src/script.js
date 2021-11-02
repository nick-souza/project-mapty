"use strict";

//Parent Class to handle the common data between the Cycling and Running child classes:
class Workout {
	//Creating a date to store when the activity wa logged:
	date = new Date();
	//Creating a unique id to be able to search the array of objects. Usually this is handled by a external library to create unique number, but we are now setting it manually using the new date, converting to string and then getting the last numbers:
	id = (Date.now() + "").slice(-10);

	//Common properties that the child classes will inherit
	constructor(coords, distance, duration) {
		this.coords = coords; // [lat, lang]
		this.distance = distance; //in km
		this.duration = duration; //in min
	}

	//Method to create the descritpion when a new workout is created:
	_setDescription() {
		// prettier-ignore
		const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

		this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
			months[this.date.getMonth()]
		} ${this.date.getDate()}`;
	}
}

//Child Class
class Running extends Workout {
	//Creating a variable to hold the type:
	type = "running";

	constructor(coords, distance, duration, cadence) {
		super(coords, distance, duration);
		this.cadence = cadence;
		//Caling the method to calculate automatically:
		this.calcPace();
		//Calling the method to create the description:
		this._setDescription();
	}

	//Method for calculating the pace:
	calcPace() {
		this.pace = this.duration / this.distance;
		return this.pace;
	}
}

//Child Class
class Cycling extends Workout {
	//Creating a variable to hold the type:
	type = "cycling";

	constructor(coords, distance, duration, elevationGaing) {
		super(coords, distance, duration);
		this.elevationGaing = elevationGaing;
		this.calcSpeed();
		//Calling the method to create the description:
		this._setDescription();
	}

	//Method to calculate speed:
	calcSpeed() {
		//Dividing by 60 because the duration input is in min:
		this.speed = this.distance / (this.duration / 60);
		return this.speed;
	}
}

//---------------//Application//---------------//

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
	//Creating the private workout array to store all saved workouts:
	#workout = [];

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

	_hideForm() {
		//Clearing the input fields;
		// prettier-ignore
		inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = "";

		form.style.display = "none";
		form.classList.add("hidden");
		setTimeout(() => (form.style.display = "grid"), 1000);
	}

	_toggleElevationField() {
		inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
		inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
	}

	_newWorkout(e) {
		//Helper function to validate the user input:
		//So this takes any types of argument, puts it in a array, then loops over every element and check if they are numbers. And only returns positive if all are numbers;
		//Same as doing this:
		// !Number.isFinite(distance) ||
		// !Number.isFinite(duration) ||
		// !Number.isFinite(cadence)
		const validate = (...inputs) => inputs.every((inp) => Number.isFinite(inp));
		//Second helper function to check if they are positive:
		const positive = (...inputs) => inputs.every((inp) => inp > 0);

		//Preventing the submit forms to realod the page:
		e.preventDefault();

		//Now getting the data the user entered in the form:
		//Getting if it is a cycling or running workout:
		const type = inputType.value;
		//Getting the duration and distance and converting then to numbers:
		const distance = +inputDistance.value;
		const duration = +inputDuration.value;
		//Assignin the lat and lng to variables using destructuring:
		const { lat, lng } = this.#mapEvent.latlng;
		//Creating the workout object outside so we can then push to the array outiside the if block scope, just reassigning it in the if blick
		let workout;

		//Chicking what type of workout the activity will be and getting the value of each unique form:
		if (type === "running") {
			const cadence = +inputCadence.value;
			//Now doing the validation of the data that the user has input, using a guard caluse, which means that we are checking fot the opposed of what we want
			if (
				!validate(distance, duration, cadence) ||
				!positive(distance, duration, cadence)
			)
				return alert("Inputs have to be positive numbers");

			//New Creating the new object with the inputs are correct, and reassigning it to the already created workout:
			workout = new Running([lat, lng], distance, duration, cadence);
		}

		if (type === "cycling") {
			const elevation = +inputElevation.value;
			if (
				!validate(distance, duration, elevation) ||
				//Here we are not checking for positive elevation because it is allowed to input negative numbers:
				!positive(distance, duration)
			)
				return alert("Inputs have to be positive numbers");

			//New Creating the new object with the inputs are correct, and reassigning it to the already created workout:
			workout = new Cycling([lat, lng], distance, duration, elevation);
		}

		//Pushing the new object to the #workout array:
		this.#workout.push(workout);

		//Now we display the marker when the user is done typing:
		this._renderWorkoutMarker(workout);

		//Display the activities the user has logged:
		this._renderWorkout(workout);

		//Hide the form after the user has created an workout:
		this._hideForm();
	}

	_renderWorkoutMarker(workout) {
		//Creating a marker where the user has clicked:
		//We can also set custom properties to the marker, creating an object in the bindPopup argument:
		L.marker(workout.coords)
			.addTo(this.#map)
			.bindPopup(
				L.popup({
					maxWidth: 250,
					minWidth: 100,
					autoClose: false,
					closeOnClick: false,
					// We can also set a className, so we can customize it in the css file:
					//Using a template literal to specify if it is a cycling or running workout and change the color:
					className: `${workout.type}-popup`,
				})
			)
			.setPopupContent(
				`${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${workout.description}`
			)
			.openPopup();
	}

	//Method to display the already logged workouts:
	_renderWorkout(workout) {
		//Common html elements for both cycling and running:
		let html = `
		<li class="workout workout--${workout.type}" data-id="${workout.id}">
			<h2 class="workout__title">${workout.description}</h2>
			<div class="workout__details">
			  <span class="workout__icon">${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"}</span>
			  <span class="workout__value">${workout.distance}</span>
			  <span class="workout__unit">km</span>
			</div>
			<div class="workout__details">
			  <span class="workout__icon">⏱</span>
			  <span class="workout__value">${workout.duration}</span>
			  <span class="workout__unit">min</span>
			</div>
		`;

		//Now the rest for the specific type of workout:
		if (workout.type === "running")
			//Adding to the template literal:
			html += `
				<div class="workout__details">
					<span class="workout__icon">⚡️</span>
					<span class="workout__value">${workout.pace.toFixed(1)}</span>
					<span class="workout__unit">min/km</span>
          		</div>
          		<div class="workout__details">
					<span class="workout__icon">🦶🏼</span>
					<span class="workout__value">${workout.cadence}</span>
					<span class="workout__unit">spm</span>
          		</div>
        	</li>
			`;

		if (workout.type === "cycling")
			html += `
				<div class="workout__details">
					<span class="workout__icon">⚡️</span>
					<span class="workout__value">${workout.speed.toFixed(1)}</span>
					<span class="workout__unit">km/h</span>
          		</div>
         		<div class="workout__details">
           			<span class="workout__icon">⛰</span>
            		<span class="workout__value">${workout.elevationGaing}</span>
           			<span class="workout__unit">m</span>
         		</div>
        	</li>
			`;

		//Adding the workout as a sibling to the form element, in the UL
		form.insertAdjacentHTML("afterend", html);
	}
}

//Creating an object app:
const app = new App();
