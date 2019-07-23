var _IMAGE_LIST = [];
var BLANKIMG = Images.Declare("Misc/empty.png","empty");
Images.Declare("Misc/idle_overlay.png","Idle Overlay");
Images.Declare("Misc/lock_icon.png","Locked");
Images.Declare("Icons/flag_base.png","Flag Base");
Images.Declare("Icons/white flag.png","White Flag");
Images.Declare("Icons/red flag.png","Red Flag");
Images.Declare("Icons/blue flag.png","Blue Flag");
Images.Declare("Icons/green flag.png","Green Flag");
Images.Declare("Icons/yellow flag.png","Yellow Flag");
var _select_img = Images.Declare("Icons/moves/tile_select.png","tile select").Image();
Images.Declare("Icons/moves/tile_range_attack.png","tile range attack");
Images.Declare("Icons/moves/tile_walk.png","tile walk");
Images.Declare("Icons/moves/tile_attack.png","tile attack");
Images.Declare("Icons/moves/tile_danger.png","tile danger");
var ERRORIMG = Images.Declare("Misc/ERROR.png","ERROR");
var temp = Images.Declare("Misc/fireball.png","Explosion");
temp.Stretch(true);

Images.Declare("Icons/attacks/great.png","Great Attack");
Images.Declare("Icons/attacks/okay.png","Okay Attack");
Images.Declare("Icons/attacks/bad.png","Bad Attack");
Images.Declare("Icons/attacks/danger0.png","Danger0");
Images.Declare("Icons/attacks/danger1.png","Danger1");
Images.Declare("Icons/attacks/danger2.png","Danger2");
var ArrowStart = Images.Declare("Icons/trail arrow/arrow0.png","Trail Arrow B");
var ArrowTurn = Images.Declare("Icons/trail arrow/arrow1.png","Trail Arrow T");
var ArrowStraight = Images.Declare("Icons/trail arrow/arrow2.png","Trail Arrow S");
var ArrowEnd = Images.Declare("Icons/trail arrow/arrow3.png","Trail Arrow E");

_IMAGE_LIST[0] = Images.Declare("Misc/SelectAni0.png","SELECT0");
_IMAGE_LIST[1] = Images.Declare("Misc/SelectAni1.png","SELECT1");
var Select_Animation = Animations.Declare(_IMAGE_LIST, "Select", 30, true);

_IMAGE_LIST[0] = Images.Declare("Icons/wrench1.png","WRENCH0");
_IMAGE_LIST[1] = Images.Declare("Icons/wrench0.png","WRENCH1");
var Repair_Animation = Animations.Declare(_IMAGE_LIST, "Repair", 30, true);




Canvas.Add_Ticker(function(){
	Animations.Increment();
});