const { JSDOM } = require("jsdom");
const fs = require("fs");

const html = fs.readFileSync("c:/AGENTIC_AI_VESSEL_RTS/prototype-mvp/public/index.html", "utf8");
const js = fs.readFileSync("c:/AGENTIC_AI_VESSEL_RTS/prototype-mvp/public/js/app.js", "utf8");

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable"
});

// Mock Leaflet
dom.window.L = {
  map: () => ({
    setView: () => ({}),
    addTo: () => ({}),
    on: () => ({}),
    addLayer: () => ({}),
    removeLayer: () => ({}),
    invalidateSize: () => ({}),
    fitBounds: () => ({})
  }),
  tileLayer: () => ({
    addTo: () => ({})
  }),
  marker: () => ({
    addTo: () => ({}),
    bindTooltip: () => ({})
  }),
  polygon: () => ({
    addTo: () => ({}),
    getBounds: () => ({ pad: () => ({}) })
  }),
  circle: () => ({
    addTo: () => ({})
  }),
  polyline: () => ({
    addTo: () => ({})
  }),
  icon: () => ({}),
  divIcon: () => ({}),
  FeatureGroup: function() { return { addTo: () => ({}), addLayer: () => ({}), clearLayers: () => ({}) }; },
  Control: { Draw: function() { return { enable: () => ({}), disable: () => ({}) }; } },
  Draw: { Event: { CREATED: 'draw:created' }, Polyline: function() {} }
};

dom.window.eval(js);

console.log("No global JS errors if it reaches here.");
