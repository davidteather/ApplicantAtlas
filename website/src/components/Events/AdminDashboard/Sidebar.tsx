import React, { memo } from 'react';
import { useSelector } from 'react-redux';

import { RootState, resetTabs } from '@/store';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

interface SidebarLink {
  title: string;
  sectionName: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  setActiveSection,
}) => {
  const eventDetails = useSelector(
    (state: RootState) => state.event.eventDetails,
  );

  const links: SidebarLink[] = [
    { title: 'Dashboard', sectionName: 'dashboard' },
    { title: 'Forms', sectionName: 'forms' },
    { title: 'Event Details', sectionName: 'event-details' },
    { title: 'Pipelines', sectionName: 'pipelines' },
    { title: 'Email Templates', sectionName: 'email-templates' },
    { title: 'Settings', sectionName: 'settings' },
  ];

  const handleLinkClick = (sectionName: string) => {
    // reset any of the tabs held state for tabs
    resetTabs();

    setActiveSection(sectionName);
  };

  return (
    <div className="sidebar bg-base-200 text-base-content">
      <div className="flex flex-col md:w-64 w-20 sm:w-32 h-full p-2 sm:p-4 overflow-y-auto">
        <h2 className="text-lg font-bold truncate">
          {eventDetails?.metadata.name}
        </h2>
        <ul className="flex flex-col gap-1 p-0">
          {links.map((link) => (
            <li
              key={link.sectionName}
              className={`${
                activeSection === link.sectionName
                  ? 'bg-primary text-primary-content rounded transition-colors duration-300'
                  : ''
              } p-2 h-max text-xs sm:text-sm md:text-md py-2 cursor-pointer hover:bg-primary hover:text-primary-content hover:rounded transition-colors duration-300`}
              onClick={() => handleLinkClick(link.sectionName)}
            >
              <span className="text-left">{link.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default memo(Sidebar);
