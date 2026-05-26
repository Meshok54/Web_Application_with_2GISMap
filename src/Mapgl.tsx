import { useEffect } from 'react';
import { load } from '@2gis/mapgl';
import { useMapglContext } from './MapglContext';
import { RulerControl } from '@2gis/mapgl-ruler';
import { useControlRotateClockwise } from './useControlRotateClockwise';
import { ControlRotateCounterclockwise } from './ControlRotateConterclockwise';
import { MapWrapper } from './MapWrapper';

import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import geoData from './data/tulskaia-oblast.json';
// import geoData from './data/data.json';

export const MAP_CENTER = [37.617348, 54.193122];

export default function Mapgl() {
    const { setMapglContext } = useMapglContext();

    useEffect(() => {
        let map: any = undefined;

        load().then((mapgl) => {
            map = new mapgl.Map('map-container', {
                center: MAP_CENTER,
                zoom: 14.5,
                key: '98c5508d-3e0c-480c-9ace-9037d996cd2e',
                style: '86ae2ed6-9acf-4b9b-998f-1742b5de9656',
            });

            map.on('click', (e: any) => console.log(e));

            const data = geoData as FeatureCollection<Geometry, GeoJsonProperties>;
            console.log('Всего объектов в файле:', data.features?.length);

            const source = new mapgl.GeoJsonSource(map, {
                data: data,
                attributes: { visible: true },
            });

            // СЛОЙ 1: Точечный слой
            const pointLayer = {
                id: 'dtp-points-layer',
                filter: [
                    'all',
                    [
                        'match',
                        ['sourceAttr', 'visible'],
                        [true],
                        true,
                        false,
                    ],
                ],
                type: 'point',
                minzoom: 12,
                maxzoom: 20,
                style: {
                    iconImage: 'caution',
                    iconWidth: 20,
                    iconHeight: 20,
                    textField: [
                        'concat',
                        ['get', 'category'],
                        '\n',
                        ['get', 'severity']
                    ],
                    textFont: ['Noto_Sans', 'Arial', 'sans-serif'],
                    textSize: 10,
                    textColor: '#000000',
                    textHaloColor: '#ffffff',
                    textHaloWidth: 2,
                    iconPriority: 100,
                    textPriority: 100,
                    textOffset: [0, -1.5],
                },
            };

            // СЛОЙ 2: Тепловая карта
            const heatmapLayer = {
                id: 'dtp-heatmap-layer',
                filter: [
                    'match',
                    ['sourceAttr', 'visible'],
                    [true],
                    true,
                    false,
                ],
                type: 'heatmap',
                minzoom: 5,
                maxzoom: 20,
                style: {
                    color: [
                        'interpolate',
                        ['linear'],
                        ['heatmap-density'],
                        0, 'rgba(0, 0, 0, 0)',
                        0.2, '#FF6B42',
                        0.4, '#FFA4AA',
                        0.6, '#F87A56',
                        0.8, '#ED4C59',
                        1, 'rgba(255, 255, 255, 1)'
                    ],
                    radius: 50,
                    intensity: 0.8,
                    opacity: 0.8,
                    downscale: 1,
                },
            };

            map.on('styleload', () => {
                map?.addLayer(heatmapLayer);
            });

            map.once('styleload', () => {
                map?.addLayer(pointLayer);
                console.log('Тепловая карта и точечный слой добавлены!');
            });

            const rulerControl = new RulerControl(map, { position: 'centerRight' });

            setMapglContext({
                mapglInstance: map,
                rulerControl,
                mapgl,
            });
        });

        return () => {
            map?.destroy();
            setMapglContext({ mapglInstance: undefined, mapgl: undefined });
        };
    }, [setMapglContext]);

    useControlRotateClockwise();

    return (
        <>
            <MapWrapper />
            <ControlRotateCounterclockwise />
        </>
    );
}