import { useEffect, type RefObject } from 'react';

/**
 * Custom hook that detects clicks outside of the specified element
 * and calls the provided handler function.
 * 
 * @param ref - React ref object pointing to the element to detect clicks outside of
 * @param handler - Callback function to call when a click outside is detected
 * @param enabled - Optional flag to enable/disable the listener (default: true)
 * 
 * @example
 * ```tsx
 * const menuRef = useRef<HTMLDivElement>(null);
 * const [isOpen, setIsOpen] = useState(false);
 * 
 * useClickOutside(menuRef, () => setIsOpen(false), isOpen);
 * 
 * return (
 *   <div ref={menuRef}>
 *     {isOpen && <DropdownMenu />}
 *   </div>
 * );
 * ```
 */
export function useClickOutside<T extends HTMLElement>(
    ref: RefObject<T | null>,
    handler: () => void,
    enabled: boolean = true
): void {
    useEffect(() => {
        if (!enabled) return;

        const listener = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node;

            // Do nothing if clicking ref's element or descendent elements
            if (!ref.current || ref.current.contains(target)) {
                return;
            }

            handler();
        };

        // Use mousedown instead of click for better UX
        // (closes menu before the click completes)
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler, enabled]);
}
