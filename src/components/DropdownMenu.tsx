import React, { useState, useRef, useCallback, type ReactNode } from 'react';
import { useClickOutside } from '../hooks/useClickOutside';

// ============================================
// Types
// ============================================

export interface DropdownMenuItem {
    id: string;
    label: string;
    icon?: ReactNode;
    iconColor?: string;
    onClick: () => void;
    danger?: boolean;
    dividerBefore?: boolean;
}

export interface DropdownMenuProps {
    items: DropdownMenuItem[];
    trigger?: ReactNode;
    triggerLabel?: string;
    position?: 'left' | 'right';
    className?: string;
}

// ============================================
// Icons
// ============================================

const DotsIcon = () => (
    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
);

export const EditIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

export const DeleteIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export const KeyIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
);

export const LogoutIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

// ============================================
// Component
// ============================================

const DropdownMenu: React.FC<DropdownMenuProps> = ({
    items,
    trigger,
    triggerLabel = 'Menu',
    position = 'right',
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useClickOutside(menuRef, useCallback(() => setIsOpen(false), []), isOpen);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(prev => !prev);
    };

    const handleItemClick = (item: DropdownMenuItem) => (e: React.MouseEvent) => {
        e.stopPropagation();
        item.onClick();
        setIsOpen(false);
    };

    const positionClass = position === 'left' ? 'left-0' : 'right-0';

    return (
        <div className={`relative ${className}`} ref={menuRef}>
            {/* Trigger Button */}
            {trigger ? (
                <div onClick={handleToggle} className="cursor-pointer">
                    {trigger}
                </div>
            ) : (
                <button
                    onClick={handleToggle}
                    className="p-1 text-gray-600 hover:text-gray-700 rounded-md bg-white transition-colors"
                    aria-label={triggerLabel}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                >
                    <DotsIcon />
                </button>
            )}

            {/* Dropdown Panel */}
            {isOpen && (
                <div
                    role="menu"
                    className={`absolute ${positionClass} mt-2 min-w-[160px] rounded-lg bg-white shadow-lg z-50 overflow-hidden animate-[dropdownFadeIn_0.15s_ease-out]`}
                >
                    <div className="py-1">
                        {items.map((item, index) => (
                            <React.Fragment key={item.id}>
                                {item.dividerBefore && index > 0 && (
                                    <div className="h-px bg-gray-200 my-1" />
                                )}
                                <button
                                    onClick={handleItemClick(item)}
                                    className={`
                    w-full text-left px-4 py-2 text-sm flex items-center gap-2 
                    transition-colors duration-150 whitespace-nowrap
                    ${item.danger
                                            ? 'text-red-600 hover:bg-red-50'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }
                  `}
                                    role="menuitem"
                                >
                                    {item.icon && (
                                        <span className={item.iconColor || (item.danger ? 'text-red-500' : 'text-purple-600')}>
                                            {item.icon}
                                        </span>
                                    )}
                                    {item.label}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}

            {/* Animation styles injected once */}
            <style>{`
        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
};

export default DropdownMenu;
