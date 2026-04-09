import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { createPaymentIntent, confirmPayment, sendOTP, verifyOTP } from '../../api/payment';
import client from '../../api/client';
import { useAuth } from '../../hooks/useAuth';

const PaymentPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { courseTitle, amount, thumbnail } = location.state || {};

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [saveCard, setSaveCard] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [showPaypalModal, setShowPaypalModal] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState('');
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const formatCardNumber = (value) => {
    const v = value.replace(/\D/g, '').substring(0, 16);
    return v.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 2) return v.substring(0, 2) + ' / ' + v.substring(2);
    return v;
  };

  const validateExpiry = (value) => {
    const parts = value.replace(/\s/g, '').split('/');
    if (parts.length !== 2) return false;
    const month = parseInt(parts[0]);
    const year = parseInt('20' + parts[1]);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    if (month < 1 || month > 12) return false;
    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    return true;
  };

  const validate = () => {
    const newErrors = {};
    if (!cardName.trim()) {
      newErrors.cardName = 'Name on card is required.';
    } else if (cardName.trim().length < 3) {
      newErrors.cardName = 'Please enter your full name.';
    }
    if (selectedMethod === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
        newErrors.cardNumber = 'Please enter a valid 16-digit card number.';
      }
      if (!expiry || expiry.length < 7) {
        newErrors.expiry = 'Please enter expiry date.';
      } else if (!validateExpiry(expiry)) {
        newErrors.expiry = 'Card is expired or invalid date.';
      }
      if (!cvv || cvv.length < 3) {
        newErrors.cvv = 'CVV must be 3 digits.';
      }
    }
    return newErrors;
  };

  // ✅ Step 1 - Validate then send OTP
  const handlePayNow = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    try {
      setLoading(true);
      const email = user?.email;
      await sendOTP(email, courseTitle, amount);
      setOtpSent(true);
      setShowOtpModal(true);
    } catch (err) {
      setErrors({ submit: 'Failed to send OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Step 2 - Verify OTP then process payment
  const handleVerifyOTP = async () => {
    if (!otpValue || otpValue.length < 6) {
      setOtpError('Please enter the 6-digit OTP.');
      return;
    }
    setOtpError('');
    try {
      setOtpLoading(true);
      await verifyOTP(otpValue);
      setShowOtpModal(false);
      await handlePay();
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // ✅ Step 3 - Process payment after OTP verified
  const handlePay = async () => {
    try {
      setLoading(true);
      const data = await createPaymentIntent(courseId, courseTitle, amount);
      await confirmPayment(data.payment_id);
      await client.post('/enrollments', { courseId });
      setSuccess(true);
      setTimeout(() => {
        navigate('/student/my-courses');
      }, 3000);
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Payment failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const AnotherStepMessage = () => (
    <div className="border-t border-gray-200 px-4 py-3 flex items-center gap-3 bg-gray-50 rounded-b-xl">
      <div className="w-10 h-10 flex-shrink-0 border border-gray-300 rounded-lg flex items-center justify-center bg-white">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <p className="text-sm text-gray-600">
        Another step will appear to securely submit your payment information.
      </p>
    </div>
  );

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-10 text-center shadow-sm border border-gray-200 max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 mb-6">You are now enrolled in <strong>{courseTitle}</strong></p>
          <p className="text-sm text-gray-400">Redirecting to My Courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ✅ OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Verify Your Email</h2>
              <p className="text-gray-500 text-sm">
                We sent a 6-digit OTP to
              </p>
              <p className="text-blue-600 font-semibold text-sm">{user?.email}</p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={otpValue}
                onChange={(e) => {
                  setOtpValue(e.target.value.replace(/\D/g, ''));
                  setOtpError('');
                }}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-center text-2xl font-bold tracking-widest focus:outline-none focus:border-blue-500"
              />
              {otpError && (
                <p className="text-red-500 text-xs mt-1 text-center">{otpError}</p>
              )}
            </div>

            <p className="text-xs text-gray-400 text-center mb-5">
              OTP expires in <strong>10 minutes</strong>. Check your spam folder if not received.
            </p>

            <button
              onClick={handleVerifyOTP}
              disabled={otpLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60 mb-3"
            >
              {otpLoading ? 'Verifying...' : 'Verify & Pay'}
            </button>

            <button
              onClick={async () => {
                try {
                  await sendOTP(user?.email, courseTitle, amount);
                  setOtpValue('');
                  setOtpError('Resent! Check your email.');
                } catch {
                  setOtpError('Failed to resend. Try again.');
                }
              }}
              className="w-full text-blue-600 text-sm hover:underline"
            >
              Resend OTP
            </button>

            <button
              onClick={() => setShowOtpModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-light"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* ✅ PayPal Login Modal */}
      {showPaypalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">PayPal</h1>
            </div>
            <p className="text-center text-gray-600 text-sm mb-5">
              Enter your email address to get started.
            </p>
            <input
              type="email"
              placeholder="Email or mobile number"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              className="w-full border-2 border-blue-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-600 mb-2"
            />
            <div className="mb-5">
              <span className="text-blue-600 text-sm cursor-pointer hover:underline">
                Forgot email?
              </span>
            </div>
            <button
              onClick={async () => {
                setShowPaypalModal(false);
                await handlePay();
              }}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full transition disabled:opacity-60 mb-4"
            >
              {loading ? 'Processing...' : 'Next'}
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-gray-400 text-sm">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>
            <button className="w-full border-2 border-gray-800 text-gray-800 font-bold py-3 rounded-full hover:bg-gray-50 transition mb-6 text-sm">
              Create an Account
            </button>
            <div className="text-center mb-4">
              <span
                onClick={() => setShowPaypalModal(false)}
                className="text-blue-600 text-sm cursor-pointer hover:underline"
              >
                Cancel and return to EduFlex
              </span>
            </div>
            <div className="text-center">
              <div className="flex justify-center gap-4 text-xs text-gray-400">
                <span className="cursor-pointer hover:underline">Contact Us</span>
                <span className="cursor-pointer hover:underline">Privacy</span>
                <span className="cursor-pointer hover:underline">Legal</span>
                <span className="cursor-pointer hover:underline">Policy Updates</span>
                <span className="cursor-pointer hover:underline">Worldwide</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-3">
        <span className="text-2xl font-semibold text-blue-600">Edu<span className="text-gray-800">Flex</span></span>
        <span className="text-gray-400 text-sm">/ Checkout</span>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">

            <h2 className="text-lg font-semibold text-gray-800 mb-4">Billing information</h2>
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Name on card <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 ${
                  errors.cardName ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Your full name"
                value={cardName}
                onChange={(e) => {
                  setCardName(e.target.value);
                  if (errors.cardName) setErrors(prev => ({ ...prev, cardName: '' }));
                }}
              />
              {errors.cardName && (
                <p className="text-red-500 text-xs mt-1">{errors.cardName}</p>
              )}
            </div>

            <h2 className="text-lg font-semibold text-gray-800 mb-3">Payment methods</h2>

            {/* Card Option */}
            <div className={`border rounded-xl mb-3 cursor-pointer transition ${
              selectedMethod === 'card' ? 'border-blue-500' : 'border-gray-300 hover:border-gray-400'
            }`}>
              <div className="p-4" onClick={() => setSelectedMethod('card')}>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-6 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                  </svg>
                  <span className="font-semibold text-blue-600 text-sm">Card</span>
                </div>

                {selectedMethod === 'card' && (
                  <>
                    <div className="mb-3">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Card Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 pr-36 ${
                            errors.cardNumber ? 'border-red-400 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="1234 1234 1234 1234"
                          value={cardNumber}
                          onChange={(e) => {
                            setCardNumber(formatCardNumber(e.target.value));
                            if (errors.cardNumber) setErrors(prev => ({ ...prev, cardNumber: '' }));
                          }}
                          maxLength={19}
                        />
                        <div className="absolute right-2 top-1.5 flex gap-1">
                          <div className="w-8 h-5 bg-blue-700 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
                          <div className="w-8 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
                          <div className="w-8 h-5 bg-blue-400 rounded text-white text-xs flex items-center justify-center font-bold">AMX</div>
                          <div className="w-8 h-5 bg-orange-400 rounded text-white text-xs flex items-center justify-center font-bold">DIS</div>
                        </div>
                      </div>
                      {errors.cardNumber && (
                        <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Expiration Date</label>
                        <input
                          type="text"
                          className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 ${
                            errors.expiry ? 'border-red-400 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="MM / YY"
                          value={expiry}
                          onChange={(e) => {
                            setExpiry(formatExpiry(e.target.value));
                            if (errors.expiry) setErrors(prev => ({ ...prev, expiry: '' }));
                          }}
                          maxLength={7}
                        />
                        {errors.expiry && (
                          <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Security Code</label>
                        <div className="relative">
                          <input
                            type="password"
                            className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 ${
                              errors.cvv ? 'border-red-400 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="CVC"
                            value={cvv}
                            onChange={(e) => {
                              setCvv(e.target.value);
                              if (errors.cvv) setErrors(prev => ({ ...prev, cvv: '' }));
                            }}
                            maxLength={3}
                          />
                          <div className="absolute right-2 top-2 flex items-center gap-0.5">
                            <svg className="w-5 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="1.5"/>
                              <path d="M2 10h20" strokeWidth="1.5"/>
                            </svg>
                            <span className="text-xs text-gray-400 font-bold">123</span>
                          </div>
                        </div>
                        {errors.cvv && (
                          <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Google Pay */}
            <div className={`border rounded-xl mb-3 cursor-pointer transition ${
              selectedMethod === 'googlepay' ? 'border-blue-500' : 'border-gray-300 hover:border-gray-400'
            }`}
              onClick={() => setSelectedMethod('googlepay')}
            >
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="flex items-center justify-center border border-gray-300 rounded-full px-2 py-0.5">
                  <span className="text-xs font-bold">
                    <span className="text-blue-500">G</span>
                    <span className="text-red-500">o</span>
                    <span className="text-yellow-500">o</span>
                    <span className="text-blue-500">g</span>
                  </span>
                </div>
                <span className="font-semibold text-blue-600 text-sm">Google Pay</span>
              </div>
              {selectedMethod === 'googlepay' && <AnotherStepMessage />}
            </div>

            {/* PayPal */}
            <div className={`border rounded-xl mb-4 cursor-pointer transition ${
              selectedMethod === 'paypal' ? 'border-blue-500' : 'border-gray-300 hover:border-gray-400'
            }`}
              onClick={() => setSelectedMethod('paypal')}
            >
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <span className="text-blue-800 font-bold text-xl">P</span>
                </div>
                <span className="font-semibold text-blue-700 text-sm">PayPal</span>
              </div>
              {selectedMethod === 'paypal' && (
                <div className="border-t border-gray-200 px-6 py-6 bg-gray-50 rounded-b-xl text-center">
                  <p className="font-bold text-gray-800 text-base mb-2">
                    Complete payment with PayPal.
                  </p>
                  <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                    You'll be prompted for your PayPal account email and password
                    through a secure PayPal login form.
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPaypalModal(true);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-12 rounded-full transition text-sm"
                  >
                    PayPal
                  </button>
                </div>
              )}
            </div>

            {/* Save card checkbox */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="saveCard"
                  checked={saveCard}
                  onChange={(e) => setSaveCard(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                <label htmlFor="saveCard" className="text-sm text-gray-600">
                  Save this card securely for future purposes.{' '}
                  <span
                    onClick={() => setShowLearnMore(!showLearnMore)}
                    className="text-blue-600 cursor-pointer hover:underline"
                  >
                    Learn more.
                  </span>
                </label>
              </div>

              {showLearnMore && (
                <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 leading-relaxed">
                  <p className="font-semibold text-gray-800 mb-2">About saving your card</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      Your card details are encrypted and stored securely.
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      You can remove your saved card at any time from your account settings.
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      EduFlex uses industry-standard SSL encryption to protect your payment information.
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      Your card will only be charged when you make a purchase.
                    </li>
                  </ul>
                  <button
                    onClick={() => setShowLearnMore(false)}
                    className="mt-3 text-xs text-blue-600 hover:underline"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>

            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {errors.submit}
              </div>
            )}

            {/* ✅ Pay Now button — sends OTP first */}
            {selectedMethod !== 'paypal' && (
              <button
                onClick={handlePayNow}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60"
              >
                {loading ? 'Sending OTP...' : 'Pay Now'}
              </button>
            )}

            <p className="text-xs text-gray-400 text-center mt-3">
              By providing your card information, you allow EduFlex to charge your card for future payments.
            </p>
          </div>
        </div>

        {/* Right Side - Order Summary */}
        <div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="w-20 h-14 bg-blue-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm leading-snug">{courseTitle || 'Course Title'}</h3>
                <p className="text-xs text-gray-400 mt-1">Full lifetime access</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Original price</span>
                <span className="line-through text-gray-400">${(amount * 1.4).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="text-green-600 font-medium">- ${(amount * 0.4).toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between font-semibold text-gray-800">
              <span>Today's total</span>
              <span>${amount}</span>
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded-lg flex gap-2">
              <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-green-700">30-day money-back guarantee. Full lifetime access.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;