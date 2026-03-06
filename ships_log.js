async function loadArrayFromJsonFile(filePath) {
  try {
    const response = await fetch(filePath);
    // The .json() method automatically parses the JSON content into a JS object/array
    const data = await response.json(); 
    
    if (Array.isArray(data)) {
      return data; // Returns the array
    } else {
      console.error("JSON file did not contain a root-level array.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching or parsing JSON:", error);
    return null;
  }
}

const testMap = L.map('map').setView([48.5023, -122.8463], 9);
const tiles = L.tileLayer('./tiles/{z}/{x}/{y}.png', {
    maxZoom: 12,
    minZoom: 7
}).addTo(testMap);

testMap.doubleClickZoom.disable();

boatPath = L.polyline([], {
    color: 'red',
    weight: 2,
    dashArray: '4 4'
}).addTo(testMap);

markerPoints = [];

function onMapClick(e) {
    /*L.circleMarker(e.latlng, {
        color: 'red',
        fillOpacity: 0,
        radius: 4,
        weight: 3
    }).addTo(testMap)*/
    boatPath.addLatLng(e.latlng);
}

function onMapDblClick(e) {
    L.circleMarker(e.latlng, {
        color: 'red',
        fillOpacity: 0,
        radius: 4,
        weight: 3
    }).addTo(testMap);
    markerPoints.push(e.latlng)
    console.log(markerPoints)
    //remove last double click line
    boatPath.setLatLngs(boatPath.getLatLngs().slice(0, -2));
    console.log(boatPath.getLatLngs());
}

testMap.on('click', onMapClick);
testMap.on('dblclick', onMapDblClick)

async function loadBoatPath() {
    const pathArray = await loadArrayFromJsonFile('2025_path.json');
    const pinsArray = await loadArrayFromJsonFile('2025_pins.json');

    const oldBoatPath = L.polyline(pathArray, {
        color: 'red',
        weight: 2,
        dashArray: '4 4'
    }).addTo(testMap);

    for(var i = 0; i < pinsArray.length; i++){
        L.circleMarker(pinsArray[i], {
            color: 'red',
            fillOpacity: 0,
            radius: 4,
            weight: 3
        }).addTo(testMap);
    }
}

loadBoatPath();
