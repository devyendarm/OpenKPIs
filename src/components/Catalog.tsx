import React, { useEffect, useMemo, useState } from 'react';
import useBaseUrl from '@docusaurus/core/lib/client/exports/useBaseUrl';
import { Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { supabase, STATUS } from '../lib/supabase';

type Item = {
  id: string;
  title: string;
  description?: string;
  slug: string;
  tags?: string[];
  category?: string[];
  industry?: string[];
};

export default function Catalog({ section }: { section: 'kpis'|'dimensions'|'events'|'metrics' }) {
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState('');
  const [tag, setTag] = useState<string>('');
  const [cat, setCat] = useState<string>('');
  const [ind, setInd] = useState<string>('');

  // Fix URL routing: KPIs use /docs/, others use their section name
  const baseUrl = section === 'kpis' ? useBaseUrl('/docs') : useBaseUrl(`/${section}`);

  // Handle URL search parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const searchParam = urlParams.get('search') || urlParams.get('q');
      if (searchParam) setQ(searchParam);
    }
  }, []);

  // Fetch data from Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        console.log('Fetching from Supabase table:', section);
        
        const { data, error } = await supabase
          .from(section)
          .select('*')
          .eq('status', STATUS.PUBLISHED)
          .order('name');

        if (error) {
          console.error('Supabase error:', error);
          setItems([]);
          return;
        }

        // Transform Supabase data to match Item type
        const transformedItems: Item[] = (data || []).map(item => ({
          id: item.id,
          title: item.name,
          description: item.description || undefined,
          slug: item.slug,
          tags: item.tags || [],
          category: item.category ? [item.category] : [],
          industry: [], // Not in current schema, can add later if needed
        }));

        console.log('Loaded items from Supabase:', transformedItems.length);
        setItems(transformedItems);
      } catch (err) {
        console.error('Error loading data from Supabase:', err);
        setItems([]);
      }
    }

    fetchData();
  }, [section]);

  const tags = useMemo(() => Array.from(new Set(items.flatMap(i=>i.tags||[]))).sort(), [items]);
  const cats = useMemo(() => Array.from(new Set(items.flatMap(i=>i.category||[]))).sort(), [items]);
  const inds = useMemo(() => Array.from(new Set(items.flatMap(i=>i.industry||[]))).sort(), [items]);

  const filtered = useMemo(() => {
    const qlc = q.trim().toLowerCase();
    console.log('Search query:', qlc, 'Items count:', items.length); // Debug log
    return items.filter(i => {
      const searchableText = [
        i.title,
        i.description,
        ...(i.tags || []),
        ...(i.category || []),
        ...(i.industry || [])
      ].filter(Boolean).join(' ').toLowerCase();
      
      const matchQ = !qlc || searchableText.includes(qlc);
      const matchTag = !tag || (i.tags||[]).includes(tag);
      const matchCat = !cat || (i.category||[]).includes(cat);
      const matchInd = !ind || (i.industry||[]).includes(ind);
      
      if (qlc && matchQ) {
        console.log('Match found:', i.title, 'Searchable text:', searchableText); // Debug log
      }
      
      return matchQ && matchTag && matchCat && matchInd;
    });
  }, [items, q, tag, cat, ind]);

  return (
    <div className="catalog-page" style={{marginBottom: '2rem'}}>
      <div className="submit-new-cta">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          href={useBaseUrl(`/${section}/new`)}
        >
          {section === 'kpis' ? 'Add New KPI' : section === 'dimensions' ? 'Add New Dimension' : section === 'events' ? 'Add New Event' : 'Add New Metric'}
        </Button>
      </div>
      
      <div className="catalog-filters" style={{display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', alignItems: 'end'}}>
        <div>
          <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem'}}>Search</label>
          <input
            style={{border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '0.375rem', padding: '0.5rem 0.75rem', width: '16rem'}}
            placeholder={section === 'kpis' ? 'Search KPIs...' : `Search ${section}...`}
            value={q}
            onChange={e=>setQ(e.target.value)}
          />
        </div>

        <div>
          <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem'}}>Tag</label>
          <select style={{border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '0.375rem', padding: '0.5rem 0.75rem', width: '14rem'}} value={tag} onChange={e=>setTag(e.target.value)}>
            <option value="">All</option>
            {tags.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem'}}>Category</label>
          <select style={{border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '0.375rem', padding: '0.5rem 0.75rem', width: '14rem'}} value={cat} onChange={e=>setCat(e.target.value)}>
            <option value="">All</option>
            {cats.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem'}}>Industry</label>
          <select style={{border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '0.375rem', padding: '0.5rem 0.75rem', width: '14rem'}} value={ind} onChange={e=>setInd(e.target.value)}>
            <option value="">All</option>
            {inds.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem'}}>
        {filtered.map(i => (
          <a key={i.id} style={{textDecoration: 'none', color: 'inherit'}} href={`${baseUrl}${i.slug}`}>
            <div style={{border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '0.5rem', padding: '1rem', transition: 'box-shadow 0.2s', cursor: 'pointer'}} 
                 onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
                 onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <h3 style={{marginTop: 0, marginBottom: '0.5rem'}}>{i.title}</h3>
              <p style={{marginBottom: '0.5rem'}}>{i.description || '—'}</p>
              {!!(i.tags && i.tags.length) && (
                <div style={{marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.375rem'}}>
                  {i.tags.slice(0,6).map(t=>(
                    <span key={t} style={{fontSize: '0.75rem', border: '1px solid var(--ifm-color-emphasis-200)', padding: '0.125rem 0.375rem', borderRadius: '0.375rem', backgroundColor: 'var(--ifm-color-emphasis-100)'}}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}