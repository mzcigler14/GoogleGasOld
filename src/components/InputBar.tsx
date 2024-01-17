import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import NumberInput from "./NumberInput";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { useState } from "react";

interface props {
  search: boolean;
  setOrigin: React.Dispatch<React.SetStateAction<google.maps.LatLng>>;
  setDestination: React.Dispatch<React.SetStateAction<google.maps.LatLng>>;
  setDistance: React.Dispatch<React.SetStateAction<number>>;
  setSearch: React.Dispatch<React.SetStateAction<boolean>>;
  onClick: () => void;
}
const InputBar = ({
  search,
  setOrigin,
  setDestination,
  setDistance,
  setSearch,
  onClick,
}: props) => {
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete();
  const [origins, setOrigins] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [destinations, setDestinations] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const handleSuggestionsRequest = (
    input: HTMLInputElement,
    setAction: React.Dispatch<
      React.SetStateAction<google.maps.places.AutocompletePrediction[]>
    >
  ) => {
    if (search) {
      window.location.reload();
    }
    if (input) {
      setAction(data);
    }
  };

  const handleOriginChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setSearch(false);
    setValue(e.target.value);
    if (e.target instanceof HTMLInputElement && status === "OK") {
      handleSuggestionsRequest(e.target, setOrigins);
    }
  };

  const handleDestinationChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setSearch(false);
    setValue(e.target.value);
    if (e.target instanceof HTMLInputElement && status === "OK") {
      handleSuggestionsRequest(e.target, setDestinations);
    }
  };

  const handleSelect = async (
    setAction: React.Dispatch<React.SetStateAction<google.maps.LatLng>>,
    place: google.maps.places.AutocompletePrediction
  ) => {
    const geocoderRequest: google.maps.GeocoderRequest = {
      placeId: place.place_id,
    };
    const latlnggeo = await getGeocode(geocoderRequest);
    const latlng = await getLatLng(latlnggeo[0]);
    setAction(new google.maps.LatLng(latlng));
  };

  const handleFindGas = () => {
    setSearch(true);
    onClick();
  };
  return (
    <div className="input-bar">
      <Autocomplete
        disablePortal
        options={origins}
        getOptionLabel={(option) => option.description}
        sx={{ width: 200 }}
        onChange={(event, newValue) => {
          if (newValue) {
            handleSelect(setOrigin, newValue);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Origin"
            onChange={(e) => handleOriginChange(e)}
            disabled={!ready}
          />
        )}
      />
      <Autocomplete
        disablePortal
        options={destinations}
        getOptionLabel={(option) => option.description}
        sx={{ width: 200 }}
        onChange={(event, newValue) => {
          if (newValue) {
            handleSelect(setDestination, newValue);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Destination"
            onChange={(e) => handleDestinationChange(e)}
            disabled={!ready}
          />
        )}
      />
      <NumberInput setDistance={setDistance}></NumberInput>
      <div>
        <Button
          onClick={handleFindGas}
          style={{ height: "45px", fontSize: "1.25rem", fontWeight: "bold" }}
          variant="contained"
          size="large"
        >
          Find Gas
        </Button>
      </div>
    </div>
  );
};

export default InputBar;
