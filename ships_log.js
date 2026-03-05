const testMap = L.map('map').setView([48.5023, -122.8463], 9);
const tiles = L.tileLayer('./tiles/{z}/{x}/{y}.png', {
    maxZoom: 12,
    minZoom: 7
}).addTo(testMap);

testMap.doubleClickZoom.disable();

const circle = L.circleMarker([48.5023, -122.8463], {
    color: 'red',
    fillOpacity: 0,
    radius: 4,
    weight: 3
}).addTo(testMap);

boatPath = L.polyline([], {
    color: 'red',
    weight: 1,
    dashArray: '4 4'
}).addTo(testMap);

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
    //remove last double click line
    boatPath.setLatLngs(boatPath.getLatLngs().slice(0, -2));
}

testMap.on('click', onMapClick);
testMap.on('dblclick', onMapDblClick)