import Link from 'next/link';

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

export const FooterLink = ({ href, children }: FooterLinkProps) => {
  return (
    <Link 
      href={href}
      className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-200"
    >
      {children}
    </Link>
  );
};