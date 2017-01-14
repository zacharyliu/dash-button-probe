# dash-button-probe
Detect when an [Amazon Dash Button](https://www.amazon.com/Dash-Buttons/) is pressed, offline.

This package works by detecting which network your Dash Button attempts to connect to, and triggering an event when it finds the one you configured. By configuring your Dash Button onto a uniquely-named hotspot, and then turning off that hotspot, you can use the Dash Button offline without it ever connecting to Amazon's servers.

**Requires a Wi-Fi adapter supporting monitor mode.** In particular, this means that the Raspberry Pi 3's built-in Wi-Fi is not supported, and you will need an external USB Wi-Fi adapter with monitor mode support (such as [this one](https://www.amazon.com/gp/product/B00GFAN498/)). Some laptops, including most MacBooks, do have monitor mode support and will work without an external adapter.

## Setup
First, you'll need to temporarily create a hotspot with an SSID that's different from all other Wi-Fi hotspots around you. This package will detect an event whenever any device tries to connect to a network with that name, so you need a network that nothing else will use. This network is only needed during setup. The easiest way to do this is to enable hotspot/tethering on a smartphone with a new SSID.

Follow [this guide](https://medium.com/@edwardbenson/how-i-hacked-amazon-s-5-wifi-button-to-track-baby-data-794214b0bdd8) to configure your Dash Button on that network you just set up. Once you reach the product selection screen, close the Amazon app and disable the hotspot. The hotspot is no longer needed after this point.

Before running your script, you'll need to configure your Wi-Fi adapter into monitor mode. On Linux, you can use the following commands:

```
sudo ifconfig INTERFACE down
sudo iwconfig INTERFACE mode monitor
sudo ifconfig INTERFACE up
```

substituting INTERFACE for the name of your Wi-Fi hardware interface (e.g. `wlan0`).

Then, use the following snippet to detect button presses:

```js
var dash_button = require('dash-button-probe');
var dash = dash_button(INTERFACE, SSID);
dash_button.on('press', function () {
  console.log('button pressed');
});
```

where `INTERFACE` is the name of your Wi-Fi hardware interface and `SSID` is the unique network name you used during setup.

## Technical Details
This package uses probe request frames instead of the ARP/UDP packet detection method used by most Dash Button packages (such as [node-dash-button](https://github.com/hortinstein/node-dash-button/), which inspired this package). These are packets transmitted by a device to connect to a network with a particular SSID. In our case, the Dash Button never finishes the connection since the network doesn't exist anymore, but these packets are still detectable. This has the benefit of working without an active Wi-Fi network, as well as working across different networks. It also works in dense environments (dorms, offices, etc.) where networks with the same SSID may exist on multiple Wi-Fi channels. However, it does require monitor mode support in order to detect the probe requests.
