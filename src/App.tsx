import { useEffect, useState } from "react";
import {
  useJsApiLoader,
  GoogleMap,
  DirectionsRenderer,
  Marker,
} from "@react-google-maps/api";
import Header from "./components/Header";
import InputBar from "./components/InputBar";
import GasStationWidget from "./components/GasStationWidget";
import calculateRoute from "./functions/calculateRoute";
import calculateEmpty from "./functions/calculateEmpty.js";
import findGasStations from "./functions/findGasStations.js";
import distanceLatLngPts from "./functions/distanceLatLngPts.js";

//ISSUES:
//When the user updates the distance or origin or location the site does not work
//for instance changing the distance will work but will not reset the search radius
//leading the suboptimal results
function App() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_REACT_APP_API_KEY,
    libraries: ["places"],
  });

  if (!isLoaded) {
    return <p>Loading in Progress</p>;
  }
  return <AppLoaded />;
}

export default App;

function AppLoaded() {
  const [emptyPt, setEmptyPt] = useState<google.maps.LatLng | null>(null);
  const [search, setSearch] = useState(false);
  const [origin, setOrigin] = useState<google.maps.LatLng>(
    new google.maps.LatLng(0, 0)
  );
  const [mapOrigin, setMapOrigin] = useState<google.maps.LatLng>(
    new google.maps.LatLng(0, 0)
  );
  const [zoom, setZoom] = useState<number>(10);
  const [destination, setDestination] = useState<google.maps.LatLng>(
    new google.maps.LatLng(0, 0)
  );
  const [distance, setDistance] = useState(0);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [gasDirections, setGasDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [gasStations, setGasStations] = useState<
    google.maps.places.PlaceResult[] | null
  >([]);
  const [selectedGasStation, setSelectedGasStation] =
    useState<google.maps.places.PlaceResult | null>();
  const [searchOffset, setSearchOffset] = useState<number>(5000);

  //on search directions is set to null triggering the next useEffect
  useEffect(() => {
    if (search) {
      setDirections(null);
      setSelectedGasStation(null);
      setMapOrigin(origin);
    }
  }, [search]);

  //if not route yet, route is found otherwise the
  //location where gas will run out (minus 5km) is found
  useEffect(() => {
    if (directions === null) {
      calculateRoute(origin, destination, setDirections);
    } else {
      calculateEmpty(directions, setEmptyPt, distance, searchOffset);
    }
  }, [directions]);
  //on the emptyPt (location of gas being empty minus the searchOffset) being calculated
  //gasstations within the search radius are searched for, if non are found the serach radius
  // is incremented and the next useEffect is triggered
  useEffect(() => {
    if (emptyPt) {
      findGasStations(
        emptyPt,
        setMapOrigin,
        setZoom,
        searchOffset,
        setGasStations
      );
      console.log(gasStations);
      console.log(
        distanceLatLngPts(
          origin.lat(),
          origin.lng(),
          emptyPt.lat(),
          emptyPt.lng()
        )
      );
      if (
        distanceLatLngPts(
          origin.lat(),
          origin.lng(),
          emptyPt.lat(),
          emptyPt.lng()
        ) >= 5
      ) {
        setSearchOffset((prevOffset) => prevOffset + 5000);
      }
    }
  }, [emptyPt]);

  //the previous use effect will only change serach radius if there are no
  //gas stations within the search radius, once the searchOffset is
  //updated the empty point is recalculated (minus the new searchOffset - see
  //calculateEmpty function) which will again trigger the above useEffect.
  //Finding the gas stations is an iterative process until one within the range
  //and near the route is found.
  useEffect(() => {
    calculateEmpty(directions, setEmptyPt, distance, searchOffset);
  }, [searchOffset]);

  //when station directions are found they are shown

  useEffect(() => {
    if (
      selectedGasStation &&
      selectedGasStation.geometry &&
      selectedGasStation.geometry.location
    ) {
      calculateRoute(
        origin,
        new google.maps.LatLng({
          lat: selectedGasStation.geometry.location.lat(),
          lng: selectedGasStation.geometry.location.lng(),
        }),
        setGasDirections
      );
    } else {
      console.log("no station selected");
    }
  }, [selectedGasStation]);

  const handleStationChosen = () => {
    if (
      selectedGasStation &&
      selectedGasStation.geometry &&
      selectedGasStation.geometry.location
    ) {
      calculateRoute(
        origin,
        new google.maps.LatLng({
          lat: selectedGasStation.geometry.location.lat(),
          lng: selectedGasStation.geometry.location.lng(),
        }),
        setDirections
      );
    }
  };

  return (
    <>
      <Header></Header>
      <InputBar
        search={search}
        setOrigin={setOrigin}
        setDestination={setDestination}
        setDistance={setDistance}
        setSearch={setSearch}
        onClick={() => calculateRoute(origin, destination, setDirections)}
      ></InputBar>
      <div className="map-style">
        {search && gasStations && (
          <GoogleMap
            mapContainerClassName="map-style"
            center={mapOrigin}
            zoom={zoom}
          >
            {directions !== null && (
              <DirectionsRenderer directions={directions} />
            )}
            {gasStations &&
              gasStations?.length > 0 &&
              gasStations.map(
                (station, index) =>
                  station.geometry &&
                  station.geometry.location && (
                    <Marker
                      key={index}
                      position={{
                        lat: station.geometry.location.lat(),
                        lng: station.geometry.location.lng(),
                      }}
                      onClick={() => {
                        setSelectedGasStation(station);
                        if (station.geometry && station.geometry.location) {
                          setMapOrigin(
                            new google.maps.LatLng({
                              lat: station.geometry.location.lat(),
                              lng: station.geometry.location.lng(),
                            })
                          );
                        }
                      }}
                    />
                  )
              )}
            ;
          </GoogleMap>
        )}
        {selectedGasStation && (
          <GasStationWidget
            selectedStation={selectedGasStation}
            gasDirections={gasDirections}
            onClick={handleStationChosen}
          ></GasStationWidget>
        )}
      </div>
    </>
  );
}
//need to render a second map that gives the directions from
