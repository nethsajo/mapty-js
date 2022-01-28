'use strict';

//Check if the old browser supports the navigator.geolocation, if true then execute the code block
if (navigator.geolocation)
  //The getCurrentPosition() takes as an input to callback functions, the first callback function will be called on success. Takes a position parameter. So whenever the browser successfully got the coordinates of the current position of the user.
  navigator.geolocation.getCurrentPosition(
    function (position) {
      console.log(position);
    },
    //The second callback will be called error, which will be called when there happened an error while getting the coordinates
    function () {
      alert('Could not get your position');
    }
  );

class App {
  //constructor method is called immediately when a new object is created from this class
  constructor() {
    this._getPosition();

    //The _newWorkout method is basically an event handler function so it's a function that's gonna be called by an event listener

    //An event handler function will always have the 'this' keyword of the DOM element onto which it is attached. So in this case, that's gonna be the form element. Inside of the _newWorkout method the 'this' keyword gonna point to form and no longer to the App object
    form.addEventListener('submit', this._newWorkout);

    //Solution is to bind the this._newWorkout in the current object (App). The 'this' keyword is now points to the current object
    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevationField);
  }

  //When the success callback function of getCurrentPosition is only: this._loadMap; the this._loadMap method is actually called by the getCurrentPosition() function not in the current object (App). The this._loadMap treated as a regular function call not as a method call. In a regular function call the this keyword is set to undefined.

  //Since this is callback function we are not calling it ourselves. It is the getCurrentPosition function that we'll call that 'this' callback function once that it gets the current position of the user

  //Solution is to bind the this._loadMap in the current object (App). The 'this' keyword is now points to the current object
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

  //Success callback function of getCurrentPosition method and pass in the current position argument as soon as the current position of the user determined
  _loadMap(position) {
    //If the callback function is this._showForm will throw an error because it is incorrectly set the 'this' keyword. So the _showForm method is now being used as an event handler function below. So just like in regular JavaScript the 'this' keyword in the _showForm function will then be set to the object onto which the event handler is attached so that's gonna be simply the map itself
    this.#map.on('click', this._showForm);

    //So the solution to that is to bind the 'this' keyword, because the 'this' keyword is the App object
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  //The _toggleElevationField method actually does not use the 'this' keyword anywhere and it doesn't matter what the 'this' keyword be like so therefore we don't have to bind it manually
  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    //Check the inputs. Passing the arguments as rest parameters
    const validInputs = (...inputs) => {
      //This will loop over the array and then each of them it will check whether the number is finite or not. The every method will only return true if the value in Number.isFinite(inp) was true for all of them (elements in the array). But if only one of these values in  Number.isFinite(inp) was not finite. If the result was false for one of the elements of the array then every will return false
      inputs.every(inp => Number.isFinite(inp));
    };

    // if (
    //   !Number.isFinite(distance) ||
    //   !Number.isFinite(duration) ||
    //   !Number.isFinite(cadence)
    // )
    //   return alert('Inputs have to be positive numbers!');

    //OR
    if (type === 'running') {
      const cadence = +inputCadence.value;
      //Check if data is valid
      if (!validInputs(distance, duration, cadence))
        //Should happen whenever one of these three is not a number and not when all of them are invalid numbers
        return alert('Inputs have to be positive numbers!');
    }

    //Calling this as a method of the 'this' keyword, and besides that we are calling it ourselves not a callback function of any other function in JavaScript. So therefore in this renderWorkoutMarker method will still be point to the current object
    //Pass the workout object
    this.renderWorkoutMarker(workout);
  }

  renderWorkoutMarker(workout) {}
}
