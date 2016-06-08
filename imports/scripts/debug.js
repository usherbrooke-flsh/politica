Debug = {
    props: ["log", "debug", "info", "warn"],
    generalProps: ["error", "assert", "clear", "count", "dir", "dirxml", "exception", "group", "groupCollapsed", "groupEnd", "markTimeline", "memoryProfile", "memoryProfileEnd", "profile", "profileEnd", "table", "time", "timeEnd", "timeStamp", "trace"],
    hasPropFallback: true,
    propFallback: null,

    init: function() {
        var allProps = this.props.concat(this.generalProps);
        if(this.hasPropFallback) {
            this.propFallback = this.props[0];
        }

        if(typeof(console) === "undefined" || typeof(DEBUG) === "undefined" || (typeof(DEBUG) === "boolean" && !DEBUG) || (typeof(DEBUG) === "string" && DEBUG.toLowerCase() == "off")) {
            //disable all
            for(var i=0; i<allProps.length; i++) {
                this.disableProp(allProps[i]);
            }
        } else if(typeof(console) !== "undefined") {
            //console is available and not disabled
            for(var i=0; i<allProps.length; i++) {
                this.enableProp(allProps[i]);
            }
        }
    },

    disableProp: function (prop) {
        Debug[prop] = function(){};
    },

    enableProp: function (prop) {
        if((typeof(console[prop]) === "undefined")) {
            if((this.propFallback !== null) && (typeof(console[this.propFallback]) !== "undefined")) {
                Debug[prop] = Debug[this.propFallback];
            } else {
                this.disableProp(prop);
            }
        } else {
            Debug[prop] = function(){
                var argv = [];
                var argc = arguments.length;
                if(argc === 0) return;

                //Convertir les arguments en array pour le traitement.
                Array.prototype.push.apply( argv, arguments );
                if(typeof argv[0] === 'string') {
                    var elem = null;

                    //définir ce qu'on veut afficher
                    if(argc > 0) {
                        elem = argv[0];
                        argv.shift();
                        argc = argv.length;
                    }

                    //Formatter le output
                    if(argc > 0) {
                        elem = elem.format.apply(elem, argv);
                    }
                    console[prop](elem);
                } else {
                    console[prop].apply(console, argv);
                }
            }
        }
    }
};
Debug.init();
