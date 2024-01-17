const calculateRoute = (
  origin: google.maps.LatLng,
  destination: google.maps.LatLng,
  setDirections: React.Dispatch<
    React.SetStateAction<google.maps.DirectionsResult | null>
  >
) => {
  const directionsService = new google.maps.DirectionsService();
  directionsService.route(
    {
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        setDirections(result);
        console.log(result);
      } else {
        console.error(`error fetching directions ${result}`);
      }
    }
  );
};
export default calculateRoute;
