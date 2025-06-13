import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import vertexShader from '../../shaders/vertex.glsl';
import fragmentShader from '../../shaders/fragment.glsl';
import ParticleEffect from '../effects/ParticleEffect';

/**
 * Manages the core Three.js scene setup, including the scene graph,
 * camera, renderer, and the primary visualizer mesh.
 */
export default class SceneManager {
    /** @type {OrbitControls | null} */
    controls = null;
    /**
     * Initializes the scene, camera, renderer, and visualizer mesh.
     */
    constructor() {
        /** @type {THREE.Scene} */
        this.scene = new THREE.Scene();
        
        /** @type {THREE.PerspectiveCamera} */
        this.camera = new THREE.PerspectiveCamera(
            45, // Field of view
            window.innerWidth / window.innerHeight, // Aspect ratio
            0.1, // Near clipping plane
            1000 // Far clipping plane
        );
        
        /** @type {THREE.WebGLRenderer} */
        this.renderer = new THREE.WebGLRenderer({ antialias: true });

        /** 
         * Uniforms for the shader material. These are updated externally 
         * (e.g., by the main loop or GUI callbacks).
         * @type {Object.<string, {type: string, value: any}>}
         */
        this.uniforms = {
            u_time: { type: 'f', value: 0.0 },
            u_frequency: { type: 'f', value: 0.0 },
            u_red: { type: 'f', value: 1.0 }, // Initial value
            u_green: { type: 'f', value: 1.0 }, // Initial value
            u_blue: { type: 'f', value: 1.0 },  // Initial value
            u_audioIntensity: { type: 'f', value: 0.0 },
            u_colorIntensity: { type: 'f', value: 0.5 }
        };

        /** @type {THREE.Mesh | null} The main visualizer mesh (Icosahedron) */
        this.mesh = null; 
        /** @type {ParticleEffect | null} The particle effect instance */
        this.particleEffect = null;
        /** @type {string} Name of the currently active visual effect */
        this.activeEffectName = ''; // Will be set by setActiveEffect
        
        this._setupRenderer();
        this._setupCamera();
        this._setupControls();
        this._createVisualizerMesh();
        this._createParticleEffect();
    }

    /**
     * Configures the WebGL renderer and appends its canvas to the DOM.
     * @private
     */
    _setupRenderer() {
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        document.body.appendChild(this.renderer.domElement);
    }

    /**
     * Sets the initial camera position and orientation.
     * @private
     */
    _setupCamera() {
        this.camera.position.set(0, 5, 15);
        this.camera.lookAt(0, 0, 0);
        // Note: The AudioListener is added in AudioManager, passing this camera.
    }

    /**
     * Sets up the OrbitControls.
     * @private
     */
    _setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true; // 可选: 启用阻尼效果，使控制更平滑
        this.controls.dampingFactor = 0.05; // 可选: 阻尼系数
        // this.controls.autoRotate = true; // 可选: 自动旋转
    }

    /**
     * Creates the Icosahedron mesh with the custom shader material.
     * @private
     */
    _createVisualizerMesh() {
        const mat = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            side: THREE.DoubleSide,
            wireframe: false
        });

        // Create a more detailed geometry
        const geo = new THREE.IcosahedronGeometry(5, 4);
        this.mesh = new THREE.Mesh(geo, mat);
        
        // Add some rotation to make it more dynamic
        this.mesh.rotation.x = Math.PI * 0.2;
        this.scene.add(this.mesh);
    }

    /**
     * Creates the particle effect instance.
     * @private
     */
    _createParticleEffect() {
        // Pass initial color from uniforms
        const initialColor = new THREE.Color(
            this.uniforms.u_red.value, 
            this.uniforms.u_green.value, 
            this.uniforms.u_blue.value
        );
        this.particleEffect = new ParticleEffect(this.scene, {
            particleCount: 200000, // 粒子数增加 (原为 50000)
            initialColor: initialColor // Pass the initial color object
        });
    }

    /**
     * Sets the active visual effect by controlling visibility.
     * @param {string} effectName - The name of the effect to activate ('icosahedron' or 'particles').
     */
    setActiveEffect(effectName) {
        this.activeEffectName = effectName;
        console.log(`SceneManager: Activating effect ${effectName}`);

        if (this.mesh) {
            this.mesh.visible = (effectName === 'icosahedron');
        }
        if (this.particleEffect && this.particleEffect.particles) {
            this.particleEffect.particles.visible = (effectName === 'particles');
        }
    }

    /**
     * Updates scene elements based on time and interaction data.
     * Called in the main animation loop.
     * @param {number} deltaTime Time since the last frame.
     * @param {number} elapsedTime Total time elapsed since start.
     * @param {{mouseX: number, mouseY: number}} interactionData Data from user interactions (e.g., mouse position).
     */
    update(deltaTime, elapsedTime, interactionData) {
        if (this.controls) {
            this.controls.update();
        }

        // Update time uniform
        this.uniforms.u_time.value = elapsedTime;

        // Get audio frequency and apply it to the visualizer
        const audioFrequency = this.uniforms.u_frequency.value;
        
        // Add more dynamic movement based on audio
        if (this.mesh) {
            // Rotate based on audio frequency
            this.mesh.rotation.y += deltaTime * (0.2 + audioFrequency * 0.5);
            this.mesh.rotation.x += deltaTime * (0.1 + audioFrequency * 0.25);
            
            // Scale based on audio frequency
            const scale = 1.0 + audioFrequency * 0.5;
            this.mesh.scale.set(scale, scale, scale);

            // Update shader uniforms for more dynamic response
            this.uniforms.u_audioIntensity.value = audioFrequency;
            this.uniforms.u_colorIntensity.value = 0.5 + audioFrequency * 0.5;
        }

        // Update the active visual effect
        if (this.activeEffectName === 'icosahedron' && this.mesh) {
            // Mesh updates are handled by shaders
        } else if (this.activeEffectName === 'particles' && this.particleEffect) {
            this.particleEffect.update(deltaTime, elapsedTime, audioFrequency);
        }
    }

    /**
     * Updates specific shader uniforms.
     * Called from main.js with data from AudioManager or GuiManager.
     * @param {Object.<string, number>} newUniforms An object containing uniform values to update.
     */
    updateShaderUniforms(newUniforms) {
        if (newUniforms.u_time !== undefined) {
             this.uniforms.u_time.value = newUniforms.u_time;
        }
        if (newUniforms.u_frequency !== undefined) {
             // Add safety check for NaN or invalid values from audio analysis
            this.uniforms.u_frequency.value = Number.isFinite(newUniforms.u_frequency) ? newUniforms.u_frequency : 0.0;

            // Also update the particle effect when frequency changes (if needed immediately)
            // Note: The main update loop already handles passing frequency to particleEffect.update
            // This line might be redundant depending on desired responsiveness vs performance.
            // if (this.particleEffect) {
            //     this.particleEffect.update(0, this.uniforms.u_time.value, this.uniforms.u_frequency.value); 
            // }
        }
        if (newUniforms.u_red !== undefined) {
            this.uniforms.u_red.value = newUniforms.u_red;
        }
        if (newUniforms.u_green !== undefined) {
            this.uniforms.u_green.value = newUniforms.u_green;
        }
        if (newUniforms.u_blue !== undefined) {
            this.uniforms.u_blue.value = newUniforms.u_blue;
        }
        
        // Update particle color if the effect exists and colors changed
        if (this.particleEffect && (newUniforms.u_red !== undefined || newUniforms.u_green !== undefined || newUniforms.u_blue !== undefined)) {
             const newColor = new THREE.Color(
                 this.uniforms.u_red.value, 
                 this.uniforms.u_green.value, 
                 this.uniforms.u_blue.value
             );
             this.particleEffect.updateColor(newColor);
        }
    }

    /**
     * Handles window resize events by updating camera aspect ratio and renderer size.
     */
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Removed render() method - rendering is handled by PostProcessor
    
    /**
     * Gets the THREE.Camera instance.
     * @returns {THREE.PerspectiveCamera}
     */
    getCamera() {
        return this.camera;
    }

    /**
     * Gets the THREE.WebGLRenderer instance.
     * @returns {THREE.WebGLRenderer}
     */
    getRenderer() {
        return this.renderer;
    }
    
    /**
     * Gets the THREE.Scene instance.
     * @returns {THREE.Scene}
     */
    getScene() {
        return this.scene;
    }

    /**
     * Cleans up resources, including the particle effect.
     */
    dispose() {
        // Dispose existing mesh geometry and material if they exist
        if (this.mesh) {
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            if (this.mesh.material) {
                // If ShaderMaterial, dispose uniforms if necessary (textures, etc.)
                if (this.mesh.material instanceof THREE.ShaderMaterial) {
                    // Assuming no complex uniforms like textures for now
                }
                this.mesh.material.dispose();
            }
            this.scene.remove(this.mesh);
        }
        
        // Dispose particle effect
        if (this.particleEffect) {
            this.particleEffect.dispose();
        }
        
        // Dispose controls if they exist and have a dispose method (OrbitControls doesn't)
        // if (this.controls && typeof this.controls.dispose === 'function') {
        //     this.controls.dispose();
        // }
        
        // Dispose renderer if needed (though typically managed elsewhere)
        // if (this.renderer) {
        //     this.renderer.dispose();
        // }
        
        console.log("SceneManager disposed.");
    }
} 