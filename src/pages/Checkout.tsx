import { useState } from 'react';
import { motion } from 'motion/react';
import { CreditCard, Package, Truck, CheckCircle2, ChevronRight, MapPin, Mail, User } from 'lucide-react';
import axios from 'axios';

export default function Checkout() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/orders', {
        ...formData,
        amount: 299.99, // Example amount
      });
      if (response.status === 200) {
        setCompleted(true);
      }
    } catch (error) {
      console.error('Order submission failed:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-3xl shadow-xl shadow-slate-200/50 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Confirmed!</h2>
          <p className="text-slate-500 mb-8 whitespace-pre-wrap">
            Thank you for your order, {formData.fullName}. We've sent a confirmation email to {formData.email}.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Checkout</h1>
        <p className="text-slate-500">UniSphere Student Resources & Goods</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-4 mb-8">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>1</div>
            <div className={`h-px flex-1 ${step >= 2 ? 'bg-slate-900' : 'bg-slate-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>2</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <User className="w-5 h-5" /> Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5" /> Shipping Address
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Street Address</label>
                      <input 
                        required
                        type="text" 
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">City</label>
                        <input 
                          required
                          type="text" 
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Postal Code</label>
                        <input 
                          required
                          type="text" 
                          value={formData.postalCode}
                          onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Country</label>
                      <input 
                        required
                        type="text" 
                        value={formData.country}
                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" /> Payment Details
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl flex items-center gap-4 border border-slate-100">
                      <div className="w-12 h-8 bg-slate-900 rounded-md flex items-center justify-center text-[10px] text-white font-bold">VISA</div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">Credit or Debit Card</p>
                        <p className="text-xs text-slate-500">Secure encrypted payment</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Card Number</label>
                      <input 
                        type="text" 
                        disabled
                        placeholder="XXXX XXXX XXXX XXXX"
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex justify-between items-center pt-6">
              {step > 1 && (
                <button 
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 transition-all"
                >
                  Go Back
                </button>
              )}
              <button 
                type="submit"
                disabled={loading}
                className={`ml-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Processing...' : step === 1 ? <>Continue <ChevronRight className="w-4 h-4" /></> : 'Place Order'}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm sticky top-10">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Package className="w-5 h-5" /> Order Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-start pb-4 border-b border-slate-50">
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Student Success Kit</p>
                  <p className="text-xs text-slate-500">Premium course materials + Lab equipment</p>
                </div>
                <p className="text-sm font-bold text-slate-900">$249.99</p>
              </div>
              <div className="flex justify-between items-center text-sm">
                <p className="text-slate-500">Shipping</p>
                <p className="text-slate-900 font-medium">$50.00</p>
              </div>
              <div className="flex justify-between items-center text-sm">
                <p className="text-slate-500">Estimated Tax</p>
                <p className="text-slate-900 font-medium">$0.00</p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center text-lg">
                <p className="font-bold text-slate-900">Total</p>
                <p className="font-black text-slate-900">$299.99</p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-slate-50 rounded-xl flex items-start gap-3">
              <Truck className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">Express Delivery</p>
                <p className="text-[10px] text-slate-500">Estimated arrival within 2-3 business days.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
