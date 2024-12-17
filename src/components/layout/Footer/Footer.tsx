import { FooterLink } from './FooterLink';
import { FooterSection } from './FooterSection';

export const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <FooterSection title="Game">
            <FooterLink href="/play">Play Now</FooterLink>
            <FooterLink href="/leaderboard">Leaderboard</FooterLink>
            <FooterLink href="/tournaments">Tournaments</FooterLink>
          </FooterSection>

          <FooterSection title="Account">
            <FooterLink href="/profile">Profile</FooterLink>
            <FooterLink href="/settings">Settings</FooterLink>
            <FooterLink href="/stats">Statistics</FooterLink>
          </FooterSection>

          <FooterSection title="Community">
            <FooterLink href="/about">About Us</FooterLink>
            <FooterLink href="/blog">Blog</FooterLink>
            <FooterLink href="/discord">Discord</FooterLink>
          </FooterSection>

          <FooterSection title="Support">
            <FooterLink href="/help">Help Center</FooterLink>
            <FooterLink href="/contact">Contact Us</FooterLink>
            <FooterLink href="/privacy">Privacy Policy</FooterLink>
          </FooterSection>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} TicTacToe. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};