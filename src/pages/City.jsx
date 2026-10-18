import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CityScene from '../city/CityScene';
import Landmarks from '../city/Landmarks';
import Traffic from '../city/Traffic';
import People from '../city/People';
import Scenic from '../city/Scenic';
import CameraRig, { rememberView } from '../city/CameraRig';
import { Loader, TitleCard, Corner, Directory, Hint, Entering } from '../city/Hud';
import { landmarkPositions } from '../city/layout';
import { placeById } from '../city/places';
import { preload } from '../routes';
import '../city/city.css';

const SPOTS = landmarkPositions();

/**
 * The home page: the town, and what is drawn over it.
 *
 * Choosing a building flies the camera to it, and when it arrives the
 * building is entered: every one has an inside.
 */
export default function City() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [focus, setFocus] = useState(null);
  const [entering, setEntering] = useState(null);

  useEffect(() => { document.title = 'Raymond Hughes · AI Engineer & Solutions Architect'; }, []);

  // The beat between landing and going in. Held so it can be called off:
  // choosing another building, or going back to the map, cancels it.
  const trip = useRef(null);
  const cancelTrip = () => { clearTimeout(trip.current); trip.current = null; setEntering(null); };
  useEffect(() => () => clearTimeout(trip.current), []);

  const select = useCallback((id) => {
    const p = placeById[id];
    if (!p) return;
    cancelTrip();
    preload(p.route);
    setFocus(id);
  }, []);

  const arrive = useCallback((id) => {
    const p = placeById[id];
    if (!p) return;
    setEntering(id);
    rememberView(id);
    trip.current = setTimeout(() => navigate(p.route), 850);
  }, [navigate]);

  const back = useCallback(() => { cancelTrip(); setFocus(null); }, []);

  return (
    <div className="city-root">
      <CityScene>
        <CameraRig focus={focus} onArrive={arrive} ready={ready} />
        <Landmarks onSelect={select} focus={focus} />
        <Traffic />
        <People landmarks={SPOTS} />
        <Scenic />
      </CityScene>

      <TitleCard />
      <Corner focus={focus} onBack={back} />
      <Directory focus={focus} onPick={select} />
      {ready && !focus && <Hint />}
      <Entering id={entering} />
      <Loader onDone={() => setReady(true)} />
    </div>
  );
}
