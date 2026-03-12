/**
 * Fondo 3D con nodos/partículas (Three.js) + Post-processing + Mouse effects.
 * Efectos: bloom, distorsión del mouse, scroll transitions.
 */
(function () {
  let scene, camera, renderer, particles, particleCount;
  let renderTargetA, renderTargetB, bloomTarget;
  let compositeScene, compositeCamera, compositeMesh;
  let mouseX = 0, mouseY = 0, targetMouseX = 0, targetMouseY = 0;
  let scrollY = 0, targetScrollY = 0;
  let time = 0;
  const container = document.getElementById('scene-3d');

  const bloomVertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const bloomFragmentShader = `
    uniform sampler2D tDiffuse;
    uniform float uBloomStrength;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uScroll;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      
      // Distorsión del mouse (efecto ripple)
      float dist = distance(uv, uMouse * 0.5 + 0.5);
      float ripple = sin(dist * 20.0 - uTime * 2.0) * 0.003 * (1.0 - smoothstep(0.0, 0.5, dist));
      uv += ripple;
      
      // Scroll distortion
      uv.y += sin(uv.x * 10.0 + uTime) * 0.002 * uScroll;
      
      vec4 color = texture2D(tDiffuse, uv);
      
      // Extraer brightness para bloom
      float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
      vec3 bloom = color.rgb * smoothstep(0.4, 1.0, brightness) * uBloomStrength;
      
      gl_FragColor = vec4(color.rgb + bloom, color.a);
    }
  `;

  if (!container || typeof THREE === 'undefined') return;

  const isMobile = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  const isReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getAccentColor() {
    try {
      const css = getComputedStyle(document.documentElement);
      const value = (css.getPropertyValue('--color-accent') || '').trim();
      return value || '#00b4d8';
    } catch (_) {
      return '#00b4d8';
    }
  }

  function getParticleCount() {
    if (isReducedMotion()) return isMobile() ? 60 : 120;
    return isMobile() ? 120 : 280;
  }

  function init() {
    particleCount = getParticleCount();
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 80;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Render targets para post-processing
    const rtParams = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    };
    renderTargetA = new THREE.WebGLRenderTarget(width, height, rtParams);
    renderTargetB = new THREE.WebGLRenderTarget(width, height, rtParams);
    bloomTarget = new THREE.WebGLRenderTarget(width / 2, height / 2, rtParams);

    // Escena composite para post-processing
    compositeScene = new THREE.Scene();
    compositeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    const compositeMaterial = new THREE.ShaderMaterial({
      vertexShader: bloomVertexShader,
      fragmentShader: bloomFragmentShader,
      uniforms: {
        tDiffuse: { value: null },
        uBloomStrength: { value: 0.4 },
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uScroll: { value: 0 },
      },
      transparent: true,
    });

    const compositeGeometry = new THREE.PlaneGeometry(2, 2);
    compositeMesh = new THREE.Mesh(compositeGeometry, compositeMaterial);
    compositeScene.add(compositeMesh);

    // Partículas
    createParticles();

    // Event listeners
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('scroll', onScroll, { passive: true });
    
    function onMouseMove(e) {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    }

    function onScroll() {
      targetScrollY = window.scrollY;
    }

    animate();
    onResize();
    window.addEventListener('resize', onResize);

    const themeObserver = new MutationObserver(() => {
      if (particles && particles.material) {
        particles.material.color = new THREE.Color(getAccentColor());
        particles.material.needsUpdate = true;
      }
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 200;
      positions[i + 1] = (Math.random() - 0.5) * 200;
      positions[i + 2] = (Math.random() - 0.5) * 200;
      
      velocities[i] = (Math.random() - 0.5) * 0.02;
      velocities[i + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i + 2] = (Math.random() - 0.5) * 0.02;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.computeBoundingSphere();

    const teal = new THREE.Color(getAccentColor());
    const material = new THREE.PointsMaterial({
      color: teal,
      size: isMobile() ? 0.8 : 1.2,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
  }

  function animate() {
    requestAnimationFrame(animate);
    
    time += 0.016;
    
    // Suavizado del mouse
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;
    scrollY += (targetScrollY - scrollY) * 0.05;

    if (isReducedMotion()) {
      renderer.setRenderTarget(renderTargetA);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
      return;
    }

    // Animación de partículas
    if (particles) {
      const positions = particles.geometry.attributes.position.array;
      const velocities = particles.geometry.attributes.velocity.array;
      
      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] += velocities[i] + mouseX * 0.02;
        positions[i + 1] += velocities[i + 1] + mouseY * 0.02;
        
        // Wrap around
        if (positions[i] > 100) positions[i] = -100;
        if (positions[i] < -100) positions[i] = 100;
        if (positions[i + 1] > 100) positions[i + 1] = -100;
        if (positions[i + 1] < -100) positions[i + 1] = 100;
      }
      
      particles.geometry.attributes.position.needsUpdate = true;
      
      particles.rotation.y = time * 0.2;
      particles.rotation.x = time * 0.1;
    }

    // Camera parallax
    camera.position.x = mouseX * 6;
    camera.position.y = mouseY * 4;
    camera.lookAt(0, 0, 0);

    // Post-processing render
    renderer.setRenderTarget(renderTargetA);
    renderer.render(scene, camera);
    
    // Aplicar shader de bloom/distorsión
    compositeMesh.material.uniforms.tDiffuse.value = renderTargetA.texture;
    compositeMesh.material.uniforms.uTime.value = time;
    compositeMesh.material.uniforms.uMouse.value.set(mouseX, mouseY);
    compositeMesh.material.uniforms.uScroll.value = Math.min(scrollY / 1000, 1);
    
    renderer.setRenderTarget(null);
    renderer.render(compositeScene, compositeCamera);
  }

  function onResize() {
    const w = container.offsetWidth;
    const h = container.offsetHeight;
    
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    
    renderTargetA.setSize(w, h);
    renderTargetB.setSize(w, h);
    bloomTarget.setSize(w / 2, h / 2);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
