import * as THREE from 'three';
import { Product } from '../../types';

/**
 * Procedural Realistic Texture & Model Factory for NearMart 3D
 * Generates commercial retail grocery packaging, branded labels, nutrition facts,
 * barcodes, and detailed 3D geometries for all supermarket products.
 */

// Texture cache to prevent duplicate canvas allocations and GPU memory waste
const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Creates high-resolution commercial retail packaging texture with brand header,
 * realistic typography, product photo representation, nutrition badges, barcode, and price in Rupees.
 */
export function createBoxPackagingTexture(
  product: Product,
  baseColor: string = '#16a34a',
  accentColor: string = '#f59e0b'
): THREE.CanvasTexture {
  const cacheKey = `box-${product.id}-${product.name}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  const priceInRupees = Math.round((product.price || 4.99) * 80);

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 512);
  bgGrad.addColorStop(0, '#ffffff');
  bgGrad.addColorStop(0.5, '#f8fafc');
  bgGrad.addColorStop(1, '#f1f5f9');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Top Brand Header Banner
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 512, 110);

  // Curved accent stripe
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.moveTo(0, 100);
  ctx.quadraticCurveTo(256, 130, 512, 100);
  ctx.lineTo(512, 120);
  ctx.quadraticCurveTo(256, 150, 0, 120);
  ctx.closePath();
  ctx.fill();

  // Brand Name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText((product.brand || 'PREMIUM QUALITY').toUpperCase(), 256, 48);

  // Quality Tagline
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('★ 100% NATURAL & FRESH ★', 256, 80);

  // Product Name (Main title)
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
  const nameParts = product.name.split(' ');
  if (nameParts.length > 3) {
    const line1 = nameParts.slice(0, 2).join(' ');
    const line2 = nameParts.slice(2).join(' ');
    ctx.fillText(line1, 256, 180);
    ctx.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(line2, 256, 222);
  } else {
    ctx.fillText(product.name, 256, 195);
  }

  // Package specs badge
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.roundRect(156, 245, 200, 32, 16);
  ctx.fill();
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`Net Wt: ${product.packageSize}`, 256, 267);

  // Central decorative product seal / emblem
  ctx.save();
  ctx.strokeStyle = baseColor;
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.arc(256, 345, 55, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = baseColor;
  ctx.beginPath();
  ctx.arc(256, 345, 48, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`₹${priceInRupees}`, 256, 345);
  ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('SPECIAL MRP', 256, 368);

  // Bottom Nutrition & Compliance Strip
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 435, 512, 77);

  // Veg Symbol (Green square with circle inside - authentic Indian grocery requirement)
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 450, 28, 28);
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(44, 464, 7, 0, Math.PI * 2);
  ctx.fill();

  // Nutrition pills
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText('ENERGY: 140 kcal  |  PROTEIN: 4.2g  |  FAT: 0.8g', 75, 468);
  ctx.font = '11px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('FSSAI LIC. NO. 10019022009841  •  BATCH: NM26A', 75, 492);

  // Barcode (authentic retail stripes on bottom right)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(400, 448, 85, 34);
  ctx.fillStyle = '#000000';
  const barPattern = [2, 1, 3, 1, 2, 3, 1, 1, 2, 1, 3, 2, 1, 2, 1, 3, 1, 2, 1, 3, 2];
  let curX = 405;
  for (const b of barPattern) {
    ctx.fillRect(curX, 450, b, 24);
    curX += b + 2;
  }
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('8901030', 442, 480);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates high-detail bottle / can wrap label texture
 */
export function createBottleLabelTexture(
  product: Product,
  bgColor: string = '#0284c7'
): THREE.CanvasTexture {
  const cacheKey = `bottle-${product.id}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  const priceInRupees = Math.round((product.price || 4.99) * 80);

  // Background
  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, bgColor);
  grad.addColorStop(0.5, '#ffffff');
  grad.addColorStop(1, bgColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // White label window in center
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(110, 15, 292, 226, 12);
  ctx.fill();
  ctx.strokeStyle = bgColor;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Top brand
  ctx.fillStyle = bgColor;
  ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText((product.brand || 'NEARMART BEVERAGES').toUpperCase(), 256, 50);

  // Product Name
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(product.name, 256, 88);

  // Volume
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(product.packageSize, 256, 116);

  // Price badge in Indian Rupees
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.roundRect(196, 134, 120, 36, 8);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`₹${priceInRupees}`, 256, 160);

  // Chilled serving note
  ctx.fillStyle = '#475569';
  ctx.font = 'italic 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('BEST SERVED CHILLED  •  RECYCLE BOTTLE', 256, 196);

  // Barcode
  ctx.fillStyle = '#000000';
  for (let i = 0; i < 20; i++) {
    ctx.fillRect(200 + i * 3, 210, (i % 3 === 0 ? 2 : 1), 18);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates potato chips & snack pouch metallic crinkled texture
 */
export function createChipBagTexture(product: Product, flavorColor: string = '#ea580c'): THREE.CanvasTexture {
  const cacheKey = `bag-${product.id}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.CanvasTexture(canvas);

  const priceInRupees = Math.round((product.price || 4.99) * 80);

  // Metallic sheen gradient
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, flavorColor);
  grad.addColorStop(0.3, '#fde047');
  grad.addColorStop(0.5, flavorColor);
  grad.addColorStop(0.8, '#c2410c');
  grad.addColorStop(1, flavorColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Wavy crunch bands
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  for (let y = 80; y < 440; y += 70) {
    ctx.beginPath();
    ctx.ellipse(256, y, 240, 20, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Top crimp seal texture
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  for (let x = 0; x < 512; x += 8) {
    ctx.fillRect(x, 0, 4, 30);
    ctx.fillRect(x, 482, 4, 30);
  }

  // Brand banner
  ctx.fillStyle = '#1e1b4b';
  ctx.beginPath();
  ctx.roundRect(60, 50, 392, 70, 16);
  ctx.fill();
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText((product.brand || 'CRUNCH WAVE').toUpperCase(), 256, 98);

  // Product Name
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 8;
  ctx.font = '900 42px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(product.name, 256, 210);
  ctx.shadowBlur = 0;

  // Flavor burst badge
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(256, 310, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('CRISPY', 256, 305);
  ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`₹${priceInRupees}`, 256, 332);

  // Weight & Veg mark
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(product.packageSize, 256, 420);

  // Veg Mark
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 3;
  ctx.strokeRect(50, 440, 24, 24);
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(62, 452, 6, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates authentic Basmati / Grain burlap jute bag texture
 */
export function createGrainBagTexture(product: Product): THREE.CanvasTexture {
  const cacheKey = `grain-${product.id}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.CanvasTexture(canvas);

  const priceInRupees = Math.round((product.price || 4.99) * 80);

  // Warm textured burlap background
  ctx.fillStyle = '#e5d5be';
  ctx.fillRect(0, 0, 512, 512);

  // Cross-hatch jute weave lines
  ctx.strokeStyle = '#cbba9f';
  ctx.lineWidth = 1;
  for (let i = 0; i < 512; i += 6) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  // Red & Green Indian border stamp
  ctx.strokeStyle = '#991b1b';
  ctx.lineWidth = 8;
  ctx.strokeRect(30, 30, 452, 452);
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, 432, 432);

  // Traditional Grain Peacock / Crown Seal
  ctx.fillStyle = '#991b1b';
  ctx.font = 'bold 38px "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.fillText('ROYAL HERITAGE', 256, 100);

  ctx.fillStyle = '#1e3a8a';
  ctx.font = '900 44px "Times New Roman", serif';
  ctx.fillText('HIMALAYAN BASMATI', 256, 170);

  ctx.fillStyle = '#15803d';
  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('100% EXTRA LONG AGED GRAIN', 256, 215);

  // Golden wheat ears illustration motif
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.ellipse(256, 290, 80, 45, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`₹${priceInRupees}`, 256, 295);
  ctx.font = '16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(product.packageSize, 256, 322);

  // Bottom seal
  ctx.fillStyle = '#991b1b';
  ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('★ EXPORT QUALITY  •  NATURALLY AGED ★', 256, 420);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates realistic Gable-Top Milk Carton with pitched roof geometry
 */
export function buildMilkCartonMesh(product: Product): THREE.Group {
  const group = new THREE.Group();

  const texture = createBoxPackagingTexture(product, '#0284c7', '#38bdf8');
  const cartonMat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.3,
    metalness: 0.05,
  });

  // Main body
  const bodyGeo = new THREE.BoxGeometry(0.24, 0.34, 0.22);
  const bodyMesh = new THREE.Mesh(bodyGeo, cartonMat);
  bodyMesh.position.y = 0.17;
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Gable top (pitched wedge)
  const roofGeo = new THREE.CylinderGeometry(0.01, 0.14, 0.1, 4, 1, false, Math.PI / 4);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
  const roofMesh = new THREE.Mesh(roofGeo, roofMat);
  roofMesh.rotation.y = Math.PI / 4;
  roofMesh.position.y = 0.38;
  roofMesh.scale.set(1.4, 1, 1.2);
  roofMesh.castShadow = true;
  group.add(roofMesh);

  // Plastic screw cap
  const capGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.02, 12);
  const capMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
  const capMesh = new THREE.Mesh(capGeo, capMat);
  capMesh.position.set(0.05, 0.4, 0.04);
  capMesh.rotation.z = -0.3;
  group.add(capMesh);

  (group as any).userData = { product };
  return group;
}

/**
 * Creates realistic Chilled Beverage Bottle with liquid, cap and wrap label
 */
export function buildBeverageBottleMesh(product: Product): THREE.Group {
  const group = new THREE.Group();

  const isJuice = product.categoryId === 'cat-7' && product.name.toLowerCase().includes('juice');
  const liquidColor = isJuice ? 0xea580c : 0x0284c7;

  // Clear Bottle Body
  const bodyGeo = new THREE.CylinderGeometry(0.08, 0.085, 0.28, 16);
  const labelTex = createBottleLabelTexture(product, isJuice ? '#c2410c' : '#0369a1');
  const bodyMat = new THREE.MeshStandardMaterial({
    map: labelTex,
    roughness: 0.15,
    metalness: 0.1,
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.y = 0.14;
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Tapered neck
  const neckGeo = new THREE.CylinderGeometry(0.035, 0.08, 0.08, 16);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: liquidColor,
    roughness: 0.1,
    transmission: 0.6,
    thickness: 0.1,
  });
  const neckMesh = new THREE.Mesh(neckGeo, glassMat);
  neckMesh.position.y = 0.32;
  group.add(neckMesh);

  // Screw cap
  const capGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.03, 16);
  const capMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const capMesh = new THREE.Mesh(capGeo, capMat);
  capMesh.position.y = 0.37;
  group.add(capMesh);

  (group as any).userData = { product };
  return group;
}

/**
 * Creates realistic Aluminum Beverage Soda Can with metallic rim
 */
export function buildBeverageCanMesh(product: Product): THREE.Group {
  const group = new THREE.Group();

  // Printed wrap label body
  const labelTex = createBottleLabelTexture(product, '#10b981');
  const bodyGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.24, 18, 1, true);
  const bodyMat = new THREE.MeshStandardMaterial({
    map: labelTex,
    roughness: 0.25,
    metalness: 0.7,
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.y = 0.13;
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Brushed aluminum metallic lid & bottom rim
  const aluminumMat = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    roughness: 0.2,
    metalness: 0.9,
  });

  const topRim = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.078, 0.02, 18), aluminumMat);
  topRim.position.y = 0.25;
  group.add(topRim);

  const botRim = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.082, 0.02, 18), aluminumMat);
  botRim.position.y = 0.01;
  group.add(botRim);

  // Pull-tab on top
  const tabGeo = new THREE.BoxGeometry(0.02, 0.005, 0.04);
  const tabMesh = new THREE.Mesh(tabGeo, aluminumMat);
  tabMesh.position.set(0.01, 0.261, 0.01);
  group.add(tabMesh);

  (group as any).userData = { product };
  return group;
}

/**
 * Creates realistic Potato Chips / Snack Pouch with bulged pillow geometry
 */
export function buildSnackPouchMesh(product: Product): THREE.Group {
  const group = new THREE.Group();

  const tex = createChipBagTexture(product, product.color3D || '#ea580c');
  const bagGeo = new THREE.BoxGeometry(0.24, 0.34, 0.14);

  // Deform geometry slightly to create natural bulged pillow shape
  const pos = bagGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    // pinch top and bottom seals, bulge center
    const factor = 1 - Math.abs(y / 0.17) * 0.45;
    pos.setZ(i, pos.getZ(i) * factor * 1.3);
  }
  bagGeo.computeVertexNormals();

  const bagMat = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.25,
    metalness: 0.35,
  });

  const mesh = new THREE.Mesh(bagGeo, bagMat);
  mesh.position.y = 0.17;
  mesh.castShadow = true;
  group.add(mesh);

  (group as any).userData = { product };
  return group;
}

/**
 * Creates realistic Basmati Rice & Grain Sack with textured stitched burlap
 */
export function buildGrainSackMesh(product: Product): THREE.Group {
  const group = new THREE.Group();

  const tex = createGrainBagTexture(product);
  const sackGeo = new THREE.BoxGeometry(0.28, 0.38, 0.18);

  // Bulge the bag at the bottom where heavy grains sit
  const pos = sackGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y < 0) {
      pos.setX(i, pos.getX(i) * 1.15);
      pos.setZ(i, pos.getZ(i) * 1.18);
    }
  }
  sackGeo.computeVertexNormals();

  const sackMat = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.8,
    metalness: 0.05,
  });

  const mesh = new THREE.Mesh(sackGeo, sackMat);
  mesh.position.y = 0.19;
  mesh.castShadow = true;
  group.add(mesh);

  // Top stitched rope handle
  const ropeGeo = new THREE.TorusGeometry(0.05, 0.01, 8, 16, Math.PI);
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0xa88d67, roughness: 0.9 });
  const ropeMesh = new THREE.Mesh(ropeGeo, ropeMat);
  ropeMesh.position.set(0, 0.38, 0);
  ropeMesh.rotation.x = Math.PI / 2;
  group.add(ropeMesh);

  (group as any).userData = { product };
  return group;
}

/**
 * Creates realistic Produce Display Bins with organic Fruit & Vegetable shapes
 */
export function buildProduceDisplayMesh(product: Product): THREE.Group {
  const group = new THREE.Group();

  // Natural wooden orchard crate base
  const crateGeo = new THREE.BoxGeometry(0.32, 0.12, 0.28);
  const crateMat = new THREE.MeshStandardMaterial({
    color: 0xc89d66,
    roughness: 0.85,
  });
  const crateMesh = new THREE.Mesh(crateGeo, crateMat);
  crateMesh.position.y = 0.06;
  crateMesh.castShadow = true;
  group.add(crateMesh);

  const prodName = product.name.toLowerCase();

  if (prodName.includes('banana')) {
    // Curved yellow banana cluster
    const bananaMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.4,
    });
    for (let b = 0; b < 4; b++) {
      const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-0.08, 0.12, -0.06 + b * 0.04),
        new THREE.Vector3(0, 0.18, -0.04 + b * 0.04),
        new THREE.Vector3(0.06, 0.17, -0.04 + b * 0.04),
        new THREE.Vector3(0.08, 0.13, -0.06 + b * 0.04)
      );
      const bananaGeo = new THREE.TubeGeometry(curve, 12, 0.022, 8, false);
      const bMesh = new THREE.Mesh(bananaGeo, bananaMat);
      bMesh.castShadow = true;
      group.add(bMesh);
    }
  } else if (prodName.includes('orange')) {
    // Dimpled glossy Valencia oranges
    const orangeMat = new THREE.MeshStandardMaterial({
      color: 0xea580c,
      roughness: 0.3,
    });
    const orangeOffsets = [
      [-0.06, 0.14, -0.05],
      [0.06, 0.14, -0.05],
      [-0.06, 0.14, 0.05],
      [0.06, 0.14, 0.05],
      [0, 0.19, 0],
    ];
    orangeOffsets.forEach(([ox, oy, oz]) => {
      const oMesh = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 14), orangeMat);
      oMesh.position.set(ox, oy, oz);
      oMesh.castShadow = true;
      group.add(oMesh);
    });
  } else if (prodName.includes('tomato')) {
    // Cluster vine Campari tomatoes with green calyx star
    const tomatoMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.2,
    });
    const calyxMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });

    const tomatoOffsets = [
      [-0.06, 0.13, -0.05],
      [0.06, 0.13, -0.05],
      [0, 0.17, 0],
    ];
    tomatoOffsets.forEach(([tx, ty, tz]) => {
      const tMesh = new THREE.Mesh(new THREE.SphereGeometry(0.042, 14, 14), tomatoMat);
      tMesh.position.set(tx, ty, tz);
      tMesh.castShadow = true;
      group.add(tMesh);

      const calyx = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.005, 5), calyxMat);
      calyx.position.set(tx, ty + 0.042, tz);
      group.add(calyx);
    });
  } else {
    // Crisp Honeycrisp red apples
    const appleMat = new THREE.MeshStandardMaterial({
      color: 0xb91c1c,
      roughness: 0.25,
      metalness: 0.05,
    });
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x3f2e18, roughness: 0.9 });

    const appleOffsets = [
      [-0.07, 0.14, -0.05],
      [0.07, 0.14, -0.05],
      [-0.07, 0.14, 0.05],
      [0.07, 0.14, 0.05],
      [0, 0.19, 0],
    ];
    appleOffsets.forEach(([ax, ay, az]) => {
      const appleGeo = new THREE.SphereGeometry(0.046, 14, 14);
      // Apple dip on top
      const appleMesh = new THREE.Mesh(appleGeo, appleMat);
      appleMesh.scale.set(1, 0.92, 1);
      appleMesh.position.set(ax, ay, az);
      appleMesh.castShadow = true;
      group.add(appleMesh);

      // Small brown stem
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.018, 6), stemMat);
      stem.position.set(ax, ay + 0.045, az);
      stem.rotation.z = 0.15;
      group.add(stem);
    });
  }

  // Front wooden chalkboard price label
  const priceInRupees = Math.round((product.price || 4.99) * 80);
  const tagCanvas = document.createElement('canvas');
  tagCanvas.width = 256;
  tagCanvas.height = 128;
  const tagCtx = tagCanvas.getContext('2d');
  if (tagCtx) {
    tagCtx.fillStyle = '#1e293b';
    tagCtx.fillRect(0, 0, 256, 128);
    tagCtx.fillStyle = '#22c55e';
    tagCtx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    tagCtx.textAlign = 'center';
    tagCtx.fillText('FARM FRESH', 128, 36);
    tagCtx.fillStyle = '#ffffff';
    tagCtx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    tagCtx.fillText(`₹${priceInRupees}/kg`, 128, 80);
    tagCtx.fillStyle = '#94a3b8';
    tagCtx.font = '16px "Plus Jakarta Sans", sans-serif';
    tagCtx.fillText(product.name.slice(0, 18), 128, 110);
  }
  const tagTex = new THREE.CanvasTexture(tagCanvas);
  const tagMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.2, 0.08),
    new THREE.MeshBasicMaterial({ map: tagTex })
  );
  tagMesh.position.set(0, 0.06, 0.141);
  group.add(tagMesh);

  (group as any).userData = { product };
  return group;
}

/**
 * Creates realistic Dispenser / Trigger Spray / Shampoo Bottle
 */
export function buildHouseholdCleanerMesh(product: Product): THREE.Group {
  const group = new THREE.Group();

  const isDetergentJug = product.name.toLowerCase().includes('laundry') || product.name.toLowerCase().includes('detergent');

  if (isDetergentJug) {
    // Molded jug with handle cutout
    const jugGeo = new THREE.BoxGeometry(0.24, 0.36, 0.18);
    const jugMat = new THREE.MeshStandardMaterial({
      map: createBoxPackagingTexture(product, '#7c3aed', '#c084fc'),
      roughness: 0.3,
    });
    const jugMesh = new THREE.Mesh(jugGeo, jugMat);
    jugMesh.position.y = 0.18;
    jugMesh.castShadow = true;
    group.add(jugMesh);

    // Large measuring screw cap
    const capGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.06, 16);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.2 });
    const capMesh = new THREE.Mesh(capGeo, capMat);
    capMesh.position.set(0.04, 0.39, 0);
    group.add(capMesh);

    // Molded side handle loop
    const handleGeo = new THREE.TorusGeometry(0.06, 0.02, 8, 16, Math.PI);
    const handleMesh = new THREE.Mesh(handleGeo, new THREE.MeshStandardMaterial({ color: 0x7c3aed }));
    handleMesh.position.set(-0.11, 0.24, 0);
    handleMesh.rotation.y = Math.PI / 2;
    group.add(handleMesh);
  } else {
    // Trigger Spray or Pump bottle
    const bodyGeo = new THREE.CylinderGeometry(0.07, 0.08, 0.26, 16);
    const labelTex = createBottleLabelTexture(product, '#0d9488');
    const bodyMesh = new THREE.Mesh(
      bodyGeo,
      new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.3 })
    );
    bodyMesh.position.y = 0.13;
    bodyMesh.castShadow = true;
    group.add(bodyMesh);

    // Spray trigger nozzle
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.1), nozzleMat);
    headMesh.position.set(0, 0.29, 0.02);
    group.add(headMesh);

    // Red trigger lever
    const triggerMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.04, 0.02),
      new THREE.MeshStandardMaterial({ color: 0xdc2626 })
    );
    triggerMesh.position.set(0, 0.26, 0.04);
    group.add(triggerMesh);
  }

  (group as any).userData = { product };
  return group;
}

/**
 * Creates realistic Retail Grocery Box (Cereal, Tea, Pasta, Crackers, Soap, Pizza)
 */
export function buildRetailBoxMesh(product: Product): THREE.Group {
  const group = new THREE.Group();

  const tex = createBoxPackagingTexture(
    product,
    product.color3D || '#16a34a',
    '#f59e0b'
  );

  const isSlender = product.name.toLowerCase().includes('toothpaste');
  const boxW = isSlender ? 0.14 : 0.26;
  const boxH = isSlender ? 0.32 : 0.38;
  const boxD = isSlender ? 0.12 : 0.18;

  const boxGeo = new THREE.BoxGeometry(boxW, boxH, boxD);
  const boxMat = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.35,
    metalness: 0.05,
  });

  const mesh = new THREE.Mesh(boxGeo, boxMat);
  mesh.position.y = boxH / 2;
  mesh.castShadow = true;
  group.add(mesh);

  (group as any).userData = { product };
  return group;
}

/**
 * Master dispatcher: builds appropriate high-detail 3D grocery product representation
 */
export function createRealisticProduct3D(product: Product): THREE.Group {
  switch (product.model3D) {
    case 'produce':
      return buildProduceDisplayMesh(product);
    case 'bottle':
      return buildBeverageBottleMesh(product);
    case 'can':
      return buildBeverageCanMesh(product);
    case 'carton':
      return buildMilkCartonMesh(product);
    case 'pouch':
      return product.categoryId === 'cat-5'
        ? buildGrainSackMesh(product)
        : buildSnackPouchMesh(product);
    default:
      if (product.categoryId === 'cat-10' || product.categoryId === 'cat-9') {
        return buildHouseholdCleanerMesh(product);
      }
      return buildRetailBoxMesh(product);
  }
}
