import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  authService, productService, orderService, addressService, 
  notificationService, wishlistService, couponService 
} from '../firebase/db';
import { registerFCMToken, initForegroundMessaging } from '../firebase/messaging';
import { calculateDistance, FARM_LOCATION, calculateDeliveryCharge } from '../utils/geo';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // App States
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [deliveryDistance, setDeliveryDistance] = useState(3.5); // Default simulated distance
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [cart, setCart] = useState([]);
  const [theme, setTheme] = useState('light');
  
  // Active in-app notification state for real-time alerts
  const [activeToast, setActiveToast] = useState(null);

  // Ref to cleanup foreground FCM listener on logout
  const fcmUnsubRef = useRef(null);

  // Initialize Session — listens for real Firebase auth changes OR reads mock session
  useEffect(() => {
    const unsubAuth = authService.onAuthStateChanged(async (activeUser) => {
      if (activeUser) {
        setUser(activeUser);
        // Request browser push notification permission if default
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'default') {
            Notification.requestPermission().catch(console.error);
          }
        }
        // Register FCM token for this device (stores token in Firestore)
        registerFCMToken(activeUser.uid).catch(console.error);
        // Start listening for foreground push messages
        if (fcmUnsubRef.current) fcmUnsubRef.current();
        fcmUnsubRef.current = initForegroundMessaging();
        // Load user addresses
        const addrs = await addressService.getByUser(activeUser.uid);
        setAddresses(addrs);
        const def = addrs.find(a => a.isDefault) || addrs[0] || null;
        setSelectedAddress(def);
        if (def) {
          const dist = calculateDistance(FARM_LOCATION.lat, FARM_LOCATION.lng, def.lat, def.lng);
          setDeliveryDistance(dist);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Load theme preference
    const savedTheme = localStorage.getItem('hsp_theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    return () => {
      if (typeof unsubAuth === 'function') unsubAuth();
    };
  }, []);

  // Listeners for collections
  useEffect(() => {
    // 1. Subscribe to products
    const unsubProducts = productService.subscribe((data) => {
      setProducts(data);
    });

    // 2. Subscribe to orders
    const unsubOrders = orderService.subscribe((data) => {
      setOrders(data);
    });

    // 3. Subscribe to notifications
    const unsubNotifications = notificationService.subscribe((data) => {
      setNotifications(data);
    });

    // 4. Subscribe to wishlist
    const unsubWishlist = wishlistService.subscribe((data) => {
      setWishlist(data);
    });

    // 5. Subscribe to coupons
    const unsubCoupons = couponService.subscribe((data) => {
      setCoupons(data);
    });

    // 6. In-App FCM notifications listener
    const handleFCMAlert = (e) => {
      const noti = e.detail;
      // Only show if notification is for this user or all
      if (user && (noti.userId === 'all' || noti.userId === user.uid || (noti.userId === 'admin' && user.role === 'admin'))) {
        setActiveToast(noti);
        // Auto hide toast after 5 seconds
        setTimeout(() => {
          setActiveToast(null);
        }, 5000);
      }
    };

    window.addEventListener('hsp_fcm_notification', handleFCMAlert);

    return () => {
      unsubProducts();
      unsubOrders();
      unsubNotifications();
      unsubWishlist();
      unsubCoupons();
      window.removeEventListener('hsp_fcm_notification', handleFCMAlert);
    };
  }, [user]);

  // Sync selected address distance
  useEffect(() => {
    if (selectedAddress) {
      const dist = calculateDistance(FARM_LOCATION.lat, FARM_LOCATION.lng, selectedAddress.lat, selectedAddress.lng);
      setDeliveryDistance(dist);
    } else if (currentLocation) {
      const dist = calculateDistance(FARM_LOCATION.lat, FARM_LOCATION.lng, currentLocation.lat, currentLocation.lng);
      setDeliveryDistance(dist);
    } else {
      setDeliveryDistance(3.5); // Fallback
    }
  }, [selectedAddress, currentLocation]);

  // Theme Toggle
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('hsp_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // Auth Operations
  const loginWithGoogle = async () => {
    try {
      const loggedUser = await authService.loginWithGoogle();
      setUser(loggedUser);
      return loggedUser;
    } catch (err) {
      console.error("Google Auth failed:", err);
      throw err;
    }
  };

  const loginWithEmailAndPassword = async (email, password) => {
    try {
      const loggedUser = await authService.loginEmail(email, password);
      setUser(loggedUser);
      return loggedUser;
    } catch (err) {
      console.error("Email Auth failed:", err);
      throw err;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setCart([]);
    setSelectedAddress(null);
    setActiveCoupon(null);
  };

  // Address Operations
  const saveAddress = async (addressData) => {
    if (!user) return;
    const newAddr = await addressService.save(user.uid, addressData);
    const updatedAddrs = await addressService.getByUser(user.uid);
    setAddresses(updatedAddrs);
    if (!selectedAddress || newAddr.isDefault) {
      setSelectedAddress(newAddr);
    }
    return newAddr;
  };

  const deleteAddress = async (addressId) => {
    await addressService.delete(addressId);
    if (user) {
      const updatedAddrs = await addressService.getByUser(user.uid);
      setAddresses(updatedAddrs);
      if (selectedAddress?.id === addressId) {
        setSelectedAddress(updatedAddrs[0] || null);
      }
    }
  };

  // Geolocation trigger
  const detectLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation is not supported by your browser");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Simulated geocoding address details
          const simulatedAddr = {
            name: 'Detected Location',
            addressLine: `Street No. ${Math.floor(Math.random() * 20) + 1}, Indiranagar 100 Feet Rd`,
            city: 'Bengaluru',
            postalCode: '560038',
            lat: latitude,
            lng: longitude,
            isDefault: false
          };
          
          setCurrentLocation(simulatedAddr);
          resolve(simulatedAddr);
        },
        (error) => {
          console.warn("Geolocation permissions denied or failed. Sourcing from Farm Hub center.", error);
          // Fallback to random coordinate near farm
          const fallbackLat = FARM_LOCATION.lat + (Math.random() - 0.5) * 0.05;
          const fallbackLng = FARM_LOCATION.lng + (Math.random() - 0.5) * 0.05;
          const fallbackAddr = {
            name: 'Simulated Location',
            addressLine: 'Rohan Vasantha Apartment, Marathahalli Bridge',
            city: 'Bengaluru',
            postalCode: '560037',
            lat: fallbackLat,
            lng: fallbackLng,
            isDefault: false
          };
          setCurrentLocation(fallbackAddr);
          resolve(fallbackAddr);
        }
      );
    });
  };

  // Cart Management
  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: Math.min(product.stock, quantity) }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId, qty) => {
    setCart(prevCart => 
      prevCart.map(item => {
        if (item.id === productId) {
          const validQty = Math.max(1, Math.min(item.stock, qty));
          return { ...item, quantity: validQty };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
    setActiveCoupon(null);
  };

  // Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const deliveryCharge = cart.length > 0 
    ? calculateDeliveryCharge(deliveryDistance, cartSubtotal) 
    : 0;

  // Coupon Discount
  let discountAmount = 0;
  if (activeCoupon && cartSubtotal >= activeCoupon.minCartValue) {
    if (activeCoupon.discountType === 'percentage') {
      discountAmount = (cartSubtotal * activeCoupon.discountValue) / 100;
    } else if (activeCoupon.discountType === 'flat') {
      discountAmount = activeCoupon.discountValue;
    }
    // Cap discount at subtotal
    discountAmount = Math.min(cartSubtotal, discountAmount);
  }

  const cartTotal = Math.max(0, cartSubtotal + deliveryCharge - discountAmount);

  // Apply Coupon
  const applyCoupon = (code) => {
    const coupon = coupons.find(c => c.code === code.toUpperCase().trim());
    if (!coupon) {
      return { success: false, message: 'Invalid coupon code.' };
    }
    if (cartSubtotal < coupon.minCartValue) {
      return { success: false, message: `Minimum cart value of ₹${coupon.minCartValue} required for this coupon.` };
    }
    setActiveCoupon(coupon);
    return { success: true, message: `Coupon ${coupon.code} applied successfully!` };
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
  };

  // Place Order
  const placeOrder = async (paymentMethod = 'Cash On Delivery') => {
    if (!user) throw new Error("Must be logged in to place an order");
    if (cart.length === 0) throw new Error("Cart is empty");
    
    const activeAddress = selectedAddress || currentLocation;
    if (!activeAddress) throw new Error("Please select or detect a delivery address");

    const orderData = {
      customerName: user.displayName,
      customerEmail: user.email,
      items: cart,
      subtotal: cartSubtotal,
      deliveryCharge,
      couponApplied: activeCoupon?.code || null,
      discountAmount,
      total: cartTotal,
      address: activeAddress,
      distanceKm: deliveryDistance,
      paymentMethod
    };

    const newOrder = await orderService.create(user.uid, orderData);
    clearCart();
    return newOrder;
  };

  // Wishlist
  const toggleWishlist = async (productId) => {
    if (!user) return false;
    const added = await wishlistService.toggle(user.uid, productId);
    return added;
  };

  const isProductInWishlist = (productId) => {
    return wishlist.some(w => w.userId === user?.uid && w.productId === productId);
  };

  // Notifications
  const markNotificationsRead = async () => {
    if (user) {
      await notificationService.markAllAsRead(user.uid);
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      loading,
      products,
      wishlist,
      addresses,
      selectedAddress,
      setSelectedAddress,
      currentLocation,
      detectLocation,
      deliveryDistance,
      orders,
      notifications,
      coupons,
      activeCoupon,
      cart,
      theme,
      toggleTheme,
      loginWithGoogle,
      loginWithEmailAndPassword,
      logout,
      saveAddress,
      deleteAddress,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      cartSubtotal,
      deliveryCharge,
      discountAmount,
      cartTotal,
      applyCoupon,
      removeCoupon,
      placeOrder,
      toggleWishlist,
      isProductInWishlist,
      markNotificationsRead,
      activeToast,
      setActiveToast
    }}>
      {children}
    </AppContext.Provider>
  );
};
