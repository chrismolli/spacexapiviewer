/*
	Constants
*/
const base_url = "https://api.spacexdata.com/v3";

/*
	API calls
*/

async function get_latest_launch() {
    let response = await fetch(
      base_url + "/launches/latest"
    );
    let data = await response.json();
    return data;
}

async function get_next_launch() {
    let response = await fetch(
      base_url + "/launches/next"
    );
    let data = await response.json();
    return data;
}

async function get_past_launches(){
	let response = await fetch(
          base_url + "/launches/past"
        );
        let data = await response.json();
        return data;
}

async function get_upcoming_launches(){
	let response = await fetch(
		base_url + "/launches/upcoming"
	);
	let data = await response.json();
	return data;
}


/*
	Fillings
*/

function print_launch(data, prefix) {
	// feeds launch information from the API JSON to the HTML
	document.getElementById(prefix+"_flight_number").innerHTML = data.flight_number;
	document.getElementById(prefix+"_mission_name").innerHTML = data.mission_name;
	document.getElementById(prefix+"_mission_id").innerHTML = data.mission_id;
	document.getElementById(prefix+"_launch_date").innerHTML = data.launch_date_local.slice(0,10);
	document.getElementById(prefix+"_launch_site").innerHTML = data.launch_site.site_name_long;
	document.getElementById(prefix+"_details").innerHTML = data.details;
}

function create_history(data){
	// creates launch bins from the received data
	let history = {};
	for(let i = 0; i < data.length; i++){
		launch_year = data[i].launch_year;
		
		if("undefined" === typeof(history[launch_year])){
			history[launch_year]=1;
		}else{
		    history[launch_year]++;
		}
	}
	return history;
}

function plot_history(values){
	// create launch histories
	let past_history = create_history(values[0]);
	let upcoming_history = create_history(values[1]);
	// modify for plotting
	let total_past = 0;
	for(const year in past_history){
		if (!(year in upcoming_history)){
			upcoming_history[year] = 0;
		}
		total_past += past_history[year];
	}
	let total_upcoming = 0;
	for(const year in upcoming_history){
		if (!(year in past_history)){
			past_history[year] = 0;
		}
		total_upcoming += upcoming_history[year];
	}
	// plots launch history to canvas while responding to background colors
	var ctx = document.getElementById("launch_history").getContext("2d");
	if(getComputedStyle(document.body).backgroundColor=="rgb(255, 255, 255)"){
		// white bg
		border_color_past = "#000000";
		background_color_past = "rgba(0,0,0,0.1)";
		border_color_upcoming = "#000000";
		background_color_upcoming = "rgba(59,202,251,0.3)";
		grid_line_color = "rgba(0,0,0,0.1)";
		font_color = "rgba(0,0,0,0.7)";
	}else{
		// dark bg
		border_color_past = "#ffffff";
		background_color_past = "rgba(255,255,255,0.3)";
		border_color_upcoming = "#ffffff";
		background_color_upcoming = "rgba(59,202,251,0.3)";
		grid_line_color = "rgba(255,255,255,0.3)";
		font_color = "rgba(255,255,255,0.7)";
}
	var bar_chart = new Chart(ctx, {
	    type: 'bar',
	    data: {
		    labels: Object.keys(past_history),
		    datasets: [
			    {
				    label: `Past Launches (Total ${total_past})`,
				    backgroundColor: background_color_past,
				    borderColor: border_color_past,
					borderWidth: 1,
					data: Object.values(past_history)
			    },
				{
					label: `Upcoming Launches (Total ${total_upcoming})`,
					backgroundColor: background_color_upcoming,
					borderColor: border_color_upcoming,
					borderWidth: 1,
					data: Object.values(upcoming_history)
				}
		    ]
	    },
	    options: {
	    	tooltips: {
				mode: 'index',
				intersect: false
			},
			legend : {
	    		labels: {
	    			fontColor: font_color,
				},
			},
		    scales: {
			    xAxes: [{
			    	stacked: true,
					ticks:{
						fontColor: font_color,
					},
				    gridLines: {
					    color: grid_line_color,
				    }  
			    }],
			    yAxes: [{
			    	stacked: true,
					ticks:{
						fontColor: font_color,
					},
				    gridLines: {
					    color: grid_line_color,
				    }  
			    }]
		    }
	    }
	});	
}



/*
	Theme Toggle
*/

function set_dark_theme(){
	// changes css to dark theme and sets theme var in local storage
	document.getElementById("theme").setAttribute("href", "dark_theme.css");
	localStorage.setItem("theme","dark");
}

function set_light_theme(){
	// changes css to light theme and sets theme var in local storage
	document.getElementById("theme").setAttribute("href", "light_theme.css");
	localStorage.setItem("theme","light");	
}

function toggleTheme(){
	// toggle implementation
	  var checkBox = document.getElementById("theme_toggle");
	  if (checkBox.checked == true){
	    set_dark_theme();
	  } else {
	  	set_light_theme();
  }
  // redraw bar plot to update colors
	Promise.all([get_past_launches(), get_upcoming_launches()]).then(values => plot_history(values));
 }



/*
	Run on page load
*/

// load settings
theme_setting = localStorage.getItem('theme') || {};
if(theme_setting == "dark"){
	document.getElementById("theme_toggle").checked = true;
	set_dark_theme();
}

// generate content
get_latest_launch().then(data => print_launch(data,"l"));
get_next_launch().then(data => print_launch(data, "n"));
//get_past_launches().then(data => plot_history(create_launch_history(data)));
Promise.all([get_past_launches(), get_upcoming_launches()]).then(values => plot_history(values));