// my own class / exported method to handle keyboard inputs and things of that nature
// author: me, To.thekid, aka mr nou

// non character keyboard inputs
class KeyboardInputs {
	// Initialize the listener
	static initialize() {
	  document.addEventListener("keydown", KeyboardInputs.onKeyDown);
	  document.addEventListener("keyup", KeyboardInputs.onKeyUp);
	}
  
	// Keep track of keys currently be
	static status: Record<
	  string,
	  { down: boolean; pressed: boolean; up: boolean; beenUpdated: boolean }
	> = {};
  
	// On key up
	static onKeyUp(event: KeyboardEvent) {
	  const key = event.key;
	  if (KeyboardInputs.status[key]) {
		KeyboardInputs.status[key].pressed = false;
	  }
	}
  
	// On key down
	static onKeyDown(event: KeyboardEvent) {
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
		// Ensure that every keypress has "down" status exactly once
		if (!KeyboardInputs.status[key].beenUpdated) {
		  KeyboardInputs.status[key].down = true;
		  KeyboardInputs.status[key].pressed = true;
		  KeyboardInputs.status[key].beenUpdated = true;
		}
  
		// Already been dealt wit updated previously
		else {
		  KeyboardInputs.status[key].down = false;
		}
  
		// key has been flagged as "up" since last update
		if (KeyboardInputs.status[key].up) {
		  // remove key from status dict
		  delete KeyboardInputs.status[key];
		  // move on to next key in status dict
		  continue;
		}
  
		// key has been flagged as "up" since last update
		if (!KeyboardInputs.status[key].pressed) {
		  KeyboardInputs.status[key].up = true;
		}
	  }
	}
  
	// Function to handle when a key goes down
	static down(keyName: string): boolean {
	  return !!KeyboardInputs.status[keyName]?.down;
	}
	// Function to handle key "pressed"
	static pressed(keyName: string): boolean {
	  return !!KeyboardInputs.status[keyName]?.pressed;
	}
  
	// Function to handle when a key goes up
	static up(keyName: string): boolean {
	  return !!KeyboardInputs.status[keyName]?.up;
	}
  
	// Debugging function
	static debug() {
	  const list = Object.keys(KeyboardInputs.status).join(" ");
	  console.log("Keys active:", list);
	}
  }
  
  export default KeyboardInputs;
  