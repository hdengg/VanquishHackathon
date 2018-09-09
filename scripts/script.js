
var map;

function initAutocomplete() {
  // object for current position
  // let coords = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  // drawing initial map
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 49.2606, lng: 123.2460 },
    zoom: 12,
    mapTypeId: 'roadmap'
  });

  var trafficLayer = new google.maps.TrafficLayer();
  trafficLayer.setMap(map);

  _currentLocation(map);
  _searchBox(map);
  // _markerMap(map, '/datasets/collisions-2.json');
  // _heatMap(map, '/datasets/pedestrian_lat_lon.json');
  // _weightedHeatMap(map, '/datasets/detailed_pedestrian_cyclist.json');
  // _marketInfoMap(map, '/datasets/hospital_injuries_all.json');
}

function _searchBox(map) {
  // Create the search box and link it to the UI element.
  let input = document.getElementById('pac-input');
  let searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  let searchBoxLatLon = [];

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function () {
    searchBox.setBounds(map.getBounds());
  });

  let markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function () {
    let places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function (marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    let bounds = new google.maps.LatLngBounds();

    places.forEach(function (place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
      let icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      markers.push(new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      }));

      if (place.geometry.location) {
        searchBoxLatLon = place.geometry.location;
        _radius(map, searchBoxLatLon, '/datasets/final_version_dataset.json');
      }

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
    map.setZoom(13);
  });
  // _markerMap(map, '/datasets/collisions-2.json');
  // _heatMap(map, '/datasets/pedestrian_lat_lon.json');
  // _weightedHeatMap(map, '/datasets/detailed_pedestrian_cyclist.json');
}

function _currentLocation(map) {
  // get current location: https://developers.google.com/maps/documentation/javascript/geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      let pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      // set a marker 
      // let currentLocationMarker = new google.maps.Marker({ position: pos, map: map });


      // set an info window
      infoWindow = new google.maps.InfoWindow;

      //infoWindow.setPosition(pos);
      //infoWindow.setContent('Current Location');
      //infoWindow.open(map);


      map.setCenter(pos);
    }, function () {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
      'Error: The Geolocation service failed.' :
      'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
  }
}

function _markerMap(map, dataset) {
  // load JSON data
  $.getJSON(dataset, function (data) {
    for (collision of data) {
      let marker = new google.maps.Marker({
        map: map,
        id: collision.covId,
        position: new google.maps.LatLng(collision.lat, collision.lon)
      })
    }
  });
}

// deprecated method

// function _markerMapFilter(dataset) {
//     // load JSON data
//     for (collision of dataset) {
//         console.log(collision);
//         let marker = new google.maps.Marker({
//             map: map,
//             id: collision.covId,
//             position: new google.maps.LatLng(collision.lat, collision.lon)
//         })
//     }
// }

function _marketInfoMap(map, dataset) {
  // load JSON data
  $.getJSON(dataset, function (data) {
    for (collision of data) {
      let pos = {
        lat: collision.lat,
        lng: collision.lon
      };
      let marker = new google.maps.Marker({
        map: map,
        id: collision.covId,
        position: new google.maps.LatLng(collision.lat, collision.lon)
      })

      // set an info window
      let content = `incident modes: ${collision.modes}. age: ${collision.age}`
      infoWindow = new google.maps.InfoWindow;

      infoWindow.setPosition(pos);
      infoWindow.setContent(content);
      infoWindow.open(map);
    }
  });
}

function _createCircle(map, center) {
  // let center = {lat: 37.090, lng: -95.712};
  var cityCircle = new google.maps.Circle({
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35,
    map: map,
    center: center,
    radius: 1000,
    zoom: 18
  });
}

// https://developers.google.com/maps/documentation/javascript/heatmaplayer
function _heatMap(map, dataset) {
  let heatMapData = [];
  $.getJSON(dataset, function (data) {
    for (coordinate of data) {
      heatMapData.push(

        // new google.maps.LatLng(37.785, -122.435)
        { location: new google.maps.LatLng(coordinate.lat, coordinate.lon), weight: coordinate.injuryType }
      )
      // {location: new google.maps.LatLng(37.782, -122.447), weight: 0.5}
    }
    let gradient = [
      'rgba(0, 255, 255, 0)',
      'rgba(0, 255, 255, 1)',
      'rgba(0, 191, 255, 1)',
      'rgba(0, 127, 255, 1)',
      'rgba(0, 63, 255, 1)',
      'rgba(0, 0, 255, 1)',
      'rgba(0, 0, 223, 1)',
      'rgba(0, 0, 191, 1)',
      'rgba(0, 0, 159, 1)',
      'rgba(0, 0, 127, 1)',
      'rgba(63, 0, 91, 1)',
      'rgba(127, 0, 63, 1)',
      'rgba(191, 0, 31, 1)',
      'rgba(255, 0, 0, 1)'
    ];

    let heatmap = new google.maps.visualization.HeatmapLayer({
      data: heatMapData,
      radius: 28,
      opacity: .5,
      gradient: gradient
    });
    heatmap.setMap(map);
  })
}

function _cluster(map, dataset) {
  // Create an array of alphabetical characters used to label the markers.
  //var labels = [];
  var locations = [];
  // let realLocations;
  $.getJSON(dataset, function (data) {
    for (incident of data) {
      locations.push({ lat: incident.lat, lng: incident.lon });
    }

    // The map() method here has nothing to do with the Google Maps API.
    var markers = locations.map(function (location, i) {
      return new google.maps.Marker({
        position: location,
        //label: labels[i % labels.length]
      });
    });

    // Add a marker clusterer to manage the markers.
    var markerCluster = new MarkerClusterer(map, markers,
      { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });

  });
}
function _heatMapFilter(dataset) {
  let heatMapData = [];
  for (coordinate of dataset) {
    heatMapData.push(
      // new google.maps.LatLng(37.785, -122.435)
      { location: new google.maps.LatLng(coordinate.lat, coordinate.lon), weight: coordinate.injuryType }
    )
    // {location: new google.maps.LatLng(37.782, -122.447), weight: 0.5}
  }
  let gradient = [
    'rgba(0, 255, 255, 0)',
    'rgba(0, 255, 255, 1)',
    'rgba(0, 191, 255, 1)',
    'rgba(0, 127, 255, 1)',
    'rgba(0, 63, 255, 1)',
    'rgba(0, 0, 255, 1)',
    'rgba(0, 0, 223, 1)',
    'rgba(0, 0, 191, 1)',
    'rgba(0, 0, 159, 1)',
    'rgba(0, 0, 127, 1)',
    'rgba(63, 0, 91, 1)',
    'rgba(127, 0, 63, 1)',
    'rgba(191, 0, 31, 1)',
    'rgba(255, 0, 0, 1)'
  ];

  let heatmap = new google.maps.visualization.HeatmapLayer({
    data: heatMapData,
    radius: 28,
    opacity: .5,
    gradient: gradient
  });
  heatmap.setMap(map);
}

function _cluster(map, dataset) {
  // Create an array of alphabetical characters used to label the markers.
  //var labels = [];
  var locations = [];
  // let realLocations;
  $.getJSON(dataset, function (data) {
    for (incident of data) {
      locations.push({ lat: incident.lat, lng: incident.lon });
    }

    // The map() method here has nothing to do with the Google Maps API.
    var markers = locations.map(function (location, i) {
      return new google.maps.Marker({
        position: location,
        //label: labels[i % labels.length]
      });
    });

    // Add a marker clusterer to manage the markers.
    var markerCluster = new MarkerClusterer(map, markers,
      { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });

  });
}

function _cluster_filter(dataset) {
  // Create an array of alphabetical characters used to label the markers.
  //var labels = [];
  var locations = [];
  // let realLocations;
  for (collision of dataset) {
    locations.push({ lat: collision.lat, lng: collision.lon });
  }

  // The map() method here has nothing to do with the Google Maps API.
  var markers = locations.map(function (location, i) {
    return new google.maps.Marker({
      position: location,
      //label: labels[i % labels.length]
    });
  });

  // Add a marker clusterer to manage the markers.
  var markerCluster = new MarkerClusterer(map, markers,
    { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });

}

function _radius(map, searchBoxLatLon, dataset) {
  let search_area = [];

  console.log(searchBoxLatLon);
  // We create a circle to look within:
  if (searchBoxLatLon.length !== 0) {
    search_area = {
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      center: searchBoxLatLon,
      radius: 300
    };
  } else {
    return;
  }

  let circle = new google.maps.Circle(search_area);
  map.setCenter(searchBoxLatLon);

  $.getJSON(dataset, function (data) {
    for (coordinate of data) {

      let distance = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng({ lat: coordinate.lat, lng: coordinate.lon }), circle.center);
      if (distance < circle.radius) {
        let marker = new google.maps.Marker({
          map: map,
          id: coordinate.covId,
          position: new google.maps.LatLng(coordinate.lat, coordinate.lon),


        });

        let contentString = "injury type: " + coordinate.injury + ";  age: " + coordinate.age;
        var infowindow = new google.maps.InfoWindow({
          content: contentString
        });
        marker.addListener('click', function () {
          infowindow.open(map, marker);
        });
      }
    }
  })
}

async function _filter(query) {

  let data = await fetchAsync();
  let response = filter_arr(data, query);
  return response;

}

function filter_arr(arr, criteria) {
  return arr.filter(function (obj) {
    return Object.keys(criteria).every(function (c) {
      return obj[c] == criteria[c];
    });
  });
}

async function fetchAsync() {
    let response = await fetch('/datasets/final_version_dataset.json');
    let data = await response.json();
    return data;
}


// Form functions ===================================================

function submit() {
  document.body.classList.add('active')
  $("#map").show();
  $("#introForm").hide();
  $("#animation").hide();
  let query = _response();
  let response = _filter(query);
  response.then(function (result) {
    console.log("result" + result);
    _heatMapFilter(result);
  });

}

function _response() {
  let age = $("#age").val();
  let gender = $("#gender").val();
  let transportation = $("#transportation").val();
  let time = $("#time").val();
  let mapType = $("input[type=radio][name=mapType]:checked").val();
  let response = {
    age: age,
    gender: gender,
    transportation: transportation,
    time: time,
    // mapType: mapType
  }
  // console.log("response:" + response.mapType);
  return response;
}

// document.addEventListener('DOMContentLoaded', () => {
//   let radio =  $("input[type=radio][name=mapType]:checked");
//   checkRadioValue(radio);
//   $("input[type=radio][name=mapType]:checked").change(function () {
//     debugger;
//     checkRadioValue(radio);
//   })
// });

// function checkRadioValue(radio) {
//   if (radio.val() === 'marker') {
//     console.log("marker");

//   }
//   if (radio.val() === 'cluster') {
//     console.log("cluster");
//   }
//   if (radio.val() === 'heat') {
//     console.log("heat");
//   }
// }