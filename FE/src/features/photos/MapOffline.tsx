import { Icon } from '../../shared/ui/Icon'

/** Le tessere di OpenStreetMap non si salvano (regole d'uso): offline la mappa lascia il posto a questo (D-63). */
export function MapOffline() {
  return <p className="map-offline" role="status"><Icon name="cloud_off" />La mappa serve la rete</p>
}
