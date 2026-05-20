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
        let map: any = undefined;
        let directions: any = undefined;
        let clusterer: any = undefined;

        load().then((mapglInstance) => {
            if (!map) {
                map = new mapglInstance.Map('map-container', {
                    center: MAP_CENTER,
                    zoom: 14.5,
                    key: '98c5508d-3e0c-480c-9ace-9037d996cd2e',
                    style: '86ae2ed6-9acf-4b9b-998f-1742b5de9656',
                });
            }

            map.on('click', (e: any) => console.log(e));

            // Загрузка данных
            const data = geoData as FeatureCollection<Geometry, GeoJsonProperties>;
            console.log('Всего объектов в файле:', data.features?.length);

            map.on('styleload', () => {
                console.log('Стиль карты загружен, добавляем слой...');

                // 0. СОЗДАЕМ ИСТОЧНИК ДАННЫХ (Строго по методичке!)
                const source = new mapglInstance.GeoJsonSource(map, {
                    data: data,
                    attributes: {
                        visible: true // Уникальное свойство для фильтра
                    }
                });

                // 1. Создаем слой для отрисовки КРУЖОЧКОВ ДТП
                const circleLayer = {
                    id: 'dtp-circles-layer',
                    type: 'circle',
                    source: source, // <-- Ссылаемся на созданную переменную source
                    filter: [
                        'match',
                        ['sourceAttr', 'visible'],
                        [true],
                        true,
                        false
                    ],
                    style: {
                        circleColor: [
                            'match',
                            ['get', 'severity'],
                            'С погибшими', '#ff0000',
                            'Тяжёлый', '#ff6600',
                            'Легкий', '#0098ea',
                            '#0098ea'
                        ],
                        circleRadius: 8,
                        circleStrokeColor: '#ffffff',
                        circleStrokeWidth: 2
                    }
                };

                // 2. Создаем отдельный слой для ТЕКСТОВЫХ подписей
                const textLayer = {
                    id: 'dtp-text-layer',
                    type: 'point',
                    source: source, // <-- Ссылаемся на ту же переменную source
                    filter: [
                        'match',
                        ['sourceAttr', 'visible'],
                        [true],
                        true,
                        false
                    ],
                    style: {
                        iconWidth: 0, // Прячем системную иконку, оставляем только текст
                        textField: ['get', 'category'],
                        textFont: ['Noto_Sans', 'Arial', 'sans-serif'],
                        textSize: 12,
                        textColor: '#1a1a1a',
                        textHaloColor: '#ffffff',
                        textHaloWidth: 2,
                        textPriority: 100,
                        textOffset: [0, -1.5]
                    }
                };

                // Добавляем оба слоя на карту
                
                map.addLayer(textLayer);
                map.addLayer(circleLayer);

                console.log('Слои с точками и текстом ДТП успешно добавлены!');
            });

            const rulerControl = new RulerControl(map, {});

            setMapglContext({
                mapglInstance: map,
                rulerControl,
                mapgl: mapglInstance,
            });
        });

        return () => {
            directions?.clear();
            clusterer?.destroy();
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