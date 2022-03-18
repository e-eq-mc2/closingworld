const THREE = require('three');
//import { SceneUtils } from 'three/examples/jsm/utils/SceneUtils.js'
import { createMultiMaterialObject } from 'three/examples/jsm/utils/SceneUtils.js'
import CubicBezier from 'cubic-bezier-easing'
const Common   = require("./lib/common.js")
const Colormap = require("./lib/colormap.js")

// Particle3D class
const TO_RADIANS = Math.PI/180.0

export class Credit {
  constructor(idx, numPages, width, height) {
    const geometry = this.plateGeometry(width, height, 1, 1)

    this.idx = idx 
    const fname = `img/arigatou/${idx + 1}.png`
    const material = this.plateMaterial(fname)
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.translateX(width/2)
    this.mesh.translateX(1)

    this.time = 0
    this.speedSec = 35
    this.yFrom =  13
    this.yTo   = -13
    this.doPaging = false
    this.direction = +1

    this.updatePosition()
  }

  update(dt) {
    if ( ! this.doPaging ) return
    this.time += dt * this.direction

    if (this.time == 0 ) console.log(this.time, dt, this.direction)

    if ( this.time < 0             ) {
      this.time = 0
      this.doPaging = false
    }
    if ( this.time > this.speedSec ) {
      this.time = this.speedSec
      this.doPaging = false
    }

    this.updatePosition(dt)

  }

  updatePosition() {
    const timeRate = this.time / this.speedSec
    const l = this.yTo - this.yFrom
    const y = timeRate * l + this.yFrom
    const pos = this.mesh.position
    pos.y = y
  }

  plateGeometry(w, h, wsegs, hsegs) {
    const geometry = new THREE.PlaneGeometry(w, h, wsegs, hsegs)
    return geometry
  }

  plateMaterial(fname) {
    const tex  = new THREE.TextureLoader().load( fname )

    const mat = new THREE.MeshBasicMaterial({
      map:         tex, 
      side:        THREE.FrontSide,
      depthWrite:  true,
      //transparent: true,
      alphaTest:   0.5
    });

    return mat
  }
}

export class ClosingCredits {
  constructor(numPages, width, height) {
    this.width  = width
    this.height = height
    this.credits = []
    this.timePage = 0
    this.pageDely = 20
    this.doPaging = false
    for (let i = 0; i < numPages; i++) {
      const credit = new Credit(i, numPages, this.width, this.height)
      this.credits.push(credit) 
    }
    this.paged = 0
  }

  eachCredit(callback) {
    for (const c of this.credits) {
      callback(c)
    }
  }

  update(dt) {
    //dt = 0.05
    if ( ! this.doPaging  ) return
    this.eachCredit((c)=>{
      c.update(dt)
    })

    this.timePage += dt 
    if( this.timePage > this.pageDely ) {
      this.goForward()
      this.timePage = 0
    } 
  }

  goForward() {
    ++this.paged
    this.paged = Math.min(this.paged, this.credits.length)
    this.updateCreditState()
    this.doPaging = true
  }

  goBack() {
    --this.paged
    this.paged = Math.max(this.paged,                   0)
    this.updateCreditState()
    this.doPaging = true
  }

  updateCreditState() {
    for (let i = 0; i < this.credits.length; i++) {
      const c = this.credits[i]
      if ( i < this.paged ) {
        c.direction = +1
      } else {
        c.direction = -1
      } 
      c.doPaging = true
    }
  }
}
