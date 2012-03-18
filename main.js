var kMainLuaURL = "main.lua";
var kUseHTMLConsole = false; // if false, output is still visible in firefox javascript console
var G = null; // the big lua _G containing lua global vars
var gFrameWait = 1000/40; // TODO: adjust for performance ?
var gMyTicks = MyGetTicks();
var gSecondsSinceLastFrame = 0;

/// debug output
function MainPrint () {
	if (kUseHTMLConsole) {
		var element = document.getElementById('output');
		if (!element) return; // perhaps during startup
		element.innerHTML += "<br>\n" + String(arguments);
	} else {
		try {
			console.log.apply(console, arguments); // javascript console, e.g. firefox
		} catch (e) {
			// do nothing
		}
	}
}

function NotImplemented (name) { MainPrint("NotImplemented:"+String(name)); return []; }

/// when calling the result from lua_load, RobBootLoad is exectuted between lua environment setup and the parsed code
function LuaBootStrap (G) {
	//~ MyPrint("bootloader called");
	G.str['love'] = lua_newtable();
	Love_Audio_CreateTable(G);
	Love_Event_CreateTable(G);
	Love_Filesystem_CreateTable(G);
	Love_Font_CreateTable(G);
	Love_Graphics_CreateTable(G);
	Love_Image_CreateTable(G);
	Love_Joystick_CreateTable(G);
	Love_Keyboard_CreateTable(G);
	Love_Mouse_CreateTable(G);
	Love_Physics_CreateTable(G);
	Love_Sound_CreateTable(G);
	Love_Thread_CreateTable(G);
	Love_Timer_CreateTable(G);
}

function call_love_load				(cmdline_args)		{ lua_call(G.str['love'].str['load'],[cmdline_args]); }	// This function is called exactly once at the beginning of the game.
function call_love_draw				()					{ lua_call(G.str['love'].str['draw'],[]); }	// Callback function used to draw on the screen every frame.
function call_love_update			(dt)				{ lua_call(G.str['love'].str['update'],[dt]); }	// Callback function used to update the state of the game every frame.

function call_love_focus			(bHasFocus)			{ lua_call(G.str['love'].str['focus'],[bHasFocus]); }	// Callback function triggered when window receives or loses focus.
function call_love_joystickpressed	(joystick, button)	{ lua_call(G.str['love'].str['joystickpressed'],[joystick, button]); }	// Called when a joystick button is pressed.
function call_love_joystickreleased	(joystick, button)	{ lua_call(G.str['love'].str['joystickreleased'],[joystick, button]); }	// Called when a joystick button is released.
function call_love_keypressed		(key, unicode)		{ lua_call(G.str['love'].str['keypressed'],[key, unicode]); }	// Callback function triggered when a key is pressed.
function call_love_keyreleased		(key)				{ lua_call(G.str['love'].str['keyreleased'],[key]); }	// Callback function triggered when a key is released.
function call_love_mousepressed		(x, y, button)		{ lua_call(G.str['love'].str['mousepressed'],[x, y, button]); }	// Callback function triggered when a mouse button is pressed.
function call_love_mousereleased	(x, y, button)		{ lua_call(G.str['love'].str['mousereleased'],[x, y, button]); }	// Callback function triggered when a mouse button is released.
function call_love_quit				()					{ lua_call(G.str['love'].str['quit'],[]); }	// Callback function triggered when the game is closed.
function call_love_run				()					{ lua_call(G.str['love'].str['run'],[]); }	// The main function, containing the main loop. A sensible default is used when left out.

/// called every frame
function MainStep () {
	var t = MyGetTicks();
	gSecondsSinceLastFrame = min(1,(t - gMyTicks) / 1000.0);
	gMyTicks = t;
	
	Love_Graphics_Step_Start();
	
	if (G != null) {
		var dt = gSecondsSinceLastFrame;
		call_love_update(dt);
		call_love_draw();
	}
	
	Love_Graphics_Step_End();
}

function MainOnLoad () {
	Love_Audio_Init();
	Love_Graphics_Init("glcanvas");
	
	window.setInterval("MainStep()", gFrameWait);

	UtilAjaxGet(kMainLuaURL,function (luacode) {
		
		var myfun = lua_load(luacode,"maincode");
		G = myfun();
		call_love_load();
		
		//~ lua_call(G.str['love'].str["keypressed"], [k]);
		//~ lua_call(G.str.print, [lua_concat("Hello world! This is: ", G.str._VERSION)]); 
	});
}
