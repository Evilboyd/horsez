import React from 'react';
import { OpenSourceMap, OpenSourceMapProps, MapMarkerItem, createCustomMarkerIcon } from './OpenSourceMap';

export type { OpenSourceMapProps as GoogleMapContainerProps, MapMarkerItem };
export { createCustomMarkerIcon };

// 100% Open Source map container powered by Leaflet and OpenStreetMap
export const GoogleMapContainer: React.FC<OpenSourceMapProps> = (props) => {
  return <OpenSourceMap {...props} />;
};

export const hasValidGoogleMapsKey = false;
export const GOOGLE_MAPS_API_KEY = '';
export default GoogleMapContainer;
