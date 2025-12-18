let detailniveaus, geo, map, polygonlayers = {}, bounds;
const beschikbare_regios = {
	'Gemeente': 'Alle',
	'COROP-gebied': ['Zuidoost-Friesland']
}
const fillColors = {
	'Beschikbaar': {'Standaard': '#4C3D89', 'Hover': '#8D81B7'},
	'Niet-beschikbaar': {'Standaard': '#e5e7e7', 'Hover': '#eff1f1'}
}

function kaart_setup() {
	map = L.map('map', {
		center: [53.159105, 5.636314],
		zoom: 10,
		zoomControl: false,
		dragging: false,
		boxZoom: false,
		scrollWheelZoom: false,
		touchZoom: false,
		keyboad: false,
		zoomSnap: 0
	})
	window.addEventListener('resize', () => setTimeout(() => map.fitBounds(bounds), 10))
	fetch('https://planbureau-fryslan.github.io/leven_in_de_regio/geo.json')
	.then(d => d.json())
	.then(d => {
		geo = d
		detailniveaus = Object.keys(geo)

		// Kaart passend maken voor werkelijke data
		const bbox = calculateBBox(geo[detailniveaus[0]])
		bounds = [[bbox[1],bbox[0]],[bbox[3],bbox[2]]]
		map.fitBounds(bounds)
		
		// Polygonen toevoegen
		let detailniveau = 'Gemeente'
		for (let feature of geo[detailniveau]) {
			feature.properties.available = beschikbare_regios[detailniveau] == 'Alle' || beschikbare_regios[detailniveau].includes(feature.properties.regio_label)
		}
		polygonlayers[detailniveau] = L.geoJSON(geo[detailniveau], {
			onEachFeature: addFeatureActions,
			style: feature => {
				return {
					color: 'white',
					weight: 1,
					fillColor: fillColors[feature.properties.available ? 'Beschikbaar' : 'Niet-beschikbaar']['Standaard'],
					fillOpacity: 1
				}
			}
		})
		polygonlayers[detailniveaus[0]].addTo(map)
	})
}

function calculateBBox(geojson) {
	let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

	geojson.forEach(feature => {
		const coords = feature.geometry.coordinates;

		function processCoordinates(coordArray) {
			coordArray.forEach(coord => {
				if (Array.isArray(coord[0])) {
					processCoordinates(coord); // Recursief voor multipolygonen
				} else {
					const [x, y] = coord;
					minX = Math.min(minX, x);
					minY = Math.min(minY, y);
					maxX = Math.max(maxX, x);
					maxY = Math.max(maxY, y);
				}
			});
		}

		processCoordinates(coords);
	});
	const x_border = (maxX - minX)*0.1
	const y_border = (maxY - minY)*0.1
	return [minX - x_border, minY - y_border, maxX + x_border, maxY + y_border];
}

function addFeatureActions(feature, layer) {
	if (feature.properties && feature.properties.regio_label) {
		// Shape aanklikken -> Naar pagina voor die regio
		if (feature.properties.available) {
			layer.on('click', () => window.location.href = feature.properties.regio_label.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ /g,'-').toLowerCase() )
		}
		// Muis over shape -> Regionaam in tooltip
		layer.on('mouseover', () => {
			document.querySelector('#map').title = feature.properties.available ? `Ga naar de pagina voor ${feature.properties.regio_label}` : `Er is geen dashboard beschikbaar voor ${feature.properties.regio_label}`
			layer.setStyle({fillColor: fillColors[feature.properties.available ? 'Beschikbaar' : 'Niet-beschikbaar']['Hover']})
		})
		// Muis van shape af -> Tooltip leegmaken
		layer.on('mouseout', () => {
			document.querySelector('#map').title = ''
			layer.setStyle({fillColor: fillColors[feature.properties.available ? 'Beschikbaar' : 'Niet-beschikbaar']['Standaard']})
		})
	}
}
