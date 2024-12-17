interface FooterSectionProps {
  title: string;
  children: React.ReactNode;
}

export const FooterSection = ({ title, children }: FooterSectionProps) => {
  return (
    <div className="flex flex-col space-y-2">
      <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      {children}
    </div>
  );
};