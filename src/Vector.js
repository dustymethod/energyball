"use strict";

class Vector {
   constructor(x, y) {
      this.x = x;
      this.y = y;
   }
   set(x, y) {
      this.x = x;
      this.y = y;
   }
   add(v) {
      this.x += v.x;
      this.y += v.y;
   }
   sub(v) {
      this.x -= v.x;
      this.y -= v.y;
   }
   mult(n) {
      this.x *= n;
      this.y *= n;
   }
   dot(v) {
      let dotProduct = (this.x * v.x) + (this.y * v.y);
      return dotProduct;
   }
   getMag() {
      let mag = (this.x * this.x) + (this.y * this.y);
      if (mag >= 0) {
         mag = Math.sqrt(mag);
         return mag;
      } else {
         console.log("getMag error");
         return 0;
      }
   }
   normalize() {
      let mag = this.getMag();
      if (mag > 0) {
         this.x /= mag;
         this.y /= mag;
      } else if (mag === 0) {
      } else {
         console.log("normalize() error");
      }
   }
   //limit the length of this vector. http://forum.libcinder.org/topic/limit-the-magnitude-of-vector
   limit(maxLength) {
      const lengthSquared = (this.x * this.x) + (this.y * this.y);
      if (lengthSquared > maxLength * maxLength && lengthSquared > 0) {
         const ratio = maxLength / Math.sqrt(lengthSquared);
         this.x *= ratio;
         this.y *= ratio;
      }
   }
}
