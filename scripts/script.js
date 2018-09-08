function initAutocomplete() {
  // object for current position
  // var coords = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

  // drawing initial map
  var map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 49.2606, lng: 123.2460 },
    zoom: 13,
    mapTypeId: 'roadmap'
  });

  _currentLocation(map);

  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function () {
    searchBox.setBounds(map.getBounds());
  });

  var markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function () {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function (marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function (place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
      var icon = {
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

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });

  // load datasets
  $ .getJSON("./datasets/collisions-1.json"), function( data ) {
    console.log("in get JSON");
    
    _loadDatasets(map , data);
  }
}

function _currentLocation(map) {
  console.log("currentlocation");
  // get current location: https://developers.google.com/maps/documentation/javascript/geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      // set a marker 
      var currentLocationMarker = new google.maps.Marker({ position: pos, map: map });

      /*
      // set an info window
      infoWindow = new google.maps.InfoWindow;

      infoWindow.setPosition(pos);
      infoWindow.setContent('Current Location');
      infoWindow.open(map);
      */

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

function _loadDatasets(map, data) {
  console.log("loadDataset");
  function _getJSONmarkers() {
    let dataset =
    [
      {
        "": 5,
        "covId": 6,
        "collisionTimeRange": "21:00-23:59",
        "collisionDate": "2008-01-05",
        "modes": "Veh-Ped",
        "injuryType": "Minor",
        "age": "20-29",
        "gender": "F",
        "lat": 49.27127290154269,
        "lon": -123.18256221412054
      },
      {
        "": 6,
        "covId": 7,
        "collisionTimeRange": "21:00-23:59",
        "collisionDate": "2008-01-02",
        "modes": "Single Cyl",
        "injuryType": "Minor",
        "age": "30-39",
        "gender": "M",
        "lat": 49.270817750214874,
        "lon": -123.11494500174301
      }
    ]
    return dataset;
  }

  // load JSON data
  // const collisions = _getJSONmarkers();

  // initialize JSON markers
  for (collision of collisions) {
    let marker = new google.maps.Marker({
      map: map,
      id: collision.covId,
      position: new google.maps.LatLng(collision.lat, collision.lon)
    })
  }


}