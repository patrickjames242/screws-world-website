
import './ScrewsWorldLocationMap.scss';
import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import backToCenterIcon from './back-to-center-icon';
import { Optional } from 'jshelpers';
mapboxgl.accessToken = 'pk.eyJ1IjoicGF0cmlja2hhbm5hMjQyIiwiYSI6ImNqcnh2eWVrczBydGo0OWx2dDUyYjhvNnMifQ.SGbGDXppFmFkdUnBxIyoqA';

export default function ScrewsWorldLocationMap(){

    const mapDivID = "ScrewsWorldLocationMap-inner-map-div";
    const holderDivRef = useRef<HTMLDivElement>(null);
    const mapBoxMap = useRef<Optional<mapboxgl.Map>>(null);

    const centerCoordinate = { lon: -77.339006, lat: 25.052057 };
    const defaultZoom = 14.5;
    // map is loaded when its section is actually scrolled into view because loading the map is expensive and slows down the page while it is loading
    useEffect(() => {

        // we display the map immediately if the browser doesn't support the intersection api
        if ('IntersectionObserver' in window === false) {
            displayMapOnScreen();
            return;
        }

        let observer = new IntersectionObserver(intersectionOccured);

        function displayMapOnScreen() {
            
            const map = new mapboxgl.Map({
                container: mapDivID,
                style: 'mapbox://styles/patrickhanna242/cjs0x6hqx0co31fmqmxjluf1w',
                center: centerCoordinate,
                zoom: defaultZoom,
            });
            mapBoxMap.current = map;
            const marker = new mapboxgl.Marker({ color: "#0470d9" });
            
            marker.setLngLat(centerCoordinate).addTo(map);
            
        }

        function intersectionOccured(entries: IntersectionObserverEntry[]) {
            const entry = entries[0];
            // testing for the isIntersecting property because some older browsers didn't implement it
            if ('isIntersecting' in entry && entry.isIntersecting === false) { return; }
            displayMapOnScreen();
            observer.disconnect();
        }

        if (holderDivRef.current) {
            observer.observe(holderDivRef.current);
        }

        return () => { 
            observer.disconnect() 
        };

    }, [centerCoordinate]);

    function respondToCenterButtonClicked(){
        if (mapBoxMap.current == null){return;}
        mapBoxMap.current.easeTo({center: centerCoordinate, zoom: defaultZoom});
    }

    return <div ref={holderDivRef} className="ScrewsWorldLocationMap">
        <div id={mapDivID}/>
        <button onClick={respondToCenterButtonClicked} title="go back to center" className="back-to-center-button">{backToCenterIcon}</button>
    </div>
}

