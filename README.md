## aframe-lowroller-component
## Demo
https://jahbini.github.io/aframe-lowroller-component

## Release
[![Version](https://img.shields.io/npm/v/aframe-lowroller-component.svg?style=flat-square)](https://npmjs.org/package/aframe-lowroller-component)
[![License](https://img.shields.io/npm/l/aframe-lowroller-component.svg?style=flat-square)](https://npmjs.org/package/aframe-lowroller-component)

robot soccerball

For [A-Frame](https://aframe.io).

### API

A lowroller is a sphere with an internal mass that is confined inside the outer shell. Tetrahedral supports
move the inner mass and shift the lowroller's center of gravity, causing it to roll, wobble and hop.

The supports are driven by four identical thrustors controlled by PID constants.  The PID constants are `P` proportional, `i` integral, and `d` differential.  The values of the thrustors controls the tracking behavior of the lowroller.  They are tuned by hand to accomodate the best
behavior for the masses of inner and outer.

| Property | Description | Default Value |
| -------- | ----------- | ------------- |
|    radius      | outer sphere           |       1        |
|    inner      |  inner mass           |       5        |
|    outer      |  outer mass           |       1        |
|    debug      |  show tetrahedral control forces           |   false            |
|    pursuit      |  DOM ID or x y coordinate           |     idle          |
|    pid        |  Proportional, Integral and Delta factors for thrusters | p: 20, i: 20, d: 1 |



### Installation

#### Browser

Install and use by directly including the [browser files](dist):

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/0.8.2/aframe.min.js"></script>
  <script src="//cdn.rawgit.com/donmccurdy/aframe-physics-system/v3.2.0/dist/aframe-physics-system.min.js"></script>
  <script src="https://unpkg.com/aframe-lowroller-component/dist/aframe-lowroller-component.min.js"></script>
</head>

<body>
  <a-scene>
    <a-sphere lowroller="debug:true; inner:4;outer:1;pursuit: 2,0;" radius="1" dynamic-body="">
    </a-sphere>
  </a-scene>
</body>
```

#### npm

Install via npm:

```bash
npm install aframe-lowroller-component
```

Then require and use.

```js
require('aframe');
require('aframe-lowroller-component');
```
