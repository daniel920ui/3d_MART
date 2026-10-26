import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Product } from '../types';
import {
  Eye,
  ShoppingBag,
  Volume2,
  VolumeX,
  Compass,
  X,
  Plus,
  Minus,
  Sparkles,
  Maximize2,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Grid,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createRealisticProduct3D } from './supermarket/ProductVisualFactory';
import {
  createPolishedFloorTexture,
  buildCommercialGondolaUnit,
  buildOverheadAisleSign,
  buildCheckoutCounter,
  buildShoppingBasketStack,
  buildCoolerWallDisplay,
} from './supermarket/SupermarketArchitecture';

interface Supermarket3DProps {
  storeId: string;
  storeName: string;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onSwitchToCatalog: () => void;
}

// Bounding box for collision detection
interface AABB {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export const Supermarket3D: React.FC<Supermarket3DProps> = ({
  storeId,
  storeName,
  products,
  onSelectProduct,
  onSwitchToCatalog,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { addItem } = useCart();

  // Selected product in 3D HUD
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [hudQuantity, setHudQuantity] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [currentAisleName, setCurrentAisleName] = useState<string>('Entrance Area');
  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);
  const [hoveredProduct, setHoveredProduct] = useState<Product | null>(null);
  const [isPointerLocked, setIsPointerLocked] = useState<boolean>(false);

  // Audio Context synthesizer for supermarket soundscapes
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playChime = (freq: number = 880, type: OscillatorType = 'sine', duration: number = 0.15) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
      gain.gain.setValueAtTime(0.12, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();
      osc.stop(audioCtxRef.current.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy
    }
  };

  // References to keep 3D engine independent of React re-renders
  const sceneState = useRef<{
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    renderer: THREE.WebGLRenderer | null;
    productMeshes: THREE.Object3D[];
    colliders: AABB[];
    highlightBox: THREE.BoxHelper | null;
    selectedMesh: THREE.Object3D | null;
    keys: { [key: string]: boolean };
    rotationEuler: THREE.Euler;
    isDragging: boolean;
    prevMousePos: { x: number; y: number };
    animId: number | null;
  }>({
    scene: null,
    camera: null,
    renderer: null,
    productMeshes: [],
    colliders: [],
    highlightBox: null,
    selectedMesh: null,
    keys: {},
    rotationEuler: new THREE.Euler(0, 0, 0, 'YXZ'),
    isDragging: false,
    prevMousePos: { x: 0, y: 0 },
    animId: null,
  });

  // Teleport helper to open aisle walkways (between shelves)
  const teleportTo = (x: number, z: number, aisleLabel: string) => {
    const s = sceneState.current;
    if (s.camera) {
      s.camera.position.set(x, 1.7, z);
      s.rotationEuler.set(0, 0, 0);
      s.camera.quaternion.setFromEuler(s.rotationEuler);
      setCurrentAisleName(aisleLabel);
      playChime(660, 'triangle', 0.1);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = mountRef.current;
    if (!canvas || !container) return;

    // Check WebGL support
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) {
      setWebGlSupported(false);
      return;
    }

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 600;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);
    scene.fog = new THREE.FogExp2(0xf1f5f9, 0.018);

    // 2. Camera setup - eye level 1.7m, starting at the entrance looking into central walkway
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 80);
    camera.position.set(0, 1.7, 18);
    camera.rotation.order = 'YXZ';

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    sceneState.current.scene = scene;
    sceneState.current.camera = camera;
    sceneState.current.renderer = renderer;

    // 4. Lighting setup (Bright commercial supermarket illumination)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);

    const mainSun = new THREE.DirectionalLight(0xfffbeb, 1.1);
    mainSun.position.set(12, 22, 14);
    mainSun.castShadow = true;
    mainSun.shadow.mapSize.width = 1024;
    mainSun.shadow.mapSize.height = 1024;
    mainSun.shadow.bias = -0.0005;
    scene.add(mainSun);

    // Fill light from north
    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.6);
    fillLight.position.set(-10, 15, -15);
    scene.add(fillLight);

    // 5. Build Supermarket Architecture
    // Polished Terrazzo/Porcelain Floor Tiles with subtle commercial sheen
    const floorGeo = new THREE.PlaneGeometry(38, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      map: createPolishedFloorTexture(),
      roughness: 0.18, // polished supermarket gloss
      metalness: 0.12,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Central Walkway Guide Decal (Wide aisle between west & east aisles)
    const walkwayGeo = new THREE.PlaneGeometry(4.5, 46);
    const walkwayMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.05,
    });
    const walkway = new THREE.Mesh(walkwayGeo, walkwayMat);
    walkway.rotation.x = -Math.PI / 2;
    walkway.position.set(0, 0.005, 0);
    walkway.receiveShadow = true;
    scene.add(walkway);

    // Ceiling with architectural dark industrial finish
    const ceilingGeo = new THREE.PlaneGeometry(38, 48);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9,
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 5.2;
    scene.add(ceiling);

    // Recessed Linear Fluorescent Diffuse LED Troffers
    for (let lz = -18; lz <= 16; lz += 5.5) {
      for (const lx of [-12, -6, 0, 6, 12]) {
        const lightBox = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.08, 4.2),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        lightBox.position.set(lx, 5.15, lz);
        scene.add(lightBox);
      }
    }

    // Outer Commercial Perimeter Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
    const wallTrimMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 });

    // North Wall with Wall Accent Mural
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(38, 5.2, 0.6), wallMat);
    northWall.position.set(0, 2.6, -24);
    scene.add(northWall);

    const northMural = new THREE.Mesh(new THREE.BoxGeometry(26, 1.4, 0.08), wallTrimMat);
    northMural.position.set(0, 4.1, -23.6);
    scene.add(northMural);

    // South Wall (Entrance Glass & Pillars)
    const southWallL = new THREE.Mesh(new THREE.BoxGeometry(14, 5.2, 0.6), wallMat);
    southWallL.position.set(-12, 2.6, 24);
    scene.add(southWallL);

    const southWallR = new THREE.Mesh(new THREE.BoxGeometry(14, 5.2, 0.6), wallMat);
    southWallR.position.set(12, 2.6, 24);
    scene.add(southWallR);

    // Automatic Glass Sliding Entrance Doors
    const glassEntrance = new THREE.Mesh(
      new THREE.BoxGeometry(10, 4.4, 0.15),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.35,
        roughness: 0.1,
      })
    );
    glassEntrance.position.set(0, 2.2, 24);
    scene.add(glassEntrance);

    // East & West Perimeter Walls
    const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 5.2, 48), wallMat);
    westWall.position.set(-19, 2.6, 0);
    scene.add(westWall);

    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 5.2, 48), wallMat);
    eastWall.position.set(19, 2.6, 0);
    scene.add(eastWall);

    // 6. Build Checkout Counters & Shopping Baskets
    const checkoutL = buildCheckoutCounter(-4.5, 15, 1);
    scene.add(checkoutL);

    const checkoutR = buildCheckoutCounter(4.5, 15, 2);
    scene.add(checkoutR);

    const basketStackL = buildShoppingBasketStack(-8.5, 17);
    scene.add(basketStackL);

    const basketStackR = buildShoppingBasketStack(8.5, 17);
    scene.add(basketStackR);

    // 7. Rear Chilled Cooler Display Wall (Dairy & Chilled Beverages)
    const coolerWall = buildCoolerWallDisplay(0, -23.2, 18);
    scene.add(coolerWall);

    // 8. Build 5 Realistic Commercial Double-Sided Gondola Aisle Shelves
    const aisleConfigs = [
      { aisle: 1, x: -12, name: 'Fruits & Vegetables', color: '#16a34a' },
      { aisle: 2, x: -6, name: 'Dairy & Bakery', color: '#0284c7' },
      { aisle: 3, x: 0, name: 'Rice, Grains & Snacks', color: '#d97706' },
      { aisle: 4, x: 6, name: 'Beverages & Frozen', color: '#06b6d4' },
      { aisle: 5, x: 12, name: 'Personal Care & Home', color: '#9333ea' },
    ];

    // Array of solid obstacles for collision detection
    const colliders: AABB[] = [
      // Outer walls
      { minX: -19, maxX: -18, minZ: -24, maxZ: 24 }, // West
      { minX: 18, maxX: 19, minZ: -24, maxZ: 24 }, // East
      { minX: -19, maxX: 19, minZ: -24, maxZ: -23 }, // North
      { minX: -19, maxX: 19, minZ: 23, maxZ: 24 }, // South
      // Checkout counters
      { minX: -6.5, maxX: -2.5, minZ: 14, maxZ: 16 },
      { minX: 2.5, maxX: 6.5, minZ: 14, maxZ: 16 },
    ];

    aisleConfigs.forEach(({ aisle, x, name, color }) => {
      // Build commercial gondola unit (length: 22m, centered at z = -4)
      const gondola = buildCommercialGondolaUnit(x, -4, 22, color);
      scene.add(gondola);

      // Register solid collider for this shelving unit
      colliders.push({
        minX: x - 0.75,
        maxX: x + 0.75,
        minZ: -15.5,
        maxZ: 7.5,
      });

      // Overhead Hanging Aisle Signs at front and rear of the aisle
      const frontSign = buildOverheadAisleSign(x, 7.8, aisle, name, color);
      scene.add(frontSign);

      const rearSign = buildOverheadAisleSign(x, -15.8, aisle, name, color);
      scene.add(rearSign);
    });

    sceneState.current.colliders = colliders;

    // 9. Populate Realistic Grocery Product Packaging onto Shelves
    const productMeshes: THREE.Object3D[] = [];

    // 5 Aisle Walkways and their respective left/right gondola shelf coordinates
    const aisleWalkways = [
      { aisle: 1, walkwayX: -9, leftShelfX: -11.52, rightShelfX: -6.48 },
      { aisle: 2, walkwayX: -3, leftShelfX: -5.52, rightShelfX: -0.48 },
      { aisle: 3, walkwayX: 3, leftShelfX: 0.48, rightShelfX: 5.52 },
      { aisle: 4, walkwayX: 9, leftShelfX: 6.48, rightShelfX: 11.52 },
      { aisle: 5, walkwayX: 15, leftShelfX: 12.48, rightShelfX: 17.52 },
    ];

    aisleWalkways.forEach(({ aisle, leftShelfX, rightShelfX }) => {
      const aisleProducts = products.filter((p) => p.aisle === aisle);
      if (aisleProducts.length === 0) return;

      const leftProducts = aisleProducts.filter((_, i) => i % 2 === 0);
      const rightProducts = aisleProducts.filter((_, i) => i % 2 !== 0);

      // Place products on left shelf (facing East towards walkway, rotation.y = Math.PI / 2)
      leftProducts.forEach((prod, idx) => {
        const zCenter = -11 + (idx / Math.max(leftProducts.length - 1, 1)) * 14;
        let tierY = 1.37;
        if (prod.categoryId === 'cat-5' || prod.categoryId === 'cat-10') tierY = 0.47;
        if (prod.model3D === 'produce' && idx % 2 === 0) tierY = 0.47;
        if (prod.model3D === 'can') tierY = 2.27;

        for (let row = -1; row <= 1; row++) {
          const item = createRealisticProduct3D(prod);
          item.position.set(leftShelfX, tierY, zCenter + row * 0.32);
          item.rotation.y = Math.PI / 2;

          item.traverse((child) => {
            (child as any).userData = { product: prod, root: item };
          });

          scene.add(item);
          productMeshes.push(item);
        }
      });

      // Place products on right shelf (facing West towards walkway, rotation.y = -Math.PI / 2)
      rightProducts.forEach((prod, idx) => {
        const zCenter = -11 + (idx / Math.max(rightProducts.length - 1, 1)) * 14;
        let tierY = 1.37;
        if (prod.categoryId === 'cat-5' || prod.categoryId === 'cat-10') tierY = 0.47;
        if (prod.model3D === 'produce' && idx % 2 === 0) tierY = 0.47;
        if (prod.model3D === 'can') tierY = 2.27;

        for (let row = -1; row <= 1; row++) {
          const item = createRealisticProduct3D(prod);
          item.position.set(rightShelfX, tierY, zCenter + row * 0.32);
          item.rotation.y = -Math.PI / 2;

          item.traverse((child) => {
            (child as any).userData = { product: prod, root: item };
          });

          scene.add(item);
          productMeshes.push(item);
        }
      });
    });

    sceneState.current.productMeshes = productMeshes;

    // 10. Selection Highlight Reticle Box
    const highlightBox = new THREE.BoxHelper(new THREE.Mesh(), 0x22c55e);
    highlightBox.visible = false;
    scene.add(highlightBox);
    sceneState.current.highlightBox = highlightBox;

    // 11. Controls & Interaction Listeners
    const onKeyDown = (e: KeyboardEvent) => {
      sceneState.current.keys[e.code] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      sceneState.current.keys[e.code] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Mouse Look & Pointer Lock
    const handlePointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement === canvas);
    };
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    const raycaster = new THREE.Raycaster();
    const centerPoint = new THREE.Vector2(0, 0); // screen center for crosshair raycast

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === canvas) {
        // Pointer lock movement
        const euler = sceneState.current.rotationEuler;
        euler.y -= e.movementX * 0.0024;
        euler.x -= e.movementY * 0.0022;
        euler.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, euler.x));
        camera.quaternion.setFromEuler(euler);
      } else if (sceneState.current.isDragging) {
        // Mouse drag movement fallback
        const dx = e.clientX - sceneState.current.prevMousePos.x;
        const dy = e.clientY - sceneState.current.prevMousePos.y;
        sceneState.current.prevMousePos = { x: e.clientX, y: e.clientY };

        const euler = sceneState.current.rotationEuler;
        euler.y -= dx * 0.0035;
        euler.x -= dy * 0.003;
        euler.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, euler.x));
        camera.quaternion.setFromEuler(euler);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (document.pointerLockElement !== canvas) {
        sceneState.current.isDragging = true;
        sceneState.current.prevMousePos = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      sceneState.current.isDragging = false;
    };

    // Canvas click: either select crosshair product or request pointer lock
    const handleCanvasClick = (e: MouseEvent) => {
      // Raycast against products
      const mouse = new THREE.Vector2();
      if (document.pointerLockElement === canvas) {
        mouse.set(0, 0);
      } else {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      }

      raycaster.setFromCamera(mouse, camera);
      const meshes = sceneState.current.productMeshes;
      const intersects = raycaster.intersectObjects(meshes, true);

      if (intersects.length > 0) {
        // Walk up to find root object with userData.product
        let hitObj: THREE.Object3D | null = intersects[0].object;
        while (hitObj && !(hitObj as any).userData?.product && hitObj.parent) {
          hitObj = hitObj.parent;
        }

        const prod = (hitObj as any)?.userData?.product as Product;
        if (prod) {
          setActiveProduct(prod);
          setHudQuantity(1);
          playChime(980, 'sine', 0.2);

          // Highlight mesh
          if (hitObj) {
            highlightBox.setFromObject(hitObj);
            highlightBox.visible = true;
            sceneState.current.selectedMesh = hitObj;
          }
          return;
        }
      }

      // If no product hit and not locked, request pointer lock
      if (!document.pointerLockElement) {
        canvas.requestPointerLock?.();
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('click', handleCanvasClick);

    // 12. Main Render & Physics Simulation Loop
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const keys = sceneState.current.keys;
      const isRunning = keys['ShiftLeft'] || keys['ShiftRight'];
      const moveSpeed = (isRunning ? 6.5 : 3.8) * delta;

      // Walking vectors
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      forward.y = 0;
      forward.normalize();

      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
      right.y = 0;
      right.normalize();

      const move = new THREE.Vector3();
      if (keys['KeyW'] || keys['ArrowUp']) move.add(forward);
      if (keys['KeyS'] || keys['ArrowDown']) move.sub(forward);
      if (keys['KeyD'] || keys['ArrowRight']) move.add(right);
      if (keys['KeyA'] || keys['ArrowLeft']) move.sub(right);

      if (move.lengthSq() > 0) {
        move.normalize().multiplyScalar(moveSpeed);

        // Collision Detection & Smooth Sliding
        const currentPos = camera.position.clone();
        const playerRadius = 0.45; // collision buffer
        const newX = currentPos.x + move.x;
        const newZ = currentPos.z + move.z;

        // Check X movement against solid colliders
        let collisionX = false;
        for (const col of colliders) {
          if (
            newX + playerRadius > col.minX &&
            newX - playerRadius < col.maxX &&
            currentPos.z + playerRadius > col.minZ &&
            currentPos.z - playerRadius < col.maxZ
          ) {
            collisionX = true;
            break;
          }
        }
        if (!collisionX) camera.position.x = newX;

        // Check Z movement against solid colliders
        let collisionZ = false;
        for (const col of colliders) {
          if (
            camera.position.x + playerRadius > col.minX &&
            camera.position.x - playerRadius < col.maxX &&
            newZ + playerRadius > col.minZ &&
            newZ - playerRadius < col.maxZ
          ) {
            collisionZ = true;
            break;
          }
        }
        if (!collisionZ) camera.position.z = newZ;

        // Maintain human eye level
        camera.position.y = 1.7;

        // Update current aisle label dynamically
        const px = camera.position.x;
        const pz = camera.position.z;
        if (pz > 12) {
          setCurrentAisleName('Entrance & Checkout Area');
        } else if (px < -9) {
          setCurrentAisleName('Aisle 1: Fruits & Vegetables');
        } else if (px < -3) {
          setCurrentAisleName('Aisle 2: Dairy & Bakery');
        } else if (px < 3) {
          setCurrentAisleName('Aisle 3: Rice, Grains & Snacks');
        } else if (px < 9) {
          setCurrentAisleName('Aisle 4: Beverages & Chilled');
        } else {
          setCurrentAisleName('Aisle 5: Personal Care & Home');
        }
      }

      // Center raycasting for crosshair hover tooltip
      raycaster.setFromCamera(centerPoint, camera);
      const hitIntersects = raycaster.intersectObjects(sceneState.current.productMeshes, true);
      if (hitIntersects.length > 0 && hitIntersects[0].distance < 4.2) {
        let hit: THREE.Object3D | null = hitIntersects[0].object;
        while (hit && !(hit as any).userData?.product && hit.parent) {
          hit = hit.parent;
        }
        const p = (hit as any)?.userData?.product as Product;
        setHoveredProduct(p || null);
      } else {
        setHoveredProduct(null);
      }

      if (sceneState.current.selectedMesh) {
        highlightBox.update();
      }

      renderer.render(scene, camera);
      sceneState.current.animId = requestAnimationFrame(animate);
    };

    sceneState.current.animId = requestAnimationFrame(animate);

    // Resize handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (sceneState.current.animId) cancelAnimationFrame(sceneState.current.animId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('click', handleCanvasClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [products]);

  // Touch controls for mobile / tablets
  const handleTouchMove = (direction: 'forward' | 'backward' | 'left' | 'right') => {
    const s = sceneState.current;
    if (!s.camera) return;
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(s.camera.quaternion);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(s.camera.quaternion);
    right.y = 0;
    right.normalize();

    const step = 0.8;
    if (direction === 'forward') s.camera.position.addScaledVector(forward, step);
    if (direction === 'backward') s.camera.position.addScaledVector(forward, -step);
    if (direction === 'left') s.camera.position.addScaledVector(right, -step);
    if (direction === 'right') s.camera.position.addScaledVector(right, step);

    s.camera.position.x = Math.max(-17.5, Math.min(17.5, s.camera.position.x));
    s.camera.position.z = Math.max(-22.5, Math.min(22.5, s.camera.position.z));
    s.camera.position.y = 1.7;
  };

  const handleTouchRotate = (deltaX: number) => {
    const s = sceneState.current;
    if (!s.camera) return;
    s.rotationEuler.y -= deltaX * 0.08;
    s.camera.quaternion.setFromEuler(s.rotationEuler);
  };

  const handleAddToCart = async () => {
    if (!activeProduct) return;
    const ok = await addItem(storeId, activeProduct.id, hudQuantity);
    if (ok) {
      playChime(1180, 'sine', 0.25);
    }
  };

  const priceInRupees = activeProduct
    ? Math.round((activeProduct.price || 4.99) * 80 * (1 - (activeProduct.discountPercentage || 0) / 100))
    : 0;

  const originalPriceInRupees = activeProduct ? Math.round((activeProduct.price || 4.99) * 80) : 0;

  return (
    <div
      ref={mountRef}
      className="relative w-full h-[650px] md:h-[750px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-700 shadow-2xl select-none"
    >
      {!webGlSupported ? (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-900 text-white">
          <p className="text-xl font-bold mb-2">WebGL Hardware Acceleration Unavailable</p>
          <p className="text-slate-400 max-w-md mb-6">
            Your browser environment does not support WebGL. Switch to our responsive 2D catalog with live inventory!
          </p>
          <button
            onClick={onSwitchToCatalog}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-semibold transition"
          >
            Switch to 2D Product Catalog
          </button>
        </div>
      ) : (
        <>
          {/* Main 3D Canvas */}
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-grab active:cursor-grabbing block"
            title="Click to explore and look around"
          />

          {/* Crosshair Reticle with Dynamic Hover State */}
          <div
            className={`reticle transition-transform duration-150 ${
              hoveredProduct ? 'scale-150 border-amber-400 bg-amber-400/80 shadow-amber-400/60' : ''
            }`}
          />

          {/* Hover Product Peek Tooltip */}
          {hoveredProduct && !activeProduct && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-6 pointer-events-none z-20 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-emerald-500/50 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in duration-150">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{hoveredProduct.name}</span>
              <span className="text-amber-400 font-extrabold">
                ₹{Math.round((hoveredProduct.price || 4.99) * 80 * (1 - (hoveredProduct.discountPercentage || 0) / 100))}
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Click to Inspect</span>
            </div>
          )}

          {/* Top Bar HUD */}
          <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-10">
            {/* Store & Aisle Badge */}
            <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/80 shadow-xl flex items-center gap-3 pointer-events-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-black">{storeName}</p>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-slate-300" />
                  {currentAisleName}
                </h3>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {/* Pointer Lock hint badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-900/80 text-slate-300 rounded-xl border border-slate-700/60 text-[11px] font-medium shadow-md">
                <span>{isPointerLocked ? '🔒 Pointer Locked (Esc to unlock)' : '🖱️ Click canvas for Mouse Look'}</span>
              </div>

              {/* Audio toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl border border-slate-700 shadow-md transition"
                title={soundEnabled ? 'Mute Supermarket Sound' : 'Enable Sound'}
                aria-label="Toggle Sound"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              </button>

              {/* Switch to standard 2D view */}
              <button
                onClick={onSwitchToCatalog}
                className="px-3.5 py-2.5 bg-slate-900/90 hover:bg-emerald-600 text-white rounded-xl border border-slate-700 font-bold text-xs flex items-center gap-2 shadow-md transition"
                title="Switch to 2D Grocery List"
              >
                <Grid className="w-4 h-4" />
                <span className="hidden sm:inline">2D Catalog</span>
              </button>
            </div>
          </div>

          {/* Bottom Aisle Quick-Jump Teleport Bar */}
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto flex items-center gap-1.5 bg-slate-900/95 backdrop-blur-md p-2 rounded-2xl border border-slate-700/80 shadow-2xl overflow-x-auto z-10">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">Aisle Jump:</span>
            <button
              onClick={() => teleportTo(0, 18, 'Entrance Area')}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-200 hover:text-white hover:bg-slate-800 transition whitespace-nowrap"
            >
              Entrance
            </button>
            <button
              onClick={() => teleportTo(-9, -2, 'Aisle 1: Fruits & Vegetables')}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-950/70 text-emerald-300 hover:bg-emerald-800 transition whitespace-nowrap border border-emerald-800/50"
            >
              Aisle 1 (Produce)
            </button>
            <button
              onClick={() => teleportTo(-3, -2, 'Aisle 2: Dairy & Bakery')}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-sky-950/70 text-sky-300 hover:bg-sky-800 transition whitespace-nowrap border border-sky-800/50"
            >
              Aisle 2 (Dairy)
            </button>
            <button
              onClick={() => teleportTo(3, -2, 'Aisle 3: Rice, Grains & Snacks')}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-950/70 text-amber-300 hover:bg-amber-800 transition whitespace-nowrap border border-amber-800/50"
            >
              Aisle 3 (Pantry)
            </button>
            <button
              onClick={() => teleportTo(9, -2, 'Aisle 4: Beverages & Chilled')}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-cyan-950/70 text-cyan-300 hover:bg-cyan-800 transition whitespace-nowrap border border-cyan-800/50"
            >
              Aisle 4 (Beverages)
            </button>
            <button
              onClick={() => teleportTo(15, -2, 'Aisle 5: Personal Care & Home')}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-purple-950/70 text-purple-300 hover:bg-purple-800 transition whitespace-nowrap border border-purple-800/50"
            >
              Aisle 5 (Care & Home)
            </button>
          </div>

          {/* Desktop Instruction Badge */}
          <div className="hidden lg:block absolute top-20 left-4 bg-slate-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700/60 text-[11px] text-slate-300 pointer-events-none z-10 max-w-[220px] shadow-xl">
            <p className="font-bold text-white mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Supermarket Controls:
            </p>
            <p>• Move: <span className="text-emerald-400 font-bold">W, A, S, D</span> or Arrow keys</p>
            <p>• Look: Click canvas for Mouse Look</p>
            <p>• Sprint: Hold <span className="text-slate-100 font-bold">Shift</span></p>
            <p>• Inspect: Click any grocery package</p>
          </div>

          {/* Mobile Touch Controller (Bottom Right) */}
          <div className="md:hidden absolute bottom-16 right-4 flex flex-col items-center gap-1 bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-700 z-10 shadow-xl">
            <button
              onClick={() => handleTouchMove('forward')}
              className="p-2.5 bg-slate-800 text-white rounded-xl active:bg-emerald-600 shadow"
              aria-label="Walk Forward"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleTouchMove('left')}
                className="p-2.5 bg-slate-800 text-white rounded-xl active:bg-emerald-600 shadow"
                aria-label="Walk Left"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleTouchMove('backward')}
                className="p-2.5 bg-slate-800 text-white rounded-xl active:bg-emerald-600 shadow"
                aria-label="Walk Backward"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleTouchMove('right')}
                className="p-2.5 bg-slate-800 text-white rounded-xl active:bg-emerald-600 shadow"
                aria-label="Walk Right"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <button
                onClick={() => handleTouchRotate(-1)}
                className="text-[10px] font-bold text-slate-200 px-2 py-1 bg-slate-800 rounded-lg active:bg-emerald-600"
              >
                ↺ Turn L
              </button>
              <button
                onClick={() => handleTouchRotate(1)}
                className="text-[10px] font-bold text-slate-200 px-2 py-1 bg-slate-800 rounded-lg active:bg-emerald-600"
              >
                Turn R ↻
              </button>
            </div>
          </div>

          {/* Interactive Realistic Product Details Drawer in 3D */}
          {activeProduct && (
            <div className="absolute top-16 right-4 w-84 sm:w-92 bg-white/95 backdrop-blur-xl p-5 rounded-3xl border border-slate-200 shadow-2xl z-20 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-black rounded-lg uppercase tracking-wider">
                    {activeProduct.categoryName || 'Grocery'}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                    Aisle {activeProduct.aisle}
                  </span>
                </div>
                <button
                  onClick={() => setActiveProduct(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
                  aria-label="Close Product Panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Product Visual Container */}
              <div className="relative h-44 rounded-2xl overflow-hidden mb-3.5 bg-slate-50 border border-slate-100">
                <img
                  src={activeProduct.imageUrl}
                  alt={activeProduct.name}
                  className="w-full h-full object-cover"
                />
                {activeProduct.discountPercentage && activeProduct.discountPercentage > 0 ? (
                  <span className="absolute top-2.5 left-2.5 bg-orange-600 text-white text-xs font-black px-2.5 py-0.5 rounded-lg shadow-md flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {activeProduct.discountPercentage}% OFF
                  </span>
                ) : null}

                <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  Shelf {activeProduct.shelfSection}
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{activeProduct.brand}</p>
                <h4 className="text-base font-black text-slate-900 leading-snug">{activeProduct.name}</h4>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1">{activeProduct.description}</p>
                <p className="text-xs text-slate-500 mt-1 font-semibold">Net Quantity: {activeProduct.packageSize}</p>
              </div>

              {/* Price in Indian Rupees & Stock */}
              <div className="flex items-baseline justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-700">
                    ₹{priceInRupees}
                  </span>
                  {activeProduct.discountPercentage && activeProduct.discountPercentage > 0 ? (
                    <span className="text-sm line-through text-slate-400">
                      ₹{originalPriceInRupees}
                    </span>
                  ) : null}
                  <span className="text-[11px] text-slate-400 font-medium">
                    (approx. ${(activeProduct.price! * (1 - (activeProduct.discountPercentage || 0) / 100)).toFixed(2)})
                  </span>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                    activeProduct.stockQuantity! > 5
                      ? 'bg-emerald-50 text-emerald-700'
                      : activeProduct.stockQuantity! > 0
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {activeProduct.stockQuantity! > 0
                    ? `${activeProduct.stockQuantity} in stock`
                    : 'Out of Stock'}
                </span>
              </div>

              {/* Quantity Stepper & Add to Basket */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                  <button
                    onClick={() => setHudQuantity(Math.max(1, hudQuantity - 1))}
                    disabled={hudQuantity <= 1}
                    className="p-1 rounded-lg text-slate-600 hover:bg-white disabled:opacity-40 transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-sm text-slate-800">{hudQuantity}</span>
                  <button
                    onClick={() =>
                      setHudQuantity(Math.min(activeProduct.stockQuantity || 1, hudQuantity + 1))
                    }
                    disabled={hudQuantity >= (activeProduct.stockQuantity || 1)}
                    className="p-1 rounded-lg text-slate-600 hover:bg-white disabled:opacity-40 transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!activeProduct.available}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-black rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Basket • ₹{priceInRupees * hudQuantity}</span>
                </button>
              </div>

              {/* View Full Specs Modal Trigger */}
              <button
                onClick={() => onSelectProduct(activeProduct)}
                className="w-full mt-2.5 text-center text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center justify-center gap-1"
              >
                <span>View Full Product Specifications & Nutrition</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
