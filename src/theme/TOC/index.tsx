import React from 'react';
import clsx from 'clsx';

type Props = {
  className?: string;
  toc: any[];
  minHeadingLevel?: number;
  maxHeadingLevel?: number;
};

function TOCList({ items }: { items: any[] }) {
  if (!items || items.length === 0) return null as any;
  return (
    <ul className="mui-rr-list">
      {items.map((item) => (
        <li key={item.id}>
          <a href={`#${item.id}`}>{item.value}</a>
          {item.children && item.children.length > 0 ? <TOCList items={item.children} /> : null}
        </li>
      ))}
    </ul>
  );
}

export default function TOC({ className, toc }: Props) {
  if (!toc || toc.length === 0) return null;
  return (
    <nav aria-label="Page table of contents" className={clsx('mui-right-rail', className)}>
      <p className="mui-rr-title">Contents</p>
      <TOCList items={toc} />
    </nav>
  );
}


