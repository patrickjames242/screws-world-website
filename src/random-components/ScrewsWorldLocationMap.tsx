import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoicGF0cmlja2hhbm5hMjQyIiwiYSI6ImNqcnh2eWVrczBydGo0OWx2dDUyYjhvNnMifQ.SGbGDXppFmFkdUnBxIyoqA';

export default function ScrewsWorldLocationMap(){

    const mapDivID = "ScrewsWorldLocationMap";
    const mapDivRef = useRef<HTMLDivElement>(null);

    // map is loaded when its section is actually scrolled into view because loading the map is expensive and slows down the page while it is loading
    useEffect(() => {

        // we display the map immediately if the browser doesn't support the intersection api
        if ('IntersectionObserver' in window === false) {
            displayMapOnScreen();
            return;
        }

        let observer = new IntersectionObserver(intersectionOccured)

        function displayMapOnScreen() {
            const center = { lon: -77.339006, lat: 25.052057 };
            const map = new mapboxgl.Map({
                container: mapDivID,
                style: 'mapbox://styles/patrickhanna242/cjs0x6hqx0co31fmqmxjluf1w',
                center: center,
                zoom: 14.5,
            });
            new mapboxgl.Marker({ color: "#0470d9" }).setLngLat(center).addTo(map);
        }

        function intersectionOccured(entries: IntersectionObserverEntry[]) {
            const entry = entries[0];
            // testing for the isIntersecting property because some older browsers didn't implement it
            if ('isIntersecting' in entry && entry.isIntersecting === false) { return; }
            displayMapOnScreen();
            observer.disconnect();
        }

        if (mapDivRef.current) {
            observer.observe(mapDivRef.current);
        }

        return () => observer.disconnect();

    }, []);

    return <div id={mapDivID} ref={mapDivRef} className="map"/>
}

