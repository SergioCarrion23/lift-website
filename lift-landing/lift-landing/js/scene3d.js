/**
 * Fondo 3D con nodos/partículas (Three.js). Colores teal/negro del logo.
 * Se adapta a móvil reduciendo partículas.
 */
(function () {
  let scene, camera, renderer, particles, particleCount;
  const container = document.getElementById('scene-3d');

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

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 200;
      positions[i + 1] = (Math.random() - 0.5) * 200;
      positions[i + 2] = (Math.random() - 0.5) * 200;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.computeBoundingSphere();

    const teal = new THREE.Color(getAccentColor());
    const material = new THREE.PointsMaterial({
      color: teal,
      size: isMobile() ? 0.8 : 1.2,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let mouseX = 0, mouseY = 0;
    function onMouseMove(e) {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    }
    window.addEventListener('mousemove', onMouseMove);

    let time = 0;
    function animate() {
      requestAnimationFrame(animate);
      if (isReducedMotion()) {
        renderer.render(scene, camera);
        return;
      }
      time += 0.002;
      if (particles) {
        particles.rotation.y = time * 0.2 + mouseX * 0.1;
        particles.rotation.x = time * 0.1 + mouseY * 0.05;
      }
      renderer.render(scene, camera);
    }
    animate();

    function onResize() {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    const themeObserver = new MutationObserver(() => {
      if (particles && particles.material) {
        particles.material.color = new THREE.Color(getAccentColor());
        particles.material.needsUpdate = true;
      }
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
