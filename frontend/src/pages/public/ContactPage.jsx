import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { Navbar } from '../../components/shared/Navbar';
import { Footer } from '../../components/shared/Footer';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
    setFormState({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />

      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Get in Touch
            </h1>
            <p className="text-lg text-slate-600">
              Have questions about our courses or platform? We're here to help.
              Fill out the form below and our team will get back to you shortly.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{
                opacity: 0,
                x: -20
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              transition={{
                duration: 0.6
              }}
              className="lg:col-span-1 space-y-8">

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-6">
                  Contact Information
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mt-1">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-900">
                        Email
                      </p>
                      <p className="text-slate-600">support@eduflex.com</p>
                      <p className="text-slate-600">partners@eduflex.com</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mt-1">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-900">
                        Phone
                      </p>
                      <p className="text-slate-600">+1 (555) 123-4567</p>
                      <p className="text-slate-500 text-xs mt-1">
                        Mon-Fri 9am-6pm EST
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mt-1">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-900">
                        Office
                      </p>
                      <p className="text-slate-600">123 Education Lane</p>
                      <p className="text-slate-600">Tech City, TC 90210</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-slate-200 rounded-2xl h-64 w-full flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/city-map.png')] opacity-20"></div>
                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-slate-600 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-indigo-600" />
                  Tech City, TC 90210
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{
                opacity: 0,
                x: 20
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              transition={{
                duration: 0.6,
                delay: 0.2
              }}
              className="lg:col-span-2">

              <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-slate-100">
                {isSuccess ?
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-slate-600 mb-8">
                      Thank you for contacting us. We'll get back to you within
                      24 hours.
                    </p>
                    <Button
                    onClick={() => setIsSuccess(false)}
                    variant="secondary">

                      Send Another Message
                    </Button>
                  </div> :

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input
                      label="Full Name"
                      placeholder="John Doe"
                      value={formState.name}
                      onChange={(e) =>
                      setFormState({
                        ...formState,
                        name: e.target.value
                      })
                      }
                      required />

                      <Input
                      label="Email Address"
                      type="email"
                      placeholder="john@example.com"
                      value={formState.email}
                      onChange={(e) =>
                      setFormState({
                        ...formState,
                        email: e.target.value
                      })
                      }
                      required />

                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Subject
                      </label>
                      <select
                      className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5"
                      value={formState.subject}
                      onChange={(e) =>
                      setFormState({
                        ...formState,
                        subject: e.target.value
                      })
                      }
                      required>

                        <option value="">Select a subject</option>
                        <option value="course">Course Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="billing">Billing Question</option>
                        <option value="partnership">
                          Partnership Opportunity
                        </option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Message
                      </label>
                      <textarea
                      rows={6}
                      className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="How can we help you?"
                      value={formState.message}
                      onChange={(e) =>
                      setFormState({
                        ...formState,
                        message: e.target.value
                      })
                      }
                      required />

                    </div>

                    <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    isLoading={isSubmitting}>

                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                }
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>);

}
