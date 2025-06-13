"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';

// Add type declarations for Web Speech API
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const AudioVisualizer = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<any>(null);
  const animationIdRef = useRef<number | null>(null);
  const [status, setStatus] = useState('Initializing...');
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  // Check browser compatibility
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isSpeechRecognitionSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    if (!isSpeechRecognitionSupported) {
      setStatus('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    const isMicrophoneSupported = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
    if (!isMicrophoneSupported) {
      setStatus('Microphone access is not supported in your browser.');
      return;
    }

    // Request microphone permission
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        setStatus('Listening...');
      })
      .catch((error) => {
        console.error('Microphone permission error:', error);
        setStatus('Please allow microphone access to use speech recognition.');
      });
  }, []);

  // Scene Manager Class (same as before, but no controls)
  class SceneManager {
    constructor(container) {
      this.container = container;
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.visualObjects = [];
      this.mouseX = 0;
      this.mouseY = 0;
      this.targetRotationX = 0;
      this.targetRotationY = 0;
      this.currentRotationX = 0;
      this.currentRotationY = 0;
      this.init();
    }
    init() {
      if (!this.container) return;
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x0a0a0a);
      this.camera = new THREE.PerspectiveCamera(
        75,
        this.container.clientWidth / this.container.clientHeight,
        0.1,
        1000
      );
      this.camera.position.z = 5;
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
      this.renderer.setClearColor(0x0a0a0a, 1);
      this.container.appendChild(this.renderer.domElement);
      const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
      this.scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 10, 5);
      this.scene.add(directionalLight);
      this.createSphereVisualization();
    }
    createSphereVisualization() {
      const geometry = new THREE.SphereGeometry(1, 64, 32);
      const material = new THREE.MeshPhongMaterial({
        color: 0x00ff96,
        wireframe: true,
        transparent: true,
        opacity: 0.8
      });
      const sphere = new THREE.Mesh(geometry, material);
      this.scene.add(sphere);
      this.visualObjects.push(sphere);
      const glowGeometry = new THREE.SphereGeometry(0.8, 32, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff96,
        transparent: true,
        opacity: 0.3
      });
      const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
      this.scene.add(glowSphere);
      this.visualObjects.push(glowSphere);
    }
    updateVisualization() {
      // Optionally animate
      this.visualObjects.forEach((obj, index) => {
        if (index === 0 && obj.material) {
          obj.rotation.y += 0.01;
        }
      });
    }
    render() {
      if (!this.renderer || !this.scene || !this.camera) return;
      this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.05;
      this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.05;
      this.scene.rotation.x = this.currentRotationY;
      this.scene.rotation.y = this.currentRotationX;
      this.updateVisualization();
      this.renderer.render(this.scene, this.camera);
    }
    handleResize() {
      if (!this.container || !this.camera || !this.renderer) return;
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
    dispose() {
      this.visualObjects.forEach(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
      if (this.renderer) {
        this.renderer.dispose();
        if (this.container && this.renderer.domElement) {
          this.container.removeChild(this.renderer.domElement);
        }
      }
    }
  }

  // Animation loop
  const animate = () => {
    if (sceneManagerRef.current && sceneManagerRef.current.render) {
      sceneManagerRef.current.render();
    }
    animationIdRef.current = requestAnimationFrame(animate);
  };

  // Initialize scene
  useEffect(() => {
    if (mountRef.current && !sceneManagerRef.current) {
      try {
        sceneManagerRef.current = new SceneManager(mountRef.current);
        animate();
      } catch (error) {
        setStatus('Failed to initialize 3D scene');
      }
    }
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (sceneManagerRef.current) {
        sceneManagerRef.current.dispose();
        sceneManagerRef.current = null;
      }
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (sceneManagerRef.current && sceneManagerRef.current.handleResize) {
        sceneManagerRef.current.handleResize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Speech-to-text and API logic
  useEffect(() => {
    let recognition: SpeechRecognition | null = null;
    let stopped = false;

    const initializeSpeechRecognition = async () => {
      if (typeof window === 'undefined') return;
      
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          throw new Error('Speech recognition is not supported in your browser.');
        }

        recognition = new SpeechRecognition();
        if (!recognition) {
          throw new Error('Failed to create speech recognition instance.');
        }

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          console.log('Speech recognition started');
          setStatus('Listening...');
        };

        recognition.onresult = async (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          console.log('Speech result:', transcript, event);
          if (!transcript.trim()) {
            setStatus('No speech detected, please try again.');
            setIsProcessing(false);
            return;
          }
          setTranscript(transcript);
          setStatus('Thinking...');
          setIsProcessing(true);
          
          try {
            const response = await fetch('/api/speech', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: transcript })
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('API error:', errorText);
              setStatus('API error: ' + errorText);
              setIsProcessing(false);
              return;
            }
            
            const audioBlob = await response.blob();
            setStatus('Speaking...');
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            audio.onended = () => {
              setStatus('Done');
              setIsProcessing(false);
              URL.revokeObjectURL(audioUrl);
              setTimeout(() => router.push('/'), 1000);
            };
            
            audio.onerror = (error) => {
              console.error('Audio playback error:', error);
              setStatus('Error playing audio');
              setIsProcessing(false);
              URL.revokeObjectURL(audioUrl);
            };
            
            await audio.play();
          } catch (err) {
            console.error('Network or server error:', err);
            setStatus('Network or server error');
            setIsProcessing(false);
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', {
            error: event.error,
            message: event.message,
            type: event.type
          });
          
          let errorMessage = 'Speech recognition error';
          switch (event.error) {
            case 'no-speech':
              errorMessage = 'No speech was detected. Please try again.';
              break;
            case 'aborted':
              errorMessage = 'Speech recognition was aborted.';
              break;
            case 'audio-capture':
              errorMessage = 'No microphone was found. Please ensure your microphone is connected and permitted.';
              break;
            case 'network':
              errorMessage = 'Network error occurred. Please check your internet connection.';
              break;
            case 'not-allowed':
              errorMessage = 'Microphone access was denied. Please allow microphone access in your browser settings.';
              break;
            case 'service-not-allowed':
              errorMessage = 'Speech recognition service is not allowed.';
              break;
            case 'bad-grammar':
              errorMessage = 'Speech recognition grammar error.';
              break;
            case 'language-not-supported':
              errorMessage = 'Language not supported. Please try using English.';
              break;
            default:
              errorMessage = `Speech recognition error: ${event.error}`;
          }
          
          setStatus(errorMessage);
          setIsProcessing(false);
        };

        recognition.onend = () => {
          console.log('Speech recognition ended');
          if (!stopped && !isProcessing) {
            setStatus('No speech detected, please try again.');
          }
        };

        try {
          recognition.start();
        } catch (error) {
          console.error('Error starting recognition:', error);
          setStatus('Failed to start speech recognition');
        }
      } catch (error) {
        console.error('Speech recognition initialization error:', error);
        setStatus(error instanceof Error ? error.message : 'Failed to initialize speech recognition');
      }
    };

    initializeSpeechRecognition();

    return () => {
      stopped = true;
      if (recognition) {
        try {
          recognition.stop();
        } catch (error) {
          console.error('Error stopping recognition:', error);
        }
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-white text-lg font-semibold bg-black/60 px-6 py-2 rounded-xl shadow">
        {status}
      </div>
      {transcript && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white text-xl font-bold bg-black/70 px-6 py-3 rounded-xl shadow">
          "{transcript}"
        </div>
      )}
    </div>
  );
};

export default AudioVisualizer; 