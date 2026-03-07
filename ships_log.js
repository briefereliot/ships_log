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

window.L_DISABLE_3D = true;
const testMap = L.map('map').setView([48.5023, -122.8463], 11);
const tiles = L.tileLayer('./tiles/{z}/{x}/{y}.png', {
    maxZoom: 13,
    minZoom: 6
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
    constructor(log, params={}) {
        this.log = log;
        this.parent = log.element;
        this.map = log.map;
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
        this.log.addStoryPoint(this);

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

        this.parent.scrollTo({
            top: this.element.offsetTop - this.parent.offsetTop,
            behavior: 'smooth'
        });

        if(this.latlng) {
            this.map.panTo(this.latlng);
        }
        
    }
}

//Scrolling div for story points
class Log {
    constructor(parent, map, scrollResolution = 10) {
        this.parent = parent;
        this.map = map;
        this.scrollResolution = scrollResolution;
        this.element = document.createElement('div');
        this.element.classList.add('log')
        this.storyPoints = [];
        this.scrollMap = [];
        this.parent.appendChild(this.element);
        this.parent.addEventListener("scroll", () => {
            this.#scrollEventCallback();
        });
    }

    addStoryPoint(storyPoint, index = undefined) {
        if(index) {
            this.storyPoints.splice(index, 0, storyPoint);
            this.element.insertBefore(this.element.children[index], storyPoint.element)
        } else {
            this.storyPoints.push(storyPoint);
            this.element.appendChild(storyPoint.element);
        }

        this.#computeScrollMap()
    }

    //relates scroll position to map position
    //scroll map is an array of length parentHeight / scrollResolution [storyPoint, storyPoint, ...]
    #computeScrollMap() {
        const totalHeight = this.element.scrollHeight;
        console.log(totalHeight);
        this.scrollMap = new Array(Math.floor(totalHeight / this.scrollResolution)).fill(undefined);
        for(let i = 0; i < this.storyPoints.length; i++) {
            const topIndex = Math.floor(this.storyPoints[i].element.offsetTop / this.scrollResolution);
            const bottomIndex = Math.floor((this.storyPoints[i].element.offsetTop + this.storyPoints[i].element.offsetHeight) / this.scrollResolution);
            console.log([topIndex, bottomIndex]);
            this.scrollMap.fill(this.storyPoints[i], topIndex, bottomIndex);
        }
    }

    #scrollEventCallback() {
        const i = Math.floor(this.parent.scrollTop / this.scrollResolution);
        const storyPoint = this.scrollMap[i];
        console.log(this.scrollMap);
        if(storyPoint) {
            storyPoint.select();
        }
    }
}

var testLog = document.getElementById("log");


async function loadStoryPoints(log) {
    const pinsArray = await loadArrayFromJsonFile('storyPoints.json');
    var output = [];
    for(var i = 0; i < pinsArray.length; i++){
        output.push(new StoryPoint(log, {
            latlng: pinsArray[i].latlng,
            title: pinsArray[i].title,
            text: pinsArray[i].text
        }));
    }
    return output;
}

const log = new Log(testLog, testMap, 10);
var storyPoints = []; 
loadStoryPoints(log).then((result) => {
    /*storyPoints = result;
    for(let i = 0; i < storyPoints.length; i++) {
        log.addStoryPoint(storyPoints[i]);
        /*setTimeout(() => {
            console.log(i);
            console.log(storyPoints[i]);
            storyPoints[i].select();
        }, i*2000);
    }*/
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