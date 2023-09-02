class KeyboardInputs {
	static initialize() {
	  document.addEventListener("keydown", KeyboardInputs.onKeyDown);
	  document.addEventListener("keyup", KeyboardInputs.onKeyUp);
	}
  
	static status = {};
  
	static onKeyUp(event) {
	  const key = event.key;
	  if (KeyboardInputs.status[key]) {
		KeyboardInputs.status[key].pressed = false;
	  }
	}
  
	static onKeyDown(event) {
	  const key = event.key;
	  if (!KeyboardInputs.status[key]) {
		KeyboardInputs.status[key] = {
		  down: false,
		  pressed: false,
		  up: false,
		  beenUpdated: false,
		};
	  }
	}
  
	static update() {
	  for (const key in KeyboardInputs.status) {
		if (!KeyboardInputs.status[key].beenUpdated) {
		  KeyboardInputs.status[key].down = true;
		  KeyboardInputs.status[key].pressed = true;
		  KeyboardInputs.status[key].beenUpdated = true;
		} else {
		  KeyboardInputs.status[key].down = false;
		}
  
		if (KeyboardInputs.status[key].up) {
		  delete KeyboardInputs.status[key];
		  continue;
		}
  
		if (!KeyboardInputs.status[key].pressed) {
		  KeyboardInputs.status[key].up = true;
		}
	  }
	}
  
	static down(keyName) {
	  return !!KeyboardInputs.status[keyName]?.down;
	}
  
	static pressed(keyName) {
	  return !!KeyboardInputs.status[keyName]?.pressed;
	}
  
	static up(keyName) {
	  return !!KeyboardInputs.status[keyName]?.up;
	}
  
	static debug() {
	  const list = Object.keys(KeyboardInputs.status).join(" ");
	  console.log("Keys active:", list);
	}
  }
  
  export default KeyboardInputs;