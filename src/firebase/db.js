// HSP Organics Database Service (Supports real Firebase Firestore + High-Fidelity LocalStorage Fallback)
import { isMock, db, auth, googleProvider } from './config';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInAnonymously
} from 'firebase/auth';
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, onSnapshot, orderBy, limit, setDoc, writeBatch, arrayUnion
} from 'firebase/firestore';

// Initial preloaded database assets (Premium organic groceries)
const INITIAL_PRODUCTS = [
  // Vegetables
  {
    id: 'prod-veg-1',
    name: 'Organic Leafy Spinach (Palak)',
    category: 'Vegetables',
    price: 45,
    unit: '250g',
    stock: 45,
    description: 'Freshly harvested organic leafy spinach. Grown without synthetic pesticides, packed with iron, vitamins, and minerals. Perfect for healthy green smoothies, salads, or traditional curries.',
    organicInfo: '100% Certified Organic, Non-GMO, Pesticide-Free, Locally Sourced.',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
    featured: true,
    bestSeller: true,
    discountType: 'percentage',
    discountValue: 20,
    offerPrice: 36
  },
  {
    id: 'prod-veg-2',
    name: 'Heirloom Cherry Tomatoes',
    category: 'Vegetables',
    price: 85,
    unit: '500g',
    stock: 20,
    description: 'Sweet, juicy, and vibrant vine-ripened heirloom cherry tomatoes. Excellent source of vitamin C and antioxidants. Great for salads, roasting, or snacking.',
    organicInfo: 'Hydroponically grown under natural sunlight using organic nutrients.',
    image: 'https://images.unsplash.com/photo-1561131248-c52d89bad5af?w=600&auto=format&fit=crop&q=80',
    featured: true,
    bestSeller: false
  },
  {
    id: 'prod-veg-3',
    name: 'Fresh Hydroponic Cucumbers',
    category: 'Vegetables',
    price: 55,
    unit: '1kg',
    stock: 30,
    description: 'Crunchy, refreshing, and seedless hydroponic cucumbers. High water content makes them perfect for summer hydration, salads, and detox juices.',
    organicInfo: 'Zero chemical pesticides. Grown in clean mineralized water.',
    image: 'https://images.unsplash.com/photo-1587411768538-e95182755e5f?w=600&auto=format&fit=crop&q=80',
    featured: false,
    bestSeller: true
  },
  {
    id: 'prod-veg-4',
    name: 'Organic Farm Potatoes',
    category: 'Vegetables',
    price: 40,
    unit: '1kg',
    stock: 120,
    description: 'Fresh organic potatoes directly sourced from local soil. Earthy flavor, rich in potassium and complex carbohydrates.',
    organicInfo: 'Soil-grown in naturally fertilized organic farms.',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
    featured: false,
    bestSeller: false
  },
  {
    id: 'prod-veg-5',
    name: 'Tender Lady Finger (Okra)',
    category: 'Vegetables',
    price: 35,
    unit: '500g',
    stock: 15,
    description: 'Fresh, slender, and tender lady finger (okra). Crisp texture, excellent for traditional stir-fries and rich in dietary fibers.',
    organicInfo: 'Sourced from cooperative organic farms in Southern India.',
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=80',
    featured: false,
    bestSeller: false
  },
  
  // Fruits
  {
    id: 'prod-fruit-1',
    name: 'Premium Alphonso Mangoes',
    category: 'Fruits',
    price: 699,
    unit: '1 Dozen (12 pcs)',
    stock: 12,
    description: 'The King of Mangoes! Incredibly aromatic, sweet, and pulpy Devgad/Ratnagiri Alphonso mangoes. Naturally ripened using hay.',
    organicInfo: 'GI-Tagged authentic mangoes ripened chemical-free.',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80',
    featured: true,
    bestSeller: true
  },
  {
    id: 'prod-fruit-2',
    name: 'Fresh Organic Bananas (Yelakki)',
    category: 'Fruits',
    price: 75,
    unit: '1 Dozen (12 pcs)',
    stock: 50,
    description: 'Small, sweet, and aromatic Yelakki bananas. Loaded with instant energy, dietary fibers, and essential vitamins.',
    organicInfo: 'Ripened using natural temperature control, never carbide treated.',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
    featured: false,
    bestSeller: true
  },
  {
    id: 'prod-fruit-3',
    name: 'Sweet Crisp Red Apples',
    category: 'Fruits',
    price: 190,
    unit: '1kg (4-5 pcs)',
    stock: 25,
    description: 'Crisp, sweet, and wax-free red apples from Shimla orchards. Fresh, juicy, and ideal for healthy snacking.',
    organicInfo: 'Unwaxed, hand-picked, washed in ozonated water.',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80',
    featured: true,
    bestSeller: false
  },
  
  // Oils
  {
    id: 'prod-oil-1',
    name: 'Cold-Pressed Virgin Coconut Oil',
    category: 'Oils',
    price: 340,
    unit: '1 Liter',
    stock: 40,
    description: 'Pure, extra-virgin coconut oil extracted via cold-pressing fresh coconut milk (wood-pressed/Kachi Ghani). Highly nutritious and excellent for cooking, skin, and hair care.',
    organicInfo: 'Sulphur-free coconuts, cold-processed under 45 degrees Celsius.',
    image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&auto=format&fit=crop&q=80',
    featured: true,
    bestSeller: true,
    discountType: 'flat',
    discountValue: 40,
    offerPrice: 300
  },
  {
    id: 'prod-oil-2',
    name: 'Wood-Pressed Groundnut Oil',
    category: 'Oils',
    price: 270,
    unit: '1 Liter',
    stock: 60,
    description: 'Traditional wood-pressed groundnut (peanut) oil. High smoke point, rich in Vitamin E and monounsaturated fats. Retains natural nutty aroma and flavor.',
    organicInfo: 'Zero chemical refining, filtered naturally through sedimentation.',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
    featured: false,
    bestSeller: true
  },

  // Cool Drinks
  {
    id: 'prod-drink-1',
    name: 'Organic Tender Coconut Water',
    category: 'Cool Drinks',
    price: 55,
    unit: '1 Piece',
    stock: 100,
    description: 'Sweet, natural, and electrolyte-rich fresh tender coconut water. Harvested fresh daily and served in raw shell or bio-degradable bottle.',
    organicInfo: 'Grown on organic coastlands, chemical fertilizer free.',
    image: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=600&auto=format&fit=crop&q=80',
    featured: true,
    bestSeller: true
  }
];

// Seed initial state in local storage helper
const DB_PRODUCTS_VERSION = 'v4';
const initLocalStorageDB = () => {
  const storedVer = localStorage.getItem('hsp_products_version');
  if (!localStorage.getItem('hsp_products') || storedVer !== DB_PRODUCTS_VERSION) {
    localStorage.setItem('hsp_products', JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem('hsp_products_version', DB_PRODUCTS_VERSION);
  }
  if (!localStorage.getItem('hsp_orders')) {
    localStorage.setItem('hsp_orders', JSON.stringify([]));
  }
  if (!localStorage.getItem('hsp_notifications')) {
    localStorage.setItem('hsp_notifications', JSON.stringify([
      {
        id: 'noti-init',
        title: 'Welcome to HSP Organics!',
        body: 'Fresh vegetables, fruits, and cold pressed oils are now available. Get free delivery on your first order.',
        createdAt: new Date().toISOString(),
        read: false,
        type: 'general',
        userId: 'all'
      }
    ]));
  }
  if (!localStorage.getItem('hsp_users')) {
    localStorage.setItem('hsp_users', JSON.stringify([
      {
        uid: 'admin-default',
        email: 'admin@hsporganics.com',
        displayName: 'Master Admin',
        role: 'admin',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
      },
      {
        uid: 'user-demo',
        email: 'customer@gmail.com',
        displayName: 'John Doe',
        role: 'customer',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
      },
      {
        uid: 'delivery-default',
        email: 'delivery@hsporganics.com',
        displayName: 'Ramesh Kumar (Rider)',
        role: 'delivery',
        phone: '+91 98765 43210',
        photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
      }
    ]));
  }
  if (!localStorage.getItem('hsp_addresses')) {
    localStorage.setItem('hsp_addresses', JSON.stringify([
      {
        id: 'addr-1',
        userId: 'user-demo',
        name: 'Home',
        addressLine: 'Block 4A, Green Meadows Apartment, Near Outer Ring Road',
        city: 'Bengaluru',
        postalCode: '560103',
        lat: 12.9234,
        lng: 77.6854,
        isDefault: true
      }
    ]));
  }
  if (!localStorage.getItem('hsp_wishlist')) {
    localStorage.setItem('hsp_wishlist', JSON.stringify([]));
  }
  if (!localStorage.getItem('hsp_coupons')) {
    localStorage.setItem('hsp_coupons', JSON.stringify([
      { id: 'cpn-1', code: 'ORGANIC20', discountType: 'percentage', discountValue: 20, minCartValue: 300, description: '20% Off on orders above ₹300' },
      { id: 'cpn-2', code: 'FREE50', discountType: 'flat', discountValue: 50, minCartValue: 200, description: 'Flat ₹50 Off on orders above ₹200' }
    ]));
  }
  if (!localStorage.getItem('hsp_videos')) {
    localStorage.setItem('hsp_videos', JSON.stringify([
      {
        id: 'vid-1',
        title: 'Organic Spinach Cultivation — Farm to Table',
        description: 'Watch how we grow fresh organic spinach using sustainable farming practices with zero chemical pesticides.',
        url: 'https://www.youtube.com/embed/bHhgPgGPpLI',
        thumbnail: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
        category: 'Cultivation',
        createdAt: new Date().toISOString()
      },
      {
        id: 'vid-2',
        title: 'Cold-Press Virgin Coconut Oil Extraction',
        description: 'Traditional wood-pressed Kachi Ghani process that retains all nutrients and natural aroma.',
        url: 'https://www.youtube.com/embed/K2yjU_6Ywns',
        thumbnail: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&auto=format&fit=crop&q=80',
        category: 'Processing',
        createdAt: new Date().toISOString()
      },
      {
        id: 'vid-3',
        title: 'Alphonso Mango Harvesting Season',
        description: 'Experience the joy of harvesting GI-tagged Alphonso mangoes from our coastal organic orchards.',
        url: 'https://www.youtube.com/embed/ysz5S6PUM-U',
        thumbnail: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80',
        category: 'Harvest',
        createdAt: new Date().toISOString()
      }
    ]));
  }
  if (!localStorage.getItem('hsp_ratings')) {
    localStorage.setItem('hsp_ratings', JSON.stringify([]));
  }
};

// Execute DB initialization
if (typeof window !== 'undefined') {
  initLocalStorageDB();
}

// Memory-based Listeners for Emulated real-time updates
const eventListeners = {};

export const subscribeToLocalCollection = (collectionKey, callback) => {
  const fullKey = `hsp_${collectionKey}`;
  if (!eventListeners[fullKey]) {
    eventListeners[fullKey] = [];
  }
  eventListeners[fullKey].push(callback);
  
  // Call immediately
  const rawData = localStorage.getItem(fullKey);
  callback(rawData ? JSON.parse(rawData) : []);
  
  // Unsubscribe
  return () => {
    eventListeners[fullKey] = eventListeners[fullKey].filter(cb => cb !== callback);
  };
};

const triggerCollectionChange = (collectionKey) => {
  const fullKey = `hsp_${collectionKey}`;
  if (eventListeners[fullKey]) {
    const rawData = localStorage.getItem(fullKey);
    const parsed = rawData ? JSON.parse(rawData) : [];
    eventListeners[fullKey].forEach(cb => cb(parsed));
  }
};

// HELPER API IMPLEMENTATIONS (TRANSPARENT FALLBACKS)

// Helper functions to unify sessionStorage and localStorage for PWA reliability
const setSession = (userObj) => {
  if (userObj) {
    sessionStorage.setItem('hsp_session', JSON.stringify(userObj));
    localStorage.setItem('hsp_session', JSON.stringify(userObj));
  } else {
    sessionStorage.removeItem('hsp_session');
    localStorage.removeItem('hsp_session');
  }
};

const getSession = () => {
  const s = sessionStorage.getItem('hsp_session') || localStorage.getItem('hsp_session');
  return s ? JSON.parse(s) : null;
};

// 1. Authentication Functions
const resolveFirebaseUserProfile = async (firebaseUser) => {
  if (firebaseUser.isAnonymous) {
    const session = getSession();
    if (session) return session;
  }

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@hsporganics.com';
  let profile = null;
  let profileId = firebaseUser.uid;

  try {
    const uidSnapshot = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (uidSnapshot.exists()) {
      profile = uidSnapshot.data();
      profileId = uidSnapshot.id;
    } else if (firebaseUser.email) {
      const emailQuery = query(collection(db, 'users'), where('email', '==', firebaseUser.email));
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        profile = emailSnapshot.docs[0].data();
        profileId = emailSnapshot.docs[0].id;
      }
    }
  } catch (error) {
    console.warn('Error resolving Firebase user profile:', error);
  }

  const displayName = profile?.displayName || profile?.name || firebaseUser.displayName || firebaseUser.email;
  return {
    ...profile,
    uid: profile?.uid || profileId,
    id: profile?.id || profileId,
    authUid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName,
    name: profile?.name || displayName,
    photoURL: profile?.photoURL || firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2E7D32&color=fff`,
    role: profile?.role || (firebaseUser.email === adminEmail ? 'admin' : 'customer')
  };
};

export const authService = {
  // Returns currently logged-in user (real Firebase user or mock session)
  getCurrentUser: () => {
    if (!isMock && auth && auth.currentUser) {
      const savedUser = getSession();
      if (savedUser) {
        if (savedUser.authUid === auth.currentUser.uid || savedUser.email === auth.currentUser.email) {
          return savedUser;
        }
      }
      const fu = auth.currentUser;
      return {
        uid: fu.uid,
        email: fu.email,
        displayName: fu.displayName || fu.email,
        photoURL: fu.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fu.displayName || fu.email)}&background=2E7D32&color=fff`,
        role: fu.email === import.meta.env.VITE_ADMIN_EMAIL ? 'admin' : 'customer'
      };
    }
    // Fallback: mock session stored in sessionStorage/localStorage
    return getSession();
  },

  // Google Sign-In via Firebase popup (real) or demo simulation (mock)
  loginWithGoogle: async () => {
    if (!isMock && auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const userObj = await resolveFirebaseUserProfile(result.user);
        setSession(userObj);
        return userObj;
      } catch (error) {
        throw new Error(error.message || 'Google Sign-In was cancelled or blocked.');
      }
    }

    // ── MOCK mode: simulate a Google login ──────────────────────────────────
    const demoUser = {
      uid: 'user-google-' + Math.random().toString(36).substring(2, 9),
      email: 'organic.shopper@gmail.com',
      displayName: 'Organic Lover',
      role: 'customer',
      photoURL: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80'
    };
    const users = JSON.parse(localStorage.getItem('hsp_users') || '[]');
    if (!users.some(u => u.email === demoUser.email)) {
      users.push(demoUser);
      localStorage.setItem('hsp_users', JSON.stringify(users));
      triggerCollectionChange('users');
    }
    setSession(demoUser);
    return demoUser;
  },

  // Email / Password Sign-In via Firebase (real) or LocalStorage lookup (mock)
  loginEmail: async (email, password) => {
    if (!isMock && auth) {
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const userObj = await resolveFirebaseUserProfile(result.user);
        setSession(userObj);
        return userObj;
      } catch (error) {
        // Fallback for Delivery Boys created via Admin Panel (which only exist in Firestore, not Auth)
        try {
          const emailQuery = query(collection(db, 'users'), where('email', '==', email), where('role', '==', 'delivery'));
          const emailSnapshot = await getDocs(emailQuery);
          if (!emailSnapshot.empty) {
            // Delivery boy found in DB! Sign them in anonymously to grant Firestore access.
            await signInAnonymously(auth);
            const userObj = emailSnapshot.docs[0].data();
            const sessionObj = { ...userObj, uid: emailSnapshot.docs[0].id, id: emailSnapshot.docs[0].id };
            setSession(sessionObj);
            return sessionObj;
          }
        } catch (dbErr) {
          console.warn('Fallback DB check failed:', dbErr);
        }
        throw new Error(error.message || 'Authentication failed. Please check your credentials.');
      }
    }

    // ── MOCK mode ────────────────────────────────────────────────────────────
    const users = JSON.parse(localStorage.getItem('hsp_users') || '[]');
    const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('User not found. Try customer@gmail.com, delivery@hsporganics.com or admin@hsporganics.com');
    }
    if (email.toLowerCase().includes('admin') && password !== 'admin123') {
      throw new Error('Incorrect admin password. Hint: admin123');
    }
    if (email.toLowerCase().includes('delivery') && password !== 'delivery123') {
      throw new Error('Incorrect delivery password. Hint: delivery123');
    }
    if (email.toLowerCase().includes('customer') && password !== 'customer123') {
      throw new Error('Incorrect customer password. Hint: customer123');
    }
    setSession(user);
    return user;
  },

  // Sign out (real Firebase or mock clear)
  logout: async () => {
    if (!isMock && auth) {
      await signOut(auth);
    }
    setSession(null);
    return true;
  },

  onAuthStateChanged: (callback) => {
    if (!isMock && auth) {
      return onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const userObj = await resolveFirebaseUserProfile(firebaseUser);
          setSession(userObj);
          callback(userObj);
        } else {
          const session = getSession();
          if (session) {
            signInAnonymously(auth).catch(console.error);
            callback(session);
          } else {
            callback(null);
          }
        }
      });
    }
    callback(getSession());
    return () => {};
  }
};

// 2. Product Services (CRUD)
export const productService = {
  getAll: async () => {
    if (!isMock && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const list = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        // Seed default products to Firestore if it's completely empty on first launch
        if (list.length === 0) {
          for (const p of INITIAL_PRODUCTS) {
            await setDoc(doc(db, 'products', p.id), p);
            list.push(p);
          }
        }
        return list;
      } catch (err) {
        console.error("Firestore products read failed: ", err);
      }
    }
    const raw = localStorage.getItem('hsp_products');
    return raw ? JSON.parse(raw) : [];
  },
  
  subscribe: (callback) => {
    if (!isMock && db) {
      return onSnapshot(collection(db, 'products'), (snapshot) => {
        const list = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        callback(list);
      }, (err) => {
        console.error("Firestore products subscription failed, falling back to local: ", err);
      });
    }
    return subscribeToLocalCollection('products', callback);
  },

  add: async (productData) => {
    if (!isMock && db) {
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock),
        featured: !!productData.featured,
        bestSeller: !!productData.bestSeller,
        createdAt: new Date().toISOString()
      });
      const newProduct = { id: docRef.id, ...productData };
      
      // Trigger notification
      await notificationService.addSystemNotification({
        title: 'New Organic Harvest!',
        body: `${newProduct.name} is now available in the ${newProduct.category} section!`,
        type: 'new_product'
      });
      
      return newProduct;
    }

    const products = JSON.parse(localStorage.getItem('hsp_products') || '[]');
    const newProduct = {
      ...productData,
      id: 'prod-' + Math.random().toString(36).substring(2, 9),
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock),
      featured: !!productData.featured,
      bestSeller: !!productData.bestSeller
    };
    products.push(newProduct);
    localStorage.setItem('hsp_products', JSON.stringify(products));
    triggerCollectionChange('products');
    
    notificationService.addSystemNotification({
      title: 'New Organic Harvest!',
      body: `${newProduct.name} is now available in the ${newProduct.category} section!`,
      type: 'new_product'
    });
    
    return newProduct;
  },

  update: async (productId, updatedFields) => {
    const cleanFields = {
      ...updatedFields,
      price: parseFloat(updatedFields.price),
      stock: parseInt(updatedFields.stock)
    };

    if (!isMock && db) {
      const docRef = doc(db, 'products', productId);
      await updateDoc(docRef, cleanFields);

      // Low stock notification
      if (cleanFields.stock <= 5) {
        await notificationService.addSystemNotification({
          title: 'Inventory Alert ⚠️',
          body: `Low stock alert: ${cleanFields.name} has only ${cleanFields.stock} units left!`,
          type: 'inventory_alert',
          userId: 'admin'
        });
      }
      return { id: productId, ...cleanFields };
    }

    const products = JSON.parse(localStorage.getItem('hsp_products') || '[]');
    const index = products.findIndex(p => p.id === productId);
    if (index === -1) throw new Error("Product not found");
    
    products[index] = {
      ...products[index],
      ...cleanFields
    };
    
    if (products[index].stock <= 5) {
      notificationService.addSystemNotification({
        title: 'Inventory Alert ⚠️',
        body: `Low stock alert: ${products[index].name} has only ${products[index].stock} units left!`,
        type: 'inventory_alert',
        userId: 'admin'
      });
    }
    
    localStorage.setItem('hsp_products', JSON.stringify(products));
    triggerCollectionChange('products');
    return products[index];
  },

  delete: async (productId) => {
    if (!isMock && db) {
      await deleteDoc(doc(db, 'products', productId));
      return true;
    }

    let products = JSON.parse(localStorage.getItem('hsp_products') || '[]');
    products = products.filter(p => p.id !== productId);
    localStorage.setItem('hsp_products', JSON.stringify(products));
    triggerCollectionChange('products');
    return true;
  }
};

// 3. Address Services
export const addressService = {
  getByUser: async (userId) => {
    if (!isMock && db) {
      const q = query(collection(db, 'addresses'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list;
    }

    const addresses = JSON.parse(localStorage.getItem('hsp_addresses') || '[]');
    return addresses.filter(a => a.userId === userId);
  },

  save: async (userId, addressData) => {
    if (!isMock && db) {
      // If saving as default, reset other addresses in Firestore
      if (addressData.isDefault) {
        const q = query(collection(db, 'addresses'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.forEach((d) => {
          if (d.data().isDefault) {
            batch.update(d.ref, { isDefault: false });
          }
        });
        await batch.commit();
      }

      const cleanAddress = {
        name: addressData.name,
        addressLine: addressData.addressLine,
        city: addressData.city,
        postalCode: addressData.postalCode,
        lat: addressData.lat || 12.9716,
        lng: addressData.lng || 77.5946,
        isDefault: !!addressData.isDefault,
        userId
      };

      if (addressData.id) {
        // Edit existing doc
        await setDoc(doc(db, 'addresses', addressData.id), cleanAddress, { merge: true });
        return { id: addressData.id, ...cleanAddress };
      } else {
        // Create new doc
        const docRef = await addDoc(collection(db, 'addresses'), cleanAddress);
        return { id: docRef.id, ...cleanAddress };
      }
    }

    const addresses = JSON.parse(localStorage.getItem('hsp_addresses') || '[]');
    if (addressData.isDefault) {
      addresses.forEach(a => {
        if (a.userId === userId) a.isDefault = false;
      });
    }

    const newAddress = {
      ...addressData,
      id: addressData.id || 'addr-' + Math.random().toString(36).substring(2, 9),
      userId,
      lat: addressData.lat || 12.9716,
      lng: addressData.lng || 77.5946
    };

    if (addressData.id) {
      const index = addresses.findIndex(a => a.id === addressData.id);
      if (index !== -1) addresses[index] = newAddress;
    } else {
      addresses.push(newAddress);
    }

    localStorage.setItem('hsp_addresses', JSON.stringify(addresses));
    return newAddress;
  },

  delete: async (addressId) => {
    if (!isMock && db) {
      await deleteDoc(doc(db, 'addresses', addressId));
      return true;
    }

    let addresses = JSON.parse(localStorage.getItem('hsp_addresses') || '[]');
    addresses = addresses.filter(a => a.id !== addressId);
    localStorage.setItem('hsp_addresses', JSON.stringify(addresses));
    return true;
  }
};

// 4. Order Services
export const orderService = {
  getAll: async () => {
    if (!isMock && db) {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      // Sort by createdAt descending
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return list;
    }

    orderService.cleanupOldOrders();
    const raw = localStorage.getItem('hsp_orders');
    return raw ? JSON.parse(raw) : [];
  },

  subscribe: (callback) => {
    if (!isMock && db) {
      return onSnapshot(collection(db, 'orders'), (snapshot) => {
        const list = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        callback(list);
      });
    }

    orderService.cleanupOldOrders();
    return subscribeToLocalCollection('orders', callback);
  },

  create: async (userId, orderData) => {
    const orderId = 'HSP-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
      userId,
      customerName: orderData.customerName || 'Customer',
      customerEmail: orderData.customerEmail || '',
      customerPhone: orderData.customerPhone || '',
      items: orderData.items,
      subtotal: orderData.subtotal,
      deliveryCharge: orderData.deliveryCharge,
      couponApplied: orderData.couponApplied || null,
      discountAmount: orderData.discountAmount || 0,
      total: orderData.total,
      address: orderData.address,
      distanceKm: parseFloat(orderData.distanceKm.toFixed(1)),
      status: 'Pending',
      createdAt: new Date().toISOString(),
      statusTimeline: [
        { status: 'Pending', time: new Date().toISOString(), message: 'Order placed successfully.' }
      ],
      paymentMethod: orderData.paymentMethod || 'Cash On Delivery',
      deliveryOTP: Math.floor(1000 + Math.random() * 9000).toString(),
      otpVerified: false,
    };

    if (!isMock && db) {
      // Save order to Firestore
      await setDoc(doc(db, 'orders', orderId), newOrder);

      // Decrement stocks in Firestore
      const batch = writeBatch(db);
      for (const item of orderData.items) {
        const pRef = doc(db, 'products', item.id);
        const pSnap = await getDoc(pRef);
        if (pSnap.exists()) {
          const currentStock = pSnap.data().stock || 0;
          batch.update(pRef, { stock: Math.max(0, currentStock - item.quantity) });
        }
      }
      await batch.commit();

      // Trigger FCM Notification for Admin in Firestore
      await notificationService.addSystemNotification({
        title: 'New Order Received! 🛒',
        body: `Order ${orderId} for ₹${newOrder.total} from ${newOrder.customerName}.`,
        type: 'new_order',
        userId: 'admin'
      });

      // Trigger FCM Notification for Customer in Firestore
      await notificationService.addSystemNotification({
        title: 'Order Placed! 🌱',
        body: `Your order ${orderId} of ₹${newOrder.total} is pending admin acceptance.`,
        type: 'order_status',
        userId
      });

      return { id: orderId, ...newOrder };
    }

    const orders = JSON.parse(localStorage.getItem('hsp_orders') || '[]');
    const finalOrder = { id: orderId, ...newOrder };
    orders.unshift(finalOrder);
    localStorage.setItem('hsp_orders', JSON.stringify(orders));
    triggerCollectionChange('orders');

    // Reduce inventory stocks locally
    const products = JSON.parse(localStorage.getItem('hsp_products') || '[]');
    orderData.items.forEach(orderItem => {
      const pIndex = products.findIndex(p => p.id === orderItem.id);
      if (pIndex !== -1) {
        products[pIndex].stock = Math.max(0, products[pIndex].stock - orderItem.quantity);
      }
    });
    localStorage.setItem('hsp_products', JSON.stringify(products));
    triggerCollectionChange('products');

    notificationService.addSystemNotification({
      title: 'New Order Received! 🛒',
      body: `Order ${orderId} for ₹${finalOrder.total} from ${finalOrder.customerName}.`,
      type: 'new_order',
      userId: 'admin'
    });

    notificationService.addSystemNotification({
      title: 'Order Placed! 🌱',
      body: `Your order ${orderId} of ₹${finalOrder.total} is pending admin acceptance.`,
      type: 'order_status',
      userId
    });

    return finalOrder;
  },

  updateStatus: async (orderId, newStatus) => {
    if (!isMock && db) {
      const oRef = doc(db, 'orders', orderId);
      const oSnap = await getDoc(oRef);
      if (!oSnap.exists()) throw new Error("Order not found");

      const orderData = oSnap.data();
      const oldStatus = orderData.status;
      if (oldStatus === newStatus) return { id: orderId, ...orderData };

      let timelineMessage = '';
      switch(newStatus) {
        case 'Accepted': timelineMessage = 'Your order has been accepted by the farm team.'; break;
        case 'Preparing': timelineMessage = 'Harvesting fresh produce & packing your items.'; break;
        case 'Out for Delivery': timelineMessage = 'Our delivery partner is on the way to your home.'; break;
        case 'Delivered': timelineMessage = 'Order delivered successfully. Enjoy your organic goods!'; break;
        case 'Cancelled': timelineMessage = 'Order has been cancelled.'; break;
        default: timelineMessage = `Status updated to ${newStatus}.`;
      }

      const updatedTimeline = [
        ...(orderData.statusTimeline || []),
        { status: newStatus, time: new Date().toISOString(), message: timelineMessage }
      ];

      const completionFields = newStatus === 'Delivered'
        ? { deliveryOTP: null, otpVerified: true, deliveredAt: new Date().toISOString() }
        : {};

      await updateDoc(oRef, {
        status: newStatus,
        statusTimeline: updatedTimeline,
        ...completionFields
      });

      await notificationService.addSystemNotification({
        title: `Order Update: ${newStatus} 📦`,
        body: `Your order ${orderId} is now ${newStatus}. ${timelineMessage}`,
        type: 'order_status',
        userId: orderData.userId
      });

      return { id: orderId, ...orderData, status: newStatus, statusTimeline: updatedTimeline, ...completionFields };
    }

    const orders = JSON.parse(localStorage.getItem('hsp_orders') || '[]');
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error("Order not found");

    const oldStatus = orders[index].status;
    if (oldStatus === newStatus) return orders[index];

    orders[index].status = newStatus;
    
    let timelineMessage = '';
    switch(newStatus) {
      case 'Accepted': timelineMessage = 'Your order has been accepted by the farm team.'; break;
      case 'Preparing': timelineMessage = 'Harvesting fresh produce & packing your items.'; break;
      case 'Out for Delivery': timelineMessage = 'Our delivery partner is on the way to your home.'; break;
      case 'Delivered': timelineMessage = 'Order delivered successfully. Enjoy your organic goods!'; break;
      case 'Cancelled': timelineMessage = 'Order has been cancelled.'; break;
      default: timelineMessage = `Status updated to ${newStatus}.`;
    }

    orders[index].statusTimeline.push({
      status: newStatus,
      time: new Date().toISOString(),
      message: timelineMessage
    });
    if (newStatus === 'Delivered') {
      orders[index].deliveryOTP = null;
      orders[index].otpVerified = true;
      orders[index].deliveredAt = new Date().toISOString();
    }

    localStorage.setItem('hsp_orders', JSON.stringify(orders));
    triggerCollectionChange('orders');

    notificationService.addSystemNotification({
      title: `Order Update: ${newStatus} 📦`,
      body: `Your order ${orderId} is now ${newStatus}. ${timelineMessage}`,
      type: 'order_status',
      userId: orders[index].userId
    });

    return orders[index];
  },

  updateOrder: async (orderId, updatedFields) => {
    if (!isMock && db) {
      const oRef = doc(db, 'orders', orderId);
      await updateDoc(oRef, updatedFields);
      const oSnap = await getDoc(oRef);
      return { id: orderId, ...oSnap.data() };
    }

    const orders = JSON.parse(localStorage.getItem('hsp_orders') || '[]');
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error("Order not found");

    orders[index] = {
      ...orders[index],
      ...updatedFields
    };

    localStorage.setItem('hsp_orders', JSON.stringify(orders));
    triggerCollectionChange('orders');
    return orders[index];
  },

  cleanupOldOrders: () => {
    // Only local storage has size limit restrictions requiring 30-day purge
    const raw = localStorage.getItem('hsp_orders');
    if (!raw) return;
    
    const orders = JSON.parse(raw);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const remainingOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= thirtyDaysAgo;
    });

    if (orders.length !== remainingOrders.length) {
      localStorage.setItem('hsp_orders', JSON.stringify(remainingOrders));
      triggerCollectionChange('orders');
    }
  }
};

// 5. Notifications Service
export const notificationService = {
  EXPIRY_MS: 24 * 60 * 60 * 1000,

  subscribe: (callback) => {
    if (!isMock && db) {
      return onSnapshot(collection(db, 'notifications'), (snapshot) => {
        const list = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        callback(list);
      });
    }
    return subscribeToLocalCollection('notifications', callback);
  },

  addSystemNotification: async (notiData) => {
    const cleanNoti = {
      title: notiData.title,
      body: notiData.body,
      createdAt: new Date().toISOString(),
      read: false,
      type: notiData.type || 'general',
      userId: notiData.userId || 'all'
    };

    if (!isMock && db) {
      const docRef = await addDoc(collection(db, 'notifications'), cleanNoti);
      const newNoti = { id: docRef.id, ...cleanNoti };

      // Dispatch inside current browser tab too
      const event = new CustomEvent('hsp_fcm_notification', { detail: newNoti });
      window.dispatchEvent(event);
      return newNoti;
    }

    const notifications = JSON.parse(localStorage.getItem('hsp_notifications') || '[]');
    const newNoti = { id: 'noti-' + Math.random().toString(36).substring(2, 9), ...cleanNoti };
    notifications.unshift(newNoti);
    localStorage.setItem('hsp_notifications', JSON.stringify(notifications));
    triggerCollectionChange('notifications');

    // Trigger standard push alert if permission granted
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(newNoti.title, { body: newNoti.body, icon: '/pwa-192x192.png' });
      }
    }
    
    const event = new CustomEvent('hsp_fcm_notification', { detail: newNoti });
    window.dispatchEvent(event);

    return newNoti;
  },

  markAllAsRead: async (userId) => {
    if (!isMock && db) {
      const q = query(collection(db, 'notifications'), where('userId', 'in', ['all', userId]));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.forEach((d) => {
        if (!d.data().read) {
          batch.update(d.ref, { read: true });
        }
      });
      await batch.commit();
      return true;
    }

    const notifications = JSON.parse(localStorage.getItem('hsp_notifications') || '[]');
    notifications.forEach(n => {
      if (n.userId === userId || n.userId === 'all') {
        n.read = true;
      }
    });
    localStorage.setItem('hsp_notifications', JSON.stringify(notifications));
    triggerCollectionChange('notifications');
    return true;
  },

  dismiss: async (notificationId, userId) => {
    if (!notificationId || !userId) return false;

    if (!isMock && db) {
      await updateDoc(doc(db, 'notifications', notificationId), {
        dismissedBy: arrayUnion(userId)
      });
      return true;
    }

    const notifications = JSON.parse(localStorage.getItem('hsp_notifications') || '[]');
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return false;
    notification.dismissedBy = [...new Set([...(notification.dismissedBy || []), userId])];
    localStorage.setItem('hsp_notifications', JSON.stringify(notifications));
    triggerCollectionChange('notifications');
    return true;
  },

  dismissAll: async (userId) => {
    if (!userId) return false;

    if (!isMock && db) {
      const q = query(collection(db, 'notifications'), where('userId', 'in', ['all', userId]));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.forEach(d => batch.update(d.ref, { dismissedBy: arrayUnion(userId) }));
      await batch.commit();
      return true;
    }

    const notifications = JSON.parse(localStorage.getItem('hsp_notifications') || '[]');
    notifications.forEach(n => {
      if (n.userId === userId || n.userId === 'all') {
        n.dismissedBy = [...new Set([...(n.dismissedBy || []), userId])];
      }
    });
    localStorage.setItem('hsp_notifications', JSON.stringify(notifications));
    triggerCollectionChange('notifications');
    return true;
  },

  removeExpired: async () => {
    const cutoff = Date.now() - notificationService.EXPIRY_MS;
    const isExpired = notification => {
      const createdAt = new Date(notification.createdAt).getTime();
      return Number.isFinite(createdAt) && createdAt < cutoff;
    };

    if (!isMock && db) {
      const snapshot = await getDocs(collection(db, 'notifications'));
      const expired = snapshot.docs.filter(d => isExpired(d.data()));
      if (expired.length === 0) return 0;
      const batch = writeBatch(db);
      expired.forEach(d => batch.delete(d.ref));
      await batch.commit();
      return expired.length;
    }

    const notifications = JSON.parse(localStorage.getItem('hsp_notifications') || '[]');
    const remaining = notifications.filter(n => !isExpired(n));
    const removedCount = notifications.length - remaining.length;
    if (removedCount > 0) {
      localStorage.setItem('hsp_notifications', JSON.stringify(remaining));
      triggerCollectionChange('notifications');
    }
    return removedCount;
  }
};

// 6. Wishlist Service
export const wishlistService = {
  subscribe: (callback) => {
    if (!isMock && db) {
      return onSnapshot(collection(db, 'wishlist'), (snapshot) => {
        const list = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        callback(list);
      });
    }
    return subscribeToLocalCollection('wishlist', callback);
  },

  toggle: async (userId, productId) => {
    if (!isMock && db) {
      const q = query(collection(db, 'wishlist'), where('userId', '==', userId), where('productId', '==', productId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        // Already wishlisted, so delete it
        await deleteDoc(snapshot.docs[0].ref);
        return false;
      } else {
        // Not wishlisted, so add it
        await addDoc(collection(db, 'wishlist'), { userId, productId });
        return true;
      }
    }

    const wishlist = JSON.parse(localStorage.getItem('hsp_wishlist') || '[]');
    const index = wishlist.findIndex(w => w.userId === userId && w.productId === productId);
    
    let isAdded = false;
    if (index !== -1) {
      wishlist.splice(index, 1);
    } else {
      wishlist.push({ userId, productId });
      isAdded = true;
    }

    localStorage.setItem('hsp_wishlist', JSON.stringify(wishlist));
    triggerCollectionChange('wishlist');
    return isAdded;
  }
};

// 7. Coupons Service
export const couponService = {
  getAll: async () => {
    if (!isMock && db) {
      const querySnapshot = await getDocs(collection(db, 'coupons'));
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      // Seed default coupons if database is clean & empty
      if (list.length === 0) {
        const defaultCoupons = [
          { id: 'cpn-1', code: 'ORGANIC20', discountType: 'percentage', discountValue: 20, minCartValue: 300, description: '20% Off on orders above ₹300' },
          { id: 'cpn-2', code: 'FREE50', discountType: 'flat', discountValue: 50, minCartValue: 200, description: 'Flat ₹50 Off on orders above ₹200' }
        ];
        for (const c of defaultCoupons) {
          await setDoc(doc(db, 'coupons', c.id), c);
          list.push(c);
        }
      }
      return list;
    }

    const raw = localStorage.getItem('hsp_coupons');
    return raw ? JSON.parse(raw) : [];
  },

  subscribe: (callback) => {
    if (!isMock && db) {
      return onSnapshot(collection(db, 'coupons'), (snapshot) => {
        const list = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        callback(list);
      });
    }
    return subscribeToLocalCollection('coupons', callback);
  },

  add: async (couponData) => {
    const cleanCoupon = {
      code: couponData.code.toUpperCase().trim(),
      discountType: couponData.discountType,
      discountValue: parseFloat(couponData.discountValue),
      minCartValue: parseFloat(couponData.minCartValue || 0),
      description: couponData.description || `${couponData.discountValue}% Off`
    };

    if (!isMock && db) {
      const docRef = await addDoc(collection(db, 'coupons'), cleanCoupon);
      return { id: docRef.id, ...cleanCoupon };
    }

    const coupons = JSON.parse(localStorage.getItem('hsp_coupons') || '[]');
    const newCoupon = {
      id: 'cpn-' + Math.random().toString(36).substring(2, 9),
      ...cleanCoupon
    };
    coupons.push(newCoupon);
    localStorage.setItem('hsp_coupons', JSON.stringify(coupons));
    triggerCollectionChange('coupons');
    return newCoupon;
  },

  delete: async (couponId) => {
    if (!isMock && db) {
      await deleteDoc(doc(db, 'coupons', couponId));
      return true;
    }

    let coupons = JSON.parse(localStorage.getItem('hsp_coupons') || '[]');
    coupons = coupons.filter(c => c.id !== couponId);
    localStorage.setItem('hsp_coupons', JSON.stringify(coupons));
    triggerCollectionChange('coupons');
    return true;
  }
};

// 8. Delivery Boy Services
export const deliveryBoyService = {
  getAll: async () => {
    if (!isMock && db) {
      const q = query(collection(db, 'users'), where('role', '==', 'delivery'));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list;
    }
    const users = JSON.parse(localStorage.getItem('hsp_users') || '[]');
    return users.filter(u => u.role === 'delivery');
  },

  subscribe: (callback) => {
    if (!isMock && db) {
      const q = query(collection(db, 'users'), where('role', '==', 'delivery'));
      return onSnapshot(q, (snapshot) => {
        const list = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        callback(list);
      }, (error) => {
        console.error("Error subscribing to delivery boys:", error);
        callback([]); // Fallback to empty list to stop loading
      });
    }
    return subscribeToLocalCollection('users', (usersList) => {
      callback(usersList.filter(u => u.role === 'delivery'));
    });
  },

  add: async (data) => {
    const uid = 'db-' + Math.random().toString(36).substring(2, 9);
    const newBoy = {
      uid,
      id: uid,
      email: data.email,
      displayName: data.name,
      name: data.name,
      phone: data.phone,
      role: 'delivery',
      photoURL: data.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=2E7D32&color=fff`,
      createdAt: new Date().toISOString()
    };

    if (!isMock && db) {
      await setDoc(doc(db, 'users', uid), newBoy);
      return newBoy;
    }

    const users = JSON.parse(localStorage.getItem('hsp_users') || '[]');
    users.push(newBoy);
    localStorage.setItem('hsp_users', JSON.stringify(users));
    triggerCollectionChange('users');
    return newBoy;
  },

  update: async (id, updatedFields) => {
    if (!isMock && db) {
      const uRef = doc(db, 'users', id);
      await updateDoc(uRef, updatedFields);
      const snap = await getDoc(uRef);
      return { id, ...snap.data() };
    }

    const users = JSON.parse(localStorage.getItem('hsp_users') || '[]');
    const index = users.findIndex(u => u.uid === id || u.id === id);
    if (index === -1) throw new Error("Delivery partner not found");
    users[index] = { ...users[index], ...updatedFields };
    localStorage.setItem('hsp_users', JSON.stringify(users));
    triggerCollectionChange('users');
    return users[index];
  },

  delete: async (id) => {
    if (!isMock && db) {
      await deleteDoc(doc(db, 'users', id));
      return true;
    }
    const users = JSON.parse(localStorage.getItem('hsp_users') || '[]');
    const filtered = users.filter(u => u.uid !== id && u.id !== id);
    localStorage.setItem('hsp_users', JSON.stringify(filtered));
    triggerCollectionChange('users');
    return true;
  }
};

// 9. Cultivation Videos Service
export const videoService = {
  subscribe: (callback) => {
    if (!isMock && db) {
      return onSnapshot(collection(db, 'videos'), (snapshot) => {
        const list = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...d.data() }));
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        callback(list);
      });
    }
    return subscribeToLocalCollection('videos', callback);
  },

  add: async (videoData) => {
    const clean = {
      title: videoData.title,
      description: videoData.description || '',
      url: videoData.url,
      thumbnail: videoData.thumbnail || '',
      category: videoData.category || 'General',
      createdAt: new Date().toISOString()
    };
    if (!isMock && db) {
      const ref = await addDoc(collection(db, 'videos'), clean);
      return { id: ref.id, ...clean };
    }
    const videos = JSON.parse(localStorage.getItem('hsp_videos') || '[]');
    const nv = { id: 'vid-' + Math.random().toString(36).substring(2, 9), ...clean };
    videos.unshift(nv);
    localStorage.setItem('hsp_videos', JSON.stringify(videos));
    triggerCollectionChange('videos');
    return nv;
  },

  delete: async (videoId) => {
    if (!isMock && db) {
      await deleteDoc(doc(db, 'videos', videoId));
      return true;
    }
    let videos = JSON.parse(localStorage.getItem('hsp_videos') || '[]');
    videos = videos.filter(v => v.id !== videoId);
    localStorage.setItem('hsp_videos', JSON.stringify(videos));
    triggerCollectionChange('videos');
    return true;
  }
};

// 10. Customer Ratings Service
export const ratingService = {
  subscribe: (callback) => {
    if (!isMock && db) {
      return onSnapshot(collection(db, 'ratings'), (snapshot) => {
        const list = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...d.data() }));
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        callback(list);
      });
    }
    return subscribeToLocalCollection('ratings', callback);
  },

  submit: async (ratingData) => {
    const clean = {
      orderId: ratingData.orderId,
      userId: ratingData.userId,
      customerName: ratingData.customerName || 'Customer',
      deliveryBoyId: ratingData.deliveryBoyId || null,
      deliveryBoyName: ratingData.deliveryBoyName || null,
      stars: ratingData.stars,
      comment: ratingData.comment || '',
      createdAt: new Date().toISOString()
    };
    if (!isMock && db) {
      const q = query(collection(db, 'ratings'),
        where('orderId', '==', ratingData.orderId),
        where('userId', '==', ratingData.userId));
      const existing = await getDocs(q);
      if (!existing.empty) {
        await updateDoc(existing.docs[0].ref, clean);
        return { id: existing.docs[0].id, ...clean };
      }
      const ref = await addDoc(collection(db, 'ratings'), clean);
      return { id: ref.id, ...clean };
    }
    const ratings = JSON.parse(localStorage.getItem('hsp_ratings') || '[]');
    const idx = ratings.findIndex(r => r.orderId === ratingData.orderId && r.userId === ratingData.userId);
    if (idx !== -1) {
      ratings[idx] = { ...ratings[idx], ...clean };
      localStorage.setItem('hsp_ratings', JSON.stringify(ratings));
      triggerCollectionChange('ratings');
      return ratings[idx];
    }
    const nr = { id: 'rating-' + Math.random().toString(36).substring(2, 9), ...clean };
    ratings.unshift(nr);
    localStorage.setItem('hsp_ratings', JSON.stringify(ratings));
    triggerCollectionChange('ratings');
    return nr;
  }
};

// 11. Biometric Authentication Service
export const biometricService = {
  isAvailable: () => {
    return true; // Always true in dev/test to allow simulated fallback on mobile HTTP
  },
  hasRegistered: (userId) => {
    return localStorage.getItem('hsp_biometric_cred_' + userId) !== null;
  },
  hasAnyRegistered: () => {
    for (let i = 0; i < localStorage.length; i++) {
      if (localStorage.key(i)?.startsWith('hsp_biometric_cred_')) return true;
    }
    return false;
  },
  register: async (userId) => {
    try {
      if (!window.PublicKeyCredential) throw new Error('WebAuthn not supported');
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      const userIdBytes = new TextEncoder().encode(userId);
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'HSP Organics' },
          user: { id: userIdBytes, name: userId, displayName: userId },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }],
          authenticatorSelection: { userVerification: 'preferred' },
          timeout: 60000
        }
      });
      const credBase64 = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
      localStorage.setItem('hsp_biometric_cred_' + userId, credBase64);
      return true;
    } catch (err) {
      console.warn('Real WebAuthn enrollment failed, falling back to simulated biometric registration:', err);
      // Fallback: Register mock credential in localStorage
      localStorage.setItem('hsp_biometric_cred_' + userId, 'mock_credential_' + userId);
      return true;
    }
  },
  authenticate: async () => {
    // Get all registered users on this device
    const registeredUsers = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('hsp_biometric_cred_')) {
        registeredUsers.push(key.replace('hsp_biometric_cred_', ''));
      }
    }
    
    if (registeredUsers.length === 0) {
      throw new Error('No biometric credentials registered on this device.');
    }
    
    try {
      if (!window.PublicKeyCredential) throw new Error('WebAuthn not supported');
      const allowedCredentials = [];
      const credentialMap = {};
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('hsp_biometric_cred_')) {
          const uid = key.replace('hsp_biometric_cred_', '');
          const credBase64 = localStorage.getItem(key);
          if (credBase64.startsWith('mock_')) continue; // Skip mock credentials for real WebAuthn
          try {
            const credStr = atob(credBase64);
            const credBytes = new Uint8Array(credStr.length);
            for (let j = 0; j < credStr.length; j++) credBytes[j] = credStr.charCodeAt(j);
            allowedCredentials.push({ id: credBytes, type: 'public-key' });
            credentialMap[credBase64] = uid;
          } catch (e) {}
        }
      }
      
      if (allowedCredentials.length === 0) {
        throw new Error('No real credentials registered');
      }
      
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: allowedCredentials,
          userVerification: 'preferred',
          timeout: 60000
        }
      });
      
      const usedCredBase64 = btoa(String.fromCharCode(...new Uint8Array(assertion.rawId)));
      const userId = credentialMap[usedCredBase64];
      if (!userId) throw new Error('Unrecognized credential used.');
      return userId;
    } catch (err) {
      console.warn('Real WebAuthn authentication failed/unavailable, using simulated biometric:', err);
      // Wait 1 second to simulate the scan animation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (registeredUsers.length > 1) {
        // If multiple users are enrolled, show a simulated account picker prompt for testing
        const userOptions = registeredUsers.map(uid => {
          const cache = localStorage.getItem(`hsp_biometric_user_${uid}`);
          return cache ? JSON.parse(cache) : { uid, displayName: uid, role: 'user' };
        });
        
        const listText = userOptions.map((u, i) => `${i + 1}. ${u.displayName || u.name || u.email} [${u.role.toUpperCase()}]`).join('\n');
        const choice = prompt(`[Simulated Biometric] Multiple credentials found on this device.\nSelect account to log in (Enter number):\n\n${listText}`, '1');
        
        const idx = parseInt(choice, 10) - 1;
        if (idx >= 0 && idx < userOptions.length) {
          return userOptions[idx].uid;
        }
      }
      // Return the first registered user on the device
      return registeredUsers[0];
    }
  }
};
