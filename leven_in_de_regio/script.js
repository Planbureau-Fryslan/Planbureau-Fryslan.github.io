const $ = query => document.querySelector(query), $$ = query => document.querySelectorAll(query)
const dashboards = [{"name":"Bereikbaarheid","caption":"Bereikbaarheid","heights":{"Desktop": 1000,"Tablet": 1000,"Phone": 860}},{"name":"Bevolking","caption":"Bevolking","heights":{"Desktop": 600,"Tablet": 600,"Phone": 500}},{"name":"Bevolkingsontwikkeling","caption":"Bevolkings-ontwikkeling","heights":{"Desktop": 800,"Tablet": 800,"Phone": 700}},{"name":"Gezondheid","caption":"Gezondheid","heights":{"Desktop": 880,"Tablet": 880,"Phone": 700}},{"name":"Inkomen","caption":"Inkomen","heights":{"Desktop": 870,"Tablet": 870,"Phone": 650}},{"name":"Klimaatenmilieu","caption":"Klimaat en milieu","heights":{"Desktop": 760,"Tablet": 760,"Phone": 650}},{"name":"Natuurenlandschap","caption":"Natuur en landschap","heights":{"Desktop": 1000,"Tablet": 1000,"Phone": 900}},{"name":"Onderwijs","caption":"Onderwijs","heights":{"Desktop": 770,"Tablet": 770,"Phone": 650}},{"name":"Socialesamenhang","caption":"Sociale samenhang","heights":{"Desktop": 800,"Tablet": 800,"Phone": 650}},{"name":"Veiligheid","caption":"Veiligheid","heights":{"Desktop": 670,"Tablet": 670,"Phone": 700}},{"name":"Vrijetijd","caption":"Vrije tijd","heights":{"Desktop": 1000,"Tablet": 1000,"Phone": 800}},{"name":"Welzijn","caption":"Welzijn","heights":{"Desktop": 760,"Tablet": 760,"Phone": 700}},{"name":"Werk","caption":"Werk","heights":{"Desktop": 1000,"Tablet": 1000,"Phone": 800}},{"name":"Wonen","caption":"Wonen","heights":{"Desktop": 700,"Tablet": 700,"Phone": 700}}]
var dashboardwidth,device

function get_layout() {
	if (document.body.offsetWidth > 1280) {
		// Gebaseerd op breedte waarop de webpagina het menu links verbergt (regel 46 in https://planbureau.frl/wp-content/themes/fsp/assets/js/functions.js?x80738&ver=6.9.1)
		// Desktop layout
		dashboardwidth = '1000px'
		device = 'Desktop'
	} else if (document.body.offsetWidth > 500) {
		// Tablet layout
		dashboardwidth = `${$('#dashboard').offsetWidth}px`
		device = 'Tablet'
	} else {
		// Phone layout
		dashboardwidth = `${$('#dashboard').offsetWidth}px`
		device = 'Phone'
	}
}

function switch_view(name) {
	$$('.thema_button.active, .tableauContainer.active').forEach((node,index) => {node.classList.remove('active')})
	$(`#button_${name}`).classList.add('active')
	$(`#tableau_${name}`).classList.add('active')
}

function switch_regio(name,caption) {
	$$('.regio_button.active').forEach((node,index) => {node.classList.remove('active')})
	$(`#button_${name}`).classList.add('active')
	LidR_setup(caption)
}

function LidR_setup(regio) {
	dashboard_laden(regio, '20260114LidRDashboard')
}

function dashboard_laden(regio, workbookname) {
	get_layout()
	const num_dashboards = ['Vlieland','Terschelling','Ameland','Schiermonnikoog','Waddeneilanden'].includes(regio) ? dashboards.length - 1 : dashboards.length
	$('#themas').style.width = `${150*num_dashboards}px`
	$('#themascontainer').style.width = dashboardwidth;

	for (let dashboard of dashboards) {
		if (['Vlieland','Terschelling','Ameland','Schiermonnikoog','Waddeneilanden'].includes(regio) && ['Vrijetijd'].includes(dashboard.name)) {
			continue
		}
		$('#themas').innerHTML += `<div class="thema_button" onclick="switch_view('${dashboard.name}')" id="button_${dashboard.name}">${dashboard.caption}</div>`
		content = `<div class='tableauContainer' id='tableau_${dashboard.name}'>
			<div class='tableauPlaceholder' id='viz_${dashboard.name}' style='position: relative'>
				<object class='tableauViz'  style='display:none;width:${dashboardwidth};height:${dashboard.heights[device]+27}px'>
					<param name='host_url' value='https%3A%2F%2Fpublic.tableau.com%2F' />
					<param name='embed_code_version' value='3' />
					<param name='path' value='views&#47;${workbookname}&#47;${dashboard.name}?:language=nl-NL&amp;:embed=true&amp;Gemeente=${regio}&amp;:sid=&amp;:redirect=auth' />
					<param name='toolbar' value='yes' />
					<param name='animate_transition' value='yes' />
					<param name='display_static_image' value='no' />
					<param name='display_spinner' value='yes' />
					<param name='display_overlay' value='yes' />
					<param name='display_count' value='yes' />
					<param name='language' value='nl-NL' />
					<param name='filter' value='Gemeente=${regio}' />
				</object>
			</div></div>`
		// console.log(content)
		$('#dashboard').innerHTML += content
		var vizElement = $(`#viz_${dashboard.name}`).getElementsByTagName('object')[0];
		var scriptElement = document.createElement('script');
		scriptElement.src = 'https://public.tableau.com/javascripts/api/viz_v1.js';
		vizElement.parentNode.insertBefore(scriptElement, vizElement);
	}
	switch_view(dashboards[0].name)
}

function regios_laden() {
	get_layout()
	const regios = [{'name': 'NWF', 'caption': 'Noordwest Fryslân'}, {'name': 'NOF', 'caption': 'Noordoost Fryslân'}, {'name': 'ZWF', 'caption': 'Zuidwest Fryslân'}, {'name': 'ZOF', 'caption': 'Zuidoost Friesland'}, {'name': 'LWD', 'caption': 'Leeuwarden'}, {'name': 'WAD', 'caption': 'Waddeneilanden'}]
	$('#regios').style.width = `${150*regios.length}px`
	$('#regioscontainer').style.width = dashboardwidth
	for (let regio of regios) {
		$('#regios').innerHTML += `<div class="regio_button" onclick="$('#themas').innerHTML = ''; $('#dashboard').innerHTML = ''; switch_regio('${regio.name}','${regio.caption}')" id="button_${regio.name}">${regio.caption}</div>`
	}
	switch_regio(regios[0].name,regios[0].caption)
}