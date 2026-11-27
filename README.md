# PRIAM — Precision Radio Instrument for Antenna Measurements

A landing page for **PRIAM**, a drone-based antenna calibration system for 21-cm cosmology and
low-frequency radio instruments. Open `index.html` directly, or serve the folder statically.

```
python3 -m http.server 8000
# then open http://localhost:8000
```

No build step, no dependencies — plain HTML, CSS, and vanilla JavaScript.

## What's here

| Path | Contents |
| --- | --- |
| `index.html` | All page content: overview, block diagram, drones, payload, RF modules, specs, links |
| `public/style.css` | Design system, layout, responsive rules, reveal animations |
| `script.js` | Background starfield, sticky nav, mobile menu, scroll reveal, active-section tracking |
| `public/images/` | Illustrative renders used on the page |

## The project in one paragraph

A Tarot T960 hexacopter carries an Ettus B205-mini SDR, a Raspberry Pi 4B payload computer, custom
RF switching, and a dual-polarization crossed-dipole antenna referenced to a high-accuracy frequency
standard. Flying a generated far-field trajectory with RTK GPS positioning, it measures the complex
(magnitude and phase) response of an antenna-under-test in X, Y, and circular polarization. A
Flamewheel F450 serves as the cheap testbed for ROS nodes, flight-stack changes, and RTK trials.

## Related repositories

- **CAD, PCB, and RF simulation files** — [km5es/Drone-Project-CAD](https://github.com/km5es/Drone-Project-CAD)
- **ROS nodes, SDR code, flight-path generator** — [km5es/Drone-Project-code](https://github.com/km5es/Drone-Project-code)
- **Project guide** — [krishnamakhija.gitbook.io/priam](https://krishnamakhija.gitbook.io/priam/)

## Credits

Several sub-assemblies and parts in the 3D models were obtained from [GrabCAD](https://grabcad.com/);
credit is due to their creators. None of this work is towards commercialisation or monetary profit.
Images on the page are illustrative renders, not photographs of the built hardware.

## License

MIT — see [LICENSE](LICENSE).
