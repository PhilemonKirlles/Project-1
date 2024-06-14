
//stores searches so it can be loaded on to page and localstorage
var searchHistory = [];

//event listener looks for submti to capture zip code info for api's
document.querySelector('#search-form').addEventListener
    ('submit', getZipCode);
var searchForm = document.getElementById('search-form');

//displays footer upon click to see history and other information about site
document.querySelector('#display-footer-btn').addEventListener('click', displayFooter);
var footerDisplay = 0;
function displayFooter() {
    var footerNav = document.getElementById('footer-nav');
    if (footerDisplay == 0) {
        footerNav.classList.remove("hide");
        footerDisplay = 1;
        console.log("display footer")
    } else {
        footerNav.classList.add("hide");
        footerDisplay = 0;
        console.log("hide footer")
    }

  }
    
//this function is the main function for fetch commands to pull weather and marine info
function getZipCode(event){

    var lat;
    var lon;

    
    //get zip from input
    var zip = document.querySelector('.input').value;
    document.querySelector('.input').value = "";
    console.log(zip);

  //   if (isNaN(zip) || !((/^[0-9]{5}$/.test(zip)))){
  //     var errorMsg = document.createElement('div');
  //     errorMsg.classList.add("error");
  //     errorMsg.innerText = "Please enter a 5 digit zip code!";
  //     searchForm.appendChild(errorMsg);
  //     zip = "";
  // } 

    if(zip){
        zip = zip.replace(/\D/g, '');
        console.log(zip);
    }

    

    //make request using fetch command
    fetch("https://api.weatherbit.io/v2.0/current?postal_code=" + zip + "&key=b7e8dc3394ab4eb1893a34bec589cea1")
    .then(response => response.json())
    .then(data => {

        //console.log(data);
        //the following varibles below are created to cpature the api endpoints we needed to display on the page
        var airTemp = data.data.map(current => {
            return ` ${current.app_temp}`;
        }).join("");
        document.querySelector("#air-temp").insertAdjacentHTML("afterbegin","Air Temperature: " + (Math.floor((airTemp * 1.8) + 32)) + " F");


        var weatherCond = data.data.map(current => {
            return `${current.weather.description}`;            
        }).join("");
       // console.log(data.data);        
        document.querySelector("#weather-condition").insertAdjacentHTML("afterbegin", "Weather Conditions: " + weatherCond);

        var windSpeed = data.data.map(current => {
            return `${current.wind_spd}`;
        }).join("");
        var windDirection = data.data.map(current => {
            return `${current.wind_cdir}`;
        }).join("");
        document.querySelector("#wind-speed").insertAdjacentHTML("afterbegin", "Wind Speed: " + windSpeed + " mph " + windDirection);

        var uvIndex = data.data.map(current => {
            return `${current.uv}`;
        }).join("");
        document.querySelector("#UV-index").insertAdjacentHTML("afterbegin", "UV Index: " + uvIndex);

        var airQuality = data.data.map(current => {
            return `${current.aqi}`;
        }).join("");
        document.querySelector("#pollution").insertAdjacentHTML("afterbegin", "Air Quality: " + airQuality);

        var cityName = data.data.map(current => {
            return `${current.city_name}`;
        }).join("");
        document.querySelector(".city-name").insertAdjacentText("afterbegin","Current weather for "  + cityName);

       //console.log(cityName);
        //the lon and lat were used to capture for the marine api as it does not work with zip code
       lon = data.data.map(current => {
           return `${current.lon}`;
       }).join("");

       

       lat = data.data.map((current => {
           return`${current.lat}`
       })).join("");

       //marine api used to fetch water information for other activiteis besides sitting on the beach, ex surfing, sailing, fishing
       fetch("https://api.worldweatheronline.com/premium/v1/marine.ashx?key=ba158bbb822240ee9b1135808241406&format=JSON&&tide-yes&q=" + lat + "," + lon)
        .then(response => response.json())
        .then(data => {

            console.log(data);

            var waterTemp = data.data.weather.map(weather => {
                return `${JSON.stringify(weather.hourly[0].waterTemp_F)}`
            }).join("");
            document.querySelector("#water-temp").insertAdjacentText("afterbegin","Water Temperature: "  + waterTemp[1] + waterTemp[2] + " F");
            
            var waveHeight = data.data.weather.map(weather => {
                return `${JSON.stringify(weather.hourly[0].swellHeight_ft)}`
            }).join("");
            document.querySelector("#wave-height").insertAdjacentText("afterbegin","Wave Height: "  + waveHeight[1] + waveHeight[2] + waveHeight[3] + " ft");
            

            var waveDegree = data.data.weather.map(weather => {
                return `${JSON.stringify(weather.hourly[0].swellDir)}`
            }).join("");
            document.querySelector("#wave-degree").insertAdjacentText("afterbegin","Wave Degrees: "  + waveDegree[1] + waveDegree[2] + waveDegree[3]);
            

            var waveDir = data.data.weather.map(weather => {
                return `${JSON.stringify(weather.hourly[0].swellDir16Point)}`
            }).join("");
            document.querySelector("#wave-direction").insertAdjacentText("afterbegin","Wave Direction: "  + waveDir[1]);

            var visibility = data.data.weather.map(weather => {
                return `${JSON.stringify(weather.hourly[0].visibilityMiles)}`
            }).join("");
            document.querySelector("#visibility").insertAdjacentText("afterbegin","Visibility: "  + visibility[1] + " miles");
            

           
        });

       // save search history
        saveStoreArray(zip, cityName);
        
    });

    
    //this api is for capturing the alerts in the area that you are searching in case of severe weather
    fetch("https://api.weatherbit.io/v2.0/alerts?postal_code=" + zip + "&key=23f4eb9104a3417ebae0fd654b5b8faa")
    .then(response => {
        if(!response.ok) {
            throw Error("ERROR");
        }

        return response.json();
    })
    .then(data => {
        //console.log(data);
        //this variable is for the alerts endpoint
        var weatherAlerts = data.alerts
        .map(alerts => {
            return `<p> ${alerts.description}</p>`;
        })
        .join("");

        if(Object.keys(data.alerts).length) {
            document.querySelector(".alert-text").insertAdjacentHTML("afterbegin", "Current Alerts: " + weatherAlerts);
            
        }else {
            weatherAlerts = "No weather worries today!";
            document.querySelector(".alert-text").insertAdjacentHTML("afterbegin", weatherAlerts);
            
        }
        
    })
    .catch(error => {
        console.log(error);
    });

    

    var submitBtn = document.querySelector("#search-form");

    function reload() {

    reload = location.reload();
   
    };

    submitBtn.addEventListener("click", reload, false);  

    
    event.preventDefault();
    
    
     
}; //end get zip code function
// map////////////////////////
//this function is for the map feature, that only works on localhost currently but not when deployed
function initAutocomplete() {
    const map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 41.3146671, lng: -70.6381596 },
      zoom: 13,
      mapTypeId: "roadmap",
    });
    //search box and linking
    const input = document.getElementById("location");
    const searchBox = new google.maps.places.SearchBox(input);
  
    // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    
    map.addListener("bounds_changed", () => {
      searchBox.setBounds(map.getBounds());
    });
  
    let markers = [];
  
    // Listen for the event 
    searchBox.addListener("places_changed", () => {
      const places = searchBox.getPlaces();
  
      if (places.length == 0) {
        return;
      }
  
      // Clear out marker
      markers.forEach((marker) => {
        marker.setMap(null);
      });
      markers = [];
  
    
      const bounds = new google.maps.LatLngBounds();
  
      places.forEach((place) => {
        if (!place.geometry || !place.geometry.location) {
          console.log("Returned place contains no geometry");
          return;
        }
  
        const icon = {
          url: place.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25),
        };
  
      
        markers.push(
          new google.maps.Marker({
            map,
            icon,
            title: place.name,
            position: place.geometry.location,
          })
        );
        if (place.geometry.viewport) {
          // geocodes viewport
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      map.fitBounds(bounds);
    });
  }
  
  window.initAutocomplete = initAutocomplete;

// map


// functions to save and load search history
function saveStoreArray(zip, cityName) {
    
    searchHistory.push({city: cityName, zipCode: zip});
    console.log(searchHistory);

    if (searchHistory.length > 4) {
        searchHistory.shift();
    }

    localStorage.setItem("history", JSON.stringify(searchHistory));
}

  //this function is used to load the history of searches on page for user. 
  function loadHistory() {
    var historyEl = document.getElementById('history-ul');
    var savedSearch = localStorage.getItem("history");

    if (!savedSearch) { // if no saved searches then do nothing
      return false;
    }

    console.log("Saved locations found!");
  
    // parse into array of objects
    searchHistory = JSON.parse(savedSearch);
    console.log(savedSearch);
    // loop through array 
    for (var i = 0; i < searchHistory.length; i++) {
      // create list elements in footer
      var listItem = document.createElement("li");
      var cityHistory = searchHistory[i].city;
      var zipHistory = searchHistory[i].zipCode;
      listItem.innerText = cityHistory + " (" + zipHistory + ")";
      historyEl.appendChild(listItem);
        // add to searchHistory array
        //searchHistory.push(savedSearch[i]);
    }
  };


loadHistory();
