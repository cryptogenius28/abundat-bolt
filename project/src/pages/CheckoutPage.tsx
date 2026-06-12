import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, CreditCard, Truck, FileText } from 'lucide-react';
import { useCartStore } from '../stores';
import { useAuth } from '../contexts';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Separator } from '../components/ui/separator';

type CheckoutStep = 'shipping' | 'payment' | 'review';

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const shippingMethods = [
  { id: 'standard', name: 'Standard (5-7 days)', price: 5.99, freeOver: 49 },
  { id: 'express', name: 'Express (2-3 days)', price: 12.99 },
  { id: 'overnight', name: 'Overnight (1 day)', price: 24.99 },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getSubtotal } = useCartStore();
  const { user, getDefaultAddress } = useAuth();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);

  const defaultAddress = getDefaultAddress();

  const [shippingData, setShippingData] = useState({
    email: user?.email || '',
    firstName: defaultAddress?.firstName || user?.firstName || '',
    lastName: defaultAddress?.lastName || user?.lastName || '',
    address1: defaultAddress?.address1 || '',
    address2: defaultAddress?.address2 || '',
    city: defaultAddress?.city || '',
    state: defaultAddress?.state || '',
    zip: defaultAddress?.zip || '',
    country: 'US',
    shippingMethod: 'standard',
  });

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });

  useEffect(() => {
    document.title = 'Checkout | Abundant Merchandise';
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length]);

  const subtotal = getSubtotal();
  const shippingMethod = shippingMethods.find((m) => m.id === shippingData.shippingMethod);
  const shippingCost =
    shippingMethod && (subtotal >= (shippingMethod.freeOver || 0) ? 0 : shippingMethod.price);
  const tax = subtotal * 0.08;
  const total = subtotal + (shippingCost || 0) + tax;

  const handleNext = () => {
    if (currentStep === 'shipping') setCurrentStep('payment');
    else if (currentStep === 'payment') setCurrentStep('review');
  };

  const handleBack = () => {
    if (currentStep === 'payment') setCurrentStep('shipping');
    else if (currentStep === 'review') setCurrentStep('payment');
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    navigate('/order-confirmation');
  };

  const steps = [
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'review', label: 'Review', icon: FileText },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-heading font-bold text-center mb-8">Checkout</h1>

      {/* Progress steps */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isComplete = steps.findIndex((s) => s.id === currentStep) > index;

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive
                      ? 'bg-brand text-white'
                      : isComplete
                      ? 'bg-green-500 text-white'
                      : 'bg-ink-200 text-ink-500'
                  }`}
                >
                  {isComplete ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`text-xs mt-1 ${isActive ? 'font-semibold text-brand' : 'text-ink-500'}`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 md:w-32 h-0.5 mx-2 ${
                  isComplete ? 'bg-green-500' : 'bg-ink-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Shipping step */}
          {currentStep === 'shipping' && (
            <div className="bg-white border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand" />
                Shipping Information
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={shippingData.email}
                    onChange={(e) =>
                      setShippingData({ ...shippingData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={shippingData.firstName}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, firstName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={shippingData.lastName}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, lastName: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address1">Address Line 1</Label>
                  <Input
                    id="address1"
                    value={shippingData.address1}
                    onChange={(e) =>
                      setShippingData({ ...shippingData, address1: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                  <Input
                    id="address2"
                    value={shippingData.address2}
                    onChange={(e) =>
                      setShippingData({ ...shippingData, address2: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={shippingData.city}
                    onChange={(e) =>
                      setShippingData({ ...shippingData, city: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Select
                      value={shippingData.state}
                      onValueChange={(value) =>
                        setShippingData({ ...shippingData, state: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      value={shippingData.zip}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, zip: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <h3 className="font-semibold">Shipping Method</h3>
              <RadioGroup
                value={shippingData.shippingMethod}
                onValueChange={(value) =>
                  setShippingData({ ...shippingData, shippingMethod: value })
                }
              >
                {shippingMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between border rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className="font-medium cursor-pointer">
                        {method.name}
                      </Label>
                    </div>
                    <span className="font-semibold">
                      {method.freeOver && subtotal >= method.freeOver
                        ? 'Free'
                        : `$${method.price.toFixed(2)}`}
                    </span>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex justify-end pt-4">
                <Button onClick={handleNext}>
                  Continue to Payment <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Payment step */}
          {currentStep === 'payment' && (
            <div className="bg-white border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand" />
                Payment Information
              </h2>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={paymentData.cardNumber}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, cardNumber: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="cardName">Name on Card</Label>
                  <Input
                    id="cardName"
                    value={paymentData.cardName}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, cardName: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={paymentData.expiry}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, expiry: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={paymentData.cvv}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, cvv: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button onClick={handleNext}>
                  Review Order <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Review step */}
          {currentStep === 'review' && (
            <div className="bg-white border rounded-xl p-6 space-y-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand" />
                Review Your Order
              </h2>

              {/* Shipping address */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">Shipping Address</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep('shipping')}
                  >
                    Edit
                  </Button>
                </div>
                <p className="text-sm text-ink-600">
                  {shippingData.firstName} {shippingData.lastName}<br />
                  {shippingData.address1}<br />
                  {shippingData.address2 && <>{shippingData.address2}<br /></>}
                  {shippingData.city}, {shippingData.state} {shippingData.zip}
                </p>
              </div>

              {/* Payment */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">Payment Method</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep('payment')}
                  >
                    Edit
                  </Button>
                </div>
                <p className="text-sm text-ink-600">
                  Card ending in {paymentData.cardNumber.slice(-4) || '****'}
                </p>
              </div>

              {/* Items */}
              <div className="border rounded-lg p-4 space-y-2">
                <h3 className="font-medium">Items</h3>
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span>
                      {item.product.title} x {item.quantity}
                    </span>
                    <span>
                      ${((item.product.sale_price || item.product.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button onClick={handlePlaceOrder} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Place Order'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-ink-50 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-600">Shipping</span>
                <span>
                  {shippingCost === 0 || shippingCost === undefined ? 'Free' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-600">Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
