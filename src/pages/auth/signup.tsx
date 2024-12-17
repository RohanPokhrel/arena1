import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { RiLockPasswordLine, RiUserLine } from 'react-icons/ri';
import { BsShieldLock, BsFingerprint, BsEyeFill, BsEyeSlashFill } from 'react-icons/bs';

export default function SignUp() {
  const { signUpWithEmail, signInWithGoogle, signInWithFacebook, error, checkUsernameAvailability } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    uid: '',
    password: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Generate random UID on component mount
  useEffect(() => {
    const generateUID = () => {
      const uid = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      setFormData(prev => ({ ...prev, uid }));
    };
    generateUID();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Basic validation
    if (!formData.username || formData.username.length < 3) {
      setFormError('Username must be at least 3 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    try {
      const isAvailable = await checkUsernameAvailability(formData.username);
      console.log('Username availability result:', isAvailable); // For debugging
      
      if (!isAvailable) {
        setFormError('Username is already taken');
        return;
      }

      await signUpWithEmail(formData.email, formData.password, {
        username: formData.username,
        uid: formData.uid
      });
      router.push('/profile');
    } catch (err: any) {
      if (err.message.includes('email-already-in-use')) {
        setFormError('Email is already registered');
      } else if (err.message.includes('weak-password')) {
        setFormError('Password should be at least 6 characters');
      } else if (err.message.includes('invalid-email')) {
        setFormError('Please enter a valid email address');
      } else {
        setFormError('Unable to create account. Please try again');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push('/profile');
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      await signInWithFacebook();
      router.push('/profile');
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4"
    >
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">Create Account</h1>
        
        {(formError || error) && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm text-center">
            {formError || 'Unable to create account. Please try again'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Username
            </label>
            <div className="relative">
              <RiUserLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 transition-colors focus:border-blue-500 dark:focus:border-blue-400"
                required
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_-]+"
                title="Username can only contain letters, numbers, underscores, and hyphens"
              />
            </div>
          </div>

          <div>
            <label htmlFor="uid" className="block text-sm font-medium mb-1">
              Player ID
            </label>
            <div className="relative">
              <BsFingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="uid"
                value={formData.uid}
                className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 bg-gray-50 dark:bg-gray-600 cursor-not-allowed"
                readOnly
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              This is your unique player ID
            </p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <div className="relative">
              <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 transition-colors focus:border-blue-500 dark:focus:border-blue-400"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <RiLockPasswordLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full pl-10 pr-12 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 transition-colors focus:border-blue-500 dark:focus:border-blue-400"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? <BsEyeSlashFill className="w-5 h-5" /> : <BsEyeFill className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <BsShieldLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full pl-10 pr-12 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 transition-colors focus:border-blue-500 dark:focus:border-blue-400"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showConfirmPassword ? <BsEyeSlashFill className="w-5 h-5" /> : <BsEyeFill className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <span className="border-b dark:border-gray-600 w-full"></span>
          <span className="px-4 text-gray-500 dark:text-gray-400">or</span>
          <span className="border-b dark:border-gray-600 w-full"></span>
        </div>

        <div className="space-y-3 mt-6">
          <Button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors group"
          >
            <FcGoogle className="w-5 h-5" />
            <span className="text-gray-700 dark:text-white font-medium group-hover:text-gray-900 dark:group-hover:text-gray-100">
              Sign up with Google
            </span>
          </Button>

          <Button
            onClick={handleFacebookSignIn}
            className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors group"
          >
            <FaFacebook className="w-5 h-5 text-[#1877F2]" />
            <span className="text-gray-700 dark:text-white font-medium group-hover:text-gray-900 dark:group-hover:text-gray-100">
              Sign up with Facebook
            </span>
          </Button>
        </div>

        <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-500 hover:text-blue-600">
            Sign In
          </Link>
        </p>
      </div>
    </motion.div>
  );
} 