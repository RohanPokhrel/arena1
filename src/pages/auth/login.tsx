import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { RiLockPasswordLine } from 'react-icons/ri';
import { BsEyeFill, BsEyeSlashFill } from 'react-icons/bs';
import { ADMIN_EMAIL } from '@/lib/adminAuth';

export default function Login() {
  const { signInWithEmail, signInWithGoogle, signInWithFacebook, error } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      await signInWithEmail(formData.email, formData.password);
      
      // Check if the email matches admin email
      if (formData.email === ADMIN_EMAIL) {
        router.push('/admin/dashboard');
      } else {
        router.push('/profile');
      }
    } catch (err: any) {
      if (err.message.includes('invalid-credential')) {
        setFormError('Invalid email or password');
      } else if (err.message.includes('too-many-requests')) {
        setFormError('Too many attempts. Please try again later');
      } else {
        setFormError('Unable to sign in. Please try again');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      if (result?.user?.email === ADMIN_EMAIL) {
        router.push('/admin/dashboard');
      } else {
        router.push('/profile');
      }
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      const result = await signInWithFacebook();
      if (result?.user?.email === ADMIN_EMAIL) {
        router.push('/admin/dashboard');
      } else {
        router.push('/profile');
      }
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
        <h1 className="text-3xl font-bold text-center mb-6">Welcome Back!</h1>

        {(formError || error) && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm text-center">
            {formError || 'Unable to sign in. Please try again'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <Button type="submit" className="w-full">
            Sign In
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
              Sign in with Google
            </span>
          </Button>

          <Button
            onClick={handleFacebookSignIn}
            className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors group"
          >
            <FaFacebook className="w-5 h-5 text-[#1877F2]" />
            <span className="text-gray-700 dark:text-white font-medium group-hover:text-gray-900 dark:group-hover:text-gray-100">
              Sign in with Facebook
            </span>
          </Button>
        </div>

        <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-blue-500 hover:text-blue-600">
            Sign Up
          </Link>
        </p>
      </div>
    </motion.div>
  );
} 