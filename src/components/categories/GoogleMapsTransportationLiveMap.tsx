import React from 'react';
import { TransportationLiveMap, TransportationLiveMapProps } from './TransportationLiveMap';

export type { TransportationLiveMapProps };
export const GoogleMapsTransportationLiveMap: React.FC<TransportationLiveMapProps> = (props) => {
  return <TransportationLiveMap {...props} />;
};

export const hasValidGoogleMapsApiKey = false;
export default GoogleMapsTransportationLiveMap;
