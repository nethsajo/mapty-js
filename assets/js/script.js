'use strict';

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  clicks = 0;

  constructor(coords, distance, duration) {
    this.coords = coords; //[lat, lng]
    this.distance = distance; //in km
    this.duration = duration; //in min
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase() + this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  click() {
    this.clicks++;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calculatePace();
    this._setDescription();
  }

  calculatePace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calculateSpeed();
    this._setDescription();
  }

  calculateSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

////////////////////////////////////////////
//Application Architecture

const form = document.querySelector('.form');
const containerWorkout = document.querySelector('.workout');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const sidebar = document.querySelector('.sidebar');
const logo = document.querySelector('.logo');
const action = document.querySelector('.action');

class App {
  #map;
  #mapEvent;
  #mapZoomLevel = 15;
  #workouts = [];

  constructor() {
    this._getPosition();

    //Get data from local storage
    this._getLocalStorage();

    //Attach event handlers
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
    //Hide menu
    sidebar.addEventListener('click', this._hideMenuClick.bind(this));

    //Toggle menu
    sidebar.addEventListener('click', this._toggleMenuActions);

    action.addEventListener('click', this._deleteWorkouts.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position');
        }
      );
    }
  }

  _loadMap(position) {
    // console.log(this);
    const { latitude, longitude } = position.coords;
    // console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
    // console.log(map);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach(workout => {
      this._renderWorkoutMarker(workout);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    //Empty inputs
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => {
      form.style.display = 'grid';
    }, 1000);
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    //Check the inputs. Passing the arguments as rest parameters
    const validInputs = (...inputs) => {
      return inputs.every(inp => Number.isFinite(inp));
    };

    const allPositive = (...inputs) => {
      return inputs.every(inp => inp > 0);
    };

    e.preventDefault();

    //Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    //If workout running, create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      //Check if data is valid
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    //If workout cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    //Add new object to workout array
    this.#workouts.push(workout);
    // console.log(workout);

    //Render workout on map as marker
    //Pass the workout object
    this._renderWorkoutMarker(workout);

    //Render workout on list
    this._renderWorkout(workout);

    //Hide form + clear input fields
    this._hideForm();

    //Set local storage to all workouts
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    const icon = new L.Icon.Default();
    icon.options.shadowSize = [0, 0];

    L.marker(workout.coords, { icon })
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    const html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <div class="workout__menu-actions workout__menu-hidden">
          <ul class="workout__menus">
            <li class="workout__menu-item workout--delete">
              <svg class="workout__item-icon">
                <use xlink:href="./assets/icons/sprite.svg#icon-trash"></use>
              </svg>
              <span>Delete</span>
            </li>
          </ul>
        </div>
        <h2 class="workout__title">${workout.description}</h2>
        <svg class="workout__menu-icon">
          <use
            xlink:href="./assets/icons/sprite.svg#icon-dots-three-horizontal"
          ></use>
        </svg>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${
            workout.type === 'running'
              ? workout.pace.toFixed(1)
              : workout.speed.toFixed(1)
          }</span>
          <span class="workout__unit">${
            workout.type === 'running' ? 'min/km' : 'km/h'
          }</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === 'running' ? '🦶🏼' : '⛰'
          }</span>
          <span class="workout__value">${
            workout.type === 'running' ? workout.cadence : workout.elevationGain
          }</span>
          <span class="workout__unit">${
            workout.type === 'running' ? 'spm' : 'm'
          }</span>
        </div>
      </li>
    `;

    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e) {
    //event delegation
    const workOutElement = e.target.closest('.workout');

    if (!workOutElement) return;

    const workout = this.#workouts.find(
      work => work.id === workOutElement.dataset.id
    );

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    //using the public interface
    // workout.click();
  }

  _toggleMenuActions(e) {
    if (!e.target.classList.contains('workout__menu-icon')) return;
    const menu = e.target
      .closest('.workout')
      .querySelector('.workout__menu-actions');

    menu.style.display = 'block';
    menu.classList.remove('workout__menu-hidden');
  }

  _hideMenu() {
    const menus = document.querySelectorAll('.workout__menu-actions');

    menus.forEach(menu => {
      if (menu.classList.contains('workout__menu-hidden')) return;
      menu.classList.add('workout__menu-hidden');
      menu.style.display = 'none';
    });
  }

  _hideMenuClick(e) {
    const menus = Array.from(
      document.querySelectorAll('.workout__menu-actions')
    );
    const isHidden = menus.every(menu =>
      menu.classList.contains('workout__menu-hidden')
    );

    if (e.target.closest('.workout__menu-item') !== null || isHidden) return;

    this._hideMenu();
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    // console.log(data);

    if (!data) return;

    this.#workouts = data;

    this.#workouts.forEach(workout => {
      this._renderWorkout(workout);
    });
  }

  _deleteWorkouts(e) {
    const clicked = e.target.closest('.action--delete-all');

    if (!clicked) return;

    localStorage.removeItem('workouts');
    this._removeWorkoutList();
  }

  _removeWorkoutList() {
    const workouts = document.querySelectorAll('.workout');
    const popup = document.querySelectorAll('.leaflet-popup');
    const marker = document.querySelectorAll('.leaflet-marker-icon');

    workouts.forEach(work => (work.style.display = 'none'));
    popup.forEach(popup => (popup.style.display = 'none'));
    marker.forEach(marker => (marker.style.display = 'none'));
  }
}

//Create an object and instantiate the class App
const app = new App();
