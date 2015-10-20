/**
 * Utils functions fot web application
 */

Utils = {
        accents: {
            'a': 'aàáâäåãæ',
            'e': 'eèéêë',
            'i': 'iìíîï',
            'o': 'oòóôõöø',
            'u': 'uùúûü',
            'y': 'yÿ',
            'n': 'nñ',
            'c': 'cç'
        },

		/**
		 * Function to get accent insensitive regex
		 */
        getRegex: function(value) {
            for(var i in Utils.accents) {
                value = value.replace(new RegExp('['+Utils.accents[i]+']', 'gi'), '['+Utils.accents[i]+']');
            }

            return value;
        },

		unaccent: function(obj) {
			var not_special, newObj;
			if(typeof obj == 'object') {
				newObj = {};
				for(var k in obj) {
					not_special = Utils.unaccent(k);
					newObj[not_special] = {
						value: (typeof obj[k] == 'object') ? Utils.unaccent(obj[k]) : obj[k],
						key: k
					};
				}
			} else {
				newObj = obj;
				for(var i in Utils.accents) {
					newObj = newObj.replace(new RegExp('['+Utils.accents[i]+']', 'g'), i);
					newObj = newObj.replace(new RegExp('['+Utils.accents[i].toUpperCase()+']', 'g'), i.toUpperCase());
				}
			}
			return newObj;
		},

		/**
		 * Function to imitate in_array php function
		 */
		in_array: function(needle, haystack, argStrict) {
			  var key = '',
			    strict = !! argStrict;

			  if (strict) {
			    for (key in haystack) {
			      if (haystack[key] === needle) {
			        return true;
			      }
			    }
			  } else {
			    for (key in haystack) {
			      if (haystack[key] == needle) {
			        return true;
			      }
			    }
			  }

			  return false;
		},

		/**
		 * Functiont to imitate uniqid php function
		 */
		uniqid: function(prefix, more_entropy) {
			  if (typeof prefix == 'undefined') {
			    prefix = "";
			  }

			  var retId;
			  var formatSeed = function (seed, reqWidth) {
			    seed = parseInt(seed, 10).toString(16); // to hex str
			    if (reqWidth < seed.length) { // so long we split
			      return seed.slice(seed.length - reqWidth);
			    }
			    if (reqWidth > seed.length) { // so short we pad
			      return (new Array(1 + (reqWidth - seed.length))).join('0') + seed;
			    }
			    return seed;
			  };

			  // BEGIN REDUNDANT
			  if (!this.php_js) {
			    this.php_js = {};
			  }
			  // END REDUNDANT
			  if (!this.php_js.uniqidSeed) { // init seed with big random int
			    this.php_js.uniqidSeed = Math.floor(Math.random() * 0x75bcd15);
			  }
			  this.php_js.uniqidSeed++;

			  retId = prefix; // start with prefix, add current milliseconds hex string
			  retId += formatSeed(parseInt(new Date().getTime() / 1000, 10), 8);
			  retId += formatSeed(this.php_js.uniqidSeed, 5); // add seed hex string
			  if (more_entropy) {
			    // for more entropy we add a float lower to 10
			    retId += (Math.random() * 10).toFixed(8).toString();
			  }

			  return retId;
		},

		/**
		 * Function to detect light and dark colors from hex value
		 */
		getContrastYIQ: function(hexcolor) {
			if((typeof hexcolor == 'undefined') || (hexcolor == '')) {
				return '#000';
			}
				
			var r = parseInt(hexcolor.substr(0,2),16);
			var g = parseInt(hexcolor.substr(2,2),16);
			var b = parseInt(hexcolor.substr(4,2),16);
			var yiq = ((r*299)+(g*587)+(b*114))/1000;
			return (yiq >= 128) ? '#000' : '#FFF';
		},
		
		lcfirst: function(str) {
			  str += '';
			  var f = str.charAt(0).toLowerCase();
			  return f + str.substr(1);
		},

	    empty: function (mixed_var) {
	        var undef, key, i, len;
	        var emptyValues = [undef, null, false, 0, "", "0", undefined];

	        for (i = 0, len = emptyValues.length; i < len; i++) {
	            if (mixed_var === emptyValues[i]) {
	                return true;
	            }
	        }

	        if (typeof mixed_var === "object") {
	            for (key in mixed_var) {
	                // TODO: should we check for own properties only?
	                //if (mixed_var.hasOwnProperty(key)) {
	                return false;
	                //}
	            }
	            return true;
	        }

	        return false;
	    }
};

/**
 * Object functions
 */
Object .size = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};

/**
 * Debug functions
 */
var Debug = {
		/**
		 * Is debug on or off
		 */
		isOn: true,
		
		/**
		 * Set debug on
		 */
		on: function(){
			Debug.isOn = true;
		},
		
		/**
		 * Set debug off
		 */
		off: function(){
			Debug.isOn = false;
		},
		
		/**
		 * Function to log into console
		 */
		log: function() {
			if (Debug.isOn && (typeof console == "object")) {
				console.log(arguments);
			}
		},

        debug: function() {
            if (Debug.isOn && (typeof console == "object")) {
                console.debug(arguments);
            }
        }
};

/**
 * Aliases
 */
var _l = Debug.log;
var _d = Debug.debug;