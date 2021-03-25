mapboxgl.accessToken = 'pk.eyJ1IjoibXNwYXJrczcxNCIsImEiOiJjazZsZjl0aXAwYmMzM21uMHpmNjcxMzFoIn0.yMKMcXRxt0QzELn7THF_8g';

// we want to return to this point and zoom level after the user interacts
// with the map, so store them in variables
var initialCenterPoint = [-73.9600338572175, 40.683099860943685]
var initialZoom = 10.1

var defaultText = '<p> Click on a location for more information on hours, digital ordering, and contact information. </p> <p>Our partner pantries serve food insufficient clients regardless of their race, faith, ethnicity, sexual identity, or gender.</p>'
$('#feature-info').html(defaultText)

// create an object to hold the initialization options for a mapboxGL map
var initOptions = {
  container: 'map-container', // put the map in this container
  style: 'mapbox://styles/mapbox/light-v10', // use this basemap
  center: initialCenterPoint, // initial view center
  zoom: initialZoom, // initial view zoom level (0-18)
}

// create the new map
var map = new mapboxgl.Map(initOptions);

// add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());


// wait for the initial style to Load
map.on('style.load', function() {
  //add a layer for your custom source//
  map.addSource('NTA', {
    type:'geojson',
    data:'data/NTA.geojson',
  });

  // let's make sure the source got added by logging the current map state to the console
  console.log(map.getStyle().sources)


  // add a layer for our custom source
  // Have to include the `stops` key and you can't use the value `null` as one of the stops. Need to use all one type of
  // value, in this case strings.
  map.addLayer({
    id: 'fill-NTA',
    type: 'fill',
    source: 'NTA',
    paint: {
      'fill-color': {
        type: 'categorical',
        property: 'ntacode',
        stops: [
          ["ntacode", "#f00"],
          ["ntaname", "#0f0"],
          ["Neighborhood Park", "#00f"]
        ]
      }
    }
  })

  // add an empty data source, which we will use to highlight the lot the user is hovering over
  map.addSource('highlight-feature', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })

  // add a layer for the highlighted lot
  map.addLayer({
    id: 'highlight-line',
    type: 'line',
    source: 'highlight-feature',
    paint: {
      'line-width': 2,
      'line-opacity': 0.9,
      'line-color': 'white',
    }
  });

 //iterate over each object in data
// partnerData.forEach(function(manuelEntry){
//     //for each object in the data, add a marker to the map with a popup
//     new mapboxgl.Marker()
//       .setLngLat([manuelEntry.longitude, manuelEntry.latitude])
//       .setPopup(new mapboxgl.Popup({ offset: 25})//add popups
//         .set HTML '${manuelEntry.name}' </a>
//       )
//   .addTo(map);
//   })

  // listen for the mouse moving over the map and react when the cursor is over our data

  map.on('mousemove', function (e) {
    // query for the features under the mouse, but only in the lots layer
    var features = map.queryRenderedFeatures(e.point, {
        layers: ['fill-NTA'],
    });

    // if the mouse pointer is over a feature on our layer of interest
    // take the data for that feature and display it in the sidebar
    if (features.length > 0) {
      map.getCanvas().style.cursor = 'pointer';  // make the cursor a pointer

      var hoveredFeature = features[0]
      var featureInfo = `
        <p><strong> NTA code :</strong> ${hoveredFeature.properties.ntacode}</p>
        <p><strong> Neighborhood:</strong> ${hoveredFeature.properties.ntaname}</p>
        <p><strong> Borough:</strong> ${hoveredFeature.properties.boro_name}</p>
      `
      $('#feature-info').html(featureInfo)

      // set this lot's polygon feature as the data for the highlight source
      map.getSource('highlight-feature').setData(hoveredFeature.geometry);
    } else {
      // if there is no feature under the mouse, reset things:
      map.getCanvas().style.cursor = 'default'; // make the cursor default

      // reset the highlight source to an empty featurecollection
      map.getSource('highlight-feature').setData({
        type: 'FeatureCollection',
        features: []
      });

      // reset the default message
      $('#feature-info').html(defaultText)
    }
  })

})
