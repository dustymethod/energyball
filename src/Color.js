"use strict";
class Color {
	constructor(r, g, b, a = 1) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
	
	get() {
		return "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
	}
	
	set(r, g, b, a = 1) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
	
	setColor(color, a = color.a) {
		this.r = color.r;
		this.g = color.g;
		this.b = color.b;
		this.a = a;
	}
}