import * as React from 'react';

type TabsContainerChildProps = {
  value?: string;
  onValueChange?: (value: string) => void;
};

type TabsListChildProps = {
  value?: string;
  isActive?: boolean;
  onClick?: () => void;
};

export interface TabsProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  className?: string;
  children: React.ReactNode;
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ value, onValueChange, defaultValue, className, children }, ref) => {
    const [selectedValue, setSelectedValue] = React.useState(defaultValue || value || '');

    const handleValueChange = (newValue: string) => {
      setSelectedValue(newValue);
      onValueChange?.(newValue);
    };

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);

    return (
      <div ref={ref} className={className} data-value={selectedValue}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<TabsContainerChildProps>, {
              value: selectedValue,
              onValueChange: handleValueChange,
            });
          }
          return child;
        })}
      </div>
    );
  }
);

Tabs.displayName = 'Tabs';

export interface TabsListProps {
  className?: string;
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, value: _value, onValueChange }, ref) => {
    return (
      <div ref={ref} className={className} role="tablist">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            const tabsChild = child as React.ReactElement<TabsListChildProps>;
            return React.cloneElement(tabsChild, {
              isActive: tabsChild.props.value === _value,
              onClick: () => onValueChange?.(tabsChild.props.value ?? ''),
            });
          }
          return child;
        })}
      </div>
    );
  }
);

TabsList.displayName = 'TabsList';

export interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, className, children, isActive, onClick }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        data-value={value}
        data-state={isActive ? 'active' : 'inactive'}
        className={`${className} ${isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }
);

TabsTrigger.displayName = 'TabsTrigger';

export interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  activeValue?: string;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, className, children, activeValue }, ref) => {
    if (value !== activeValue) {
      return null;
    }

    return (
      <div ref={ref} role="tabpanel" className={className}>
        {children}
      </div>
    );
  }
);

TabsContent.displayName = 'TabsContent';
