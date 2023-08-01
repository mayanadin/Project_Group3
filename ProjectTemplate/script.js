let isLoggedIn = true;
var dashboards = [];

//we're using a stacked card approach for our main viewing area
//this array holds the ids of our cards and the method
//allows us to easly switch the interface from one to the other
var contentPanels = ['logonPanel', 'newAccountPanel', 'accountsPanel', 'editAccountPanel', 'requestsPanel'];
//this function toggles which panel is showing, and also clears data from all panels
function showPanel(panelId) {
	clearData();
	for (var i = 0; i < contentPanels.length; i++) {
		if (panelId == contentPanels[i]) {
			$("#" + contentPanels[i]).css("visibility", "visible");
		}
		else {
			$("#" + contentPanels[i]).css("visibility", "hidden");
		}
	}
}

//this function clears data from all panels
function clearData() {
	$("#accountsBox").empty();
	$("#requestsBox").empty();
	clearNewAccount();
	clearLogon();
	clearEditAccount();
}


//when we retrieve accounts, we'll put them here
//so that we can reference them later for admins
//that may want to edit accounts
var accountsArray;
//to begin with, we assume that the account is not an admin
var admin = false;

//this function grabs accounts and loads our account window
function LoadAccounts() {
	var webMethod = "AccountServices.asmx/GetAccounts";
	$.ajax({
		type: "POST",
		url: webMethod,
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function (msg) {
			if (msg.d.length > 0) {
				//let's put our accounts that we get from the
				//server into our accountsArray variable
				//so we can use them in other functions as well
				accountsArray = msg.d;
				//this clears out the div that will hold our account info
				$("#accountsBox").empty();
				//again, we assume we're not an admin unless we see data from the server
				//that we know only admins can see
				admin = false;
				for (var i = 0; i < accountsArray.length; i++) {
					//we grab on to a specific html element in jQuery
					//by using a  # followed by that element's id.
					var acct;
					//if they have access to admin-level info (like userid and password) then
					//create output that has an edit option
					if (accountsArray[i].userId != null) {
						acct = "<div class='accountRow' id='acct" + accountsArray[i].id + "'>" +
							"<a class='nameTag' href='mailto:" + accountsArray[i].email + "'>" +
							accountsArray[i].firstName + " " + accountsArray[i].lastName +
							"</a> <a href='#' onclick='LoadAccount(" + accountsArray[i].id + ")' class='optionsTag'>edit</a></div><hr>"
						admin = true;
					}
					//if not, then they're not an admin so don't include the edit option
					else {
						acct = "<div class='accountRow' id='acct" + accountsArray[i].id + "'>" +
							"<a class='nameTag' href='mailto:" + accountsArray[i].email + "'>" +
							accountsArray[i].firstName + " " + accountsArray[i].lastName +
							"</a></div><hr>"
					}
					$("#accountsBox").append(
						//anything we throw at our panel in the form of text
						//will be added to the contents of that panel.  Here
						//we're putting together a div that holds info on the
						//account as well as an edit link if the user is an admin
						acct
					);
				}
			}
			//we're showing the account window, so let's track that...
			accountWindowShowing = true;
			//...because the ShowMenu function behaves differently depending on
			//if the account window is showing or not
			ShowMenu();
		},
		error: function (e) {
			alert("boo...");
		}
	});
}

//this is just like loading accounts!
function LoadRequests() {
	var webMethod = "AccountServices.asmx/GetAccountRequests";
	$.ajax({
		type: "POST",
		url: webMethod,
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function (msg) {
			if (msg.d.length > 0) {
				$("#requestsBox").empty();
				admin = false;
				for (var i = 0; i < msg.d.length; i++) {
					req = "<div class='accountRow' id='acctR" + msg.d[i].id + "'>" +
						"<span class='nameTag'>" +
						msg.d[i].firstName + " " + msg.d[i].lastName +
						"</span> <span class='optionsTag'><a href='#' onclick='approveAccount(" + msg.d[i].id + ")'>yes</a> / " +
						"<a href='#' onclick='rejectAccount(" + msg.d[i].id + ")'>no</a></span>" +
						"<div style='font-size: smaller'>" + msg.d[i].email + "</div></div > <hr>";
					$("#requestsBox").append(req);
				}
			}
			accountWindowShowing = false;
			ShowMenu();
		},
		error: function (e) {
			alert("boo...");
		}
	});
}

//a simple ajax call that passes the id to be approved
function approveAccount(id) {
	var webMethod = "AccountServices.asmx/ActivateAccount";
	var parameters = "{\"id\":\"" + encodeURI(id) + "\"}";

	$.ajax({
		type: "POST",
		url: webMethod,
		data: parameters,
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function (msg) {
			showPanel('requestsPanel');
			LoadRequests();
		},
		error: function (e) {
			alert("boo...");
		}
	});
}

//virtually identical with approve
function rejectAccount(id) {
	var webMethod = "AccountServices.asmx/RejectAccount";
	var parameters = "{\"id\":\"" + encodeURI(id) + "\"}";

	$.ajax({
		type: "POST",
		url: webMethod,
		data: parameters,
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function (msg) {
			showPanel('requestsPanel');
			LoadRequests();
		},
		error: function (e) {
			alert("boo...");
		}
	});
}

//here's the variable to track if the account window is showing
var accountWindowShowing = false;
//and here's a function that adjusts the menu options if you're an admin or a user
//and if you're looking at accounts or requests
function ShowMenu() {

	$("#menu").css("visibility", "visible");
	if (admin) {
		if (accountWindowShowing) {
			$("#adminLink").text("requests");
		}
		else {
			$("#adminLink").text("accounts");
		}
	}
}

//just hides the menu
function HideMenu() {

	$("#menu").css("visibility", "hidden");
	$("#adminLink").text("");
}

//when an admin clicks either accounts or requests,
//they're shown teh appropriate screen
function adminClick() {
	if (accountWindowShowing) {
		//show requests
		showPanel('requestsPanel');
		accountWindowShowing = false;
		LoadRequests()
		ShowMenu();
	}
	else {
		showPanel('accountsPanel');
		LoadAccounts();
		ShowMenu();
	}
}

//resets the new account inputs
function clearNewAccount() {
	$('#newLogonId').val("");
	$('#newLogonPassword').val("");
	$('#newLogonFName').val("");
	$('#newLogonLName').val("");
	$('#newLogonEmail').val("");
}

//resets the edit account inputs
function clearEditAccount() {
	$('#editLogonId').val("");
	$('#editLogonPassword').val("");
	$('#editLogonFName').val("");
	$('#editLogonLName').val("");
	$('#editLogonEmail').val("");
}

//resets the logon inputs
function clearLogon() {
	$('#logonId').val("");
	$('#logonPassword').val("");
}

//passes account info to the server, to create an account request
function CreateAccount(id, pass, fname, lname, email) {
	var webMethod = "AccountServices.asmx/RequestAccount";
	var parameters = "{\"uid\":\"" + encodeURI(id) + "\",\"pass\":\"" + encodeURI(pass) + "\",\"firstName\":\"" + encodeURI(fname) + "\",\"lastName\":\"" + encodeURI(lname) + "\",\"email\":\"" + encodeURI(email) + "\"}";

	$.ajax({
		type: "POST",
		url: webMethod,
		data: parameters,
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function (msg) {
			showPanel('logonPanel');
			alert("Account request pending approval...");
		},
		error: function (e) {
			alert("boo...");
		}
	});
}

//logs the user off both at the client and at the server
function LogOff() {

	var webMethod = "AccountServices.asmx/LogOff";
	$.ajax({
		type: "POST",
		url: webMethod,
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function (msg) {
			if (msg.d) {
				//we logged off, so go back to logon page,
				//stop checking messages
				//and clear the chat panel
				showPanel('logonPanel');
				HideMenu();
			}
			else {
			}
		},
		error: function (e) {
			alert("boo...");
		}
	});
}

//this function executes once jQuery has successfully loaded and is
//ready for business.  Usually, if we're wiring up event handlers via jQuery
//then this is where they go.
jQuery(function () {
	//when the app loads, show the logon panel to start with!
	showPanel('logonPanel');
});

//an ajax to kill an account
function DeactivateAccount() {
	var webMethod = "AccountServices.asmx/DeleteAccount";
	var parameters = "{\"id\":\"" + encodeURI(currentAccount.id) + "\"}";

	$.ajax({
		type: "POST",
		url: webMethod,
		data: parameters,
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function (msg) {
			showPanel('accountsPanel');
			LoadAccounts();
		},
		error: function (e) {
			alert("boo...");
		}
	});
}

//hold on to the account being currently edited here
var currentAccount;
//load up an account for editing
function LoadAccount(id) {
	showPanel('editAccountPanel');
	currentAccount = null;
	//find the account with a matching id in our array
	for (var i = 0; i < accountsArray.length; i++) {
		if (accountsArray[i].id == id) {
			currentAccount = accountsArray[i]
		}
	}
	//set up our inputs
	if (currentAccount != null) {
		$('#editLogonId').val(currentAccount.userId);
		$('#editLogonPassword').val(currentAccount.password);
		$('#editLogonFName').val(currentAccount.firstName);
		$('#editLogonLName').val(currentAccount.lastName);
		$('#editLogonEmail').val(currentAccount.email);
	}
}

//ajax to send the edits of an account to the server
function EditAccount() {
	var webMethod = "AccountServices.asmx/UpdateAccount";
	var parameters = "{\"id\":\"" + encodeURI(currentAccount.id) + "\",\"uid\":\"" + encodeURI($('#editLogonId').val()) + "\",\"pass\":\"" + encodeURI($('#editLogonPassword').val()) + "\",\"firstName\":\"" + encodeURI($('#editLogonFName').val()) + "\",\"lastName\":\"" + encodeURI($('#editLogonLName').val()) + "\",\"email\":\"" + encodeURI($('#editLogonEmail').val()) + "\"}";

	$.ajax({
		type: "POST",
		url: webMethod,
		data: parameters,
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function (msg) {
			showPanel('accountsPanel');
			LoadAccounts();
		},
		error: function (e) {
			alert("boo...");
		}
	});
}
// Beginning of custom code

// Checks to see if user is an employee

function isEmployee(form) {
	var form = document.getElementById('inputFormId');
	var isMgr = isManager.value;
	var empNum = empNumber.value;
	var webMethod = "ProjectServices.asmx/IsEmployee";
	var parameters = "{\"empNum\":\"" + encodeURI(empNum) + "\"}";
	//jQuery ajax method
	$.ajax({
		type: "POST",
		url: webMethod,
		data: parameters,
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function (msg) {
			if (msg.d) {
				createUser(empNum, isMgr);
				//alert(empNum);
			}
			else {
				alert("logon failed");
			}
		},
		error: function (e) {
			//alert("this code will only execute if javascript is unable to access the webservice");
		}
	});
}

// routes to either updateUserDB or updateMgrDb 
function createUser(empNum, isMgr) {
	var form = document.getElementById('inputFormId');
	//var isMgr = isManager.value;
	console.log(empNum, isMgr);
	var pass = generatePassword();
	console.log(pass);
	var uid = Math.random().toString().slice(2, 11);
	console.log(uid);
	var webMethod = "ProjectServices.asmx/IsSurveyUser";
	var parameters = "{\"empNum\":\"" + encodeURI(empNum) + "\"}";

	//jQuery ajax method
	$.ajax({
		type: "POST",
		url: webMethod,
		data: parameters,
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function (msg) {
			if (msg.d) {
				alert(empNum + " is already a user.  Please log in.");

			}
			else if (isMgr == "No") {
				document.getElementById("userName").value = uid;
				document.getElementById("passWord").value = pass;
				updateUserDb(uid, pass, empNum, isMgr);
			}
			else {
				document.getElementById("userName").value = empNum;
				document.getElementById("passWord").value = pass;
				uid = empNum;
				updateUserDb(uid, pass, empNum, isMgr);
			}


			},
			error: function (e) {
				//alert("this code will only execute if javascript is unable to access the webservice");
			}
		});
}
//HERE'S AN EXAMPLE OF AN AJAX CALL WITH JQUERY!
function LogOn(form) {

	var form = document.getElementById('logonFormId');
	var uid = username.value;
	var pass = password.value;

	console.log(uid);
	console.log(pass);

	//the url of the webservice we will be talking to
	var webMethod = "ProjectServices.asmx/LogOn";
	//the parameters we will pass the service (in json format because curly braces)
	//note we encode the values for transmission over the web.  All the \'s are just
	//because we want to wrap our keynames and values in double quotes so we have to
	//escape the double quotes (because the overall string we're creating is in double quotes!)
	var parameters = "{\"uid\":\"" + encodeURI(uid) + "\",\"pass\":\"" + encodeURI(pass) + "\"}";

	//jQuery ajax method
	$.ajax({
		//post is more secure than get, and allows
		//us to send big data if we want.  really just
		//depends on the way the service you're talking to is set up, though
		type: "POST",
		//the url is set to the string we created above
		url: webMethod,
		//same with the data
		data: parameters,
		//these next two key/value pairs say we intend to talk in JSON format
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		//jQuery sends the data and asynchronously waits for a response.  when it
		//gets a response, it calls the function mapped to the success key here
		success: function (msg) {
			//the server response is in the msg object passed in to the function here
			//since our logon web method simply returns a true/false, that value is mapped
			//to a generic property of the server response called d (I assume short for data
			//but honestly I don't know...)
			if (msg.d) {
				//server replied true, so show the accounts panel
				employeeType(uid);
				alert(uid);
			}
			else {
				//server replied false, so let the user know
				//the logon failed
				alert("logon failed");
			}
		},
		error: function (e) {
			//if something goes wrong in the mechanics of delivering the
			//message to the server or the server processing that message,
			//then this function mapped to the error key is executed rather
			//than the one mapped to the success key.  This is just a garbage
			//alert becaue I'm lazy
			alert("logon error");
		}
	});
}


function employeeType(uid) {
	//the url of the webservice we will be talking to
	var webMethod = "ProjectServices.asmx/EmployeeType";
	//the parameters we will pass the service (in json format because curly braces)
	//note we encode the values for transmission over the web.  All the \'s are just
	//because we want to wrap our keynames and values in double quotes so we have to
	//escape the double quotes (because the overall string we're creating is in double quotes!)
	var parameters = "{\"uid\":\"" + encodeURI(uid) + "\"}";

	//jQuery ajax method
	$.ajax({
		//post is more secure than get, and allows
		//us to send big data if we want.  really just
		//depends on the way the service you're talking to is set up, though
		type: "POST",
		//the url is set to the string we created above
		url: webMethod,
		//same with the data
		data: parameters,
		//these next two key/value pairs say we intend to talk in JSON format
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		//jQuery sends the data and asynchronously waits for a response.  when it
		//gets a response, it calls the function mapped to the success key here
		success: function (msg) {
			//the server response is in the msg object passed in to the function here
			//since our logon web method simply returns a true/false, that value is mapped
			//to a generic property of the server response called d (I assume short for data
			//but honestly I don't know...)
			serverResponse = (msg.d);
			console.log(serverResponse);

			if (serverResponse == true) {
				
				alert(serverResponse);
				//server replied true, so show the manager discussion panel
				showPanel(mgrPanel);
				showDiscussion(true);
			}
			else {
				//server replied false, so let the user know
				//start user discussion panel
				showPanel(empPanel);
				showEmpDiscussion();
			}
		},
		error: function (e) {
			//if something goes wrong in the mechanics of delivering the
			//message to the server or the server processing that message,
			//then this function mapped to the error key is executed rather
			//than the one mapped to the success key.  This is just a garbage
			//alert becaue I'm lazy
			alert("Employee Type Failure");
		}
	});
}

function generatePassword() {
	var length = 8,
		charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
		retVal = "";
	for (var i = 0, n = charset.length; i < length; ++i) {
		retVal += charset.charAt(Math.floor(Math.random() * n));
	}
	return retVal;
}

function updateUserDb(uid, pass, empNum, isMgr) {
	var webMethod = "ProjectServices.asmx/RequestUserAccount";
	var parameters = "{ \"uid\":\"" + encodeURI(uid) + "\",\"pass\":\"" + encodeURI(pass) + "\",\"empNum\":\"" + encodeURI(empNum) + "\",\"isMgr\":\"" + encodeURI(isMgr) + "\"}";

	//jQuery ajax method
	$.ajax({
		type: "POST",
		url: webMethod,
		data: parameters,
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function (msg) {
			alert('User successfully created!');
		},
		error: function (e) {
			alert("this code will only execute if javascript is unable to access the webservice");
		}
	});

}

function updateMgrDb(uid, pass, empNum, isMgr) {
	var webMethod = "ProjectServices.asmx/RequestMgrAccount";
	var parameters = "{ \"uid\":\"" + encodeURI(uid) + "\",\"pass\":\"" + encodeURI(pass) + "\",\"empNum\":\"" + encodeURI(empNum) + "\",\"isMgr\":\"" + encodeURI(isMgr) + "\"}";

	//jQuery ajax method
	$.ajax({
		type: "POST",
		url: webMethod,
		data: parameters,
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function (msg) {
			var responseFromServer = msg.d;
			// alert(responseFromServer);
		},
		error: function (e) {
			alert("this code will only execute if javascript is unable to access the webservice");
		}
	});
}

// Manager Discussion Code
function showDiscussion(isManager) {
	const discussion = document.getElementById("mgrPanel");

	if (isManager) {
		discussion.style.display = "block";
		loadDiscussionContent();
	} else {
		alert("You do not have permission to access the discussion.");
	}
}

function loadDiscussionContent() {
	const discussion = document.getElementById("mgrPanel");
	discussion.innerHTML = `
        <h2>Welcome, Manager!</h2>

        <form id="discussionForm" onsubmit="createDiscussion(event)">
            <label for="discussionName">Discussion Name:</label>
            <input type="text" id="discussionName" required>

            <label for="topic">Topic:</label>
            <input type="text" id="topic" required>

            <label for="department">Department:</label>
            <input type="text" id="department" required>

            <label for="date">Date:</label>
            <input type="date" id="date" required>

            <button type="submit">Create Discussion Board</button>
        </form>

        <h3>Created Discussion Boards:</h3>
        <div id="discussionBoardsList"></div>
    `;

	displayDiscussions();
}

function createDiscussion(event) {
	event.preventDefault();
	if (!isLoggedIn) {
		alert("You need to be logged in as a manager to create discussions.");
		return;
	}

	const discussionName = document.getElementById("discussionName").value;
	const topic = document.getElementById("topic").value;
	const department = document.getElementById("department").value;
	const date = document.getElementById("date").value;

	dashboards.push({ name: discussionName, topic, department, date });

	// Clear the form inputs
	document.getElementById("discussionName").value = "";
	document.getElementById("topic").value = "";
	document.getElementById("department").value = "";
	document.getElementById("date").value = "";

	// Update the displayed discussions
	displayDiscussions();
}

function displayDiscussions() {
	const discussionsList = document.getElementById("discussionBoardsList");
	discussionsList.innerHTML = "";

	dashboards.forEach(discussion => {
		const div = document.createElement("div");
		div.innerHTML = `
            <h4>${discussion.name}</h4>
            <p>Topic: ${discussion.topic}</p>
            <p>Department: ${discussion.department}</p>
            <p>Date: ${discussion.date}</p>
        `;
		discussionsList.appendChild(div);
	});
}

// Employee Discussion Code
function showEmpDiscussion() {
	const discussion = document.getElementById("empPanel");
	discussion.style.display = "block";
	loadEmpDiscussionContent();
}

function loadEmpDiscussionContent() {
	const discussion = document.getElementById("empPanel");
	discussion.innerHTML = `
        <h2>Welcome, Employee!</h2>
        <h3>Discussion Boards:</h3>
        <div id="discussionBoardsList"></div>
    `;

	displayEmpDiscussions();
}

function displayEmpDiscussions() {
	const discussionsList = document.getElementById("discussionBoardsList");
	discussionsList.innerHTML = "";

	dashboards.forEach(discussion => {
		const div = document.createElement("div");
		div.innerHTML = `
            <h4><a href="#" onclick="viewDiscussion('${discussion.name}')">${discussion.name}</a></h4>
            <p>Topic: ${discussion.topic}</p>
            <p>Department: ${discussion.department}</p>
            <p>Date: ${discussion.date}</p>
        `;
		discussionsList.appendChild(div);

		// Add a reply form for regular users/employees
		const replyForm = document.createElement("form");
		replyForm.onsubmit = (event) => {
			event.preventDefault();
			const reply = replyForm.querySelector("input").value;
			addReply(discussion.name, reply);
		};
		replyForm.innerHTML = `
            <label for="reply">Your Reply:</label>
            <input type="text" id="reply" required>
            <button type="submit">Post Reply</button>
        `;
		discussionsList.appendChild(replyForm);

		// Display existing replies
		const replies = getReplies(discussion.name);
		if (replies.length > 0) {
			const repliesHeader = document.createElement("h5");
			repliesHeader.textContent = "Replies:";
			discussionsList.appendChild(repliesHeader);
			replies.forEach(reply => {
				const replyDiv = document.createElement("div");
				replyDiv.textContent = reply;
				discussionsList.appendChild(replyDiv);
			});
		}
	});
}

dashboards = [
	{
		name: "Discussion 1",
		topic: "Topic 1",
		department: "Department A",
		date: "2023-07-26",
		replies: ["Reply 1", "Reply 2"]
	},
	{
		name: "Discussion 2",
		topic: "Topic 2",
		department: "Department B",
		date: "2023-07-27",
		replies: ["Reply 1"]
	}
];
