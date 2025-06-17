const $ = query => document.querySelector(query), $$ = query => document.querySelectorAll(query)
const dashboards = [{"name":"Bevolkingsontwikkeling","caption":"Bevolkings-ontwikkeling","height":800},{"name":"Bevolking","caption":"Bevolking","height":600},{"name":"Werk","caption":"Werk","height":1000},{"name":"Inkomen","caption":"Inkomen","height":870},{"name":"Onderwijs","caption":"Onderwijs","height":770},{"name":"Welzijn","caption":"Welzijn","height":760},{"name":"Gezondheid","caption":"Gezondheid","height":880},{"name":"Socialesamenhang","caption":"Sociale samenhang","height":800},{"name":"Veiligheid","caption":"Veiligheid","height":670},{"name":"Bereikbaarheid","caption":"Bereikbaarheid","height":1000},{"name":"Natuurenlandschap","caption":"Natuur en landschap","height":1000},{"name":"Klimaatenmilieu","caption":"Klimaat en milieu","height":760},{"name":"Wonen","caption":"Wonen","height":700},{"name":"Vrijetijd","caption":"Vrije tijd","height":1000}]

function switch_view(name) {
	$$('.active').forEach((node,index) => {node.classList.remove('active')})
	$(`#button_${name}`).classList.add('active')
	$(`#tableau_${name}`).classList.add('active')
}

function LidR_setup(regio) {
	$('#themas').style.width = `${150*dashboards.length}px`
	for (let dashboard of dashboards) {
		if (['Vlieland','Terschelling','Ameland','Schiermonnikoog'].includes(regio) && ['Vrijetijd'].includes(dashboard.name)) {
			continue
		}
		$('#themas').innerHTML += `<div class="thema_button" onclick="switch_view('${dashboard.name}')" id="button_${dashboard.name}">${dashboard.caption}</div>`
		$('#dashboard').innerHTML += `<div class='tableauContainer' id='tableau_${dashboard.name}'>
			<div class='tableauPlaceholder' id='viz_${dashboard.name}' style='position: relative'>
				<object class='tableauViz'  style='display:none;width:1000px;height:${dashboard.height+27}px'>
					<param name='host_url' value='https%3A%2F%2Fpublic.tableau.com%2F' />
					<param name='embed_code_version' value='3' />
					<param name='path' value='views&#47;20250402InteractiefDashboardGemeenten&#47;${dashboard.name}?:language=nl-NL&amp;:embed=true&amp;Gemeente=${regio}&amp;:sid=&amp;:redirect=auth' />
					<param name='toolbar' value='yes' />
					<param name='static_image' value='https:&#47;&#47;public.tableau.com&#47;static&#47;images&#47;20&#47;20250402InteractiefDashboardGemeenten&#47;${dashboard.name}&#47;1.png' />
					<param name='animate_transition' value='yes' />
					<param name='display_static_image' value='yes' />
					<param name='display_spinner' value='yes' />
					<param name='display_overlay' value='yes' />
					<param name='display_count' value='yes' />
					<param name='language' value='nl-NL' />
					<param name='filter' value='Gemeente=${regio}' />
				</object>
			</div></div>`
		var vizElement = $(`#viz_${dashboard.name}`).getElementsByTagName('object')[0];
		var scriptElement = document.createElement('script');
		scriptElement.src = 'https://public.tableau.com/javascripts/api/viz_v1.js';
		vizElement.parentNode.insertBefore(scriptElement, vizElement);
	}
	switch_view(dashboards[0].name)
}


function kaart_setup() {
	let detailniveaus, geo, map, polygonlayers = {}, bounds;
	let beschikbare_regios = {
		'Gemeente': 'Alle',
		'COROP-gebied': ['Zuidoost-Friesland']
	}
	const fillColors = {
		'Beschikbaar': {'Standaard': '#006374', 'Hover': '#66a1ac'},
		'Niet-beschikbaar': {'Standaard': '#e5e7e7', 'Hover': '#eff1f1'}
	}
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
	window.addEventListener('resize', () => map.fitBounds(bounds))
	fetch('geo.json')
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
			layer.on('click', () => window.location.href = 'dashboard.html?regio='+feature.properties.regio_label )
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