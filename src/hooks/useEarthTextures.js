import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { EARTH_TEXTURES } from '../data/earthTextures.js';

const loader = new THREE.TextureLoader();
loader.crossOrigin = 'anonymous';

function loadTexture(url, { srgb = true, aniso = 8 } = {}) {
  return new Promise((resolve) => {
    loader.load(
      url,
      (tex) => {
        if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = aniso;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        resolve(tex);
      },
      undefined,
      () => resolve(null)
    );
  });
}

export function useEarthTextures({ reduced = false } = {}) {
  const [state, setState] = useState({
    textures: { day: null, night: null, topology: null, water: null, clouds: null },
    loading: true,
    mode: 'loading'
  });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const aniso = reduced ? 2 : 8;
      const [day, night, topology, water, clouds] = await Promise.all([
        loadTexture(EARTH_TEXTURES.day, { aniso }),
        loadTexture(EARTH_TEXTURES.night, { aniso }),
        loadTexture(EARTH_TEXTURES.topology, { srgb: false, aniso }),
        loadTexture(EARTH_TEXTURES.water, { srgb: false, aniso }),
        loadTexture(EARTH_TEXTURES.clouds, { aniso })
      ]);

      if (cancelled) {
        [day, night, topology, water, clouds].forEach((t) => t?.dispose?.());
        return;
      }

      const full = Boolean(day && night);
      setState({
        textures: { day, night, topology, water, clouds },
        loading: false,
        mode: full ? 'full' : 'fallback'
      });
    }

    run();
    return () => { cancelled = true; };
  }, [reduced]);

  useEffect(() => {
    return () => {
      const t = state.textures;
      Object.values(t).forEach((tex) => tex?.dispose?.());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}