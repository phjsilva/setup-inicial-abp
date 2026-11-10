import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import type { RefObject } from 'react';
import { statusStyle } from '@/utils/statusStyle';

export interface GlobeViewHandle {
    rotateLeft: () => void;
    rotateRight: () => void;
    zoom: (factor: number) => void;
    resetView: () => void;
    resetPosition: () => void;
}

export interface GlobeState {
    progress: number;
    target: { x: number; y: number };
    lon: number;
}

interface GlobeViewProps {
    autoRotate?: boolean;
    stateRef: RefObject<GlobeState>;
    focusTarget: {
        latitude: number;
        longitude: number;
    } | null;
    markers: GlobeMarker[];
}

export interface GlobeMarker {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    status: string;
}

export const GlobeView = forwardRef<GlobeViewHandle, GlobeViewProps>(function GlobeView(
    { autoRotate = true, stateRef, focusTarget, markers },
    ref,
) {
    const containerRef = useRef<HTMLDivElement>(null);
    const autoRotateRef = useRef(autoRotate);
    const markersGroupRef = useRef<THREE.Group | null>(null);
    const focusQuaternionRef = useRef<THREE.Quaternion | null>(null);
    const focusTargetRef = useRef(focusTarget);
    const zoomLevelRef = useRef(1);
    const wasFocusedRef = useRef(false);

    const commandsRef = useRef({
        rotation: 0,
        zoomFactor: 1,
        reset: false,
        resetPosition: false,
    });
    useImperativeHandle(
        ref,
        () => ({
            rotateLeft: () => {
                commandsRef.current.rotation -= Math.PI / 6;
            },
            rotateRight: () => {
                commandsRef.current.rotation += Math.PI / 6;
            },
            zoom: (factor: number) => {
                if (factor > 0) {
                    commandsRef.current.zoomFactor *= factor;
                }
            },
            resetView: () => {
                commandsRef.current.reset = true;
            },
            resetPosition: () => {
                commandsRef.current.resetPosition = true;
            },
        }),
        [],
    );

    useEffect(() => {
        autoRotateRef.current = autoRotate;
    }, [autoRotate]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);

        camera.position.z = 4.5;

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
        });

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        container.appendChild(renderer.domElement);

        const globe = new THREE.Group();
        scene.add(globe);

        globe.quaternion.setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            -Math.PI / 2 - THREE.MathUtils.degToRad(stateRef.current.lon),
        );

        const markersGroup = new THREE.Group();
        globe.add(markersGroup);
        markersGroupRef.current = markersGroup;

        const earthTexture = new THREE.TextureLoader().load('/textures/earth.png');

        earthTexture.colorSpace = THREE.SRGBColorSpace;

        const earthMaterial = new THREE.MeshStandardMaterial({
            map: earthTexture,
            roughness: 0.9,
            metalness: 0,
        });

        const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), earthMaterial);

        globe.add(earth);

        const atmosphere = new THREE.Mesh(
            new THREE.SphereGeometry(1.12, 64, 64),
            new THREE.MeshBasicMaterial({
                color: '#0ea5e9',
                transparent: true,
                opacity: 0.12,
                side: THREE.BackSide,
            }),
        );

        globe.add(atmosphere);

        scene.add(new THREE.AmbientLight('#ffffff', 1.5));

        const sunlight = new THREE.DirectionalLight('#e0f2fe', 2.5);
        sunlight.position.set(3, 2, 4);
        scene.add(sunlight);

        const starPositions = new Float32Array(1800 * 3);

        for (let i = 0; i < 1800; i++) {
            const radius = 8 + Math.random() * 20;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);

            starPositions[i * 3 + 1] = radius * Math.cos(phi);

            starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
        }

        const starsGeometry = new THREE.BufferGeometry();

        starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

        const stars = new THREE.Points(
            starsGeometry,
            new THREE.PointsMaterial({
                color: '#bae6fd',
                size: 0.06,
                transparent: true,
                opacity: 0.8,
                sizeAttenuation: true,
            }),
        );

        scene.add(stars);

        const size = { w: container.clientWidth, h: container.clientHeight };

        const resizeObserver = new ResizeObserver(() => {
            size.w = container.clientWidth;
            size.h = container.clientHeight;

            if (!size.w || !size.h) return;

            camera.aspect = size.w / size.h;
            camera.updateProjectionMatrix();
            renderer.setSize(size.w, size.h);
        });

        resizeObserver.observe(container);

        let animationId = 0;
        let previousTime = 0;

        const restQuaternion = new THREE.Quaternion();
        const inverse = new THREE.Quaternion();
        const localFront = new THREE.Vector3();
        const forward = new THREE.Vector3(0, 0, 1);
        const viewDirection = new THREE.Vector3();
        const aim = new THREE.Quaternion();
        const desired = new THREE.Quaternion();

        const animate = (time: number) => {
            animationId = requestAnimationFrame(animate);

            const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;

            previousTime = time;

            const commands = commandsRef.current;

            if (commands.reset) {
                commands.rotation = 0;
                commands.zoomFactor = 1;
                zoomLevelRef.current = 1;
                commands.reset = false;
            }

            if (commands.resetPosition) {
                globe.position.set(0, 0, 0);
                globe.quaternion.identity();
                camera.position.z = 4.5;
                commands.rotation = 0;
                commands.zoomFactor = 1;
                zoomLevelRef.current = 1;
                wasFocusedRef.current = false;
                commands.resetPosition = false;
            }

            if (commands.zoomFactor !== 1) {
                zoomLevelRef.current = THREE.MathUtils.clamp(
                    zoomLevelRef.current / commands.zoomFactor,
                    0.6,
                    2,
                );
                commands.zoomFactor = 1;
            }

            const desiredCameraZ = (focusTargetRef.current ? 3.0 : 4.5) / zoomLevelRef.current;

            camera.position.z = THREE.MathUtils.lerp(
                camera.position.z,
                desiredCameraZ,
                Math.min(delta * 3, 1),
            );

            const { progress, target } = stateRef.current;
            const p = THREE.MathUtils.clamp(progress, 0, 1);
            const smooth = p * p * (3 - 2 * p);

            const { w: width, h: height } = size;

            const startScale = 1.65;
            const endScale = 1.45;

            globe.scale.setScalar(THREE.MathUtils.lerp(startScale, endScale, smooth));

            const visibleHeight =
                2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;

            const horizontalOffset = 60;

            const targetX = ((target.x - horizontalOffset - width / 2) / height) * visibleHeight;

            const targetY = -((target.y - height / 2) / height) * visibleHeight;

            globe.position.x = THREE.MathUtils.lerp(0, targetX, smooth);

            globe.position.y = THREE.MathUtils.lerp(0, targetY, smooth);

            if (focusQuaternionRef.current) {
                if (!wasFocusedRef.current) restQuaternion.copy(globe.quaternion);
                wasFocusedRef.current = true;

                viewDirection.copy(camera.position).sub(globe.position).normalize();
                aim.setFromUnitVectors(forward, viewDirection);
                desired.copy(aim).multiply(focusQuaternionRef.current);

                globe.quaternion.slerp(desired, Math.min(delta * 2.5, 1));

                commands.rotation = 0;
            } else if (wasFocusedRef.current) {
                globe.quaternion.slerp(restQuaternion, Math.min(delta * 2, 1));

                if (globe.quaternion.angleTo(restQuaternion) < 0.01) {
                    globe.quaternion.copy(restQuaternion);
                    wasFocusedRef.current = false;
                }
            } else {
                const rotationStep = commands.rotation * Math.min(delta * 6, 1);

                globe.rotateY(rotationStep);
                commands.rotation -= rotationStep;

                if (Math.abs(commands.rotation) < 0.001) {
                    commands.rotation = 0;
                }

                if (autoRotateRef.current) {
                    globe.rotateY(delta * 0.2);
                }
            }

            inverse.copy(globe.quaternion).invert();
            localFront.copy(forward).applyQuaternion(inverse);
            stateRef.current.lon = THREE.MathUtils.radToDeg(
                Math.atan2(-localFront.z, localFront.x),
            );

            renderer.render(scene, camera);
        };

        animate(0);

        return () => {
            cancelAnimationFrame(animationId);
            resizeObserver.disconnect();

            earth.geometry.dispose();
            earthMaterial.dispose();
            earthTexture.dispose();

            atmosphere.geometry.dispose();
            (atmosphere.material as THREE.Material).dispose();

            starsGeometry.dispose();
            (stars.material as THREE.Material).dispose();

            markersGroupRef.current = null;
            renderer.dispose();
            renderer.domElement.remove();
        };
    }, [stateRef]);

    useEffect(() => {
        const group = markersGroupRef.current;
        if (!group) return;

        group.clear();

        const geometry = new THREE.SphereGeometry(0.018, 12, 12);

        markers.forEach((marker) => {
            const latitude = (marker.latitude * Math.PI) / 180;
            const longitude = (marker.longitude * Math.PI) / 180;
            const radius = 1.015;

            const position = new THREE.Vector3(
                radius * Math.cos(latitude) * Math.cos(longitude),
                radius * Math.sin(latitude),
                -radius * Math.cos(latitude) * Math.sin(longitude),
            );

            const material = new THREE.MeshBasicMaterial({
                color: statusStyle(marker.status).color,
            });
            const pin = new THREE.Mesh(geometry, material);

            pin.position.copy(position);
            pin.userData = {
                id: marker.id,
                name: marker.name,
                status: marker.status,
            };

            group.add(pin);
        });

        return () => {
            group.children.forEach((pin) => {
                if (pin instanceof THREE.Mesh) {
                    pin.material.dispose();
                }
            });

            group.clear();
            geometry.dispose();
        };
    }, [markers]);

    useEffect(() => {
        focusTargetRef.current = focusTarget;

        if (!focusTarget) {
            focusQuaternionRef.current = null;
            return;
        }

        const latitude = THREE.MathUtils.degToRad(focusTarget.latitude);
        const longitude = THREE.MathUtils.degToRad(focusTarget.longitude);

        const yRotation = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            -Math.PI / 2 - longitude,
        );

        const xRotation = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(1, 0, 0),
            latitude,
        );

        focusQuaternionRef.current = xRotation.multiply(yRotation);
    }, [focusTarget]);

    return (
        <div
            ref={containerRef}
            className="h-full w-full"
            aria-label="Globo 3D do GreenER"
            role="img"
        />
    );
});
