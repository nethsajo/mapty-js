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
    //The _newWorkout method is basically an event handler function so it's a function that's gonna be called by an event listener

    //An event handler function will always have the 'this' keyword of the DOM element onto which it is attached. So in this case, that's gonna be the form element. Inside of the _newWorkout method the 'this' keyword gonna point to form and no longer to the App object
    form.addEventListener('submit', this._newWorkout.bind(this));
    this._getPosition();
  }

  //this._loadMap treated as a regular function call not as a method call. In a regular function call the this keyword is set to undefined
  //Since this is callback function we are not calling it ourselves. It is the getCurrentPosition function that we'll call 'this' callback function once that it gets the current position of the user
  //'this' keyword will point to the current object
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

    //So the solution to that is to bind the 'this' keyword because the 'this' keyword is the App object
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _newWorkout(e) {}
}
