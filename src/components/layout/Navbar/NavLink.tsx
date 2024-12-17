import Link from 'next/link';
import { useRouter } from 'next/router';
import clsx from 'clsx';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export const NavLink = ({ href, children }: NavLinkProps) => {
  const router = useRouter();
  const isActive = router.pathname === href;

  return (
    <Link 
      href={href} 
      className={clsx(
        'px-4 py-2 rounded-md transition-colors duration-200',
        isActive 
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      )}
    >
      {children}
    </Link>
  );
};