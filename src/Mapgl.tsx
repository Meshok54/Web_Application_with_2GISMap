import { useEffect } from 'react';
import { load } from '@2gis/mapgl';
import { useMapglContext } from './MapglContext';
import { RulerControl } from '@2gis/mapgl-ruler';
import { useControlRotateClockwise } from './useControlRotateClockwise';
import { ControlRotateCounterclockwise } from './ControlRotateConterclockwise';
import { MapWrapper } from './MapWrapper';

import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import geoData from './data/data.json';

export const MAP_CENTER = [37.617348, 54.193122];

export default function Mapgl() {
    const { setMapglContext } = useMapglContext();

    useEffect(() => {
        let map: mapgl.Map | undefined = undefined;

        load().then((mapgl) => {
            map = new mapgl.Map('map-container', {
                center: MAP_CENTER,
                zoom: 14.5,
                key: '98c5508d-3e0c-480c-9ace-9037d996cd2e',
                style: '86ae2ed6-9acf-4b9b-998f-1742b5de9656',
            });

            map.on('click', (e) => console.log(e));

            const data = geoData as FeatureCollection<Geometry, GeoJsonProperties>;
            console.log('Всего объектов в файле:', data.features?.length);

            const source = new mapgl.GeoJsonSource(map, {
                data: data,
                attributes: {
                    visible: true
                }
            });

            const layer = {
                id: 'dtp-points-layer',
                filter: [
                    'match',
                    ['sourceAttr', 'visible'],
                    [true],
                    true,
                    false
                ],
                type: 'point',
                style: {
                    iconImage: 'caution',  // Это иконка из моего 2gis стиля
                    iconWidth: 20,
                    iconHeight: 20,
                    
                    // Подпись: категория + тяжесть
                    textField: [
                        'concat',
                        ['get', 'category'],
                        '\n',
                        ['get', 'severity']
                    ],
                    textFont: ['Noto_Sans', 'Arial', 'sans-serif'],
                    textSize: 10,
                    textColor: '#ff6600',
                    textHaloColor: '#ffffff',
                    textHaloWidth: 2,
                    iconPriority: 100,
                    textPriority: 100,
                    textOffset: [0, -1.5]
                }
            };


            map.on('styleload', () => {
                map?.addLayer(layer);
                console.log('Слой с точками и подписями ДТП добавлен!');
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