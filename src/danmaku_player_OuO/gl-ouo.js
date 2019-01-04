
  var createShader = (gl, type, source) => {
    var shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    if (success) {
      return shader
    }
    console.log(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
  }
  
  var createProgram = (gl, vertexShader, fragmentShader) => {
    var program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    var success = gl.getProgramParameter(program, gl.LINK_STATUS)
    if (success) {
      return program
    }
    console.log(gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
  }
  var App = (width = 500, height = 500, opt = {}) => {
    var canvas = document.createElement('canvas')
    var gl = canvas.getContext('webgl', { preserveDrawingBuffer: true })
    canvas.width = width
    canvas.height = height
    canvas.setAttribute('gl-ouo', '')
  
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, `
      attribute vec2 a_position;
      
      uniform vec2 u_resolution;
      uniform vec2 u_translation;
      uniform vec2 u_scale;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      varying vec2 v_zeroToOne;
      void main() {
          vec2 position = a_position * u_scale + u_translation;
          vec2 zeroToOne = position / u_resolution;
          v_zeroToOne = zeroToOne;

          vec2 zeroToTwo = zeroToOne * 2.0;

          vec2 clipSpace = zeroToTwo - 1.0;
  
          v_texCoord = a_texCoord;
      
          gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
      }
    `)
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, `
      precision mediump float;
      uniform float u_alpha;
      uniform vec4 u_color;
      uniform sampler2D u_texture;
      varying vec2 v_texCoord;
      varying vec2 v_zeroToOne; 
    
      void main() {
        //gl_FragColor = texture2D(u_texture,v_texCoord)*u_color;

        // 0, 161, 214
        gl_FragColor = texture2D(u_texture,v_texCoord)*u_color*vec4(vec3(1),u_alpha);


        // gl_FragColor = 
        //   texture2D(u_texture,v_texCoord)*
        //   u_color*
        //   vec4(vec2(v_zeroToOne.y), 1, u_alpha);
      }
    `)
    var program = createProgram(gl, vertexShader, fragmentShader)
  
    var App = {
      children: [],
      canvas,
      gl,
      $el: canvas,
      program1: program,
      addTicker (fuc, name) {
        var Renderer = { animate: true, name: '' }
  
        var els = [
          Object.assign(Object.create(Renderer), { fuc, name })
        ]
        var animate = () => {
          window.requestAnimationFrame(animate)
          els.forEach(o => {
            var { fuc, animate } = o
            if (animate) {
              fuc.call(o, Date.now())
            }
          })
        }
        animate()
        // debugger
        this.addTicker = (fuc, name) => {
          // debugger
          var o = Object.assign(Object.create(Renderer), { fuc, name })
          els.push(o)
          return o
        }
  
        return els[0]
      },
      resize(w, h) {
        this.$el.width = w
        this.$el.height = h
      },
      update() {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
  
        gl.clear(gl.COLOR_BUFFER_BIT)
  
        this.children.forEach((obj) => {
          if(obj.visible === true) {
            obj.update()
          }
          
        })
      },
      addChild(...objs) {
        objs.forEach(obj => {
          obj.gl = this.gl
          obj.program = this.program1
          obj.init()
        })
        this.children.push(...objs)
      }
    }
    return App
  }
  
  var Rectangle = ([width, height], [texture_, color = [1, 1, 1, 1]], { vs, fs, uniforms = {} } = {}) => {
    var Rectangle = {
      init () {
        var gl = this.gl
  
        if (vs && fs) {
          let program = createProgram(gl,
            createShader(gl, gl.VERTEX_SHADER, vs),
            createShader(gl, gl.FRAGMENT_SHADER, fs)
          )
          this.program = program
  
          Object.keys(uniforms).forEach((k) => {
            // console.log(uniforms[v]);
  
            this.uniforms[k] = uniforms[k]
            this[k + '_location'] = gl.getUniformLocation(this.program, k)
          })
        }
  
        this.position_location = gl.getAttribLocation(this.program, 'a_position')
        this.texCoord_location = gl.getAttribLocation(this.program, 'a_texCoord')
        this.resoluton_location = gl.getUniformLocation(this.program, 'u_resolution')
        this.translation_location = gl.getUniformLocation(this.program, 'u_translation')
        this.scale_location = gl.getUniformLocation(this.program, 'u_scale')
        this.texture_location = gl.getUniformLocation(this.program, 'u_texture')
        this.color_location = gl.getUniformLocation(this.program, 'u_color')
        this.alpha_location = gl.getUniformLocation(this.program, 'u_alpha')
  
        this.position_buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.position_buffer)
        // Put geometry data into buffer
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, width, 0, width, height, 0, height]), gl.STATIC_DRAW)
  
        this.tex_buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.tex_buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), gl.STATIC_DRAW)
  
        this.texture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, this.texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.texture_)
        // make sure we can render it even if it's not a power of 2
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        // a_position
        // u_resolution
        // u_translation
        // a_texCoord
        // u_color
        // u_texture
  
        return this
      },
      gl: null,
      program: null,
      texture_,
      color,
      width,
      height,
      translation: [0, 0],
      scale: [1, 1],
      alpha: 1,
      uniforms: {},
      canReadPixels: false,
      visible: true,
      action_uniform: {
        // gl.uniform1f (floatUniformLoc, v);                 // float
        // gl.uniform1fv(floatUniformLoc, [v]);               // float 或 float array
        // gl.uniform2f (vec2UniformLoc,  v0, v1);            // vec2
        // gl.uniform2fv(vec2UniformLoc,  [v0, v1]);          // vec2 或 vec2 array
        // gl.uniform3f (vec3UniformLoc,  v0, v1, v2);        // vec3
        // gl.uniform3fv(vec3UniformLoc,  [v0, v1, v2]);      // vec3 或 vec3 array
        // gl.uniform4f (vec4UniformLoc,  v0, v1, v2, v4);    // vec4
        // gl.uniform4fv(vec4UniformLoc,  [v0, v1, v2, v4]);  // vec4 或 vec4 array
        '4_uniform' (gl, v, v_location) {
          gl.uniform4fv(v_location, v)
        },
        '3_uniform' (gl, v, v_location) {
          gl.uniform3fv(v_location, v)
        },
        '2_uniform' (gl, v, v_location) {
          gl.uniform2fv(v_location, v)
        },
        '1_uniform' (gl, v, v_location) {
          gl.uniform1fv(v_location, v)
        }
      },
      update () {
        var gl = this.gl
  
        gl.useProgram(this.program)
        // Turn on the attribute
        gl.enableVertexAttribArray(this.position_location)
  
        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, this.position_buffer)
  
        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2 // 2 components per iteration
        var type = gl.FLOAT // the data is 32bit floats
        var normalize = false // don't normalize the data
        var stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0 // start at the beginning of the buffer
        gl.vertexAttribPointer(
          this.position_location, size, type, normalize, stride, offset)
  
        // set the resolution
        gl.uniform2f(this.resoluton_location, gl.canvas.width, gl.canvas.height)
  
        // set the color
        gl.uniform4fv(this.color_location, this.color)
        // Set the translation.
        gl.uniform2fv(this.translation_location, this.translation)
  
        gl.uniform2fv(this.scale_location, this.scale)
  
        gl.uniform1f(this.alpha_location, this.alpha)
        // debugger
  
        {
          gl.enableVertexAttribArray(this.texCoord_location)
          gl.bindBuffer(gl.ARRAY_BUFFER, this.tex_buffer)
          gl.vertexAttribPointer(this.texCoord_location, 2, gl.FLOAT, false, 0, 0)
        }
        {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.texture_)
  
          // Tell WebGL we want to affect texture unit 0
          gl.activeTexture(gl.TEXTURE0)
  
          gl.uniform1i(this.texture_location, 0)
        }
        {
          // u_textureSize: (2)  [500, 300]
          let action = this.action_uniform
          Object.keys(this.uniforms).forEach(k => {
            var val = this.uniforms[k]
            var len = this.uniforms[k].length
            if (action[`${len}_uniform`]) {
              action[`${len}_uniform`](gl, val, this[k + '_location'])
            }
          })
        }
  
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
  
        if (this.handel_pixel && this.canReadPixels) {
          
          let pixels = new Uint8Array(this.widthInClip * this.heightInClip * 4)
          gl.readPixels(this.translation[0], this.translation[1], this.widthInClip, this.heightInClip, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
          this.handel_pixel(pixels)
        } else {

        }
      },
      get widthInClip () {
        return width * this.scale[0]

        //return this.gl.drawingBufferWidth
      },
      get heightInClip () {
        return height * this.scale[0]
        //return this.gl.drawingBufferHeight
      },
      readPixels (fn) {
        this.handel_pixel = fn
      }
    }
    return Rectangle
  }
  
  export default { App, Rectangle }
  