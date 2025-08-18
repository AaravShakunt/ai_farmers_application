import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { authApi, authStorage } from '../services/authApi';
import type { LocationData, SignupRequest, LoginRequest } from '../services/authApi';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Get current location
  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({
            latitude,
            longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          });
          setLocationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationLoading(false);
          setErrors({ location: 'Unable to get location. Please enable location services.' });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      setLocationLoading(false);
      setErrors({ location: 'Geolocation is not supported by this browser.' });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!isLogin) {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile.replace(/\D/g, ''))) {
      newErrors.mobile = 'Mobile number must be 10 digits';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      if (isLogin) {
        // Login
        const loginData: LoginRequest = {
          mobile: formData.mobile,
          password: formData.password
        };
        
        const user = authApi.login(loginData);
        console.log('Login successful:', user);
        navigate('/home');
      } else {
        // Signup
        const signupData: SignupRequest = {
          name: formData.name,
          mobile: formData.mobile,
          password: formData.password,
          location: location || undefined
        };
        
        const user = authApi.signup(signupData);
        console.log('Signup successful:', user);
        navigate('/home');
      }
    } catch (error: any) {
      setErrors({ form: error.message || 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Auto-get location for signup
  useEffect(() => {
    if (!isLogin && !location) {
      getCurrentLocation();
    }
  }, [isLogin]);

  // Check if user is already logged in
  useEffect(() => {
    if (authStorage.isLoggedIn()) {
      navigate('/home');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center">
          <img 
            src="/Logo.png" 
            alt="Farmers App" 
            className="h-16 w-16 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">
            {isLogin ? 'Welcome Back' : 'Join Farmers App'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isLogin 
              ? 'Sign in to your account' 
              : 'Create your account to get started'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
          )}

          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.mobile ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your mobile number"
            />
            {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
          )}

          {!isLogin && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Location</span>
                <Button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="text-xs px-2 py-1"
                >
                  {locationLoading ? 'Getting...' : 'Get Location'}
                </Button>
              </div>
              
              {location ? (
                <div className="text-sm text-gray-600">
                  <p>📍 {location.address}</p>
                  <p className="text-xs text-gray-500">
                    Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  {locationLoading ? 'Getting your location...' : 'Location not available'}
                </p>
              )}
              
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>
          )}

          {errors.form && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{errors.form}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setFormData({
                name: '',
                mobile: '',
                password: '',
                confirmPassword: ''
              });
              setErrors({});
              setLocation(null);
            }}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            {isLogin 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"
            }
          </button>
        </div>

        {/* Debug section - remove in production */}
        <div className="text-center text-xs text-gray-500 border-t pt-4">
          <p>Debug: {authApi.getAllUsers().length} users registered</p>
          <button
            type="button"
            onClick={() => {
              authApi.clearAllUsers();
              window.location.reload();
            }}
            className="text-red-500 hover:text-red-700 underline"
          >
            Clear All Users
          </button>
        </div>
      </Card>
    </div>
  );
}
