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

async function get_all_launches(){
	let response = await fetch(
          base_url + "/launches/past"
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

function create_launch_history(data){
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

function plot_history(history){
	// plots launch history to canvas while responding to background colors
	var ctx = document.getElementById("launch_history").getContext("2d");
	if(getComputedStyle(document.body).backgroundColor=="rgb(255, 255, 255)"){
		// white bg
		border_color = "#000000";
		backgroundColor = "rgba(0, 0, 0, 0.1)";
	}else{
		// dark bg
		border_color = "#ffffff";
		backgroundColor = "rgba(255, 255, 255, 0.1)";
	}
	var bar_chart = new Chart(ctx, {
	    type: 'bar',
	    data: {
		    labels: Object.keys(history),
		    datasets: [
			    {
				    label: "Launches per year",
				    backgroundColor: backgroundColor,
				    borderColor: border_color,
					borderWidth: 1,
					data: Object.values(history)
			    }
		    ]
	    },
	    options: {
		    scales: {
			    xAxes: [{				    
				    gridLines: {
					    color: backgroundColor,
				    }  
			    }],
			    yAxes: [{				    
				    gridLines: {
					    color: backgroundColor,
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
  get_all_launches().then(data => plot_history(create_launch_history(data)));
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
get_all_launches().then(data => plot_history(create_launch_history(data)));

