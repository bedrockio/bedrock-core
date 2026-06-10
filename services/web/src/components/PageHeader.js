import { Link, useLocation, useNavigate } from '@bedrockio/router';
import React from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import Meta from './Meta';

const PageHeader = ({
  tabs = [],
  breadcrumbItems = [],
  title,
  rightSection,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <Meta title={title} />
      <div className="flex flex-col gap-4">
        {breadcrumbItems.length > 0 && (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbItems.map((item, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {item?.href ? (
                      <BreadcrumbLink asChild>
                        <Link to={item.href}>{item.title}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{item.title}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbItems.length - 1 && (
                    <BreadcrumbSeparator>/</BreadcrumbSeparator>
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}

        <div className="flex flex-nowrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <div className="flex flex-none items-center gap-2">{rightSection}</div>
        </div>

        {tabs.length > 0 && (
          <Tabs value={location.pathname} onValueChange={(value) => navigate(value)}>
            <TabsList>
              {tabs.map((tab, index) => (
                <TabsTrigger key={index} value={tab.href}>
                  {tab.icon}
                  {tab.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </div>
    </>
  );
};

export default PageHeader;
