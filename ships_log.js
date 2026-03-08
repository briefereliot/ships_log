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
        this.element.classList.add('story-point');
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
            const currentLatlng = this.map.getCenter();
            const bounds = L.latLngBounds([currentLatlng, this.latlng]);
            const currentZoom = Math.ceil(this.map.getZoom());

            //zoom and pan to show old point and new point
            console.log(bounds);
            this.map.fitBounds(bounds, {
                padding: [50,50],
                animate: true,
                duration: 0.5,
                zoomSnap: 1
            })

            //zoom and pan to new point
            this.map.flyTo(this.latlng, currentZoom, {
                animate: true,
                duration: 0.5,
                zoomSnap: 1
            })
        }
        
    }
}

//Scrolling div for story points
class Log {
    constructor(parent, map) {
        this.parent = parent;
        this.map = map;
        this.element = document.createElement('div');
        this.element.classList.add('log')
        this.storyPoints = [];
        this.parent.appendChild(this.element);

        //Used for auto scrolling map location to storyPoints
        this.observer = new IntersectionObserver((entries, observer) => {
            this.#intersectionObserverCallBack(entries, observer);
        }, {
            root: this.parent,
            rootMargin: "0px 0px -95% 0px",
        })
    }

    addStoryPoint(storyPoint, i = undefined) {
        if(i) {
            storyPoint.element.dataset.index = i; //store the index of the StoryPoint object with its DOM element for use in event callbacks
            this.storyPoints.splice(i, 0, storyPoint);
            this.element.insertBefore(this.element.children[i], storyPoint.element)

            for (const point of this.storyPoints.slice(i+1)) { //update the indexes of every element after the inserted element
                point.element.dataset.index += 1;
            }
        } else {
            console.log(storyPoint);
            storyPoint.element.dataset.index = this.storyPoints.length; //store the index of the StoryPoint object with its DOM element for use in event callbacks
            this.storyPoints.push(storyPoint);
            this.element.appendChild(storyPoint.element);
            this.observer.observe(storyPoint.element);
        }
    }

    #intersectionObserverCallBack(entries, observer) {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                let index = entry.target.dataset.index; //Retrieve the corresponding StoryPoint object index from the DOM element
                this.storyPoints[index].select(); //Select and scroll to the corresponding StoryPoint on the map
                break;
            }
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

const log = new Log(testLog, testMap);
var storyPoints = []; 
loadStoryPoints(log);