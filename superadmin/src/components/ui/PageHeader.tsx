import React from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight m-0 mb-1.5">{title}</h1>
        <p className="text-sm font-medium text-slate-500 m-0">{description}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
