import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

export default function CesiumGlobe({ onReady }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // កំណត់ Cesium Ion token (ឥតគិតថ្លៃ ត្រូវចុះឈ្មោះនៅ cesium.com)
    // ប្រសិនបើមិនមាន token វានឹងប្រើរូបភាពពី OpenStreetMap
    Cesium.Ion.defaultAccessToken = undefined;

    const viewer = new Cesium.Viewer(containerRef.current, {
      // ប្រើ OpenStreetMap ជាស្រទាប់មូលដ្ឋាន (ឥតគិតថ្លៃ)
      imageryProvider: new Cesium.OpenStreetMapImageryProvider({
        url: 'https://tile.openstreetmap.org/'
      }),
      terrainProvider: new Cesium.EllipsoidTerrainProvider(), // ដីសំប៉ែត
      baseLayerPicker: false,
      geocoder: false,        // យើងធ្វើស្វែងរកដោយខ្លួនឯង
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
    });

    // បង្វិលផែនដីដោយស្វ័យប្រវត្តិ
    viewer.scene.globe.enableLighting = true;
    viewer.clock.shouldAnimate = true;

    // លាក់ logo និងព័ត៌មានសិទ្ធិដែលមិនចាំបាច់
    viewer.cesiumWidget.creditContainer.style.display = 'none';

    viewerRef.current = viewer;
    onReady?.(viewer);

    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
  }, [onReady]);

  return (
    <div
      ref={containerRef}
      className="cesium-globe"
      style={{ width: '100%', height: '100%' }}
    />
  );
}