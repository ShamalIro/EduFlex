import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import client from '../../api/client';

const FinancialAidPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { courseTitle } = location.state || {};

  const [formData, setFormData] = useState({
    annualIncome: '',
    employmentStatus: '',
    education: '',
    whyAid: '',
    howHelp: '',
    honestInfo: false
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const wordCount = (text) => text.trim().split(/\s+/).filter(w => w).length;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // ✅ Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.annualIncome) {
      newErrors.annualIncome = 'Please select your annual income.';
    }

    if (!formData.employmentStatus) {
      newErrors.employmentStatus = 'Please select your employment status.';
    }

    if (!formData.whyAid.trim()) {
      newErrors.whyAid = 'This field is required.';
    } else if (wordCount(formData.whyAid) < 150) {
      newErrors.whyAid = `Minimum 150 words required. You have ${wordCount(formData.whyAid)} words.`;
    }

    if (!formData.howHelp.trim()) {
      newErrors.howHelp = 'This field is required.';
    } else if (wordCount(formData.howHelp) < 150) {
      newErrors.howHelp = `Minimum 150 words required. You have ${wordCount(formData.howHelp)} words.`;
    }

    if (!formData.honestInfo) {
      newErrors.honestInfo = 'You must certify that the information is accurate.';
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // ✅ Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    try {
      await client.post('/enrollments', { courseId: id });
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-10 max-w-lg w-full text-center border border-gray-200">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-500 mb-2">Your financial aid application for</p>
          <p className="font-semibold text-gray-800 mb-4">{courseTitle}</p>
          <p className="text-sm text-gray-400 mb-6">
            We will review your application and notify you within 15 days.
            You have been enrolled with free access in the meantime.
          </p>
          <button
            onClick={() => navigate('/student/my-courses')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Go to My Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-3">
        <span className="text-2xl font-semibold text-blue-600">Edu<span className="text-gray-800">Flex</span></span>
        <span className="text-gray-400 text-sm">/ Financial Aid Application</span>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Aid Application</h1>
          <p className="text-gray-500">Applying for: <span className="font-semibold text-gray-700">{courseTitle}</span></p>
        </div>

        {/* ✅ General error banner */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8">
          <h3 className="font-semibold text-blue-800 mb-1">About Financial Aid</h3>
          <p className="text-blue-700 text-sm leading-relaxed">
            EduFlex offers financial aid to learners who cannot afford the course fee.
            Applications are reviewed within 15 days. You will be notified by email
            about the decision. Providing false information may result in removal from the course.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-6">

          {/* Annual Income */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Annual Income (USD) <span className="text-red-500">*</span>
            </label>
            <select
              name="annualIncome"
              value={formData.annualIncome}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 ${
                errors.annualIncome ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            >
              <option value="">Select your annual income</option>
              <option value="0-100">$0 - $100</option>
              <option value="100-150">$100 - $150</option>
              <option value="150-250">$150 - $250</option>
              <option value="250-350">$250 - $350</option>
              
            </select>
            {errors.annualIncome && (
              <p className="text-red-500 text-xs mt-1">{errors.annualIncome}</p>
            )}
          </div>

          {/* Employment Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Employment Status <span className="text-red-500">*</span>
            </label>
            <select
              name="employmentStatus"
              value={formData.employmentStatus}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 ${
                errors.employmentStatus ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            >
              <option value="">Select employment status</option>
              <option value="employed">Employed</option>
              <option value="self-employed">Self-employed</option>
              <option value="unemployed">Unemployed</option>
              <option value="student">Student</option>
              <option value="retired">Retired</option>
            </select>
            {errors.employmentStatus && (
              <p className="text-red-500 text-xs mt-1">{errors.employmentStatus}</p>
            )}
          </div>

          {/* Education */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Highest Level of Education
            </label>
            <select
              name="education"
              value={formData.education}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">Select education level</option>
              <option value="highschool">High School</option>
              <option value="diploma">Diploma</option>
              <option value="bachelor">Bachelor's Degree</option>
              <option value="master">Master's Degree</option>
              <option value="phd">PhD</option>
            </select>
          </div>

          {/* Why Aid */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Why are you applying for Financial Aid? <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-2">Minimum 150 words required</p>
            <textarea
              name="whyAid"
              value={formData.whyAid}
              onChange={handleChange}
              rows={5}
              placeholder="Describe your financial situation and why you need aid to access this course..."
              className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none ${
                errors.whyAid ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            <div className="flex justify-between mt-1">
              {errors.whyAid ? (
                <p className="text-red-500 text-xs">{errors.whyAid}</p>
              ) : (
                <p className="text-xs text-gray-400"></p>
              )}
              <p className={`text-xs ${wordCount(formData.whyAid) >= 150 ? 'text-green-500' : 'text-gray-400'}`}>
                {wordCount(formData.whyAid)} / 150 words
              </p>
            </div>
          </div>

          {/* How will it help */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              How will this course help you achieve your goals? <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-2">Minimum 150 words required</p>
            <textarea
              name="howHelp"
              value={formData.howHelp}
              onChange={handleChange}
              rows={5}
              placeholder="Explain how completing this course will benefit your career or personal development..."
              className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none ${
                errors.howHelp ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            <div className="flex justify-between mt-1">
              {errors.howHelp ? (
                <p className="text-red-500 text-xs">{errors.howHelp}</p>
              ) : (
                <p className="text-xs text-gray-400"></p>
              )}
              <p className={`text-xs ${wordCount(formData.howHelp) >= 150 ? 'text-green-500' : 'text-gray-400'}`}>
                {wordCount(formData.howHelp)} / 150 words
              </p>
            </div>
          </div>

          {/* Checkbox */}
          <div>
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                name="honestInfo"
                id="honestInfo"
                checked={formData.honestInfo}
                onChange={handleChange}
                className="mt-1 w-4 h-4 accent-blue-600"
              />
              <label htmlFor="honestInfo" className="text-sm text-gray-600 leading-relaxed">
                I certify that the information provided in this application is true and accurate.
                I understand that providing false information may result in the cancellation of
                my financial aid and removal from the course.
              </label>
            </div>
            {errors.honestInfo && (
              <p className="text-red-500 text-xs mt-2 ml-7">{errors.honestInfo}</p>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60 mt-4"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Applications are reviewed within 15 days. You will be notified by email.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinancialAidPage;