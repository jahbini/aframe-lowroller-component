## aframe-lowroller-component

[![Version](http://img.shields.io/npm/v/aframe-lowroller-component.svg?style=flat-square)](https://npmjs.org/package/aframe-lowroller-component)
[![License](http://img.shields.io/npm/l/aframe-lowroller-component.svg?style=flat-square)](https://npmjs.org/package/aframe-lowroller-component)

robot soccerball

For [A-Frame](https://aframe.io).

### API

| Property | Description | Default Value |
| -------- | ----------- | ------------- |
|          |             |               |

### Installation

#### Browser

Install and use by directly including the [browser files](dist):

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/0.8.2/aframe.min.js"></script>
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
