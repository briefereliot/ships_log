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
}

loadBoatPath();

class StoryPoint {
    constructor(parent, map, params={}) {
        this.parent = parent;
        this.map = map;
        this.text = params.text;
        this.latlng = params.latlng;
        this.date = params.date;
        this.title = params.title;

        //Create text elements
        this.element = document.createElement('div');
        this.heading = document.createElement('h2');
        this.heading.textContent = this.title;
        this.body = document.createElement('p');
        this.body.textContent = this.text;
        this.element.appendChild(this.heading);
        this.element.appendChild(this.body);
        this.parent.appendChild(this.element);

        this.marker = undefined;
        //Create map elements
        if(this.latlng) {
            this.marker = L.circleMarker(this.latlng, {
            color: 'red',
            fillOpacity: 0,
            radius: 4,
            weight: 3
        }).addTo(this.map);
        }
    }

    select() {
        const selectedElements = document.querySelectorAll('.selected');

        selectedElements.forEach(element => {
            element.classList.remove('selected');
        });

        this.marker._path.classList.add('selected');

        this.element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            container: 'nearest'
        })

        if(this.latlng) {
            this.map.panTo(this.latlng);
        }
        
    }
}

var testLog = document.getElementById("log");


async function loadStoryPoints(callback) {
    const pinsArray = await loadArrayFromJsonFile('2025_pins.json');
    var output = [];
    for(var i = 0; i < pinsArray.length; i++){
        output.push(new StoryPoint(testLog, testMap, {
            latlng: pinsArray[i],
            title: `Test Entry ${i}`,
            text: "I ate a lot of good food. It was yummy. yada yada yada yada yada yada yada yada yada yada yada yada yada yada yada"
        }));
    }
    return output;
}

var storyPoints = []; 
loadStoryPoints().then((result) => {
    storyPoints = result;
    for(let i = 0; i < storyPoints.length; i++) {
        setTimeout(() => {
            console.log(i);
            console.log(storyPoints[i]);
            storyPoints[i].select();
        }, i*2000);
    }
});

/*const testStoryPoint = new StoryPoint(testLog, testMap, {
    latlng: {
        lat: 48.748945343432936,
        lng: -122.8480911254883
        },
    title: "Test Entry",
    text: "I ate a lot of good food. It was yummy. yada yada yada yada yada yada yada yada yada yada yada yada yada yada yada"

})

testStoryPoint.select();*/