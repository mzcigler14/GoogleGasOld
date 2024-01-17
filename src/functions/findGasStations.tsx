const findGasStations = (
  emptyPt: google.maps.LatLng,
  setMapOrigin: React.Dispatch<React.SetStateAction<google.maps.LatLng>>,
  setZoom: React.Dispatch<React.SetStateAction<number>>,
  searchOffset: number,
  setGasStations: React.Dispatch<
    React.SetStateAction<google.maps.places.PlaceResult[] | null>
  >
) => {
  const placesService = new google.maps.places.PlacesService(
    document.createElement("div")
  );
  if (emptyPt) {
    setMapOrigin(emptyPt);
    const zoomLevel = Math.round(14 - Math.log(searchOffset / 500) / Math.LN2);
    setZoom(zoomLevel);
    const request = {
      location: emptyPt, //emptyPt keeps continuing from pt of empty to origin until stations are found
      radius: 5000,
      type: "gas_station",
    };

    placesService.nearbySearch(request, (results, status) => {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        setGasStations((prevResults) =>
          prevResults
            ? prevResults.concat(results as google.maps.places.PlaceResult[])
            : []
        );
      } else {
        console.error("Error fetching gas stations:", status);
        return null;
      }
    });
  } else {
    return null;
  }
};

export default findGasStations;
