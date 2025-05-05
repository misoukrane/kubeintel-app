import React from 'react';
import { Link } from 'react-router';
import { Slash } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ROUTES } from '@/lib/routes';

interface MainNavigationProps {
  location: string;
  className?: string;
}

export const MainNavigation = ({
  location,
  className,
}: MainNavigationProps) => {
  const segments = location
    .split('/')
    .filter(Boolean)
    .map((segment, index, array) => ({
      name: segment,
      path: '/' + array.slice(0, index + 1).join('/'),
    }));

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to={ROUTES.CLUSTER}>Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment, index) => (
          <React.Fragment key={segment.path}>
            <BreadcrumbSeparator>
              <Slash className="m-1" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              {index === segments.length - 1 ? (
                <BreadcrumbPage>{segment.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={segment.path}>{segment.name}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
