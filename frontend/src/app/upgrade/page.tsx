"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Check, Zap, Shield, Crown, Building2, CreditCard, Lock, Loader2, ArrowRight, CheckCircle2, Star
} from "lucide-react";
import { useToastStore } from "@/store/useToastStore";

const features = [
  { name: "Unlimited Committees & Channels", desc: "Create as many dedicated spaces as you need.", plans: [true, true, true] },
  { name: "Advanced AI Search Assistant", desc: "Context-aware conversational bot for all queries.", plans: [false, true, true] },
  { name: "Custom Progress Poll Metrics", desc: "Premium progress indicators & visual analytics.", plans: [false, true, true] },
  { name: "Real-time Meeting Schedulers", desc: "Coordinate times with automatic attendee checks.", plans: [true, true, true] },
  { name: "Dynamic Document Versioning", desc: "Keep unlimited historic revisions and logs.", plans: [false, true, true] },
  { name: "Advanced Role System Permissions", desc: "Fine-grained security guidelines and audits.", plans: [false, false, true] },
  { name: "Dedicated 24/7 SLA Support", desc: "Direct channel with priority incident support.", plans: [false, false, true] }
];

export default function UpgradePage() {
  const { addToast } = useToastStore();
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const handleUpgrade = (planName: string) => {
    if (planName === "Free") {
      addToast("You are already on the Free tier!", "info");
      return;
    }
    setSelectedPlan(planName);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardName || !expiry || !cvc) {
      addToast("Please fill in all card details", "error");
      return;
    }

    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      addToast("Upgrade successful! Welcome to Pro.", "success");
      setTimeout(() => {
        setSuccess(false);
        setSelectedPlan(null);
        // Clear inputs
        setCardName("");
        setCardNumber("");
        setExpiry("");
        setCvc("");
      }, 3000);
    }, 2500);
  };

  return (
    <div className="space-y-12 pb-16 max-w-6xl mx-auto px-4">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider"
        >
          <Crown size={12} className="animate-pulse" /> Premium Plans
        </motion.div>
        
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white max-w-2xl mx-auto leading-tight">
          Supercharge Your <span className="gradient-text">Committee Operations</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
          Unlock the true potential of collaboration with advanced AI intelligence, visual poll analytics, and robust document history.
        </p>

        {/* Pricing Toggle */}
        <div className="flex items-center justify-center gap-3 pt-6">
          <span className={cn("text-xs font-semibold transition-colors", !isAnnual ? "text-white" : "text-muted-foreground")}>Monthly</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-12 h-6 rounded-full bg-white/10 dark:bg-white/5 border border-white/10 relative p-1 flex items-center transition-colors focus:outline-none"
          >
            <motion.div
              layout
              className="h-4 w-4 rounded-full bg-indigo-500 shadow-md"
              animate={{ x: isAnnual ? 22 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={cn("text-xs font-semibold transition-colors flex items-center gap-1.5", isAnnual ? "text-white" : "text-muted-foreground")}>
            Yearly
            <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/20 uppercase">
              Save 20%
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Tier 1: Free */}
        <motion.div
          whileHover={{ y: -5 }}
          className="glass-card p-6 flex flex-col justify-between border-white/5 relative"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white">Starter</h3>
                <p className="text-xs text-muted-foreground mt-1">For basic project spaces</p>
              </div>
              <span className="p-2 rounded-xl bg-white/5 text-muted-foreground">
                <Building2 size={16} />
              </span>
            </div>

            <div className="pt-2">
              <span className="text-3xl font-extrabold text-white">$0</span>
              <span className="text-xs text-muted-foreground"> / forever</span>
            </div>

            <ul className="space-y-3 pt-4 border-t border-white/5">
              <li className="flex items-start gap-2.5 text-xs text-slate-300">
                <Check className="text-indigo-400 mt-0.5 shrink-0" size={14} />
                <span>Up to 2 committees</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-300">
                <Check className="text-indigo-400 mt-0.5 shrink-0" size={14} />
                <span>Standard meetings coordinator</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-300 opacity-50">
                <X className="text-rose-400 mt-0.5 shrink-0" size={14} />
                <span>Advanced AI Search Assistant</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-300 opacity-50">
                <X className="text-rose-400 mt-0.5 shrink-0" size={14} />
                <span>Premium Progress Poll Metrics</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleUpgrade("Free")}
            className="w-full mt-8 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-white text-xs font-semibold transition-all"
          >
            Current Plan
          </button>
        </motion.div>

        {/* Tier 2: Pro (Featured) */}
        <motion.div
          whileHover={{ y: -5 }}
          className="glass-card p-6 flex flex-col justify-between border-indigo-500/30 dark:border-indigo-500/20 relative overflow-hidden bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent shadow-2xl shadow-indigo-500/5"
        >
          {/* Neon Light Strip */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500" />
          
          <div className="absolute -right-12 -top-12 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl" />

          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg font-bold text-white">Professional</h3>
                  <span className="text-[9px] font-extrabold uppercase bg-indigo-500 text-white px-2 py-0.5 rounded-full tracking-widest shadow-md">
                    Popular
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Unlock intelligence & metrics</p>
              </div>
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Zap size={16} />
              </span>
            </div>

            <div className="pt-2">
              <span className="text-3xl font-extrabold text-white">
                {isAnnual ? "$15" : "$19"}
              </span>
              <span className="text-xs text-muted-foreground"> / month</span>
              {isAnnual && <p className="text-[10px] text-emerald-400 mt-1 font-semibold">Billed annually ($180/yr)</p>}
            </div>

            <ul className="space-y-3 pt-4 border-t border-white/5">
              <li className="flex items-start gap-2.5 text-xs text-slate-300">
                <Check className="text-emerald-400 mt-0.5 shrink-0" size={14} />
                <span><strong>Unlimited</strong> committees & channels</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-300">
                <Check className="text-emerald-400 mt-0.5 shrink-0" size={14} />
                <span><strong>Advanced AI Assistant</strong> Integration</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-300">
                <Check className="text-emerald-400 mt-0.5 shrink-0" size={14} />
                <span>Premium Progress Poll Metrics</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-300">
                <Check className="text-emerald-400 mt-0.5 shrink-0" size={14} />
                <span>Dynamic Document Version History</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleUpgrade("Pro")}
            className="w-full mt-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 text-xs transition-all flex items-center justify-center gap-2"
          >
            Upgrade to Pro <ArrowRight size={14} />
          </button>
        </motion.div>

        {/* Tier 3: Enterprise */}
        <motion.div
          whileHover={{ y: -5 }}
          className="glass-card p-6 flex flex-col justify-between border-white/5 relative"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white">Enterprise</h3>
                <p className="text-xs text-muted-foreground mt-1">For multi-department suites</p>
              </div>
              <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Shield size={16} />
              </span>
            </div>

            <div className="pt-2">
              <span className="text-3xl font-extrabold text-white">Custom</span>
              <span className="text-xs text-muted-foreground"> / enterprise</span>
            </div>

            <ul className="space-y-3 pt-4 border-t border-white/5">
              <li className="flex items-start gap-2.5 text-xs text-slate-300">
                <Check className="text-indigo-400 mt-0.5 shrink-0" size={14} />
                <span>Everything in Professional</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-300">
                <Check className="text-indigo-400 mt-0.5 shrink-0" size={14} />
                <span>Advanced role security guidelines</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-300">
                <Check className="text-indigo-400 mt-0.5 shrink-0" size={14} />
                <span>Dedicated SLA 24/7 Support</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-300">
                <Check className="text-indigo-400 mt-0.5 shrink-0" size={14} />
                <span>Departmental isolations</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleUpgrade("Enterprise")}
            className="w-full mt-8 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-white text-xs font-semibold transition-all"
          >
            Contact Sales
          </button>
        </motion.div>

      </div>

      {/* Feature matrix / Table comparison */}
      <div className="pt-12 space-y-6">
        <h2 className="text-center font-extrabold text-xl text-white">Compare Plan Offerings</h2>
        
        <div className="overflow-x-auto rounded-2xl border border-white/5 bg-white/2 dark:bg-white/1">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/5 text-xs font-bold text-muted-foreground uppercase bg-white/3">
                <th className="p-4 w-[45%]">Feature Description</th>
                <th className="p-4 text-center">Starter</th>
                <th className="p-4 text-center">Pro</th>
                <th className="p-4 text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {features.map((f, i) => (
                <tr key={i} className="text-xs hover:bg-white/2 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-slate-200 block">{f.name}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">{f.desc}</span>
                  </td>
                  {f.plans.map((p, idx) => (
                    <td key={idx} className="p-4 text-center">
                      <div className="flex justify-center">
                        {p ? (
                          <span className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                            <Check size={12} />
                          </span>
                        ) : (
                          <span className="h-5 w-5 rounded-full bg-slate-500/5 text-slate-600 border border-white/5 flex items-center justify-center">
                            <X size={10} />
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md glass-card p-6 relative border border-white/10 overflow-hidden"
            >
              {/* Glowing Background Glows */}
              <div className="absolute -right-20 -top-20 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl" />
              
              <button
                onClick={() => setSelectedPlan(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors focus:outline-none"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2.5 border-b border-white/5 pb-4 mb-4">
                <CreditCard size={18} className="text-indigo-400" />
                <div>
                  <h2 className="font-extrabold text-sm text-white">Upgrade Checkout</h2>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Billing for plan: <strong>{selectedPlan}</strong></p>
                </div>
              </div>

              {success ? (
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center justify-center py-8 text-center space-y-4"
                >
                  <div className="h-16 w-16 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Payment Successful!</h3>
                    <p className="text-xs text-muted-foreground max-w-xs mt-1">Your Professional subscription has been activated successfully. Enjoy premium AI & analytics tools!</p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleCheckout} className="space-y-4 relative z-10">
                  
                  {/* Dynamic Premium Credit Card Render */}
                  <div className="relative rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 p-4 border border-white/10 shadow-xl min-h-[140px] flex flex-col justify-between overflow-hidden">
                    <div className="absolute right-0 bottom-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
                    
                    <div className="flex justify-between items-start">
                      <Star size={16} className="text-amber-400 fill-amber-400" />
                      <span className="text-[10px] font-bold tracking-widest text-indigo-300 uppercase">PRO MEMBER CARD</span>
                    </div>

                    <div className="pt-4">
                      <p className="text-[10px] font-semibold text-slate-400 tracking-wider">CARD NUMBER</p>
                      <p className="text-sm font-extrabold text-white tracking-widest mt-0.5">
                        {cardNumber ? cardNumber.replace(/(\d{4})/g, "$1 ").trim() : "•••• •••• •••• ••••"}
                      </p>
                    </div>

                    <div className="flex justify-between items-end pt-3">
                      <div>
                        <p className="text-[8px] font-semibold text-slate-400">CARDHOLDER</p>
                        <p className="text-xs font-bold text-white uppercase mt-0.5 truncate max-w-[120px]">{cardName || "YOUR NAME"}</p>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <p className="text-[8px] font-semibold text-slate-400">EXPIRES</p>
                          <p className="text-xs font-bold text-white mt-0.5">{expiry || "MM/YY"}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-semibold text-slate-400">CVC</p>
                          <p className="text-xs font-bold text-white mt-0.5">{cvc || "•••"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Cardholder Name</label>
                      <input
                        className="w-full bg-black/10 dark:bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-white placeholder:text-muted-foreground/60"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Card Number</label>
                      <input
                        className="w-full bg-black/10 dark:bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-white placeholder:text-muted-foreground/60"
                        placeholder="4242 4242 4242 4242"
                        maxLength={16}
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value.replace(/\D/g, ""))}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Expiry Date</label>
                        <input
                          className="w-full bg-black/10 dark:bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-white placeholder:text-muted-foreground/60"
                          placeholder="MM/YY"
                          maxLength={5}
                          value={expiry}
                          onChange={e => {
                            let value = e.target.value;
                            if (value.length === 2 && !value.includes("/")) value += "/";
                            setExpiry(value);
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Security Code (CVC)</label>
                        <input
                          className="w-full bg-black/10 dark:bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-white placeholder:text-muted-foreground/60"
                          placeholder="123"
                          maxLength={3}
                          value={cvc}
                          onChange={e => setCvc(e.target.value.replace(/\D/g, ""))}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground py-1">
                    <Lock size={10} className="text-emerald-500 shrink-0" />
                    <span>Secure SSL Encrypted Checkout. Payments are handled via Stripe checkout.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 text-xs transition-all flex items-center justify-center gap-2 hover:opacity-95"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="animate-spin" size={14} /> Processing payment...
                      </>
                    ) : (
                      <>
                        Pay {isAnnual ? "$180" : "$19"}.00 Now
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Utility classname merger helper
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
