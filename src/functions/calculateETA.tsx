const calculateETA = (directions: google.maps.DirectionsResult) => {
  //in seconds
  let duration = 0;
  for (let i = 0; i < directions.routes[0].legs.length; i++) {
    let leg = directions.routes[0].legs[i];
    if (leg && leg.duration && leg.duration.value !== undefined) {
      duration += leg.duration.value;
    } else {
      return "ETA Unknown";
    }
  }
  const currentTime = new Date();
  //getTime returns in milliseconds
  const eta = new Date(currentTime.getTime() + duration * 1000);
  return eta;
};
export default calculateETA;
