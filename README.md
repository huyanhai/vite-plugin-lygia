# vite-plugin-lygia

Lygia Local Solutions

## How to use

1. Installation lygia
```
yarn add lygia
```

2. Installation vite-plugin-lygia

```
yarn add vite-plugin-lygia -D
```

3. Vite Configuration
```ts
import lygia from 'vite-plugin-lygia';
import glsl from 'vite-plugin-glsl';


export default {
  plugins: [
    lygia(),
    glsl(),
  ],
}
```

## Using this Plugin

```tsx
import fragmentShader from './fragmentShader.frag';

// fragmentShader.vert
#include "lygia/generative/fbm.glsl"

void main(void) {
	vec4 color = vec4(fbm(0.5))
	gl_FragColor = color;
}
```