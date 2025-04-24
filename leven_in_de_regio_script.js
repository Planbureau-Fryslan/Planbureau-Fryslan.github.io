const $ = query => document.querySelector(query), $$ = query => document.querySelectorAll(query)
const dashboards = [{"name":"Bevolkingsontwikkeling","caption":"Bevolkings-ontwikkeling","height":800},{"name":"Bevolking","caption":"Bevolking","height":600},{"name":"Werk","caption":"Werk","height":1000},{"name":"Inkomen","caption":"Inkomen","height":870},{"name":"Onderwijs","caption":"Onderwijs","height":770},{"name":"Welzijn","caption":"Welzijn","height":760},{"name":"Gezondheid","caption":"Gezondheid","height":880},{"name":"Socialesamenhang","caption":"Sociale samenhang","height":800},{"name":"Veiligheid","caption":"Veiligheid","height":670},{"name":"Bereikbaarheid","caption":"Bereikbaarheid","height":1000},{"name":"Natuurenlandschap","caption":"Natuur en landschap","height":1000},{"name":"Klimaatenmilieu","caption":"Klimaat en milieu","height":760},{"name":"Wonen","caption":"Wonen","height":700},{"name":"Vrijetijd","caption":"Vrije tijd","height":1000}]
$('#themas').style.width = `${150*dashboards.length}px`

function switch_view(name) {
	$$('.active').forEach((node,index) => {node.classList.remove('active')})
	$(`#button_${name}`).classList.add('active')
	$(`#tableau_${name}`).classList.add('active')
}

function LidR_setup(regio) {
	for (let dashboard of dashboards) {
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