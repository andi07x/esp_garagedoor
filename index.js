var request = require("request");
var Service, Characteristic;

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory("homebridge-esp-garagedoor", "ArdGaragedoorOpener", ardGdOpener);
}

function ardGdOpener(log, config) {
    this.log = log;
    this.config = config;
    this.name = config["name"];
    this.ip = config["ip"];

    this.service = new Service.GarageDoorOpener(this.name);
    this.service
        .getCharacteristic(Characteristic.CurrentDoorState)
        .on('get', this.getDoorState.bind(this));
    this.service
        .getCharacteristic(Characteristic.TargetDoorState)
        .on('set', this.setTargetState.bind(this));
}

ardGdOpener.prototype.getDoorState = function(callback) {
    request.get({
        url: 'http://'+this.ip+'/status'
    }, function(err, response, body) {
        var status;
        if  (body == 'closed') {
            state = Characteristic.CurrentDoorState.CLOSED;
        } else if (body == 'open') {
            state = Characteristic.CurrentDoorState.OPEN;
        } else if (body == 'closing') {
            state = Characteristic.CurrentDoorState.CLOSING;
        } else if (body == 'opening') {
            state = Characteristic.CurrentDoorState.OPENING;
        } else {
            state = Characteristic.CurrentDoorState.STOPPED;
        }
        callback(null, status);
    }.bind(this));
}

ardGdOpener.prototype.setTargetState = function(state, callback) {
    var url = (state == Characteristic.TargetDoorState.CLOSED) ? "closed": "open";
    request.get({
        url: 'http://'+this.ip+'/' + url
    }, function(err, response, body) {
        callback(null, on);
    }.bind(this));
}

ardGdOpener.prototype.getServices = function() {
    return [this.service];
}
