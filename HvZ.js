/* function drawgraphs will draw the graphs of the number of zombies, humans and players in time*/
function drawgraphs(){
	document.getElementById('Graphs').style.display='';
	var humans = document.getElementById('Humans').getContext('2d');
	var zombies = document.getElementById('Zombies').getContext('2d');
	var players = document.getElementById('Players').getContext('2d');
	new Chart(humans).Line(HumanData);
	new Chart(zombies).Line(ZombieData);
	new Chart(players).Line(PlayerData);
}

/* function askdata will permit the user to introduce data such as the initial number of players and the days of
 * mission*/
function askdata(){
	var text, i;
	text='<td align="center"><input type="text" placeholder="Nombre de jugadors" id="PlayersNumber"></td>';
	text+='<td align="rigth">Dies de missi&oacute </td>';
	text+='<td><select multiple id="Mission">';
	for (i=0; i<30; i++){
		text+='<option value='+i+'>'+i+'</option>';
	}
	text+='</select></td>';
	text+='<td align="center"><input type="button" value="Acceptar" onclick="startgame()"></td>';
	document.getElementById('Numbers').innerHTML=text;
}

/* function startgame will simulate the HvZ game creating objects that will act as players and will save the number of
 * zombies and humans at the end of the day*/
function startgame(){
	var i;
	HvZData= new Object();
	HvZData.propagationindex=-0.03;
	HvZData.missions=[];
	for (i=0; i<30; i++){
		if (document.getElementById('Mission').options[i].selected){
			HvZData.missions.push(i);
		}
	}
	HvZData.humans=document.getElementById('PlayersNumber').value;
	HvZData.infectivityfactor=0.2/HvZData.humans;
	/*the number of initial zombies will be a number between the 2% and the 5% of the total number of humans*/
	HvZData.zombies=Math.floor(Math.random()*HvZData.humans/33);
	HvZData.zombies+=Math.floor(HvZData.humans/50);
	HvZData.humans=HvZData.humans-HvZData.zombies;
	/* the humans will be divided between the ones avayable at morning and the ones avayable at evening*/
	HvZData.morninghumans=Math.round(Math.random()*HvZData.humans);
	HvZData.eveninghumans=HvZData.humans-HvZData.morninghumans;
	HvZData.day=0;
	HvZData.hour=0;
	HvZData.todayvictims=0;
	HvZData.todaydeceased=0;
	Zombie=new Object();
	document.getElementById('Numbers').style.display='none';
	for (i=0; i<HvZData.zombies; i++){
		Zombie['zombie'+i]=new zombie();
		Zombie['zombie'+i].first=true;
	}
	dayend();
	while (HvZData.day<30){
		daygame();
		/* we change the infectivytyfactor using a formula based on todays victims in order to 
		 * simulate de augmented experience of the survivors*/
		HvZData.infectivityfactor=0.2/(0.2/HvZData.infectivityfactor+5*HvZData.todayvictims)*(HvZData.zombies+HvZData.todaydeceased)/HvZData.zombies;
		HvZData.todayvictims=0;
		HvZData.todaydeceased=0;
		if (HvZData.day<7){
			/* we also look if new people has joined the game*/
			HvZData.humans+=Math.floor(Math.random()*61+0.5);
		}
	}
	drawgraphs();
}

/* function dayend will save the data of the number of players, humans, and zombies at the end of the day*/
function dayend(){
	HumanData.labels.push(HvZData.day);
	HumanData.datasets[0].data.push(HvZData.humans);
	ZombieData.labels.push(HvZData.day);
	ZombieData.datasets[0].data.push(HvZData.zombies);
	PlayerData.labels.push(HvZData.day);
	PlayerData.datasets[0].data.push((HvZData.humans+HvZData.zombies));
	PlayerData.datasets[1].data.push(HvZData.humans);
	PlayerData.datasets[2].data.push(HvZData.zombies);
}

/* function zombie will create an object with the caracteristics of a zombie being that the number of days
 * until starvation*/
function zombie(){
	var rand;
	this.starves=2*8;
	this.first=false;
	this.todayinfected=0;
	this.totalinfected=0;
	rand=Math.random()*0.8;
	if (rand<=0.4){
		rand=rand*3/2;
	}
	else{
		rand-=0.5;
		rand=rand/2;
		rand+=0.75;
	}
	rand+=0.2;
	this.motivation=rand;
}

/* function daygame will simulate a day of HvZ game*/
function daygame(){
	var i;
	while (HvZData.hour<8){
		for (var j in Zombie){
			decideifinfect(j);
		}
		HvZData.hour++;
	}
	for (var j in Zombie){
		Zombie[j].todayinfected=0;
	}
	if (HvZData.day==HvZData.missions[0]){
		HvZData.missions.reverse();
		HvZData.missions.pop();
		HvZData.missions.reverse();
	}
	HvZData.day++;
	HvZData.hour=0;
	dayend();
}

/* function decideifinfect will decide if a zombi will want to try and infect some human and if it wants to it will
 * try and catch one*/
function decideifinfect(zombie){
	var howmotivated;
	Zombie[zombie].starves--;
	howmotivated=Zombie[zombie].motivation;
	howmotivated=howmotivated*3*8/(2*3*8-1-Zombie[zombie].starves);
	howmotivated=howmotivated+(1-howmotivated)*Zombie[zombie].todayinfected/(1+Zombie[zombie].todayinfected);
	if (HvZData.missions.length>0){
		if (HvZData.day==HvZData.missions[0]){
			howmotivated=howmotivated/2;
		}
	}
	if (howmotivated<Math.random()){
		trytoinfect(zombie);
	}
	if (Zombie[zombie].starves==0){
		HvZData.zombies--;
		HvZData.todaydeceased++;
		delete Zombie[zombie];
	}
}

/* function trytoinfect will make a zombi try and infect some human and if it is able to do so another zombie
 * will be created*/
function trytoinfect(playingzombie){
	var i, infectivity;
	if (HvZData.hour<4){
		infectivity=HvZData.morninghumans*HvZData.infectivityfactor;
	}
	else{
		infectivity=HvZData.eveninghumans*HvZData.infectivityfactor;
	}
	if (HvZData.day==HvZData.missions[0]){
		infectivity=HvZData.humans*HvZData.infectivityfactor;
	}
	else{
		if (Zombie[playingzombie].first){
			infectivity+=infectivity;
		}
	}
	if (infectivity>Math.random()){
		infect(playingzombie);
	}
}

/* function feedzombies will look for the two zombies closer to starvation and feed them*/
function feedzombies(zombie){
	var feeded, starving, j;
	starving=zombie;
	for (var j in Zombie){
		if (j!=zombie){
			if (Zombie[j].starves<Zombie[starving].starves){
				starving=j;
			}
			else if (Zombie[j].starves==Zombie[starving].starves){
				if (Zombie[j].totalinfected>Zombie[starving].totalinfected){
					starving=j;
				}
			}
		}
	}
	feeded=starving;
	starving=zombie;
	for (var j in Zombie){
		if (j!=zombie && j!=feeded){
			if (Zombie[j].starves<Zombie[starving].starves){
				starving=j;
			}
			else if (Zombie[j].starves==Zombie[starving].starves){
				if (Zombie[j].totalinfected>Zombie[starving].totalinfected){
					starving=j;
				}
			}
		}
	}
	Zombie[feeded].starves=2*8;
	Zombie[feeded].todayinfected++;
	Zombie[starving].starves=2*8;
	Zombie[starving].todayinfected++;
}

/* function infect will simulate the infection of a human*/
function infect(playingzombie){
	i=PlayerData.datasets[0].data[0]-HvZData.humans;
	Zombie['zombie'+i]=new zombie();
	HvZData.humans--;
	if (HvZData.day!=HvZData.missions[0]){
		if (HvZData.hour<4){
			HvZData.morninghumans--;
		}
		else{
			HvZData.eveninghumans--;
		}
	}
	else{
		if (Math.random()<0.5){
			HvZData.morninghumans--;
		}
		else{
			HvZData.eveninghumans--;
		}
	}
	HvZData.zombies++;
	Zombie[playingzombie].starves=2*8;
	Zombie[playingzombie].todayinfected++;
	Zombie[playingzombie].totalinfected++;
	HvZData.todayvictims++;
	feedzombies(playingzombie);
}