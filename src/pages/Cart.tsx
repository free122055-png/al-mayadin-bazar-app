import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, ChevronRight, Ticket } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "motion/react";

export const Cart: React.FC = () => {
  const { items, updateQuantity, removeItem, subtotal, totalItems } = useCart();
  const { requireAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isFood = location.pathname.startsWith("/food/");
  const deliveryCharge = 60; // Base delivery charge

  const handleProceedToCheckout = () => {
    requireAuth(() => {
      navigate(isFood ? "/food/checkout" : "/checkout");
    }, "অর্ডার সম্পন্ন করতে প্রথমে আপনার অ্যাকাউন্টে লগইন করুন।");
  };

  if (items.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 px-4 text-center space-y-6 ${isFood ? "-mx-4 -mt-4 bg-[#fcfdfc] min-h-screen" : ""}`}>
        {isFood && (
          <header className="bg-[#004b23] px-5 pt-8 pb-4 rounded-b-[40px] shadow-lg fixed top-0 left-0 right-0 z-50">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                <ArrowLeft className="w-4 h-4 text-white" />
              </button>
              <h1 className="text-white text-lg font-black tracking-tight">Shopping Cart</h1>
            </div>
          </header>
        )}
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
          <ShoppingBag className="w-12 h-12 text-gray-300" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">Your Cart is Empty</h2>
          <p className="text-gray-500 max-w-xs mx-auto">Looks like you haven't added anything to your cart yet. Let's find something fresh!</p>
        </div>
        <Link 
          to={isFood ? "/category/cat1" : "/"} 
          className="bg-[#004b23] text-white font-bold py-4 px-12 rounded-2xl shadow-lg shadow-[#004b23]/20 flex items-center gap-2 transition-transform active:scale-95"
        >
          Start Shopping <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className={`space-y-6 pb-24 ${isFood ? "-mx-4 -mt-4 bg-[#fcfdfc] min-h-screen" : ""}`}>
      {/* Header */}
      <div className={isFood ? "bg-[#004b23] px-5 pt-8 pb-4 rounded-b-[40px] shadow-lg sticky top-0 z-50 mb-4 flex items-center gap-3" : "flex items-center justify-between"}>
        <button onClick={() => navigate(-1)} className={isFood ? "w-9 h-9 bg-white/10 rounded-full flex items-center justify-center border border-white/20" : "p-2 bg-white rounded-xl shadow-sm border border-gray-100"}>
          <ArrowLeft className={`w-4 h-4 ${isFood ? "text-white" : "text-gray-600"}`} />
        </button>
        <h1 className={`text-lg font-bold ${isFood ? "text-white" : "text-gray-800"}`}>
          {isFood ? "Shopping Cart" : `My Cart (${totalItems})`}
        </h1>
        {!isFood && <div className="w-10"></div>}
      </div>

      <div className={isFood ? "px-4 space-y-6" : "space-y-6"}>
        {/* Item List */}
        <div className="space-y-4">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div 
              key={`${item.productId}-${item.variantId}`}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
            >
              <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</h3>
                <p className="text-sm font-bold text-[#004b23]">৳{item.price}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-4 bg-gray-50 px-3 py-1 rounded-xl">
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                      className="text-gray-500"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                      className="text-gray-500"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="p-2 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Coupon */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
        <Ticket className="w-6 h-6 text-[#ffb703]" />
        <input 
          type="text" 
          placeholder="Enter Promo Code" 
          className="flex-1 text-sm font-medium focus:outline-none bg-transparent"
        />
        <button className="text-[#004b23] font-bold text-sm">Apply</button>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-800 border-bottom pb-2">Order Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-bold text-gray-800">৳{subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Delivery Charge</span>
            <span className="font-bold text-gray-800">৳{deliveryCharge}</span>
          </div>
          <div className="flex justify-between text-sm text-[#004b23] font-medium bg-[#004b23]/5 p-2 rounded-lg">
            <span>Special Discount</span>
            <span>- ৳0</span>
          </div>
          <div className="border-t pt-3 flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Total Amount</span>
            <span className="text-2xl font-black text-[#004b23]">৳{subtotal + deliveryCharge}</span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 md:static md:border-none md:bg-transparent md:p-0">
        <button 
          onClick={handleProceedToCheckout}
          className="w-full bg-[#004b23] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#004b23]/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          Proceed to Checkout <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
  );
};
