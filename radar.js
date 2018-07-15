window.angleInDegrees2 = 0;
window.endPt;
function Radar(canvas) {
	this.canvas = canvas;
	this.ctx = canvas.getContext('2d');
	trackTransforms(this.ctx);
	this.zone;
	this.lastBlueZone;
	this.lastWhiteZone;
	this.scaledFactor = 1;
	this.mapImage = new Image;
	this.focusOffset = {
		X: this.canvas.width / 2,
		Y: this.canvas.height / 2
	};
	this.viewPortOffset = {
		X: 0,
		Y: 0
	};
	var self = this;
	window.addEventListener('resize', function () {
		self.focusOffset = {
			X: self.canvas.width / 2,
			Y: self.canvas.height / 2
		};
	});

	// Adds ctx.getTransform() - returns an SVGMatrix
	// Adds ctx.transformedPoint(x,y) - returns an SVGPoint
	function trackTransforms(ctx) {
		var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		var xform = svg.createSVGMatrix();
		ctx.getTransform = function () {
			return xform;
		};

		var savedTransforms = [];
		var save = ctx.save;
		ctx.save = function () {
			savedTransforms.push(xform.translate(0, 0));
			return save.call(ctx);
		};
		var restore = ctx.restore;
		ctx.restore = function () {
			xform = savedTransforms.pop();
			return restore.call(ctx);
		};

		var scale = ctx.scale;
		ctx.scale = function (sx, sy) {
			xform = xform.scaleNonUniform(sx, sy);
			return scale.call(ctx, sx, sy);
		};
		var rotate = ctx.rotate;
		ctx.rotate = function (radians) {
			xform = xform.rotate(radians * 180 / Math.PI);
			return rotate.call(ctx, radians);
		};
		var translate = ctx.translate;
		ctx.translate = function (dx, dy) {
			xform = xform.translate(dx, dy);
			return translate.call(ctx, dx, dy);
		};
		var transform = ctx.transform;
		ctx.transform = function (a, b, c, d, e, f) {
			var m2 = svg.createSVGMatrix();
			m2.a = a;
			m2.b = b;
			m2.c = c;
			m2.d = d;
			m2.e = e;
			m2.f = f;
			xform = xform.multiply(m2);
			return transform.call(ctx, a, b, c, d, e, f);
		};
		var setTransform = ctx.setTransform;
		ctx.setTransform = function (a, b, c, d, e, f) {
			xform.a = a;
			xform.b = b;
			xform.c = c;
			xform.d = d;
			xform.e = e;
			xform.f = f;
			return setTransform.call(ctx, a, b, c, d, e, f);
		};
		var pt = svg.createSVGPoint();
		ctx.transformedPoint = function (x, y) {
			pt.x = x;
			pt.y = y;
			return pt.matrixTransform(xform.inverse());
		}
	}
}

Radar.prototype.setMap = function (map) {
	this.mapImage.src = map;
}

Radar.prototype.map = function (angel) {
	this.xz(angel);
	this.ctx.drawImage(this.mapImage, 0, 0);
	this.ctx.restore();
}
Radar.prototype.restore = function () {

	this.ctx.restore();
}

Radar.prototype.clear = function () {
	var p1 = this.ctx.transformedPoint(0, 0);
	var p2 = this.ctx.transformedPoint(this.canvas.width, this.canvas.height);
	this.ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
}

Radar.prototype.translate = function (offsetX, offsetY) {
	this.ctx.translate(offsetX, offsetY);
	this.viewPortOffset.X += offsetX;
	this.viewPortOffset.Y += offsetY;
}

Radar.prototype.setZoom = function (scale) {
	var pt = this.ctx.transformedPoint(this.canvas.width / 2, this.canvas.height / 2);
	this.scaledFactor *= scale;
	this.ctx.translate(pt.x, pt.y);
	this.ctx.scale(scale, scale);
	this.ctx.translate(-pt.x, -pt.y);
	this.clear()
}

Radar.prototype.setMove = function (offsetX, offsetY) {
    offsetX = offsetX / this.scaledFactor;
    offsetY = offsetY / this.scaledFactor;
    this.translate(offsetX, offsetY);
}

Radar.prototype.setFocus = function (x, y) {
	var pos = this.coords2Pos(x, y);
	this.translate(this.focusOffset.X - pos.X, this.focusOffset.Y - pos.Y);
	this.focusOffset = pos;

}

// translates game coords to overlay coords
Radar.prototype.game2Pix = function (p) {
	return p * (8130 / 813000)
}

Radar.prototype.coords2Pos = function (x, y) {
	return {
		X: this.game2Pix(x),
		Y: this.game2Pix(y)
	}
}

Radar.prototype.dot = function (x, y, color, color1,zone, width) {
	var pos = this.coords2Pos(x, y);
	this.ctx.beginPath();
	var radius = 8 / this.scaledFactor;
	this.ctx.arc(pos.X, pos.Y, radius, 0, 2 * Math.PI, false);
	this.ctx.lineWidth = width || 5;
	this.ctx.fillStyle = color || 'red';
	this.ctx.fill()
	this.ctx.beginPath();
	var radius1 = zone / this.scaledFactor;
	this.ctx.arc(pos.X + (0.1 / this.scaledFactor), pos.Y + (-0.1 / this.scaledFactor), radius1, 0, 2 * Math.PI, false);
	this.ctx.lineWidth = width || 5;
	this.ctx.fillStyle = color1 || 'red';
	this.ctx.fill();
}
Radar.prototype.dot1 = function (x, y, color, width) {
	var pos = this.coords2Pos(x, y);
	var radius = 4 / this.scaledFactor;
	this.ctx.beginPath();
	this.ctx.arc(pos.X, pos.Y, radius, 0, 2 * Math.PI, false);
	this.ctx.lineWidth = width || 5;
	this.ctx.fillStyle = color || 'red';
	this.ctx.fill();
}

Radar.prototype.text = function (x, y, content, color) {
	var pos = this.coords2Pos(x, y);
	this.ctx.font = '' + 20 / this.scaledFactor + 'pt Calibri';
	//	this.ctx.lineWidth = 2/ this.scaledFactor;
	//this.ctx.strokeStyle = 'black';
	//  this.ctx.strokeText(content,pos.X, pos.Y + (3 / this.scaledFactor));
	this.ctx.fillStyle = color || 'white';
	this.ctx.textAlign = 'center';
	this.ctx.fillText(content, pos.X, pos.Y + (3 / this.scaledFactor));
}

Radar.prototype.feiji = function (x, y,angel,angel2) {
	var pos = this.coords2Pos(x, y);
	this.ctx.save();
    var pt = this.ctx.transformedPoint(this.canvas.width / 2, this.canvas.height / 2);
	this.ctx.translate(pt.x, pt.y);
	this.ctx.rotate((angel-90)* Math.PI / 180);
	this.ctx.translate(-pt.x, -pt.y);
	this.ctx.translate(pos.X,pos.Y);
	this.ctx.rotate(-(angel2-90)* Math.PI / 180);
	this.ctx.translate(-(pos.X),-(pos.Y));	
	this.imgObj36 = new Image;
	this.imgObj36.src = "map/feiji.png";
	var dx = 50;
	var dxx = dx / 2;
	this.ctx.drawImage(this.imgObj36, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);
;
	this.ctx.restore();
}
Radar.prototype.xz2 = function (x, y, angel) {
	this.ctx.save();
	var pos = this.coords2Pos(x, y);
	var pt = this.ctx.transformedPoint(this.canvas.width / 2, this.canvas.height / 2);
	this.ctx.translate(pt.x, pt.y);
	this.ctx.rotate((angel - 90) * Math.PI / 180);
	this.ctx.translate(-pt.x, -pt.y);

	this.ctx.translate(pos.X, pos.Y);
	this.ctx.rotate( - (angel - 90) * Math.PI / 180);
	this.ctx.translate( - (pos.X),  - (pos.Y));
}
Radar.prototype.xz = function (angel) {
	this.ctx.save();
	var pt = this.ctx.transformedPoint(this.canvas.width / 2, this.canvas.height / 2);
	this.ctx.translate(pt.x, pt.y);
	this.ctx.rotate((angel - 90) * Math.PI / 180);
	this.ctx.translate(-pt.x, -pt.y);
}
Radar.prototype.xz1 = function (x, y, angel) {
	var pos = this.coords2Pos(x, y);	

	this.ctx.translate(pos.X, pos.Y);
	this.ctx.rotate( - (angel - 90) * Math.PI / 180);
	this.ctx.translate( - (pos.X),  - (pos.Y));

}

Radar.prototype.text1 = function (x, y, content, color, zy, sx, cd, kd, yy, size, ap) {	
	var pos = this.coords2Pos(x, y);	
	this.ctx.font = '' + size / this.scaledFactor + 'pt Calibri';
	this.ctx.globalAlpha = 0.63;
	this.ctx.fillStyle = "black";
	this.ctx.fillRect(pos.X + (zy / this.scaledFactor), pos.Y + (sx / this.scaledFactor), cd / this.scaledFactor, kd / this.scaledFactor);
	this.ctx.globalAlpha = ap || 1;
	this.ctx.fillStyle = color || 'white';
	this.ctx.textAlign = 'center';
	this.ctx.fillText(content, pos.X, pos.Y + (yy / this.scaledFactor));
}
Radar.prototype.text2 = function (x, y, content, color, zy, sx, cd, kd, yy, size, ap,angle) {	
	var pos = this.coords2Pos(x, y);	
	this.ctx.save();
	this.ctx.translate(pos.X, pos.Y);
	this.ctx.rotate( - (angle - 90) * Math.PI / 180);
	this.ctx.translate( - (pos.X),  - (pos.Y));
	this.ctx.font = '' + size / this.scaledFactor + 'pt Calibri';
	this.ctx.globalAlpha = 1;
	this.ctx.fillStyle = "black";
	this.ctx.fillRect(pos.X + (zy / this.scaledFactor), pos.Y + (sx / this.scaledFactor), cd / this.scaledFactor, kd / this.scaledFactor);
	this.ctx.globalAlpha = ap || 1;
	this.ctx.fillStyle = color || 'white';
	this.ctx.textAlign = 'center';
	this.ctx.fillText(content, pos.X, pos.Y + (yy / this.scaledFactor));
	this.ctx.restore();
}
Radar.prototype.blue = function (x, y, r,angel) {
	this.xz(angel);
	this.ctx.beginPath();
	this.ctx.arc(this.game2Pix(x), this.game2Pix(y), this.game2Pix(r), 0, 2 * Math.PI, false);
	this.ctx.lineWidth = 1.5 / this.scaledFactor;
	this.ctx.strokeStyle = "blue";
	this.ctx.stroke();
	this.ctx.restore();
}

Radar.prototype.white = function (x, y, r,angel) {
	this.xz(angel);	
	//this.ctx.globalAlpha = 0.4;
//	//this.ctx.fillStyle = '#0072E3';
	//this.ctx.fillRect(0,0,8192,8192);
	//this.ctx.globalCompositeOperation="source-over"
	this.ctx.beginPath();
	this.ctx.arc(this.game2Pix(x), this.game2Pix(y), this.game2Pix(r), 0, 2 * Math.PI, false);
	this.ctx.lineWidth = 1.5 / this.scaledFactor;
	this.ctx.strokeStyle = "white";
	this.ctx.stroke();
	this.ctx.restore();
}

Radar.prototype.textAtAngle = function (txt, x, y, length, angle, color) {
	var pos = this.coords2Pos(x, y);
	this.ctx.moveTo(pos.X, pos.Y);
	this.ctx.beginPath();
	this.ctx.font = '' + 11 / this.scaledFactor + 'YaHei Consolas Hybrid';
	this.ctx.fillStyle = color;
	this.ctx.textAlign = 'center';
	this.ctx.fillText(txt, pos.X + length * Math.cos(Math.PI * angle / 180.0), pos.Y + length * Math.sin(Math.PI * angle / 180.0));
}

Radar.prototype.znz = function (x, y) {
	var pos = this.coords2Pos(x, y);
	var radius = 70 / this.scaledFactor;
	this.ctx.beginPath();
	this.ctx.strokeStyle = 'white';
	this.ctx.arc(pos.X, pos.Y, radius, 0, 2 * Math.PI, false);
	this.ctx.lineWidth = 1 / this.scaledFactor;
	this.ctx.stroke();
	this.ctx.beginPath();
	this.ctx.font = '' + 8 / this.scaledFactor + 'YaHei Consolas Hybrid';
	this.ctx.fillStyle = 'white';
	this.ctx.textAlign = 'center';
	var dict = {
		0: "北",
		90: "东",
		180: "南",
		270: "西",
		45: "东北",
		135: "东南",
		225: "西南",
		315: "西北"
	};

	for (j = 0; j < 24; j++) {
		var color = "#FFFFFF";
		var len = 90;
		ang = j * 15;
		tt = Math.abs(ang);
		if (tt > 270 || tt < 90)
			len = 85;
		if (dict[tt]) {
			tt = dict[tt];
			color = "#FF56FF";
			this.textAtAngle(tt + " ", x, y, len / this.scaledFactor, ang - 90, color);
		} else {
			//if(scaledFactor > 0.8){
			this.textAtAngle(tt + " ", x, y, len / this.scaledFactor, ang - 90, color);
			//}
		}
	}
}

Radar.prototype.dot2 = function (x, y, color, width) {
	var pos = this.coords2Pos(x, y);
	var radius = 5.5 / this.scaledFactor;
	this.ctx.beginPath();
	this.ctx.arc(pos.X, pos.Y, radius, 0, 2 * Math.PI, false);
	this.ctx.lineWidth = width || 5;
	this.ctx.fillStyle = color || 'red';
	this.ctx.fill();
}

Radar.prototype.pieChart = function (x, y, percent, color) {

	var pos = this.coords2Pos(x, y);
	var radius = 7 / this.scaledFactor;
	var startAngle = 1.5 * Math.PI;
	var endAngle = (percent * 2 * Math.PI) + 1.5 * Math.PI;
	this.ctx.fillStyle = color || 'gray';
	this.ctx.beginPath();
	this.ctx.moveTo(pos.X, pos.Y);
	this.ctx.arc(pos.X, pos.Y, radius, startAngle, endAngle, false);
	this.ctx.closePath();
	this.ctx.fill();
}

Radar.prototype.weapons = function (x, y,img,dx) {
	var pos = this.coords2Pos(x, y);
	this.id = new Image;
	this.id.src = "weapon/"+img+".png";
	var dxx = dx / 2;
	this.ctx.drawImage(this.id, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

	}

Radar.prototype.ak = function (x, y) {
	var pos = this.coords2Pos(x, y);
	this.imgObj1 = new Image;
	this.imgObj1.src = "weapon/ak.png";
	var dx = 30;
	var dxx = dx / 2;
	this.ctx.drawImage(this.imgObj1, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);
}

Radar.prototype.b2 = function (x, y) {
	this.imgObj2 = new Image;
	this.imgObj2.src = "weapon/B2.png";
	var pos = this.coords2Pos(x, y);
	var dx = 22;
	var dxx = dx / 2;
	this.ctx.drawImage(this.imgObj2, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}

Radar.prototype.j2 = function (x, y) {
	this.imgObj3 = new Image;
	this.imgObj3.src = "weapon/J2.png";
	var pos = this.coords2Pos(x, y);
	var dx = 18;
	var dxx = dx / 2; ;
	this.ctx.drawImage(this.imgObj3, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);
}

Radar.prototype.t2 = function (x, y) {
	this.imgObj4 = new Image;
	this.imgObj4.src = "weapon/T2.png";
	var pos = this.coords2Pos(x, y);
	var dx = 22;
	var dxx = dx / 2;
	this.ctx.drawImage(this.imgObj4, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}

Radar.prototype.m4 = function (x, y) {
	var pos = this.coords2Pos(x, y);
	this.imgObj5 = new Image;
	this.imgObj5.src = "weapon/m4.png";
	var dx = 30;
	var dxx = dx / 2;
	this.ctx.drawImage(this.imgObj5, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);
}

Radar.prototype.m16 = function (x, y) {
	this.imgObj6 = new Image;
	this.imgObj6.src = "weapon/m16.png";
	var pos = this.coords2Pos(x, y);
	var dx = 30;
	var dxx = dx / 2;
	this.ctx.drawImage(this.imgObj6, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);
}
Radar.prototype.hd = function (x, y) {

	this.imgObj7 = new Image;
	this.imgObj7.src = "weapon/hd.png";
	var pos = this.coords2Pos(x, y);
	var dx = 22;
	var dxx = dx / 2;
	this.ctx.drawImage(this.imgObj7, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}
Radar.prototype.sl = function (x, y) {

	this.imgObj8 = new Image;
	this.imgObj8.src = "weapon/sl.png";
	var pos = this.coords2Pos(x, y);
	var dx = 30;
	var dxx = dx / 2;
	this.ctx.drawImage(this.imgObj8, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);
}

Radar.prototype.qbz = function (x, y) {

	this.imgObj39 = new Image;
	this.imgObj39.src = "weapon/qbz.png";
	var pos = this.coords2Pos(x, y);
	var dx = 30;
	var dxx = dx / 2;
	this.ctx.drawImage(this.imgObj39, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);
}

Radar.prototype.mn = function (x, y) {

	this.imgObj9 = new Image;
	this.imgObj9.src = "weapon/mn.png";
	var pos = this.coords2Pos(x, y);
	var dx = 30;
	var dxx = dx / 2;

	this.ctx.drawImage(this.imgObj9, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}

Radar.prototype.sks = function (x, y) {

	this.imgObj10 = new Image;
	this.imgObj10.src = "weapon/sks.png";
	var pos = this.coords2Pos(x, y);
	var dx = 30;
	var dxx = dx / 2;

	this.ctx.drawImage(this.imgObj10, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}

Radar.prototype.k98 = function (x, y) {

	this.imgObj11 = new Image;
	this.imgObj11.src = "weapon/98.png";
	var pos = this.coords2Pos(x, y);
	var dx = 30;
	var dxx = dx / 2;
	this.ctx.drawImage(this.imgObj11, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);
}

Radar.prototype.m24 = function (x, y) {

	this.imgObj37 = new Image;
	this.imgObj37.src = "weapon/m24.png";
	var pos = this.coords2Pos(x, y);
	var dx = 30;
	var dxx = dx / 2;
	this.ctx.drawImage(this.imgObj37, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);
}

Radar.prototype.slr = function (x, y) {

	this.imgObj33 = new Image;
	this.imgObj33.src = "weapon/slr.png";
	var pos = this.coords2Pos(x, y);
	var dx = 30;
	var dxx = dx / 2;

	this.ctx.drawImage(this.imgObj33, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}

Radar.prototype.qx = function (x, y) {

	var pos = this.coords2Pos(x, y);
	this.imgObj12 = new Image;
	this.imgObj12.src = "weapon/qx.png";
	var dx = 22;
	var dxx = dx / 2;

	this.ctx.drawImage(this.imgObj12, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}
Radar.prototype.t3 = function (x, y) {

	this.imgObj13 = new Image;
	this.imgObj13.src = "weapon/t3.png";
	var pos = this.coords2Pos(x, y);
	var dx = 22;
	var dxx = dx / 2;

	this.ctx.drawImage(this.imgObj13, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}

Radar.prototype.j3 = function (x, y) {

	this.imgObj14 = new Image;
	this.imgObj14.src = "weapon/j3.png";
	var pos = this.coords2Pos(x, y);
	var dx = 22;
	var dxx = dx / 2;

	this.ctx.drawImage(this.imgObj14, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}

Radar.prototype.b3 = function (x, y) {

	this.imgObj15 = new Image;
	this.imgObj15.src = "weapon/b3.png";
	var pos = this.coords2Pos(x, y);
	var dx = 22;
	var dxx = dx / 2;

	this.ctx.drawImage(this.imgObj15, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}

Radar.prototype.bk = function (x, y) {

	this.imgObj16 = new Image;
	this.imgObj16.src = "weapon/bk.png";
	var pos = this.coords2Pos(x, y);
	var dx = 22;
	var dxx = dx / 2;

	this.ctx.drawImage(this.imgObj16, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}

Radar.prototype.jj = function (x, y) {

	this.imgObj17 = new Image;
	this.imgObj17.src = "weapon/jj.png";
	var pos = this.coords2Pos(x, y);
	var dx = 22;
	var dxx = dx / 2;

	this.ctx.drawImage(this.imgObj17, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}

Radar.prototype.jk = function (x, y) {

	this.imgObj18 = new Image;
	this.imgObj18.src = "weapon/jk.png";
	var pos = this.coords2Pos(x, y);
	var dx = 22;
	var dxx = dx / 2;

	this.ctx.drawImage(this.imgObj18, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}
Radar.prototype.x4 = function (x, y) {

	this.imgObj19 = new Image;
	this.imgObj19.src = "weapon/x4.png";
	var pos = this.coords2Pos(x, y);
	var dx = 22;
	var dxx = dx / 2;

	this.ctx.drawImage(this.imgObj19, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}
Radar.prototype.x3 = function (x, y) {

	this.imgObj30 = new Image;
	this.imgObj30.src = "weapon/x3.png";
	var pos = this.coords2Pos(x, y);
	var dx = 22;
	var dxx = dx / 2;

	this.ctx.drawImage(this.imgObj30, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}
Radar.prototype.x6 = function (x, y) {

	this.imgObj31 = new Image;
	this.imgObj31.src = "weapon/x6.png";
	var pos = this.coords2Pos(x, y);
	var dx = 22;
	var dxx = dx / 2;

	this.ctx.drawImage(this.imgObj31, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}
Radar.prototype.x8 = function (x, y) {

	this.imgObj20 = new Image;
	this.imgObj20.src = "weapon/x8.png";
	var pos = this.coords2Pos(x, y);
	var dx = 22;
	var dxx = dx / 2;

	this.ctx.drawImage(this.imgObj20, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}

Radar.prototype.zt = function (x, y) {

	var pos = this.coords2Pos(x, y);
	this.imgObj21 = new Image;
	this.imgObj21.src = "weapon/zt.png";
	var dx = 22;
	var dxx = dx / 2;

	this.ctx.drawImage(this.imgObj21, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}

Radar.prototype.lyl = function (x, y) {

	var pos = this.coords2Pos(x, y);
	this.imgObj26 = new Image;
	this.imgObj26.src = "weapon/lyl.png";
	var dx = 22;
	var dxx = dx / 2;

	this.ctx.drawImage(this.imgObj26, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}

Radar.prototype.bx = function (x, y) {

	this.imgObj22 = new Image;
	this.imgObj22.src = "weapon/bx.png";
	var pos = this.coords2Pos(x, y);
	var dx = 22;
	var dxx = dx / 2;

	this.ctx.drawImage(this.imgObj22, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}

Radar.prototype.jx = function (x, y) {

	this.imgObj23 = new Image;
	this.imgObj23.src = "weapon/jx.png";
	var pos = this.coords2Pos(x, y);
	var dx = 22;
	var dxx = dx / 2;

	this.ctx.drawImage(this.imgObj23, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}

Radar.prototype.yl = function (x, y) {

	this.imgObj24 = new Image;
	this.imgObj24.src = "weapon/yl.png";
	var pos = this.coords2Pos(x, y);
	var dx = 22;
	var dxx = dx / 2;

	this.ctx.drawImage(this.imgObj24, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}
Radar.prototype.ssjs = function (x, y) {

	this.imgObj29 = new Image;
	this.imgObj29.src = "weapon/ssjs.png";
	var pos = this.coords2Pos(x, y);
	var dx = 30;
	var dxx = dx / 2;

	this.ctx.drawImage(this.imgObj29, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}
Radar.prototype.dp = function (x, y) {

	this.imgObj27 = new Image;
	this.imgObj27.src = "weapon/dp28.png";
	var pos = this.coords2Pos(x, y);
	var dx = 30;
	var dxx = dx / 2;

	this.ctx.drawImage(this.imgObj27, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}
Radar.prototype.xhq = function (x, y) {

	this.imgObj28 = new Image;
	this.imgObj28.src = "weapon/xhq.png";
	var pos = this.coords2Pos(x, y);
	var dx = 30;
	var dxx = dx / 2;

	this.ctx.drawImage(this.imgObj28, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}

Radar.prototype.ktx = function (x, y) {

	var pos = this.coords2Pos(x, y);
	this.imgObj25 = new Image;
	this.imgObj25.src = "weapon/kt.png";
	var dx = 20;
	var dxx = dx / 2;
	this.ctx.drawImage(this.imgObj25, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}
Radar.prototype.qc = function (x, y) {

	var pos = this.coords2Pos(x, y);
	this.imgObj34 = new Image;
	this.imgObj34.src = "weapon/qc.png";
	var dx = 30;
	var dxx = dx / 2;

	this.ctx.drawImage(this.imgObj34, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}

Radar.prototype.bao = function (x, y) {

	var pos = this.coords2Pos(x, y);
	this.imgObj35 = new Image;
	this.imgObj35.src = "weapon/hz.png";
	var dx = 30;
	var dxx = dx / 2;
	this.ctx.drawImage(this.imgObj35, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}

Radar.prototype.death = function (x, y) {
    
	var pos = this.coords2Pos(x, y);
	this.imgObj38 = new Image;
	this.imgObj38.src = "weapon/sw.png";
	var dx = 30;
	var dxx = dx / 2;
	this.ctx.drawImage(this.imgObj38, pos.X - (dxx / this.scaledFactor), pos.Y - (dxx / this.scaledFactor), dx / this.scaledFactor, dx / this.scaledFactor);

}

// useless
Radar.prototype.floatText = function (posX, posY, content, color) {
	this.ctx.font = '' + 8 / this.scaledFactor + 'pt Calibri';
	this.ctx.fillStyle = color || 'lightgreen';
	this.ctx.textAlign = 'left';
	this.ctx.fillText(content, posX - this.viewPortOffset.X, posY - this.viewPortOffset.Y);
}

// from https://github.com/jerrytang67/helloworld


function getPointOnCircle(radius, originPt, endPt) {
	angleInDegrees = getAngleBetweenPoints(originPt, endPt);
	// Convert from degrees to radians via multiplication by PI/180
	var x = radius * Math.cos(angleInDegrees * Math.PI / 180) + originPt.x;
	var y = radius * Math.sin(angleInDegrees * Math.PI / 180) + originPt.y;
	return {
		x: x,
		y: y
	};
}

function getAngleBetweenPoints(originPt, endPt) {
	var interPt = {
		x: endPt.x - originPt.x,
		y: endPt.y - originPt.y
	};
	return Math.atan2(interPt.y, interPt.x) * 180 / Math.PI;
}

Radar.prototype.lineWithAngle = function (x, y, length, width, angle, color) {
	var pos = this.coords2Pos(x, y);
	var anX = 5 * Math.cos(Math.PI * angle / 180.0);
	var anY = 5 * Math.sin(Math.PI * angle / 180.0);

	var x1 = pos.X + anX;
	var y1 = pos.Y + anY;

	var circle1 = {
		x: pos.X,
		y: pos.Y,
		r: 5
	};
	var circle2 = {
		x: x1,
		y: y1,
		r: 0
	};

	var arrow = {
		h: width / this.scaledFactor,
		w: length / this.scaledFactor
	};
	drawArrow(this.ctx, arrow, circle1, circle2, color);
	//Radar.prototype.lineWithAngle = function (x, y, length, width, angle, color)
	function drawArrow(canvasContext, arrow, ptArrow, endPt, color) {
		angleInDegrees = getAngleBetweenPoints(ptArrow, endPt);
		endPt = getPointOnCircle(endPt.r, ptArrow, endPt);
		// first save the untranslated/unrotated context
		canvasContext.save();

		// move the rotation point to the center of the rect
		canvasContext.translate(endPt.x, endPt.y);
		// rotate the rect
		canvasContext.rotate(angleInDegrees * Math.PI / 180);
		canvasContext.beginPath();
		canvasContext.moveTo(0, 0);

		canvasContext.lineTo(0, (-arrow.h));
		canvasContext.lineTo((arrow.w), 0);
		canvasContext.lineTo(0, (+arrow.h));
		canvasContext.closePath();
		canvasContext.fillStyle = color;
		canvasContext.lineWidth = 0;
		//canvasContext.stroke();
		canvasContext.fill();

		// restore the context to its untranslated/unrotated state
		canvasContext.restore();
	}

}
