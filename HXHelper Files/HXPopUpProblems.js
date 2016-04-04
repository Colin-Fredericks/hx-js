// Global variable HXPUPTimer is defined in the HTML.

var HXPopUpProblems = (function(HXpopUpOptions, HXPUPTimer) {

	// Declaring semi-global variables for later use.
	var video = $('.video');
	var state;
	var time;
	var problemCounter;
	var skipEmAll;
	var protectedTime = false;
	var problemsBeingShown = 0;


	// Convert mm:ss format in HXPUPTimer to seconds.
	for (var i = 0; i < HXPUPTimer.length; i++){
    	for (var key in HXPUPTimer[i]) {
            if (key == 'time') {
                HXPUPTimer[i].time = hmsToTime(HXPUPTimer[i].time)
            }
        }
    }
	
	// Sort the HXPUPTimer by time.
	HXPUPTimer.sort(timeCompare);	// Uses a custom function to sort by time.

    
	// Log play/pause events from the player.
	// Also set the play/pause external control properly.
	video.on('pause', function () {
		Logger.log("harvardx.video_embedded_problems", {"video_event": "pause"});
		console.log('pause');
		$('#playpauseicon').html('&#8227;');
		$('#playpauseword').html('Play');
	});

	video.on('play', function () {
		Logger.log("harvardx.video_embedded_problems", {"video_event": "play"});
		console.log('play');
		// Also set the play/pause external control properly.
		$('#playpauseicon').html('||'); // Need a better-looking pause icon.
		$('#playpauseword').html('Pause');
	});
	
	// Check to see whether the video is ready before continuing.
	var waitForVid = setInterval(function(){

		state = video.data('video-player-state');	// Sometimes this fails and that's ok.

		if (state.videoPlayer.isCued()){
			console.log('video data loaded');
			clearInterval(waitForVid);
			var pause = setTimeout(function(){
				console.log('done waiting');
				setUpData();
				setUpControls();
				mainLoop();
			}, 0);
		}
	}, 100);
	
	// Checks local storage and gets data from the video.
	function setUpData(){
	
		console.log('setting up data');
	
		// Get the video data.
		video =  $('.video');
		state = video.data('video-player-state');
		time = state.videoPlayer.currentTime;
		
		// Storing a separate problem counter for each video.
		// Create the counter if it doesn't exist.
		if(!localStorage[state.id + '-counter']){
			localStorage[state.id + '-counter'] = '0';
			localStorage[state.id + '-skip'] = 'false';
			
			// If the counter didn't exist, we're on a new browser.
			// Clear the questions from before the current time.
			clearOlderPopUps(time);
		}
		
		// Which problem are we on?   Using + to cast as integer.
		problemCounter = +localStorage[state.id + '-counter'];
		
		// Are we currently skipping problems?
		skipEmAll = (localStorage[state.id + '-skip'] === 'true');
		// If so, let's update the button.
		if(skipEmAll){
			$('#sunmoon').html('&#9790;');
			$('#onoff').html('Problems are Off');
			Logger.log('harvardx.video_embedded_problems', {'reload_event': 'turn_problems_off', 'time': time});
			console.log('problems are off after reload');
		}

		// Let's avoid situations where we're faced with a question
		// mere seconds after the page loads, shall we?
		// Unless we're past the last problem...
		if(time < HXPUPTimer[HXPUPTimer.length-1].time) {
			if(problemCounter > 0){
				// Go to just after the previous question...
				ISaidGoTo(HXPUPTimer[problemCounter-1].time + 1);
			}else{
				// Or all the way back to the beginning.
				ISaidGoTo(0);
			}
		}
	}
	
	// Makes the buttons work and sets up event handlers.
	function setUpControls(){		
		
		console.log('setting up controls');
	
		// If they seek to a specific position, set the problem counter appropriately 
		// so that earlier problems don't gang up on them.
		video.on('seek', function(event, ui) {
			clearOlderPopUps(ui);
		});
			
		// Let someone go through the problems again if they want.
		// Also useful for debugging.
		$('#popUpReset').on('click tap', function(){
			updateProblemCounter(0);
			ISaidGoTo(0);
			Logger.log('harvardx.video_embedded_problems', {'control_event': 'reset'});
			console.log('reset counter and time to zero');
			
			// If problems are currently on, turn them off for two seconds after we go back.
			// This addresses a bug that appears in Mobile Safari.
			// Note that you can't put questions in the first two seconds of the video
			// because of this.
			if(!skipEmAll){
				skipEmAll = true;
				var dontSpamProblemsEarly = setTimeout(function(){
					skipEmAll = false;
				}, 2000);
			}
			
		});
		
		// Go back to one second after the previous problem.
		$('#backOneProblem').on('click tap', function(){
			if(problemCounter > 1){
				var newTime = HXPUPTimer[problemCounter-2].time + 1;
				ISaidGoTo(newTime);
				Logger.log('harvardx.video_embedded_problems', {'control_event': 'back_one'});
				console.log('going back one problem');
			}else{
				updateProblemCounter(0);
				ISaidGoTo(0);
				Logger.log('harvardx.video_embedded_problems', {'control_event': 'back_one_to_start'});
				console.log('going back to beginning');
			}
		});
		
  		
		// Play or pause the video
		$('#popUpPlayPause').on('click tap', function(){
			if(state.videoPlayer.isPlaying()){
				state.videoPlayer.pause();
				$('#playpauseicon').html('&#8227;');
				$('#playpauseword').html('Play');
				Logger.log('harvardx.video_embedded_problems', {'control_event': 'play'});
				console.log('play from exterior controls');
			}else{
				state.videoPlayer.play();
				$('#playpauseicon').html('||');
				$('#playpauseword').html('Pause');
				Logger.log('harvardx.video_embedded_problems', {'control_event': 'pause'});
				console.log('pause from exterior controls');
			}
		});
				
		// Let someone turn the pop-up questions on and off.
		// Give visual indication by changing the button.
		$('#problemToggle').on('click tap', function(){
			if(skipEmAll){
				skipEmAll = false;
				localStorage[state.id + '-skip'] = 'false';
				$('#sunmoon').html('&#9788;');
				$('#onoff').html('Problems are On');
				Logger.log('harvardx.video_embedded_problems', {'control_event': 'turn_problems_on', 'time': time});
				console.log('no longer skipping all problems from time ' + time);
			}else{
				skipEmAll = true;
				localStorage[state.id + '-skip'] = 'true';
				$('#sunmoon').html('&#9790;');
				$('#onoff').html('Problems are Off');
				Logger.log('harvardx.video_embedded_problems', {'control_event': 'turn_problems_off', 'time': time});
				console.log('skipping all problems from time ' + time);
			}
		});
				
	}
	
	// Every 500 ms, check to see whether we're going to add a new problem.
	function mainLoop(){
	
		var timeChecker = setInterval(function(){
			
            try{
                state.videoPlayer.update();        // Forced update of time. Required for Safari.
            }
            catch(err){
                // If this fails, shut down this loop.
                // It's probably because we moved to a new tab.
                clearInterval(timeChecker);
            }
			time = state.videoPlayer.currentTime;

			if(problemCounter < HXPUPTimer.length){
				if(time > HXPUPTimer[problemCounter].time){
				
					if(!skipEmAll && !protectedTime){
						state.videoPlayer.pause();
						popUpProblem(HXPUPTimer[problemCounter].title, state);
						updateProblemCounter(problemCounter+1);
					}else{
						// We're still incrementing and tracking even if we skip problems.
						updateProblemCounter(problemCounter+1);
					}
				}
			}
		}, 500);
	
	}
	
	// Set all the time-related stuff to a particular time and then seek there.
	// Does the work of creating the dialogue.
	// It pulls a question from lower down in the page, and puts it back when we're done.
	function popUpProblem(title, state){
		
		// Find the div for the problem based on its title.
		var problemDiv = $('h3:contains(' + title + ')').closest('.vert');

		var problemID = $('h3:contains(' + title + ')').parent().attr('id');
		
		var nextDiv, tempDiv;
		var dialogDiv = problemDiv;
		var includenext = false;
		
		// Sometimes we can't find an h3 to latch onto.
		// We put <span style="display:none" class="includer">includenext</span> into an HTML bit before it.
		// The dialog then displays the next item, and appends a clone of the HTML before it.
		if(problemDiv.find('span.includer').text() == 'includenext'){
			nextDiv = problemDiv.next();
			includenext = true;
		}
		
		if(includenext){dialogDiv = nextDiv;}
		
		Logger.log('harvardx.video_embedded_problems', {'display_problem': title, 'problem_id': problemID,'time': time});
		console.log('displaying problem: ' + title + ' ' + problemID);
		
		// Make a modal dialog out of the chosen problem.
		dialogDiv.dialog({
			modal: true,
			dialogClass: "no-close",
			resizable: true,
			width: HXpopUpOptions.width,
			show: { 
				effect: HXpopUpOptions.effect, 
				duration: HXpopUpOptions.effectlength 
			},
			position: {
			    my: HXpopUpOptions.myPosition,
			    at: HXpopUpOptions.atPosition,
			    of: HXpopUpOptions.ofTarget
			},
			buttons: {
				'Skip': function() {
					if(includenext){tempDiv.remove();}  // We added it, we should erase it.
					dialogDestroyed('skip_problem');
					$( this ).dialog( 'destroy' );  // Put the problem back when we're done.
				},
				'Done': function() {
					if(includenext){tempDiv.remove();}  // We added it, we should erase it.
					dialogDestroyed('mark_done');
					$( this ).dialog( 'destroy' );  // Put the problem back when we're done.
				},
			},
			open: function() {
				// If we're including two divs, append a clone of the first one above.
				if(includenext){
					tempDiv = problemDiv.clone();
					dialogDiv.prepend(tempDiv);
					console.log('pushing in front');
				}
				// Highlight various controls.
				$('span.ui-button-text:contains("Done")').addClass('answeredButton');
				$('input.check.Check').attr('style', '	background: linear-gradient(to top, #9df 0%,#7bd 20%,#adf 100%); background-color:#ACF;	text-shadow: none;');
				problemsBeingShown++;
			},
			close: function(){ 
				state.videoPlayer.play(); 
				if(includenext){tempDiv.remove();}  // We added it, we should erase it.
				Logger.log('harvardx.video_embedded_problems', {'unusual_event': 'dialog_closed_unmarked'});
				console.log('dialog closed');  // Should be pretty rare. I took out the 'close' button.
			}
		});
	}
	
	// Log the destruction of the dialog and play the video if there are no more dialogs up.
	function dialogDestroyed(message){
		Logger.log('harvardx.video_embedded_problems', {'control_event': message});
		console.log(message);
		$('input.check.Check').removeAttr('style');  // un-blue the check button.
		problemsBeingShown--;
		if(problemsBeingShown < 1){
			state.videoPlayer.play();
		}
	}
	
	// This resets the problem counter to match the time.
	function clearOlderPopUps(soughtTime){
		Logger.log('harvardx.video_embedded_problems', {'control_event': 'seek_to_' + soughtTime});
		console.log('sought to time ' + soughtTime);
		updateProblemCounter(0);  // Resetting fresh.
		for(var i = 0; i < HXPUPTimer.length; i++){
			if(soughtTime > HXPUPTimer[i].time){
				updateProblemCounter(i+1);
				console.log('new problem counter: ' + problemCounter);
			}else{
				break;
			}
		}
	}
	
	// I blame multiple Javascript timing issues.
	function ISaidGoTo(thisTime){
		time = thisTime;
		state.videoPlayer.seekTo(thisTime);
		console.log('I said go to ' + thisTime);
	}
	
	// Keep the counter and the local storage in sync.
	function updateProblemCounter(number){
		problemCounter = number;
		localStorage[state.id + '-counter'] = number.toString();
		console.log('counter set to ' + problemCounter);
	}

	// Converts hh:mm:ss to a number of seconds for time-based problems.
	// If it's passed a number, it just spits that back out as seconds.
	function hmsToTime(hms){

		hms = hms.toString();

		var hmsArray = hms.split(':');
		var time = 0;
	
		if(hmsArray.length == 3){
			time = 3600*parseInt(hmsArray[0]) + 60*parseInt(hmsArray[1]) + Number(hmsArray[2]);
		}
		else if(hmsArray.length == 2){
			time = 60*parseInt(hmsArray[0]) + Number(hmsArray[1]);
		}
	
		else if(hmsArray.length == 1){
			time = Number(hmsArray[0]);
		}
	
		return time;
	}

	// This is a sorting function for my timer.
	function timeCompare(a,b){
		if (a.time < b.time)
			return -1;
		if (a.time > b.time)
			return 1;
		return 0;
	}
	


});

$(document).ready(function(){
});
