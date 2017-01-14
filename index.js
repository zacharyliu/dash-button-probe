var pcap = require('pcap');
var EventEmitter = require('events');

module.exports = function (interface, ssid, timeout) {
  var timeout_wait = false;
  if (!timeout) {
    timeout = 7000;
  }

  var pcap_session = pcap.createSession(
    process.env.INTERFACE,
    'subtype probe-req', // Only capture probe request packets
    10 * 1024 * 1024, // Default buffer size
    true // Monitor mode
  );

  var emitter = new EventEmitter();

  pcap_session.on('packet', function (raw_packet) {
    if (timeout_wait) return;

    // Decode raw packet
    try {
      var packet = pcap.decode.packet(raw_packet);
    } catch (err) {
      // Ignore decode errors: https://github.com/mranney/node_pcap/issues/153
    }

    if (packet) {
      // Find tag in packet containing probe request SSID
      var tag_ssid = packet.payload.ieee802_11Frame.probe.tags.find(function (tag) {
        return tag.type === 'ssid';
      });

      // Check if the SSID matches the configured value
      if (tag_ssid && tag_ssid.ssid === process.env.SSID) {
        // Set debounce timer
        timeout_wait = true;
        setTimeout(function () {
          timeout_wait = false;
        }, timeout);

        // Emit "press" event
        emitter.emit('press');
      }
    }
  });

  return emitter;
};
