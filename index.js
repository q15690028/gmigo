window.jiaodu;
window.playerShow = true;
window.itemShow = true;
window.lineShow = false;
window.VehiclesShow = true;
window.Kill = true;
window.Gaodu = false;
window.qiche = false;
window.map = false;
window.jls = false;
window.vjd = true;
window.dx = 0;
window.map = Math.floor(Math.random() * 3);
window.mapid = 0;
window.rwgd = 0;
window.wpgd = 0;
window.xzjd = 0;
window.wo = 0;
$(function () {
	function onResize() {
		var height = window.innerHeight;
		var is_safari = navigator.userAgent.indexOf("Safari") > -1;

		if ((navigator.userAgent.match(/iPhone/i)) ||
			(navigator.userAgent.match(/iPod/i))) {
			if (is_safari) {
				height += 80;
			}
		}
		$('#radar').attr("width", window.innerWidth).attr("height", height);
	}
	window.addEventListener('resize', onResize);
	onResize();

	// 禁止移动端弹性webview
	document.ontouchmove = function (event) {
		event.preventDefault();
	}

})

// function getJson() {
        // //$.getJSON("http://m.wjhaomama.com/pubg/api/values/6",
        // $.getJSON("http://39.108.137.83:3000/api/5",
            // function (data) {
                // locations = data;
            // });
    // }
	// window.setInterval(getJson, 1)
	 // setInterval(function () {
		// getJson();
		 // redraw();
	 // }, 50);
	

$(function () {
	var radar = new Radar($('#radar')[0]);
	var socket = io();
	var socketUpdateCounter = new Utils.MinsCounter();
	socket.on('update', function (snapshot) {
		locations = snapshot;
		socketUpdateCounter.update();
		//getJson();
		redraw();
	});

	var locations = {};
	var trackPlayerIndex = parseInt(Utils.getParameterByName('id') || 0);

	var maps = ['map/mapErangel.jpg', 'map/mapMiramar.jpg', 'map/mapSanhok.jpg'];
	var mapParameter = Utils.getParameterByName('map');
	if (mapParameter === '1') {
		radar.setMap(maps[0]);
	} else if (mapParameter === '2') {
		radar.setMap(maps[1]);
	} else if (mapParameter === '3') {
		radar.setMap(maps[2]);
	} else {
		radar.setMap(maps[map]);

	}

	// 手势支持
	var hammertime = new Hammer.Manager($('.container')[0]);
	hammertime.add(new Hammer.Pan({
			threshold: 0
		}));
	hammertime.add(new Hammer.Pinch({
			threshold: 0
		}));

	// 拖动
	var lastDelta = {
		x: 0,
		y: 0
	}
	hammertime.on('panmove', function (ev) {
		radar.setMove(ev.deltaX - lastDelta.x, ev.deltaY - lastDelta.y, xzjd);
		lastDelta.x = ev.deltaX;
		lastDelta.y = ev.deltaY;
		redraw();
	});
	hammertime.on('panend', function (ev) {
		lastDelta = {
			x: 0,
			y: 0
		}
	});

	function game2pix(p) {
		return p * (8130 / 813000)
	}

	$(document).keydown(function (e) {

		switch (e.which) {

		case 81:
			radar.setZoom(Math.pow(1.1, -5));
			redraw();
			break;

		case 69:
			radar.setZoom(Math.pow(1.1, 5));
			redraw();
			break;

			/*	case 112:
			radar.setMap(maps[0]);
			redraw();
			break;

			case 113:
			radar.setMap(maps[1]);
			redraw();
			break;
			case 114:
			radar.setMap(maps[2]);
			redraw();
			break;

			case 188:
			if (playerShow == false) {
			playerShow = true;
			} else {
			playerShow = false;
			}
			redraw();

			break;*/

		case 112:
			if (Kill == false) {
				Kill = true;
			} else {
				Kill = false;
			}
			redraw();
			break;

		case 113:
			if (vjd == false) {
				vjd = true;
			} else {
				vjd = false;
			}
			redraw();
			break;
		case 114:
			if (VehiclesShow == false) {
				VehiclesShow = true;
			} else {
				VehiclesShow = false;
			}
			redraw();
			break;

		case 220:
			window.location.reload();

			break;

		case 33:
			trackPlayerIndex = trackPlayerIndex + 1
				redraw();
			break;

		case 34:
			trackPlayerIndex = trackPlayerIndex - 1
				if (trackPlayerIndex < 0) {
					trackPlayerIndex = 0
				}
				redraw();
			break;
		}

	});

	// 缩放
	var lastScale = 0;
	hammertime.on('pinchmove', function (ev) {
		var size = 0.6;
		if (lastScale > ev.scale) {
			size = -size;
		}
		radar.setZoom(Math.pow(1.1, size));
		lastScale = ev.scale;
		redraw();
	});
	hammertime.on('pinchend', function () {
		lastScale = 0;
	});

	// 鼠标滚轮缩放
	$('.container').on("mousewheel DOMMouseScroll", function (e) {
		var evt = e.originalEvent;
		var delta = evt.wheelDelta ? evt.wheelDelta / 100 : evt.detail ? -evt.detail : 0;
		if (delta) {
			radar.setZoom(Math.pow(1.1, delta));
			redraw();
		}
		return evt.preventDefault() && false;
	});


	function changeMap() {

		if (mapid == 417377418 && map != 0) {
			map = 0
				radar.setMap(maps[0]);
			redraw();
		}
		if (mapid == 1001372888 && map != 1) {
			map = 1
				radar.setMap(maps[1]);
			redraw();
		}
		if (mapid == 384083059 && map != 2) {
			map = 2
				radar.setMap(maps[2]);
			redraw();
		}

	}
	function jiancemap() {
		if (mapid == 417377418 && map != 0) {
			changeMap();
		}
		if (mapid == 1001372888 && map != 1) {
			changeMap();
		}
		if (mapid == 384083059 && map != 2) {
			changeMap();
		}
	}
	window.setTimeout(redraw, 200)
	window.setInterval(jiancemap, 1000)
	function redraw() {

		radar.clear();
		// 视角追踪
		if (locations.players && locations.players[trackPlayerIndex]) {
			var player = locations.players[trackPlayerIndex];
			radar.setFocus(player.x, player.y);
		}
		// draw map

		radar.map();
		drawItems();
		drawwjds();
		//drawZone();
		//drawbiaoqian(xzjd);
		drawVehicles();
		drawPlayers();
		if (wo >= 150080) {
			drawfeiji();
		}

	}

	function drawPlayers(an) {
		if (!locations.players) {
			return;
		}
		if (!locations.vehicles) {
			return;
		}
		var vehicles = locations.vehicles;
		var players = locations.players;
		for (var i = players.length - 1; i >= 0; i--) {
			var player = players[i];
			var color1 = "";
			var color = "";
			var vxzjd = 0;
			var x0 = players[0].x;
			var y0 = players[0].y;
			var x1 = players[i].x;
			var y1 = players[i].y;
			var z0 = players[0].r;
			var h0 = players[0].hp;
			var h1 = players[i].hp;
			var zz0 = parseInt((players[i].z) / 100) - parseInt((players[0].z) / 100);
			var juli = parseInt(Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1)) / 100);
			mapid = player.m;
			rwgd = parseInt((players[0].z) / 100);
			var icolor = false;
			var dcolor = false;
			//radar.text(50000, 200000,  players[0].x, 'red')
		//	radar.text(50000, 350000,  players[0].y, 'red')
			//radar.text(50000, 500000,  players[0].z, 'red')
			//radar.text(50000, 200000,  players[0].r, 'red')
			
			for (var j = vehicles.length - 1; j >= 0; j--) {
				var vehicle = vehicles[j];
				var z1 = players[i].r;
				var name = "";
				var juli2 = parseInt(Math.sqrt((players[0].x - vehicles[j].x) * (players[0].x - vehicles[j].x) + (players[0].y - vehicles[j].y) * (players[0].y - vehicles[j].y)) / 100);
				var juli4 = parseInt(Math.sqrt((players[i].x - vehicles[j].x) * (players[i].x - vehicles[j].x) + (players[i].y - vehicles[j].y) * (players[i].y - vehicles[j].y)) / 100);
				if (juli4 <= 1&& juli4 >=-1&& i != 0) {
					players[i].r = 0
						if (jls == false) {
							dcolor = true;
						}
				}
				if (juli2 <= 1 && juli2 >=-1 ||wo >= 150080) {
					players[0].r = 0
						vxzjd = parseInt(vehicle.r);
					z0 = vxzjd;
					if (jls == false) {
						icolor = true;
					}
				}
				//	radar.text(vehicle.x - 2000, vehicle.y,juli4, 'lime', xzjd)
			}
			var zone = 5;
			xzjd =  - (z0);
			if (i == trackPlayerIndex) {
				color = '#61c757';
				color1 = '#1cbc0c';
				if (icolor == true) {
					color1 = '#3131e8';
					zone = 4;
				}
				if (z0 != 0 && lineShow == true) {
					radar.lineWithAngle(x0, y0, 200, 1.2, player.r, '#61c757', xzjd);
					
				}
				radar.text1(players[0].x, players[0].x, "", "white", -15, 12.8, 30, 12, 22, 8, 0.9)
				radar.znz(players[0].x,players[0].y);
			} else if (players[i].t = player.t) {
				color = '#3496f7';
				color1 = '#066dd6'; //74d46d
				if (dcolor == true) {
					color1 = '#3131e8';
					zone = 4;
				}
			} else {
				color = '#ff303f';
				color1 = '#e00e11';
				if (dcolor == true) {
					color1 = '#3131e8';
					zone = 4;
				}

				if (z1 != 0 && h1 !== 0) {
					if (player.r != 0) {
						if (Kill == true && h1 !== 0 && juli < 1000) {
							radar.text2(player.x, player.y, juli + "m", "white", -15, 12.8, 30, 12, 22, 8)
						}
						if (Kill == false  && h1 !== 0 && juli < 300 && zz0 != 0 && zz0 < 100 && zz0 > (-100)) {
							radar.text2(player.x, player.y, zz0, "white", -9, 12.8, 19, 12, 22, 8)
						}

					}
				}				
			}
			if (player.hp == 0) {
				color = '#000000';
				radar.lineWithAngle(x1, y1, 0, 0, 0, '');
				radar.dot1(player.x, player.y, color);
				//radar.death(player.x, player.y)
			} else {
				if (player.r != 0 && juli < 1000) {
					radar.lineWithAngle(player.x, player.y, 12.7, 8.5, player.r, color);
				}
				if (juli < 1000) {
					radar.dot(x1, y1, color, color1, zone);
					radar.pieChart(player.x, player.y, ((100 - player.hp) / 100), 'gray')
				}
			}

				
			//radar.text2(player.x, player.y, wo, "white", -9, 12.8, 19, 12, 22, 8, 0.9, xzjd)
			//	radar.text(player.x + 2000, player.y, cy0, 'white', xzjd)
			;
		}

	}

	function drawItems(an) {
		if (!locations.items) {
			return;
		}
		var items = locations.items;

		for (var x = items.length - 1; x >= 0; x--) {
			var item = items[x];		
			//radar.text(50000, 350000,  item.y, 'red')
			
			//radar.text(item.x, item.y,  item.z, 'red')
			if (item.n.indexOf("M4") > -1) {
				radar.m4(item.x, item.y);
			} else if (item.n.indexOf("SCAR") > -1) {
				radar.sl(item.x, item.y);
			} else if (item.n.indexOf("M16") > -1) {
				radar.m16(item.x, item.y);
			} else if (item.n.indexOf("Ak") > -1) {
				radar.ak(item.x, item.y);
			} else if (item.n.indexOf("DP-28") > -1) {
				radar.dp(item.x, item.y);
			} else if (item.n.indexOf("Mini") > -1) {
				radar.mn(item.x, item.y);
			} else if (item.n.indexOf("SKS") > -1) {
				radar.sks(item.x, item.y);
			} else if (item.n.indexOf("98K") > -1) {
				radar.k98(item.x, item.y);
			} else if (item.n.indexOf("M24") > -1) {
				radar.m24(item.x, item.y);
			} else if (item.n.indexOf("slr") > -1) {
				radar.slr(item.x, item.y);
			} else if (item.n.indexOf("xhq") > -1) {
				radar.xhq(item.x, item.y);
			} else if (item.n.indexOf("B3") > -1) {
				radar.b3(item.x, item.y);
			} else if (item.n.indexOf("B2") > -1) {
				radar.b2(item.x, item.y);
			} else if (item.n.indexOf("T3") > -1) {
				radar.t3(item.x, item.y);
			} else if (item.n.indexOf("J2") > -1) {
				radar.j2(item.x, item.y);
			} else if (item.n.indexOf("J3") > -1) {
				radar.j3(item.x, item.y);
			} else if (item.n.indexOf("T2") > -1) {
				radar.t2(item.x, item.y);
			} else if (item.n.indexOf("BXY") > -1) {
				radar.bx(item.x, item.y);
			} else if (item.n.indexOf("JXY") > -1) {
				radar.jx(item.x, item.y);
			} else if (item.n.indexOf("BKr") > -1) {
				radar.bk(item.x, item.y);
			} else if (item.n.indexOf("JKr") > -1) {
				radar.jk(item.x, item.y);
			} else if (item.n.indexOf("J3") > -1) {
				radar.j3(item.x, item.y);
			} else if (item.n.indexOf("Hd") > -1) {
				radar.hd(item.x, item.y);
			} else if (item.n.indexOf("jjb") > -1) {
				radar.jj(item.x, item.y);
			} else if (item.n.indexOf("ylb") > -1) {
				radar.yl(item.x, item.y);
			} else if (item.n.indexOf("zt") > -1) {
				radar.zt(item.x, item.y);
			} else if (item.n.indexOf("lyl") > -1) {
				radar.lyl(item.x, item.y);
			} else if (item.n.indexOf("ssjs") > -1) {
				radar.ssjs(item.x, item.y);
			} else if (item.n.indexOf("Qx") > -1) {
				radar.qx(item.x, item.y);
			} else if (item.n.indexOf("4X") > -1) {
				radar.x4(item.x, item.y);
			} else if (item.n.indexOf("8X") > -1) {
				radar.x8(item.x, item.y);
			} else if (item.n.indexOf("3X") > -1) {
				radar.x3(item.x, item.y);
			} else if (item.n.indexOf("6X") > -1) {
				radar.x6(item.x, item.y);
			} else if (item.n.indexOf("QBZ") > -1) {
				radar.qbz(item.x, item.y);
			} else {}

			
		}

	}

	function drawVehicles(an) {
		if (!locations.vehicles) {
			return;
		}
		var vehicles = locations.vehicles;
		jls=false;
		for (var j = vehicles.length - 1; j >= 0; j--) {
			var vehicle = vehicles[j];		
			
			if (vehicle.v.indexOf("DummyT") >= 0) {}
			else if (vehicle.v.indexOf("Parach") >= 0) {
				  jls=true;
			} else if (vehicle.v.indexOf("AquaRa") >= 0) {
				radar.dot1(vehicle.x, vehicle.y, '	SlateBlue');
			} else if (vehicle.v.indexOf("Boat_P") >= 0) {
				radar.dot1(vehicle.x, vehicle.y, '	SlateBlue');
			} else if (vehicle.v.indexOf("feiji") >= 0) {
				radar.dot1(vehicle.x, vehicle.y, '#00BFFF');
			} else if (vehicle.v.indexOf("cjkt") >= 0) {
				radar.dot1(vehicle.x, vehicle.y, 'Yellow');
			} else if (vehicle.v.indexOf("BP_Mir") >= 0) {
				radar.dot1(vehicle.x, vehicle.y, 'Orange');
			} else {
				radar.dot1(vehicle.x, vehicle.y, '#3131e8');
			}
			//radar.qc(vehicle.x, vehicle.y,  xzjd);
			//	radar.text(vehicle.x, vehicle.y, juli2, 'white', xzjd)
			//radar.text(vehicle.x, vehicle.y + 2000, rwr, 'red', xzjd)
			
		}
	}

	function drawwjds(an) {
		if (!locations.wjds) {
			return;
		}
		var wjds = locations.wjds;
		for (var i = wjds.length - 1; i >= 0; i--) {
			var wjd = wjds[i];
			
			if (wjd.v.indexOf("zskt") >= 0) {
				radar.ktx(wjd.x, wjd.y);
			}
			if (wjd.v.indexOf("Item_Weapon_Mk14") >= 0) {
				radar.text1(wjd.x, wjd.y, "M K 1 4", "#FF00FF", -20, 10, 40, 12, 19.5, 8, 0.8);
			} else if (wjd.v.indexOf("Item_Weapon_M249") >= 0) {
				radar.text1(wjd.x, wjd.y, "M 2 4 9", "#FF00FF", -20, 10, 40, 12, 19.5, 8, 0.8);
			} else if (wjd.v.indexOf("Item_Weapon_M24") >= 0) {
				radar.text1(wjd.x, wjd.y, "M 2 4", "#FF00FF", -18, 10, 32, 12, 19.5, 8, 0.8);
			} else if (wjd.v.indexOf("Item_Weapon_AWM") >= 0) {
				radar.text1(wjd.x, wjd.y, "A W M", "#FF00FF", -18, 10, 36, 12, 19.5, 8, 0.8);
			} else if (wjd.v.indexOf("Item_Weapon_Groza") >= 0) {
				radar.text1(wjd.x, wjd.y, "G o u z a", "#FF00FF", -21, 10, 42, 12, 19.5, 8, 0.8);
			} else if (wjd.v.indexOf("Item_Weapon_AUG") >= 0) {
				radar.text1(wjd.x, wjd.y, "A U G", "#FF00FF", -18, 10, 32, 12, 19.5, 8, 0.8);
			} else if (wjd.v.indexOf("Death") >= 0) {
				radar.bao(wjd.x, wjd.y);
			}
			
		}

	}

	function drawZone() {
		//radar.xz(an);
		//radar.white(270500, 270500, 231887,xzjd);
	//	radar.blue(406387.5, 406387.5, 579718.6875,xzjd);
		var zone = locations.zone;
		if (zone[0].br > 0) {
			radar.blue( zone[0].bx, zone[0].by, zone[0].br,xzjd);
		}
		if (zone[0].r > 0) {
			radar.white(zone[0].x, zone[0].y, zone[0].r,xzjd);
		}
//radar.restore();
		//radar.text(50000, 50000, zone[0].bx, 'red')
	}
	function drawfeiji() {

		if (!locations.vehicles) {
			return;
		}
		var vehicles = locations.vehicles;
		for (var i = vehicles.length - 1; i >= 0; i--) {
			var vehicle = vehicles[i];
			var fjjd =  - (vehicle.r)
				if (vehicle.v.indexOf("DummyT") >= 0) {
					radar.feiji(vehicle.x, vehicle.y, xzjd, fjjd);
				}

		}
	}
	// function drawMisc() {
	//radar.floatText(0, 10, "Update: " + socketUpdateCounter.getPerSec() + "ps");
	// }
});
