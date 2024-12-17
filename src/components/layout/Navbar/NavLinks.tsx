import { NavLink } from './NavLink';

export const NavLinks = () => {
  return (
    <div className="flex items-center space-x-2">
      <NavLink href="/">Home</NavLink>
      <NavLink href="/play">Play</NavLink>
      <NavLink href="/leaderboard">Leaderboard</NavLink>
      <NavLink href="/profile">Profile</NavLink>
    </div>
  );
};