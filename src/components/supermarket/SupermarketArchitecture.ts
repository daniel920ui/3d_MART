import * as THREE from 'three';

/**
 * Architectural Retail Environment Factory for NearMart 3D
 * Generates commercial gondola shelving, tiled floor, checkout lanes,
 * shopping baskets, refrigerated cooler walls, and overhead signage.
 */

// Procedural texture for polished supermarket floor tiles (60x60cm)
export function createPolishedFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Pale grey-white polished terrazzo / porcelain
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle stone flecks
    ctx.fillStyle = '#cbd5e1';
    for (let i = 0; i < 400; i++) {
      const fx = Math.random() * 512;
      const fy = Math.random() * 512;
      ctx.fillRect(fx, fy, Math.random() * 3 + 1, Math.random() * 3 + 1);
    }

    // Grout grid lines (4x4 tiles per texture repeat)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    for (let i = 0; i <= 512; i += 128) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 20); // dense tile grid across the store
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural texture for perforated metal shelf backboard
export function createPerforatedBackboardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#334155'; // dark slate powder-coat
    ctx.fillRect(0, 0, 128, 128);

    // Pegboard hole pattern
    ctx.fillStyle = '#1e293b';
    for (let y = 8; y < 128; y += 16) {
      for (let x = 8; x < 128; x += 16) {
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 8);
  return texture;
}

// Procedural texture for shelf edge price tag rail
export function createShelfPriceRailTexture(color: string = '#16a34a'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 512, 32);

    // Multiple white price tags along the rail
    for (let x = 20; x < 500; x += 100) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, 4, 75, 24);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('₹ SPECIAL', x + 5, 20);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.set(4, 1);
  return texture;
}

/**
 * Builds realistic Commercial Double-Sided Gondola Shelving Unit
 */
export function buildCommercialGondolaUnit(
  x: number,
  z: number,
  length: number = 22,
  aisleColor: string = '#16a34a'
): THREE.Group {
  const gondola = new THREE.Group();
  gondola.position.set(x, 0, z);

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // dark charcoal powder-coated steel
    metalness: 0.6,
    roughness: 0.4,
  });

  const shelfMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0, // bright clean shelf surface
    metalness: 0.2,
    roughness: 0.3,
  });

  const backboardMat = new THREE.MeshStandardMaterial({
    map: createPerforatedBackboardTexture(),
    metalness: 0.3,
    roughness: 0.7,
  });

  const priceRailMat = new THREE.MeshStandardMaterial({
    map: createShelfPriceRailTexture(aisleColor),
    roughness: 0.2,
  });

  // 1. Central Perforated Back Divider Panel (Z-axis length)
  const backPanel = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 2.8, length),
    backboardMat
  );
  backPanel.position.set(0, 1.45, 0);
  backPanel.castShadow = true;
  backPanel.receiveShadow = true;
  gondola.add(backPanel);

  // 2. Heavy-duty base kickplate (bottom skirting)
  const baseKick = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.16, length + 0.2),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
  );
  baseKick.position.set(0, 0.08, 0);
  baseKick.receiveShadow = true;
  gondola.add(baseKick);

  // 3. Vertical slotted upright posts every 5.5 meters
  const halfLen = length / 2;
  for (let pz = -halfLen; pz <= halfLen; pz += 5.5) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.1, 0.12), metalMat);
    post.position.set(0, 1.55, pz);
    post.castShadow = true;
    gondola.add(post);

    // Endcap side trims on outer ends
    if (Math.abs(pz) === halfLen) {
      const endTrim = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.9, 0.06), metalMat);
      endTrim.position.set(0, 1.5, pz);
      gondola.add(endTrim);
    }
  }

  // 4. Shelf Tiers on both East and West sides (3 tiers: y = 0.45, 1.35, 2.25)
  const shelfHeights = [0.45, 1.35, 2.25];

  for (const side of [-1, 1]) {
    const shelfX = side * 0.48;

    shelfHeights.forEach((y) => {
      // Main shelf sheet
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.04, length), shelfMat);
      shelf.position.set(shelfX, y, 0);
      shelf.receiveShadow = true;
      shelf.castShadow = true;
      gondola.add(shelf);

      // Steel cantilever support brackets under the shelf
      for (let bz = -halfLen + 2.75; bz <= halfLen - 2.75; bz += 5.5) {
        const bracket = new THREE.Mesh(
          new THREE.BoxGeometry(0.7, 0.08, 0.04),
          metalMat
        );
        bracket.position.set(shelfX, y - 0.05, bz);
        gondola.add(bracket);
      }

      // Acrylic front retaining lip
      const acrylicLip = new THREE.Mesh(
        new THREE.BoxGeometry(0.015, 0.06, length),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.6,
          roughness: 0.1,
        })
      );
      acrylicLip.position.set(side * 0.9, y + 0.03, 0);
      gondola.add(acrylicLip);

      // Price Tag Extrusion Rail on front edge
      const priceRail = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.045, length),
        priceRailMat
      );
      priceRail.position.set(side * 0.91, y - 0.01, 0);
      gondola.add(priceRail);
    });
  }

  // 5. Top Canopy Header Board (Brand header banner across top)
  const topCanopy = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.35, length + 0.1),
    new THREE.MeshStandardMaterial({ color: aisleColor, roughness: 0.3 })
  );
  topCanopy.position.set(0, 3.0, 0);
  topCanopy.castShadow = true;
  gondola.add(topCanopy);

  return gondola;
}

/**
 * Creates realistic Double-Sided Overhead Aisle Signboard suspended from ceiling
 */
export function buildOverheadAisleSign(
  x: number,
  z: number,
  aisleNum: number,
  categoryName: string,
  color: string = '#16a34a'
): THREE.Group {
  const signGroup = new THREE.Group();
  signGroup.position.set(x, 4.0, z);

  // Generate double-sided sign face canvas
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Rich gradient background matching aisle identity
    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0, color);
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 192);

    // Glowing border frame
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, 496, 176);

    // Left Circular Aisle Badge
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(80, 96, 56, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AISLE', 80, 80);
    ctx.font = '900 48px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${aisleNum}`, 80, 126);

    // Category Name Text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(categoryName, 160, 95);

    // Tagline
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NearMart 3D Quality Guaranteed', 160, 135);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const signBoard = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 0.9, 0.08),
    new THREE.MeshStandardMaterial({ map: texture, roughness: 0.2 })
  );
  signBoard.castShadow = true;
  signGroup.add(signBoard);

  // Metal suspension chains going up to the 5.2m ceiling
  const chainMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
  for (const cx of [-1.1, 1.1]) {
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.8, 6), chainMat);
    chain.position.set(cx, 0.85, 0);
    signGroup.add(chain);
  }

  return signGroup;
}

/**
 * Creates modern Cashier Checkout Counter with conveyor belt, scanner, and POS screen
 */
export function buildCheckoutCounter(x: number, z: number, laneNumber: number = 1): THREE.Group {
  const lane = new THREE.Group();
  lane.position.set(x, 0, z);

  // Counter cabinet (deep teal with stainless trim)
  const baseCabinet = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 1.05, 1.6),
    new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.4, metalness: 0.1 })
  );
  baseCabinet.position.set(0, 0.525, 0);
  baseCabinet.castShadow = true;
  baseCabinet.receiveShadow = true;
  lane.add(baseCabinet);

  // Stainless counter top
  const counterTop = new THREE.Mesh(
    new THREE.BoxGeometry(3.64, 0.06, 1.64),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 })
  );
  counterTop.position.set(0, 1.08, 0);
  lane.add(counterTop);

  // Black ribbed conveyor belt
  const belt = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.02, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.95 })
  );
  belt.position.set(-0.5, 1.12, 0.3);
  lane.add(belt);

  // Barcode scanner bed with red laser illumination slit
  const scannerBed = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.02, 0.35),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.1 })
  );
  scannerBed.position.set(0.85, 1.12, 0.3);
  lane.add(scannerBed);

  const laserSlit = new THREE.Mesh(
    new THREE.PlaneGeometry(0.25, 0.03),
    new THREE.MeshBasicMaterial({ color: 0xef4444 }) // red scanner beam
  );
  laserSlit.rotation.x = -Math.PI / 2;
  laserSlit.position.set(0.85, 1.135, 0.3);
  lane.add(laserSlit);

  // Swivel POS Touch Screen
  const standPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.35, 12),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 })
  );
  standPole.position.set(1.1, 1.25, -0.2);
  lane.add(standPole);

  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.32, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 })
  );
  screen.position.set(1.1, 1.45, -0.2);
  screen.rotation.y = -0.3;
  lane.add(screen);

  // Glowing POS display face
  const screenFace = new THREE.Mesh(
    new THREE.PlaneGeometry(0.38, 0.28),
    new THREE.MeshBasicMaterial({ color: 0x22c55e })
  );
  screenFace.position.set(1.1, 1.45, -0.183);
  screenFace.rotation.y = -0.3;
  lane.add(screenFace);

  // Acrylic customer sneeze guard / divider
  const acrylicDivider = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.65, 0.02),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.45,
      roughness: 0.05,
    })
  );
  acrylicDivider.position.set(0.4, 1.42, -0.7);
  lane.add(acrylicDivider);

  // Overhead lane number indicator ("LANE 1 - OPEN")
  const laneSign = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.3, 0.05),
    new THREE.MeshBasicMaterial({ color: 0x15803d })
  );
  laneSign.position.set(1.1, 2.6, 0);
  lane.add(laneSign);

  return lane;
}

/**
 * Creates stack of authentic Red Plastic Grocery Shopping Hand Baskets
 */
export function buildShoppingBasketStack(x: number, z: number): THREE.Group {
  const stack = new THREE.Group();
  stack.position.set(x, 0, z);

  const basketMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626, // vibrant supermarket red
    roughness: 0.35,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.9,
    roughness: 0.1,
  });

  // Basket holder chrome rack
  const stand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.28, 0.4, 16),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
  );
  stand.position.y = 0.2;
  stack.add(stand);

  // Stack of 6 plastic baskets nestled inside each other
  for (let i = 0; i < 6; i++) {
    const y = 0.42 + i * 0.07;

    const basket = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.26, 0.34),
      basketMat
    );
    basket.position.y = y;
    basket.castShadow = true;
    stack.add(basket);

    // Chrome wire folding handles
    const handle = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.012, 6, 16, Math.PI),
      chromeMat
    );
    handle.position.set(0, y + 0.14, 0);
    handle.rotation.x = -Math.PI / 2;
    stack.add(handle);
  }

  return stack;
}

/**
 * Builds the Rear Wall Refrigerated Cooler with glass doors and internal LED light
 */
export function buildCoolerWallDisplay(x: number, z: number, width: number = 14): THREE.Group {
  const cooler = new THREE.Group();
  cooler.position.set(x, 0, z);

  // Stainless case frame
  const caseFrame = new THREE.Mesh(
    new THREE.BoxGeometry(width, 3.4, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 })
  );
  caseFrame.position.set(0, 1.7, 0);
  cooler.add(caseFrame);

  // Chilled illuminated interior backplate
  const interior = new THREE.Mesh(
    new THREE.BoxGeometry(width - 0.2, 3.2, 1.0),
    new THREE.MeshBasicMaterial({ color: 0xe0f2fe }) // frosty cool white interior
  );
  interior.position.set(0, 1.7, 0.05);
  cooler.add(interior);

  // Glass doors with chrome pull handles
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xbae6fd,
    transparent: true,
    opacity: 0.3,
    roughness: 0.05,
  });

  const doorCount = Math.floor(width / 1.8);
  const doorW = width / doorCount;

  for (let d = 0; d < doorCount; d++) {
    const dx = -width / 2 + doorW / 2 + d * doorW;
    const door = new THREE.Mesh(new THREE.BoxGeometry(doorW - 0.04, 3.1, 0.03), glassMat);
    door.position.set(dx, 1.7, 0.58);
    cooler.add(door);

    // Chrome vertical handle
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.6, 12),
      new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.95, roughness: 0.1 })
    );
    handle.position.set(dx + doorW * 0.35, 1.65, 0.61);
    cooler.add(handle);
  }

  // Top Illuminated "DAIRY & CHILLED BEVERAGES" sign
  const coolerSign = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.45, 0.05),
    new THREE.MeshBasicMaterial({ color: 0x0284c7 })
  );
  coolerSign.position.set(0, 3.6, 0.58);
  cooler.add(coolerSign);

  return cooler;
}
