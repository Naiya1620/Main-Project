mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',

    zoom: 9,
    center: listing.geometry.coordinates
});


const marker = new mapboxgl.Marker({ color: "red" })
    .setLngLat(listing.geometry.coordinates) //listing.geometry.coordinates
    .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups

        .setHTML(`<h4>${listing.title}</h4><p>Exact Location provide after booking</p>`))
    .addTo(map);