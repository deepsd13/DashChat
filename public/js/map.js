mapboxgl.accessToken = 'pk.eyJ1IjoiZGVlcHNkIiwiYSI6ImNrNjhhNTB1NzAydm0zZ3Fqa2VtN3g0cW0ifQ.-wLk4cG0qCxsHpQbEEMDBg';

var {
    latitude,
    longitude
} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

var marker = new mapboxgl.Marker().setLngLat([longitude, latitude])

//adding map
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    center: [longitude, latitude], // starting position [lng, lat]
    zoom: 14 // starting zoom
});
//marking user's location
marker.addTo(map)

//removing the marker
document.querySelector('#map').addEventListener('click', () => {
    marker.remove()
})


//geolocation control
map.addControl(
    new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    })
);
//adding geocoder
map.addControl(
    new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
    }),
    'top-left'
);

//direction controls
map.addControl(
    new MapboxDirections({
        accessToken: mapboxgl.accessToken
    }),
    'top-left'
);

//fullscreen fuctionality
map.addControl(new mapboxgl.FullscreenControl());

//navigation controls
map.addControl(new mapboxgl.NavigationControl());

//changing map styles
var layerList = document.getElementById('menu');
var inputs = layerList.getElementsByTagName('input');

function switchLayer(layer) {
    var layerId = layer.target.id;
    map.setStyle('mapbox://styles/mapbox/' + layerId);
}

for (var i = 0; i < inputs.length; i++) {
    inputs[i].onclick = switchLayer;
}