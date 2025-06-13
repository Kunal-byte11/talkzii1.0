'use client';

import React, { useEffect, useRef, useState } from 'react';
import SceneManager from '../lib/audiovisualizer/core/SceneManager';
import styles from './AudioVisualizer.module.css';

const AudioVisualizer: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneManagerRef = useRef<SceneManager | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const animationFrameRef = useRef<number>(0);
    const demoTimeRef = useRef<number>(0);
    
    const [isRecording, setIsRecording] = useState(false);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [visualMode, setVisualMode] = useState('sphere');

    useEffect(() => {
        const initScene = async () => {
            if (containerRef.current) {
                try {
                    sceneManagerRef.current = await SceneManager.create(containerRef.current);
                } catch (error) {
                    console.error('Failed to initialize SceneManager:', error);
                }
            }
        };

        initScene();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            stopAudio();
        };
    }, []);

    const startMicrophone = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            
            const bufferLength = analyserRef.current.frequencyBinCount;
            dataArrayRef.current = new Uint8Array(bufferLength);
            
            microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
            microphoneRef.current.connect(analyserRef.current);
            
            setIsRecording(true);
            setIsDemoMode(false);
            
            animate();
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    const startDemo = () => {
        setIsDemoMode(true);
        setIsRecording(false);
        demoTimeRef.current = 0;
        dataArrayRef.current = new Uint8Array(128);
        animate();
    };

    const stopAudio = () => {
        setIsRecording(false);
        setIsDemoMode(false);
        
        if (microphoneRef.current) {
            microphoneRef.current.disconnect();
            microphoneRef.current = null;
        }
        
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    };

    const animate = () => {
        if (!sceneManagerRef.current) return;

        if (isDemoMode && dataArrayRef.current) {
            // Generate demo data
            demoTimeRef.current += 0.1;
            for (let i = 0; i < dataArrayRef.current.length; i++) {
                dataArrayRef.current[i] = Math.sin(demoTimeRef.current + i * 0.1) * 100 + 128;
            }
        } else if (isRecording && analyserRef.current && dataArrayRef.current) {
            analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        }

        sceneManagerRef.current.update(0.016, Date.now() * 0.001, dataArrayRef.current);
        animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const mode = event.target.value;
        setVisualMode(mode);
        if (sceneManagerRef.current) {
            sceneManagerRef.current.setVisualizationMode(mode);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                <button 
                    className={`${styles.controlBtn} ${isRecording ? styles.active : ''}`}
                    onClick={startMicrophone}
                >
                    Start Microphone
                </button>
                <button 
                    className={`${styles.controlBtn} ${isDemoMode ? styles.active : ''}`}
                    onClick={startDemo}
                >
                    Demo Mode
                </button>
                <button 
                    className={styles.controlBtn}
                    onClick={stopAudio}
                >
                    Stop
                </button>
            </div>
            
            <div className={styles.modeSelector}>
                <select 
                    value={visualMode}
                    onChange={handleModeChange}
                    className={styles.select}
                >
                    <option value="sphere">Sphere</option>
                    <option value="flower">Flower</option>
                    <option value="wave">Wave</option>
                    <option value="particles">Particles</option>
                </select>
            </div>
            
            <div className={styles.info}>
                <p>3D Audio Visualizer - Click "Start Microphone" to begin or "Demo Mode" for preview</p>
                <p>Drag to rotate • Scroll to zoom • Works on mobile and desktop</p>
            </div>
            
            <div ref={containerRef} className={styles.canvasContainer} />
        </div>
    );
};

export default AudioVisualizer; 