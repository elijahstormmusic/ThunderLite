var Interface_Class = function()
{
	var allow_input = false;
	var self = this;
	var game,terrain_disp;
	var clientWidth=0,clientHeight=0;
	var gameWidth=0,gameHeight=0;
	var pallet = {
		border:"#353214",
		inside:"#606066",
		title:"#F2F5FF",
		text:"#919399",
		validBG:"#F5E960",
		invalidBG:"#B7B48F",
		bad:"#F44450"
	};
	
	this.Width = function()
	{
		return gameWidth;
	};
	this.Height = function()
	{
		return gameHeight;
	};
	
	self.setGame = function(g)
	{
		game = g;
		self.Game = g;
		if(g==null){
			self.Tiles = null;
			terrain_disp = null;
			return;
		}
		game.Set_Interface(self);
		var __X,__Y;
		if(g.Terrain_Map==null)
		{
			__X = Levels.Cols(g.Map);
			__Y = Levels.Rows(g.Map);
		}
		else
		{
			__X = g.Terrain_Map.Width;
			__Y = g.Terrain_Map.Height;
		}
		self.Tiles = new Tile_Holder(__X, __Y, function(ui, x, y){
			if(ui.Check_Controls())ui.Select_Tile(x, y);
		});
		self.Tiles.Interface = self;
		terrain_disp = new Tiling;
		terrain_disp.setup(600, 600, game.Terrain_Map.Width*TILESIZE, game.Terrain_Map.Height*TILESIZE, TILESIZE, TILESIZE);
	};
	self.Slide_Up = HUD_Display.Add_Drawable(Shape.Rectangle, "up", 100, 0, 400, 20, "#FF0", Canvas.Clear, 0);
	self.Slide_Down = HUD_Display.Add_Drawable(Shape.Rectangle, "down", 100, 580, 400, 20, "#FF0", Canvas.Clear, 0);
	self.Slide_Left = HUD_Display.Add_Drawable(Shape.Rectangle, "left", 0, 100, 20, 400, "#FF0", Canvas.Clear, 0);
	self.Slide_Right = HUD_Display.Add_Drawable(Shape.Rectangle, "right", 580, 100, 20, 400, "#FF0", Canvas.Clear, 0);
	function overSliders(x,y)
	{
		if(Canvas.overlappingDrawable(self.Slide_Up,x,y))return 0;
		if(Canvas.overlappingDrawable(self.Slide_Down,x,(y*self.gameYScale+(TILESIZE*10-gameHeight))))return 1;
		if(Canvas.overlappingDrawable(self.Slide_Left,x,y))return 2;
		if(Canvas.overlappingDrawable(self.Slide_Right,(x*self.gameXScale+(TILESIZE*10-gameWidth)),y))return 3;
		return -1;
	}
	var hovered_dir = [false,false,false,false];

	/** display */
	self.isTileOnScreen = function(_x, _y)
	{
		var _values = scroller.getValues();
		
		var FarLeftTile = Math.ceil(_values.left/TILESIZE)+1;
		var FarRightTile = Math.floor((_values.left+gameWidth)/TILESIZE)-1;
		var TopTile = Math.ceil(_values.top/TILESIZE)+1;
		var BottomTile = Math.floor((_values.top+gameHeight)/TILESIZE)-1;
		
		if(_x<FarLeftTile)
		if(_y<TopTile)
			return 5; // top left
		if(_x<FarLeftTile)
		if(_y>BottomTile)
			return 6; // bottom left
		if(_x>FarRightTile)
		if(_y>BottomTile)
			return 7; // bottom right
		if(_x>FarRightTile)
		if(_y<TopTile)
			return 8; // top right
		if(_x<FarLeftTile)
			return 1; // just left
		if(_x>FarRightTile)
			return 2; // just right
		if(_y<TopTile)
			return 3; // just top
		if(_y>BottomTile)
			return 4; // just bottom
		return 0; // just right
	};
	self.Scroll_To_Tile = function(_x, _y)
	{
		var direction = self.isTileOnScreen(_x, _y);
		if(direction==1)
			scroller.scrollTo((_x-1)*TILESIZE, scroller.getValues().top, true);
		else if(direction==2)
			scroller.scrollTo((_x+1)*TILESIZE, scroller.getValues().top, true);
		else if(direction==3)
			scroller.scrollTo(scroller.getValues().left, (_y-1)*TILESIZE, true);
		else if(direction==4)
			scroller.scrollTo(scroller.getValues().left, (_y+1)*TILESIZE, true);
		else if(direction==5)
			scroller.scrollTo((_x-1)*TILESIZE-1, (_y-1)*TILESIZE, true);
		else if(direction==6)
			scroller.scrollTo((_x-1)*TILESIZE-1, (_y+1)*TILESIZE, true);
		else if(direction==7)
			scroller.scrollTo((_x+1)*TILESIZE+1, (_y-1)*TILESIZE, true);
		else if(direction==8)
			scroller.scrollTo((_x+1)*TILESIZE+1, (_y+1)*TILESIZE, true);
	};
	self.X_Offset = function()
	{
		return scroller.getValues().left;
	};
	self.Y_Offset = function()
	{
		return scroller.getValues().top;
	};

	self.Outside_Map = 3; // how many tiles are generated to border outside of the defined map tiles
	function paintOffMap(mapX, mapY, drawX, drawY){
		var outside = self.Outside_Map;
		var at = game.Paint_Off_Map[mapX][mapY];
		var zoomedTile = TILESIZE;
		var left = null; // true if overflow, false if overflow in opposite direction
		var overlay = "rgba(0, 0, 0, 0.2)";
		if(mapX==0&&drawX>0){
			for(var lastDrawLeft=drawX,i=1;lastDrawLeft>0;i++,lastDrawLeft-=zoomedTile){
				at = game.Paint_Off_Map[mapX+self.Outside_Map-Math.min(i, outside)][mapY];
				at.UI_Draw(backCanvas, lastDrawLeft-zoomedTile, drawY, true);
				backCanvas.fillStyle = overlay;
				backCanvas.fillRect(lastDrawLeft-zoomedTile, drawY, zoomedTile, zoomedTile);
			}
			left = true;
		}
		else if(mapX+1==game.Terrain_Map.Width&&drawX+zoomedTile<gameWidth){
			for(var lastDrawLeft=drawX+zoomedTile,i=1;lastDrawLeft<gameWidth;i++,lastDrawLeft+=zoomedTile){
				at = game.Paint_Off_Map[mapX+self.Outside_Map+Math.min(i, outside)][mapY];
				at.UI_Draw(backCanvas, lastDrawLeft, drawY, true);
				backCanvas.fillStyle = overlay;
				backCanvas.fillRect(lastDrawLeft, drawY, zoomedTile, zoomedTile);
			}
			left = false;
		}
		if(mapY==0&&drawY>0){
			for(var lastDrawTop=drawY,i=1;lastDrawTop>0;i++,lastDrawTop-=zoomedTile){
				at = game.Paint_Off_Map[mapX][mapY+self.Outside_Map-Math.min(i, outside)];
				at.UI_Draw(backCanvas, drawX, lastDrawTop-zoomedTile, true);
				backCanvas.fillStyle = overlay;
				backCanvas.fillRect(drawX, lastDrawTop-zoomedTile, zoomedTile, zoomedTile);
				if(left==null)continue;
				if(left){
					for(var lastDrawLeft=drawX,j=1;lastDrawLeft>0;j++,lastDrawLeft-=zoomedTile){
						at = game.Paint_Off_Map[mapX+self.Outside_Map-Math.min(j, outside)][mapY+self.Outside_Map-Math.min(i, outside)];
						at.UI_Draw(backCanvas, lastDrawLeft-zoomedTile, lastDrawTop-zoomedTile, true);
						backCanvas.fillStyle = overlay;
						backCanvas.fillRect(lastDrawLeft-zoomedTile, lastDrawTop-zoomedTile, zoomedTile, zoomedTile);
					}
				}else{
					for(var lastDrawLeft=drawX+zoomedTile,j=1;lastDrawLeft<gameWidth;j++,lastDrawLeft+=zoomedTile){
						at = game.Paint_Off_Map[mapX+self.Outside_Map+Math.min(j, outside)][mapY+self.Outside_Map-Math.min(i, outside)];
						at.UI_Draw(backCanvas, lastDrawLeft, lastDrawTop-zoomedTile, true);
						backCanvas.fillStyle = overlay;
						backCanvas.fillRect(lastDrawLeft, lastDrawTop-zoomedTile, zoomedTile, zoomedTile);
					}
				}
			}
		}
		else if(mapY+1==game.Terrain_Map.Height&&drawY+zoomedTile<gameHeight){
			for(var lastDrawTop=drawY+zoomedTile,i=1;lastDrawTop<gameHeight;i++,lastDrawTop+=zoomedTile){
				at = game.Paint_Off_Map[mapX][mapY+self.Outside_Map+Math.min(i, outside)];
				at.UI_Draw(backCanvas, drawX, lastDrawTop, true);
				backCanvas.fillStyle = overlay;
				backCanvas.fillRect(drawX, lastDrawTop, zoomedTile, zoomedTile);
				if(left==null)continue;
				if(left){
					for(var lastDrawLeft=drawX,j=1;lastDrawLeft>0;j++,lastDrawLeft-=zoomedTile){
						at = game.Paint_Off_Map[mapX+self.Outside_Map-Math.min(j, outside)][mapY+self.Outside_Map+Math.min(i, outside)];
						at.UI_Draw(backCanvas, lastDrawLeft-zoomedTile, lastDrawTop, true);
						backCanvas.fillStyle = overlay;
						backCanvas.fillRect(lastDrawLeft-zoomedTile, lastDrawTop, zoomedTile, zoomedTile);
					}
				}else{
					for(var lastDrawLeft=drawX+zoomedTile,j=1;lastDrawLeft<gameWidth;j++,lastDrawLeft+=zoomedTile){
						at = game.Paint_Off_Map[mapX+self.Outside_Map+Math.min(j, outside)][mapY+self.Outside_Map+Math.min(i, outside)];
						at.UI_Draw(backCanvas, lastDrawLeft, lastDrawTop, true);
						backCanvas.fillStyle = overlay;
						backCanvas.fillRect(lastDrawLeft, lastDrawTop, zoomedTile, zoomedTile);
					}
				}
			}
		}
	}
	var paint = function(x, y, left, top, w, h, zoom){
		if(game==null)return;
		/// y and x are flipped when called from scroller, due to nature of canvas data

		var at = game.Terrain_Map.At(y,x);
		if(at==null)return;
		
		at.UI_Draw(terrainCanvas, left, top);
		paintOffMap(y,x,left,top);
		
		if(at.Hidden)
		{
			at = at.Building;
			if(at!=null)at.UI_Draw(buildingCanvas, left, top);
			at = self.Tiles.At(y,x);
			if(at!=null)at.Draw(tileCanvas, left, top, w, h);
			return;
		}
		
		at = at.Building;
		if(at!=null)at.UI_Draw(buildingCanvas, left, top);
		at = game.Units_Map.At(y,x);
		if(at!=null&&at!=moving_unit)at.UI_Draw(charCanvas, left, top);
		at = self.Tiles.At(y,x);
		if(at!=null)at.Draw(tileCanvas, left, top, w, h);
	};
	var simplePaint = function(x, y, left, top, w, h, zoom){
		if(game==null)return;
		
		if(game.Terrain_Map.At(y,x).Hidden)
			return;
		
		at = game.Units_Map.At(y,x);
		if(at==moving_unit&&at!=null)
			at.UI_Draw(moveUnitCanvas, left, top);
	};
	var render = function(left, top, zoom, simple){
		if(game==null)return;
		zoom = 1;
		
		left = Math.round(left);
		top = Math.round(top);
		moveUnitCanvas.clearRect(0,0,600,600);
		overlayCanvas.clearRect(0,0,600,600);
		// hide offscreen active display
		game.Hide_Animations();
		if(simple)
		{
			terrain_disp.render(left, top, zoom, simplePaint);
			return;
		}
		// hide offscreen terrain animations
		game.Hide_Terrain_Anis();
		// TILESIZE = Math.floor((window.mobilecheck() ? 30 : 60 )*zoom);
		self.zoom = zoom;
		// backCanvas.clearRect(0,0,600,600);
		backCanvas.fillStyle = "#3C6BBE";
		backCanvas.fillRect(0, 0, 600, 600);
		worldCanvas.clearRect(0,0,600,600);
		terrainCanvas.clearRect(0,0,600,600);
		buildingCanvas.clearRect(0,0,600,600);
		charCanvas.clearRect(0,0,600,600);
		weatherCanvas.clearRect(0,0,600,600);
		dialogCanvas.clearRect(0,0,600,600);
		devCanvas.clearRect(0,0,600,600);
		// animationCanvas.clearRect(0,0,600,600);
		tileCanvas.clearRect(0,0,600,600);
		hudCanvas.clearRect(0,0,600,600);
		terrain_disp.render(left, top, zoom, paint);
	};

	var Status = {
		Display:0,
		Icon:Stats_Display.Add_Drawable(Images.Retrieve("empty"), "Icon", 0, 0, 1, true, null, Canvas.Background),
		IconBorder:Stats_Display.Add_Drawable(Shape.Box, "IconBorder", 3, 3, 63, 63, "#3C6BBE", Canvas.Merge),
		Name:Stats_Display.Add_Drawable(new Text_Class("15pt Times New Roman", "#000"), "Name", 70, 3, 200, 20, "", Canvas.Background),
		Desc:Stats_Display.Add_Drawable(new Text_Class("10pt Times New Roman", "#000"), "Desc", 70, 25, 200, 35, "", Canvas.Background),
		Info:Stats_Display.Add_Drawable(new Text_Class("10pt Times New Roman", "#000"), "Info", 290, 5, 130, 50, "", Canvas.Background),
		Divisor1:Stats_Display.Add_Drawable(Shape.Rectangle, "Div1", 280, 3, 2, 60, "#000", Canvas.Background, 0),
		Set:function(data)
		{
			Stats_Display.Background.Redraw();
			if(data==null)
			{
				this.Display = 0;
				this.Icon.Alpha.Set(0);
				this.Name.Alpha.Set(0);
				this.Desc.Alpha.Set(0);
				this.Info.Alpha.Set(0);
				this.Divisor1.Alpha.Set(0);
				return;
			}
			this.Display = data.SELECTABLE;
			this.Icon.Source.Set(data);
			this.Icon.X.Set(5+data.X_Offset());
			this.Icon.Y.Set(3+data.Y_Offset());
			this.Icon.State.Set(true);
			this.Icon.Alpha.Set(1);
			this.Name.State.Set(data.Name);
			this.Name.Alpha.Set(1);
			this.Desc.State.Set(data.Description());
			this.Desc.Alpha.Set(1);
			this.Info.Alpha.Set(1);
			this.Divisor1.Alpha.Set(1);
			if(data.SELECTABLE==1)
			{	/// unit
				this.Info.State.Set(data.Health+" / "+data.Max_Health+" HP\n"+(data.Health/data.Max_Health*data.Power).toFixed(0)+" Strength\n"+Char_Data.TypeToStr[data.Unit_Type]+"\n"+data.Movement+" "+Char_Data.MoveToStr[data.Move_Type]);
			}
			else if(data.SELECTABLE==2)
			{	/// city
				this.Icon.State.Set(false);
				this.Info.State.Set((data.Protection*100)+"% Protection\n\n"+Terrain_Data.TypeToStr[data.Type]+"\n"+data.Damage+" Damage");
			}
			else if(data.SELECTABLE==3)
			{	/// terrain
				this.Info.State.Set(data.Stature.Get()+" / "+Building_Data.PLACE[data.Source].Stature+" HP\n"+(data.Protection*100)+"% Protection\n\n"+Building_Data.TypeToStr[data.Type]+"\n"+data.Defense+" Defense\n\n");
			}
		}
	};
	var Avatar = {
		TurnBG:Avatar_Display.Add_Drawable(Shape.Rectangle, "TurnBG", 20, 15, 150, 55, "#73877B", Canvas.Background),
		TurnBox:Avatar_Display.Add_Drawable(Shape.Box, "TurnBox", 20, 15, 150, 55, "#E5D1D0", Canvas.Merge),
		Turn:Avatar_Display.Add_Drawable(new Text_Class("20pt Times New Roman", "#000"), "Turn", 30, 30, 50, 40, null, Canvas.Merge),
		Turn_Number:Avatar_Display.Add_Drawable(new Text_Class("40pt Times New Roman", "#000"), "Turn Number", 100, 20, 50, 45, null, Canvas.Merge),
		Standings:Avatar_Display.Add_Drawable(new Text_Class("15pt Times New Roman", "#000"), "Standings", 20, 85, 200, 20, null, Canvas.Background),
		Standings_Border1:Avatar_Display.Add_Drawable(Shape.Rectangle, "Standings Border1", 20, 80, 150, 2, "#000", Canvas.Background),
		Standings_Border2:Avatar_Display.Add_Drawable(Shape.Rectangle, "Standings Border2", 20, 105, 150, 2, "#000", Canvas.Background),
		Current_Player:Avatar_Display.Add_Drawable(new Text_Class("25pt Times New Roman", "#000"), "Player Name", 10, 130, 200, 35, null, Canvas.Background),
		Info:Avatar_Display.Add_Drawable(new Text_Class("15pt Times New Roman", "#000"), "Info", 15, 165, 200, 20, null, Canvas.Background),
		IconBG:Avatar_Display.Add_Drawable(Shape.Box, "IconBG", 110, 167, 80, 80, "#000", Canvas.Background),
		Icon:Avatar_Display.Add_Drawable(Images.Retrieve("empty"), "Icon", 110, 170, 80, 80, null, Canvas.Background),
		
		All_Threaths:Avatar_Display.Add_Drawable({Draw:function(){}}, "Threats", 605, 242, 80, 30, "#EE6352", Canvas.Background),
		_ThreathsBG:Avatar_Display.Add_Drawable(Shape.Rectangle, "ThreatsBG", 5, 242, 80, 30, "#EE6352", Canvas.Background),
		_ThreathsBox:Avatar_Display.Add_Drawable(Shape.Box, "ThreatsBox", 5, 242, 80, 30, "#7F9172", Canvas.Background),
		_ThreathsTEXT:Avatar_Display.Add_Drawable(new Text_Class("13pt Times New Roman", "#57241E"), "ThreatsText", 9, 250, 80, 20, "DANGER", Canvas.Merge),

		PLHighlights:Avatar_Display.Add_Drawable({
			Font:new Text_Class("15pt Times New Roman", "#ddd"),
			Draw:function(canvas, x, y, w, h, __game){
				if(__game==null ||!~__game)return;
				
				Shape.Rectangle.Draw(canvas, x-5, y-5, w+10, h+10, "#E5D1D0");
				Shape.Box.Draw(canvas, x-5, y-5, w+10, h+10, "#7F9172");
				
				var active_player = __game.Active_Player();
				var total_players = __game.Total_Players();
				
				var str = new Array(total_players);
				var box = new Array(total_players);
				
				for(var i=0;i<total_players;i++)
				{
					str = active_player.Name;
					var j_max = Math.floor(Math.log10(active_player.Cash_Money()))+1;
					if(active_player.Cash_Money()==0)
						j_max = 1;
					if(active_player.Dead)
						j_max = 3;
					for(var j=25-str.length;j>j_max;j--)
					{
						str+=" ";
					}
					if(active_player.Dead)
						str+="XXX";
					else str+="$"+active_player.Cash_Money();
					
					var color = Team_Colors.Color[active_player.Color][2]; //turn this to hex
					box = data_to_hex(color);
					
					Shape.Rectangle.Draw(canvas, x, y+(i*36), w, 30, box);
					Shape.Box.Draw(canvas, x, y+(i*36), w, 30, "#000");
					this.Font.Draw(canvas, x+5, y+(i*36)+5, w, 30, str);
					
					active_player = __game.Player((active_player.Team+1)%total_players);
				}
			}
		}, "Player List Highlights", 10, 360, 180, 85, null, Canvas.Merge),
		
		Update_Player_List:function(){
			var total_players = game.Total_Players();
			this.PLHighlights.Height.Set(total_players*34+1);
			this.PLHighlights.State.Set(game);
		},
		Display:function(player){
			if(player==null||game.Game_Over)
			{
				this.Icon.Alpha.Set(0);
				this.IconBG.Alpha.Set(0);
				this.Standings.State.Set("");
				this.Info.State.Set("");
				this.Current_Player.State.Set("");
				this._ThreathsBG.Alpha.Set(0);
				this._ThreathsBox.Alpha.Set(0);
				this._ThreathsTEXT.Alpha.Set(0);
				return;
			}
			this.TurnBG.Alpha.Set(255);
			this.TurnBox.Alpha.Set(255);
			this.Turn.State.Set("Day");
			this.Turn_Number.State.Set(""+(game.Turn()+1));
			
			var standing = game.Check_Player_Standing(player.Team),
				str = "";
			for(var i=0;i<=standing;i++)
				str+="★   ";
			for(var i=standing+1;i<5;i++)
				str+="☆   ";
			this.Standings.State.Set(str);
			
			this._ThreathsBG.Alpha.Set(255);
			this._ThreathsBox.Alpha.Set(255);
			this._ThreathsTEXT.Alpha.Set(255);
			
			this.Info.State.Set("$"+player.Cash_Money());
			this.Current_Player.State.Set(player.Name);
			this.IconBG.Alpha.Set(255);
			this.Icon.Source.Set(player.Icon);
			this.Update_Player_List();
		}
	};
	var Screen = {
		// Border:Dialog_Display.Add_Drawable(Shape.Box, "Border", 0, 0, 600, 600, "#0ff", Canvas.Background),
		openDrawables:[],
		openButtons:[],
		Hide_Unit_List:function()
		{
			self.inputXScale = 1;
			self.inputYScale = 1;
			var count = 0;
			for(var i in Screen.openDrawables)
			{
				count++;
				Dialog_Display.Delete_Drawable(Screen.openDrawables[i]);
			}
			Screen.openDrawables = [];
			count = 0;
			for(var i in Screen.openButtons)
			{
				count++;
				clickable.Delete_Button(Screen.openButtons[i]);
			}
			Screen.openButtons = [];
			Dialog_Display.Clear();
			self.Select_Tile();
		},
		Next_Player:function(player,callback)
		{
			if(player.Game.Game_Over)return;
			var collectiveDrawable = Dialog_Display.Add_Drawable({
				back:Shape.Rectangle,
				border:Shape.Box,
				icon:player.Icon,
				name:new Text_Class("25pt Times New Roman", "#000"),
				Draw:function(c, x, y, w, h, s){
					this.back.Draw(c,x,y,w,h,"#DDCA7D");
					c.lineWidth = 10;
					this.border.Draw(c,x+5,y+5,w-10,h-10,data_to_hex(Team_Colors.Color[player.Color][2]));
					c.lineWidth = 1;
					this.icon.Draw(c,x+20,y+20);
					this.name.Draw(c,x+100,y+40,w,h,player.Name);
				}
			}, null, 600, 200, 400, 200, null, null, .7);
			Core.Slide_Drawable_X(collectiveDrawable, -500, 10, function(collectiveDrawable){
				setTimeout(function(){
					Core.Fade_Drawable(collectiveDrawable, 0, 5, function(collectiveDrawable){
						Dialog_Display.Delete_Drawable(collectiveDrawable);
						Dialog_Display.Clear();
						callback();
					});
				}, 700);
			});
		}
	};

	var open_menu = null;
	this.Display_Menu = function(menu, no_scale)
	{
		if(open_menu)return;
		open_menu = menu;
		menu_scale = (no_scale==true) ? false : true;
		if(menu_scale)
			menu.Scale(clientWidth/Canvas.MaxWidth, clientHeight/Canvas.MaxHeight);
		else menu.Scale(1, 1);
		self.Click = menu.Click;
		self.Release = menu.Release;
		self.Right_Click = menu.Right_Click;
		self.Mouse_Move = menu.Mouse_Move;
	};
	this.Close_Menu = function()
	{
		if(open_menu)open_menu.Close();
		else return;
		open_menu = null;
		self.Click = click_fnc;
		self.Release = release_fnc;
		self.Right_Click = r_click_fnc;
		self.Mouse_Move = m_move_fnc;
	};

	/** input */
	self.gameXScale = 1;
	self.gameYScale = 1;
	self.inputXScale = 1;
	self.inputYScale = 1;
	self.zoom = 1;
	var clickPos=-1;
	var mousedown = false;
	var in_hl_path = false;
	var touch_start_loc = new Array(2);
	var last_handler = null;
	var curPinchDiff = 0,
		prevPinchDiff = 0;
	self.Set_Controls = function(handler){
		if(last_handler!=null)
		{
			return;
			last_handler.removeEventListener("touchstart touchmove touchend touchcancel mousedown mouseup contextmenu mousemove");
			last_handler = null;
		}
		last_handler = handler;
		window.onkeyup = function(e){
			e = e || window.event;
			if (e.keyCode == '38') {
				scroller.scrollBy(0,-TILESIZE,true);
			}
			else if (e.keyCode == '40') {
				scroller.scrollBy(0,+TILESIZE,true);
			}
			else if (e.keyCode == '37') {
				scroller.scrollBy(-TILESIZE,0,true);
			}
			else if (e.keyCode == '39') {
				scroller.scrollBy(+TILESIZE,0,true);
			}
		};
		handler.addEventListener("touchstart", function(e){
			e.preventDefault();
			
			var x = Math.round(e.touches[0].clientX);
			var y = Math.round(e.touches[0].clientY);
			self.Click(x,y);
			touch_start_loc[0] = x;
			touch_start_loc[1] = y;
			scroller.doTouchStart(e.touches, e.timeStamp);
			mousedown = true;
			in_hl_path = false;
			
			setTimeout(function(){
				if(!mousedown)return false;
				
				in_hl_path = true;
				self.Release(x,y);
				scroller.doTouchEnd(e.timeStamp);
			}, 150);
			
			return false;
		});
		handler.addEventListener("touchmove", function(e){
			e.preventDefault();
			var x = Math.round(e.touches[0].clientX);
			var y = Math.round(e.touches[0].clientY);
			if(e.touches.length==2)
			{
				scroller.doTouchEnd(e.timeStamp);
				var _x = Math.round(e.touches[1].clientX);
				var _y = Math.round(e.touches[1].clientY);
				curPinchDiff = Math.round(Math.sqrt(Math.pow(x - _x, 2)+Math.pow(y - _y, 2)));
				
				if(prevPinchDiff!=0)
				{
					let _zoom = Math.abs(curPinchDiff/prevPinchDiff);
					// LOG.add(""+_zoom, "#FFF", 800);
					// TILESIZE*=_zoom;
					// TILESIZE = Math.max(Math.min(TILESIZE, 90), 30);
				}
				
				prevPinchDiff = curPinchDiff;
				return false;
			}
			else prevPinchDiff = 0;
			
			if(Math.abs(x-touch_start_loc[0])<5 &&
				Math.abs(y-touch_start_loc[1])<5)
				return false;
			
			touch_start_loc[0] = -1;
			touch_start_loc[1] = -1;
			if(in_hl_path)
			{
				self.Mouse_Move(x,y);
				return false;
			}
			
			mousedown = false;
			
			scroller.doTouchMove(e.touches, e.timeStamp, e.scale)
			
			return false;
		});
		handler.addEventListener("touchend", function(e){
			e.preventDefault();
			
			var x = Math.round(e.touches[0].clientX);
			var y = Math.round(e.touches[0].clientY);

			if(!in_hl_path)
			{
				if(Math.abs(x-touch_start_loc[0])<5 &&
					Math.abs(y-touch_start_loc[1])<5)
					self.Release(x,y);
			}
			scroller.doTouchEnd(e.timeStamp);
			touch_start_loc[0] = -1;
			touch_start_loc[1] = -1;
			mousedown = false;
			in_hl_path = false;
			
			return false;
		});
		handler.addEventListener("touchcancel", function(e){
			e.preventDefault();
			
			if(in_hl_path)scroller.doTouchEnd(e.timeStamp);
			touch_start_loc[0] = -1;
			touch_start_loc[1] = -1;
			mousedown = false;
			in_hl_path = false;
		});
		
		handler.addEventListener("mousedown", function(e){
			if(!self.Click(e.layerX,e.layerY))return;
			if(e.target.tagName.match(/input|textarea|select/i)) {
				return;
			}
			scroller.doTouchStart([{
				pageX: e.pageX,
				pageY: e.pageY
			}], e.timeStamp);
			mousedown = true;
			return false;
		});
		handler.addEventListener("mouseup", function(e){
			self.Release(e.layerX,e.layerY);
			if(!mousedown)return;
			scroller.doTouchEnd(e.timeStamp);
			mousedown = false;
			return false;
		});
		handler.addEventListener("contextmenu", function(e){
			e.preventDefault();
			self.Right_Click(e.layerX,e.layerY);
			return false;
		});
		handler.addEventListener("mousemove", function(e){
			self.Mouse_Move(e.layerX,e.layerY);
			if(!mousedown)return;
			scroller.doTouchMove([{
				pageX: e.pageX,
				pageY: e.pageY
			}], e.timeStamp);
			return false;
		});
		handler.addEventListener(navigator.userAgent.indexOf("Firefox") > -1 ? "DOMMouseScroll" :  "mousewheel", function(e){
			scroller.doMouseZoom(e.detail ?(e.detail * -120) : e.wheelDelta, e.timeStamp, e.pageX, e.pageY);
		}, false);
	};
	self.Clickable = {
		Button_Class:function(drawable, response, name){
			this.Name = name;
			this.Overlap = function(x, y)
			{
				var X = drawable.X.Get();
				var Y = drawable.Y.Get();
				if(x>=X&&x<X+drawable.Width.Get())
				if(y>=Y&&y<Y+drawable.Height.Get())
					return true;
				return false;
			};
			this.Click = function()
			{
				response(drawable);
			};
			this.Drawable = drawable;
		},
		Buttons:[],
		Add_Button:function(drawable, response, name){
			var btn = new this.Button_Class(drawable, response, name);
			this.Buttons.unshift(btn);
			return btn;
		},
		Delete_Button:function(index){
			var pos = this.Buttons.indexOf(index);
			if(~pos)
			{
				this.Buttons.splice(pos, 1);
				return this.Buttons.length;
			}
			return false;
		},
		Click:function(x, y){
			for(var i in this.Buttons)
			{
				if(this.Buttons[i].Overlap(x, y))
				{
					this.Buttons[i].Click();
					return true;
				}
			}
			return false;
		}
	};
	var clickable = self.Clickable;
	self.Clickable.Add_Button(Avatar.All_Threaths, function(drawable){
		view_danger();
	});

	var click_fnc = function(x, y){
		if(!allow_input)return;
		x/=self.inputXScale;
		y/=self.inputYScale;
		if(hovered_dir[0])
		{
			scroller.scrollBy(0,-TILESIZE,true);
			return false;
		}
		if(hovered_dir[1])
		{
			scroller.scrollBy(0,TILESIZE,true);
			return false;
		}
		if(hovered_dir[2])
		{
			scroller.scrollBy(-TILESIZE,0,true);
			return false;
		}
		if(hovered_dir[3])
		{
			scroller.scrollBy(TILESIZE,0,true);
			return false;
		}
		clickPos = [x,y];
		return true;
	};
	var release_fnc = function(x, y){
		if(!allow_input)return;
		x/=self.inputXScale;
		y/=self.inputYScale;
		if(~clickPos)
		if(Math.abs(x-clickPos[0])<10&&Math.abs(y-clickPos[1])<10)
		{
			if(self.Clickable.Click(x, y))return;
			self.Tiles.Click(Math.floor((x+scroller.getValues().left)/TILESIZE),Math.floor((y+scroller.getValues().top)/TILESIZE));
		}
	};
	var r_click_fnc = function(x, y){
		if(!allow_input)return;
		x/=self.inputXScale;
		y/=self.inputYScale;
	};
	var m_move_fnc = function(x, y){
		if(!allow_input)return;
		if(mousedown && !in_hl_path)return;
		x/=self.inputXScale;
		y/=self.inputYScale;
		var dir = overSliders(x/self.gameXScale,y/self.gameYScale);
		if(dir==0)
		{
			if(!hovered_dir[0])
			if(scroller.getValues().top!=0)
			{
				hovered_dir[0] = true;
				self.Slide_Up.Alpha.Set(1);
				return;
			}
		}
		else if(hovered_dir[0])
		{
			hovered_dir[0] = false;
			self.Slide_Up.Alpha.Set(0);
		}
		if(dir==1)
		{
			if(!hovered_dir[1])
			if(scroller.getValues().top!=scroller.getScrollMax().top)
			{
				hovered_dir[1] = true;
				self.Slide_Down.Alpha.Set(1);
				return;
			}
		}
		else if(hovered_dir[1])
		{
			hovered_dir[1] = false;
			self.Slide_Down.Alpha.Set(0);
		}
		if(dir==2)
		{
			if(!hovered_dir[2])
			if(scroller.getValues().left!=0)
			{
				hovered_dir[2] = true;
				self.Slide_Left.Alpha.Set(1);
				return;
			}
		}
		else if(hovered_dir[2])
		{
			hovered_dir[2] = false;
			self.Slide_Left.Alpha.Set(0);
		}
		if(dir==3)
		{
			if(!hovered_dir[3])
			if(scroller.getValues().left!=scroller.getScrollMax().left)
			{
				hovered_dir[3] = true;
				self.Slide_Right.Alpha.Set(1);
				return;
			}
		}
		else if(hovered_dir[3])
		{
			hovered_dir[3] = false;
			self.Slide_Right.Alpha.Set(0);
		}
		self.Hover_Tile(Math.floor((x+scroller.getValues().left)/TILESIZE),Math.floor((y+scroller.getValues().top)/TILESIZE));
	};
	self.Click = click_fnc;
	self.Release = release_fnc;
	self.Right_Click = r_click_fnc;
	self.Mouse_Move = m_move_fnc;

	var scroller = new Scroller(render,{
		locking:false,
		zooming:true
	});
	self.reflow = function(w, h){
		gameWidth = w-(window.mobilecheck()?50:210);
		gameHeight = h-(window.mobilecheck()?60:70);
		clientWidth = w;
		clientHeight = h;
		self.gameXScale = gameWidth/600;
		self.gameYScale = gameHeight/600;
		document.getElementById('avatarCanvas').style.left = gameWidth+"px";
		document.getElementById('statsCanvas').style.top = gameHeight+"px";
		document.getElementById('endTurn').style.left = gameWidth+5+"px";
		document.getElementById('endTurn').style.top = gameHeight+"px";
		Dialog_Display.Scale(self.gameXScale, self.gameYScale);
		// Screen.Border.Width.Set(gameWidth);
		// Screen.Border.Height.Set(gameHeight);
		HUD_Display.Scale(self.gameXScale, self.gameYScale);
		Avatar_Display.Scale(1, self.gameYScale);
		Avatar.All_Threaths.X.Set(gameWidth+5);
		Avatar.All_Threaths.Y.Set(Avatar._ThreathsBG.Y.Get()*self.gameYScale);
		Stats_Display.Scale(self.gameXScale, 1);
		Status.Icon.Width.Set(self.gameXScale);
		Status.Icon.Height.Set(self.gameYScale);
		if(open_menu && menu_scale){
			open_menu.Scale(clientWidth/Canvas.MaxWidth, clientHeight/Canvas.MaxHeight);
			return;
		}
		if(game==null)return;
		Avatar_Display.Redraw();
		Stats_Display.Redraw();
		
		scroller.setDimensions(gameWidth, gameHeight, game.Terrain_Map.Width*TILESIZE, game.Terrain_Map.Height*TILESIZE);
	};

	/** functions */
	self.Draw = function(canvas, x, y, w, h, color)
	{
		scroller.repaint();
	};
	self.Simple_Draw = function(canvas, x, y, w, h, color)
	{
		scroller.simple_repaint();
	};
	self.Sample_Draw = function(canvas, x, y, w, h, sampledGame)
	{
		Canvas.ScaleImageData(canvas, self.Get_Sample(sampledGame), x, y, w/fullWidth, h/fullHeight);
	};
	self.Get_Sample = function(sampledGame)
	{
		if(sampledGame==null)return;
		if(!sampledGame.valid)return;
		var fullWidth = sampledGame.Terrain_Map.Width*TILESIZE;
		var fullHeight = sampledGame.Terrain_Map.Height*TILESIZE;
		imageHolderCanvas.clearRect(0, 0, fullWidth, fullHeight);
		for(var i=0;i<sampledGame.Terrain_Map.Width;i++)
		for(var j=0;j<sampledGame.Terrain_Map.Height;j++){
			var at = sampledGame.Terrain_Map.At(i,j);
			if(at!=null){
				at.UI_Draw(imageHolderCanvas, i*TILESIZE, j*TILESIZE, 1);
				at = at.Building;
				if(at!=null)at.UI_Draw(imageHolderCanvas, i*TILESIZE, j*TILESIZE, 1);
			}
			at = sampledGame.Units_Map.At(i,j);
			if(at!=null&&at!=moving_unit)at.UI_Draw(imageHolderCanvas, i*TILESIZE, j*TILESIZE, 1);
		}
		return imageHolderCanvas.getImageData(0, 0, fullWidth, fullHeight);
	};
	self.Update_Player_Info = function()
	{
		Avatar.Display(game.Active_Player());
	};
	self.Open_Unit_Create_Menu = function(player, resources, onBuildFnc, onCloseFnc)
	{
		if(player.Game.Client_Player()!=player)return;
		if(onBuildFnc==null)return;
		
		var TITLE_TEXT = new Text_Class("20pt Verdana", pallet.title);
		var NAME_TEXT = new Text_Class("15pt Verdana", pallet.border);
		var COST_TEXT = new Text_Class("15pt Verdana", pallet.text);
		var BAD_TEXT = new Text_Class("15pt Verdana", pallet.bad);
		
		with(Menu.Game_Prompt)
		{
			Erase();
			
			let draw_top = 50,
				draw_left = 10;
			
			Add(new Canvas.Drawable(Shape.Rectangle, null, 0, 0, gameWidth, gameHeight, pallet.border, null, 0.45), function(){
				self.Close_Menu();
				Menu.Game_Prompt.Erase();
				self.Select_Tile();
				if(onCloseFnc!=null)
					onCloseFnc();
			});
			
				// gound units
			Add(new Canvas.Drawable(TITLE_TEXT, null, draw_left, draw_top-30, 195, 525, "Ground Units"));
			Add(new Canvas.Drawable(Shape.Rectangle, null, draw_left, draw_top, 175, 525, pallet.inside, null, .4));
			Add(new Canvas.Drawable(Shape.Box, null, draw_left, draw_top, 175, 525, pallet.border));
				// air units
			Add(new Canvas.Drawable(TITLE_TEXT, null, 200+draw_left, draw_top-30, 175, 525, "Air Units"));
			Add(new Canvas.Drawable(Shape.Rectangle, null, 200+draw_left, draw_top, 175, 525, pallet.inside, null, .4));
			Add(new Canvas.Drawable(Shape.Box, null, 200+draw_left, draw_top, 175, 525, pallet.border));
				// sea units
			Add(new Canvas.Drawable(TITLE_TEXT, null, 400+draw_left, draw_top-30, 175, 525, "Sea Units"));
			Add(new Canvas.Drawable(Shape.Rectangle, null, 400+draw_left, draw_top, 175, 525, pallet.inside, null, .4));
			Add(new Canvas.Drawable(Shape.Box, null, 400+draw_left, draw_top, 175, 525, pallet.border));
			
			var _units = player.Buildable_Units();
			var ground_index = 0,
				air_index = 0,
				sea_index = 0;
			var drawer = {
				Draw:function(c,x,y,w,h,index){
					var __unit_index = Math.abs(index);
					var BG = pallet.validBG;
					var _COST_ = COST_TEXT;
					var UNIT_IMAGE = Char_Data.CHARS[__unit_index].Sprite[0];
					/* var UNIT_IMAGE = {
						Draw:function(c,x,y,w,h,s){
							var pic = player.Unit_Images[__unit_index][0];
							var behind = canvas.getImageData(x, y, pic.width, pic.height);
							var NotNullCheck = scale(pic, tile_scale, tile_scale);
							if(NotNullCheck!=null)
								pic = NotNullCheck;
							
							canvas.putImageData(_scale==null ? pic : scale(pic, _scale, _scale), x, y);
						}
					}; */
					
					if(index<0)
					{	// grey unit cuz cant afford
						BG = pallet.invalidBG;
						_COST_ = BAD_TEXT;
						// UNIT_IMAGE = Char_Data.CHARS[__unit_index].Sprite[0];
					}
					// normal unit
					
					
					
					Shape.Rectangle.Draw(c,x,y,w,h,BG);
					Shape.Box.Draw(c,x,y,w,h,pallet.border);
					// here put the unit image
					UNIT_IMAGE.Draw(c,x+10,y+15,40,40,Char_Data.CHARS[__unit_index].Name);
					NAME_TEXT.Draw(c,x+50,y+15,w-50,h,Char_Data.CHARS[__unit_index].Name);
					_COST_.Draw(c,x+115,y+55,w,h,"$"+player.Calculate_Cost(__unit_index));
				}
			};
			var click_fnc = function(index){
				self.Close_Menu();
				Menu.Game_Prompt.Erase();
				self.Select_Tile();
				onBuildFnc(index);
			};
			
			for(var j in _units)
			{
				var __unit = Char_Data.CHARS[_units[j]],
					x = draw_left,
					y = draw_top;
				if(__unit.Type==1)
				{
					x+=200;
					y+=(air_index++)*75;
				}
				else if(__unit.Type==2)
				{
					x+=400;
					y+=(sea_index++)*75;
				}
				else y+=(ground_index++)*75;
				if(y>525)
				{	// outside of list length
					continue;
				}
				var cur_drawable = new Canvas.Drawable(drawer, null, x, y, 175, 75, _units[j]);
				
				if(player.Calculate_Cost(_units[j])>resources)
				{	// can't afford!
					Add(cur_drawable);
					cur_drawable.Index = Canvas.No_Draw;
					cur_drawable.State.Set(-_units[j], false);
					continue;
				}					
				Add(cur_drawable, click_fnc, new Canvas.Drawable(Shape.Rectangle, null, x, y, 175, 75, "#ff0", null, .35));
			}
		}
		
		self.Display_Menu(Menu.Game_Prompt);
	};
	self.Open_Unit_Direction_Choice = function(unit, directions, onDecisionFnc)
	{
		if(onDecisionFnc==null)return;
		if(directions.length==0)
		{
			onDecisionFnc(-1);
			return;
		}
		
		with(Menu.Game_Prompt)
		{
			Erase();
			Add(new Canvas.Drawable(Shape.Rectangle, null, 0, 0, 600, 600, pallet.border, null, 0.25), function(){
				self.Close_Menu();
				Menu.Game_Prompt.Erase();
				self.Select_Tile();
				onDecisionFnc();
			});
			
			var click_fnc = function(input)
			{
				console.log("ooh", input);
				self.Close_Menu();
				Menu.Game_Prompt.Erase();
				self.Select_Tile();
				onDecisionFnc(input);
			};
			var _x = unit.X*TILESIZE,
				_y = unit.Y*TILESIZE;
			
			for(var i in directions)
			{
				if(directions[i]==0)
				{	// left
					Add(new Canvas.Drawable({
						Draw:function(c,x,y,w,h,s){
							c.save();
							c.translate(x+TILESIZE, y+TILESIZE);
							c.rotate(180*Math.PI/180);
							ArrowEnd.Draw(c,0,0,w,h);
							c.restore();
						}
					}, null, _x-TILESIZE, _y, TILESIZE, TILESIZE, directions[i]), click_fnc);
					continue;
				}
				if(directions[i]==1)
				{	// up
					Add(new Canvas.Drawable({
						Draw:function(c,x,y,w,h,s){
							c.save();
							c.translate(x, y+TILESIZE);
							c.rotate(270*Math.PI/180);
							ArrowEnd.Draw(c,0,0,w,h);
							c.restore();
						}
					}, null, _x, _y-TILESIZE, TILESIZE, TILESIZE, directions[i]), click_fnc);
					continue;
				}
				if(directions[i]==2)
				{	// right
					Add(new Canvas.Drawable({
						Draw:function(c,x,y,w,h,s){
							c.save();
							c.translate(x, y);
							ArrowEnd.Draw(c,0,0,w,h);
							c.restore();
						}
					}, null, _x+TILESIZE, _y, TILESIZE, TILESIZE, directions[i]), click_fnc);
					continue;
				}
				if(directions[i]==3)
				{	// down
					Add(new Canvas.Drawable({
						Draw:function(c,x,y,w,h,s){
							c.save();
							c.translate(x+TILESIZE, y);
							c.rotate(90*Math.PI/180);
							ArrowEnd.Draw(c,0,0,w,h);
							c.restore();
						}
					}, null, _x, _y+TILESIZE, TILESIZE, TILESIZE, directions[i]), click_fnc);
					continue;
				}
			}
		}
		
		self.Display_Menu(Menu.Game_Prompt, true);
	};

	self.Allow_Controls = function(input)
	{
		allow_input = input;
		if(input)Select_Animation.Stop = false;
		else Select_Animation.Stop = true;
	};
	self.Check_Controls = function()
	{
		return allow_input;
	};
	self.Start = function()
	{
		Animations.kill = false;
		for(var x=1;x<Terrain_Data.TERRE.length;x++)
		{
			var _t = Terrain_Data.TERRE[x];
			if(_t.Connnection==5 || _t.Connnection==3)
				Animations.Retrieve(_t.Name+" Ani").Stop = false;
		}
		Repair_Animation.Stop = false;
		document.getElementById("gameHelpers").style.display = "block";
		window.parent.openChat();
		Mod_List.Units.Self_Action.Irreparable.Sprite = Mod_List.Units.Self_Action.Repairable.Sprite;
		Mod_List.Units.Self_Action.Irreparable.Active = false;
	};
	self.End_Game = function(players, turns)
	{
		Animations.kill = true;
		for(var x=1;x<Terrain_Data.TERRE.length;x++)
		{
			var _t = Terrain_Data.TERRE[x];
			if(_t.Connnection==5 || _t.Connnection==3)
				Animations.Retrieve(_t.Name+" Ani").Stop = true;
		}
		Repair_Animation.Stop = true;
		document.getElementById("gameHelpers").style.display = "none";
		Canvas.Stop_All();
		Canvas.Set_Game(null);
		socket.game_id = null;
		if(players!=null)
		{
			players = Core.Array.Organize.Descending(players, function(index){
				return index.data.turns_alive;
			}, function(index){
				return index.data.damage_delt;
			}, function(index){
				return index.data.units_killed;
			}, function(index){
				return index.data.money_spent;
			});
			self = this;
			Menu.PostGame.Set(game.Name, players, turns, function(){
				self.Close_Menu();
				game = null;
				mainMenu();
			});
			self.Display_Menu(Menu.PostGame);
		}
		this.setGame(null);
		if(online)socket.emit();
	};
	self.Request_Connections = function()
	{
		if(game==null)return [];
		return game.Request_Connections();
	};
	self.ReportLeft = function(leavingPlayer)
	{
		window.parent.refreshChatList();
	};

	function hl_map(map, display)
	{
		for(var i=0;i<map.length;i++)
		{
			game.Interface.Tiles.At(map[i][0], map[i][1]).Set(display);
		}
	}
	function highlight_path(path)
	{
		hl_map(path.Attackables(), 2);
		hl_map(path.All_Movable_Spaces(), 1);
	}
	function highlight_enemies(_game)
	{
		var danger = new Array();
		var total_players = _game.Total_Players(),
			cur_player;
		for(var i=0;i<total_players;i++)
		{
			cur_player = _game.Player(i);
			if(cur_player==_game.Client_Player())
				continue;
			for(var j=0;j<cur_player.Total_Units();j++)
			{
				var unit = cur_player.Get_Unit(j),
					atks;
				if(_game.Terrain_Map.At(unit.X, unit.Y).Hidden)continue;
				unit.Start_Path();
				atks = unit.Current_Path().Attackables();
				for(var k=0;k<atks.length;k++)
				{
					danger.push(atks[k]);
				}
			}
		}
		hl_map(danger, 4);
		return danger;
	}
	function highlight_both(path)
	{
		hl_map(Core.Array.Overlapping_Positions(path.Attackables(), path.All_Movable_Spaces()), 3);
	}
	function unhighlight_path(path)
	{
		hl_map(path.Attackables(), 0);
		hl_map(path.All_Movable_Spaces(), 0);
	}

	this.HIGHLIGHT = function(){
		Avatar._ThreathsBG.State.Set("#dd5040");
		return highlight_enemies(game);
	};
	this.UNHIGHLIGHT = function(_danger){
		Avatar._ThreathsBG.State.Set("#EE6352");
		hl_map(_danger, 0);
	};
	
	
	var selected_tile = null;
	var hovered_tile = [-1,-1];
	var selected_unit = null;
	var hl_path = null;
	var moving_unit = null;
	self.Set_Moving_Unit = function(value)
	{
		moving_unit = value;
	};
	self.Set_Next_Player = function(player, callback)
	{
		self.Allow_Controls(false);
		Avatar.Display();
		Screen.Next_Player(player, function(){ // when done drawing player intro
			Avatar.Display(player);
			self.Allow_Controls(true);
			if(callback!=null)
				callback();
			self.Draw();
		});
	};
	self.Selected_Unit = function()
	{
		return selected_unit;
	};
	self.Selected_Tile = function()
	{
		return selected_tile;
	};
	self.Hover_Tile = function(x, y)
	{
		if(!allow_input)return;
		if(x==hovered_tile[0]&&y==hovered_tile[1])return;
		if(selected_unit!=null)
		{
			selected_unit.Mover.Add(x,y);
		}
		hovered_tile = [x,y];
	};
	self.Select_Tile = function(x, y, mobile_click)
	{
		if(arguments.length<2)
		{
			if(hl_path!=null)
			{
				unhighlight_path(hl_path);
			}
			if(selected_unit!=null)
			{
				if(selected_unit.Mover!=null)
				{
					selected_unit.Mover.Hide();
				}
				selected_unit.Close_Selection();
				selected_unit = null;
			}
			Status.Set();
			selected_tile = null;
			if(_____danger.length>0)
			{
				self.UNHIGHLIGHT(_____danger);
				_____danger = self.HIGHLIGHT();
			}
			self.Draw();
			return;
		}
		if(!allow_input)return;
		
		if(selected_tile!=null)
		if(selected_tile[0]==x&&selected_tile[1]==y)
		{	// status click cycle goes:
			// Unit -> Building -> Terrain -> Unit
			// skipping when there is no data
			if(game.Terrain_Map.At(x,y).Hidden)return;
			if(Status.Display==1)
			{
				var display = game.Terrain_Map.At(x,y);
				if(display.Building!=null)
					Status.Set(display.Building);
				else Status.Set(display);
			}
			else if(Status.Display==2)
			{
				var display = game.Terrain_Map.At(x,y);
				if(display.Unit!=null)
					Status.Set(display.Unit);
				else if(display.Building!=null)
					Status.Set(display.Building);
				else Status.Set(display);
			}
			else if(Status.Display==3)
			{
				Status.Set(game.Terrain_Map.At(x,y));
			}
			if(selected_unit!=null)
			{
				if(hl_path!=null)
				{
					unhighlight_path(hl_path);
				}
				if(selected_unit.Mover!=null)
				{
					selected_unit.Mover.Hide();
				}
				selected_unit.Open_Actions(true);
				selected_unit.Close_Selection();
				selected_unit = null;
			}
			if(_____danger.length>0)
			{
				self.UNHIGHLIGHT(_____danger);
				_____danger = self.HIGHLIGHT();
			}
			return;
		}
		
		selected_tile = [x,y];
		if(hl_path!=null)
		{
			unhighlight_path(hl_path);
		}
		if(selected_unit!=null)
		{	// second click after unit selected
			selected_unit.Mover.Hide();
			var check_unit = game.Units_Map.At(x,y);
			if(!game.Terrain_Map.At(x,y).Hidden && check_unit!=null)
			if(check_unit.Player==selected_unit.Player)
			{
				selected_tile = null;
				self.Select_Tile();
				if(_____danger.length>0)
				{
					self.UNHIGHLIGHT(_____danger);
					_____danger = self.HIGHLIGHT();
				}
				self.Select_Tile(x, y);
				return;
			}
			var path = selected_unit.Mover.Path();
			self.Allow_Controls(false);
			if(game.Move(selected_unit, x, y, path, function(){
				self.Allow_Controls(true);
			}))
			{
				if(online)socket.emit('send move', selected_unit.Index, x, y, path);
			}
			selected_tile = null;
			self.Select_Tile();
			if(_____danger.length>0)
			{
				self.UNHIGHLIGHT(_____danger);
				_____danger = self.HIGHLIGHT();
			}
			return;
		}
		var check_unit = game.Units_Map.At(x,y);
		if(game.Terrain_Map.At(x,y).Hidden || check_unit==null)
		{
			var selected = game.Terrain_Map.At(x,y);
			if(selected.Building!=null)
			{
				selected = selected.Building;
				Status.Set(selected);
				if(!selected.Active)return;
				if(selected.Owner!=game.Active_Player()||selected.Owner!=game.Client_Player())
				{
					if(_____danger.length>0)
					{
						self.UNHIGHLIGHT(_____danger);
						_____danger = self.HIGHLIGHT();
					}
					return;
				}
				selected.Act();
			}
			else Status.Set(selected);
			return;
		}
		
		// everything that gets here -> selecting a unit for the first time
		if(check_unit.Alpha.data==0)return;
		if(check_unit.Source==13)return;
		selected_unit = check_unit;
		selected_unit.Start_Path(x, y);
		selected_unit.Open_Selection();
		hl_path = selected_unit.Current_Path();
		highlight_path(hl_path);
		if(selected_unit.Slow_Attack)
			highlight_both(hl_path);
		Status.Set(selected_unit);
		if(selected_unit.Idle||!selected_unit.Active)
		{
			selected_unit.Close_Selection();
			selected_unit = null;
			if(_____danger.length>0)
			{
				self.UNHIGHLIGHT(_____danger);
				_____danger = self.HIGHLIGHT();
			}
			return;
		}
		if(selected_unit.Player!=game.Active_Player()||selected_unit.Player!=game.Client_Player())
		{
			selected_unit.Close_Selection();
			selected_unit = null;
			if(_____danger.length>0)
			{
				self.UNHIGHLIGHT(_____danger);
				_____danger = self.HIGHLIGHT();
			}
			return;
		}
		selected_unit.Mover = new Move_Class(selected_unit,x,y,game.Terrain_Map,function(_unit, list){
			var canvas = Tile_Display.Context;
			var _x = _unit.X*TILESIZE-scroller.getValues().left,
				_y = _unit.Y*TILESIZE-scroller.getValues().top;
				
			
			if(list.length<=1)
			{
				_unit.Update_Danger(_unit.X, _unit.Y);
				scroller.repaint();
				canvas.drawImage(_select_img, _x, _y, TILESIZE, TILESIZE);
				return;
			}
			_unit.Update_Danger(list[list.length-1][0], list[list.length-1][1]);
			scroller.repaint();
			
			canvas.save();
			canvas.globalAlpha = .85;
			
			canvas.translate(_x, _y);
			canvas.save();
			if(list[0][0]+1==list[1][0])
			{	// to right
				canvas.translate(0, TILESIZE);
				canvas.rotate(270*Math.PI/180);
			}
			else if(list[0][0]-1==list[1][0])
			{	// to left
				canvas.translate(TILESIZE, 0);
				canvas.rotate(90*Math.PI/180);
			}
			else if(list[0][1]-1==list[1][1])
			{	// go up
				canvas.translate(TILESIZE, TILESIZE);
				canvas.rotate(180*Math.PI/180);
			}
			ArrowStart.Draw(canvas, 0, 0, TILESIZE, TILESIZE);
			canvas.restore();
			
			for(var i=1;i<list.length-1;i++)
			{
				if(list[i-1][0]+1==list[i][0])
				{	// from left
					canvas.translate(TILESIZE, 0);
					canvas.save();
					if(list[i][0]+1==list[i+1][0])
					{	// to right
						ArrowStraight.Draw(canvas, 0, 0, TILESIZE, TILESIZE);
					}
					else if(list[i][1]-1==list[i+1][1])
					{	// go up
						canvas.translate(0, TILESIZE);
						canvas.rotate(270*Math.PI/180);
						ArrowTurn.Draw(canvas, 0, 0, TILESIZE, TILESIZE);
					}
					else if(list[i][1]+1==list[i+1][1])
					{	// go down
						canvas.translate(TILESIZE, TILESIZE);
						canvas.rotate(180*Math.PI/180);
						ArrowTurn.Draw(canvas, 0, 0, TILESIZE, TILESIZE);
					}
				}
				else if(list[i-1][0]-1==list[i][0])
				{	// from right
					canvas.translate(-TILESIZE, 0);
					canvas.save();
					if(list[i][0]-1==list[i+1][0])
					{	// to left
						ArrowStraight.Draw(canvas, 0, 0, TILESIZE, TILESIZE);
					}
					else if(list[i][1]-1==list[i+1][1])
					{	// go up
						ArrowTurn.Draw(canvas, 0, 0, TILESIZE, TILESIZE);
					}
					else if(list[i][1]+1==list[i+1][1])
					{	// go down
						canvas.translate(TILESIZE, 0);
						canvas.rotate(90*Math.PI/180);
						ArrowTurn.Draw(canvas, 0, 0, TILESIZE, TILESIZE);
					}
				}
				else if(list[i-1][1]-1==list[i][1])
				{	// from down
					canvas.translate(0, -TILESIZE);
					canvas.save();
					if(list[i][0]+1==list[i+1][0])
					{	// to right
						canvas.translate(TILESIZE, 0);
						canvas.rotate(90*Math.PI/180);
						ArrowTurn.Draw(canvas, 0, 0, TILESIZE, TILESIZE);
					}
					else if(list[i][0]-1==list[i+1][0])
					{	// go left
						canvas.translate(TILESIZE, TILESIZE);
						canvas.rotate(180*Math.PI/180);
						ArrowTurn.Draw(canvas, 0, 0, TILESIZE, TILESIZE);
					}
					else if(list[i][1]-1==list[i+1][1])
					{	// go up
						canvas.translate(TILESIZE, 0);
						canvas.rotate(90*Math.PI/180);
						ArrowStraight.Draw(canvas, 0, 0, TILESIZE, TILESIZE);
					}
				}
				else if(list[i-1][1]+1==list[i][1])
				{	// from up
					canvas.translate(0, TILESIZE);
					canvas.save();
					if(list[i][0]-1==list[i+1][0])
					{	// to left
						canvas.translate(0, TILESIZE);
						canvas.rotate(270*Math.PI/180);
						ArrowTurn.Draw(canvas, 0, 0, TILESIZE, TILESIZE);
					}
					else if(list[i][0]+1==list[i+1][0])
					{	// to right
						// canvas.rotate(90*Math.PI/180);
						ArrowTurn.Draw(canvas, 0, 0, TILESIZE, TILESIZE);
					}
					else if(list[i][1]+1==list[i+1][1])
					{	// go down
						canvas.translate(TILESIZE, 0);
						canvas.rotate(90*Math.PI/180);
						ArrowStraight.Draw(canvas, 0, 0, TILESIZE, TILESIZE);
					}
				}
				canvas.restore();
			}
			
			canvas.save();
			var end = list.length-1;
			var before = end-1;
			if(list[before][0]-1==list[end][0])
			{	// to left
				canvas.translate(0, TILESIZE);
				canvas.rotate(180*Math.PI/180);
			}
			else if(list[before][1]+1==list[end][1])
			{	// go down
				canvas.translate(TILESIZE, TILESIZE);
				canvas.rotate(90*Math.PI/180);
			}
			else if(list[before][1]-1==list[end][1])
			{	// go up
				canvas.translate(0, 0);
				canvas.rotate(270*Math.PI/180);
			}
			else canvas.translate(TILESIZE, 0);
			ArrowEnd.Draw(canvas, 0, 0, TILESIZE, TILESIZE);
			canvas.restore();
			
			canvas.restore();
		});
	};
};