import React, { useState, useEffect } from 'react';
import useBaseUrl from '@docusaurus/core/lib/client/exports/useBaseUrl';
import Layout from '@docusaurus/theme-classic/lib/theme/Layout';
import { supabase, STATUS } from '../lib/supabase';

interface SearchResult {
  type: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  category: string[];
  industry: string[];
}

export default function SearchResults() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      const isDark = theme === 'dark';
      setIsDarkMode(isDark);
    };

    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Get search query from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q') || urlParams.get('search') || '';
    setSearchQuery(query);
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      
      const searchData = async () => {
        try {
          const query = searchQuery.trim().toLowerCase();
          
          // Search across all Supabase tables in parallel
          const [kpisResult, eventsResult, dimensionsResult, metricsResult] = await Promise.all([
            supabase.from('kpis').select('*').eq('status', STATUS.PUBLISHED).or(`name.ilike.%${query}%,description.ilike.%${query}%`),
            supabase.from('events').select('*').eq('status', STATUS.PUBLISHED).or(`name.ilike.%${query}%,description.ilike.%${query}%`),
            supabase.from('dimensions').select('*').eq('status', STATUS.PUBLISHED).or(`name.ilike.%${query}%,description.ilike.%${query}%`),
            supabase.from('metrics').select('*').eq('status', STATUS.PUBLISHED).or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          ]);
          
          // Transform and combine results
          const filteredResults: SearchResult[] = [
            ...(kpisResult.data || []).map(item => ({
              type: 'KPI',
              title: item.name,
              description: item.description || '',
              url: `/kpis/${item.slug}`,
              tags: item.tags || [],
              category: item.category ? [item.category] : [],
              industry: []
            })),
            ...(eventsResult.data || []).map(item => ({
              type: 'Event',
              title: item.name,
              description: item.description || '',
              url: `/events/${item.slug}`,
              tags: item.tags || [],
              category: item.category ? [item.category] : [],
              industry: []
            })),
            ...(dimensionsResult.data || []).map(item => ({
              type: 'Dimension',
              title: item.name,
              description: item.description || '',
              url: `/dimensions/${item.slug}`,
              tags: item.tags || [],
              category: item.category ? [item.category] : [],
              industry: []
            })),
            ...(metricsResult.data || []).map(item => ({
              type: 'Metric',
              title: item.name,
              description: item.description || '',
              url: `/metrics/${item.slug}`,
              tags: item.tags || [],
              category: item.category ? [item.category] : [],
              industry: []
            }))
          ];
          
          setSearchResults(filteredResults);
          setIsSearching(false);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
          setIsSearching(false);
        }
      };
      
      searchData();
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const query = formData.get('search') as string;
    if (query.trim()) {
      window.location.href = `./search?q=${encodeURIComponent(query)}`;
    }
  };

  return (
    <Layout title="Search Results" description="Search results for Open KPIs">
      <main style={{ padding: '2rem 1rem' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          {/* Search Form */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ marginBottom: '1rem' }}>Search</h1>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                name="search"
                placeholder="Search KPIs, Dimensions, Events..."
                defaultValue={searchQuery}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  backgroundColor: 'var(--ifm-background-color)',
                  color: 'var(--ifm-font-color-base)',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--ifm-color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Search
              </button>
            </form>
          </div>

          {/* Search Results */}
          {searchQuery && (
            <div>
              <h2 style={{ marginBottom: '1rem' }}>
                {isSearching ? 'Searching...' : `Search Results for "${searchQuery}" (${searchResults.length})`}
              </h2>
              
              {isSearching ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ifm-color-emphasis-600)' }}>
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {searchResults.map((result, index) => (
                    <a
                      key={index}
                      href={result.url}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        padding: '1rem',
                        border: '1px solid var(--ifm-color-emphasis-200)',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'all 0.2s ease',
                        backgroundColor: 'var(--ifm-background-color)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--ifm-color-primary)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--ifm-color-emphasis-200)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <span style={{
                        backgroundColor: result.type === 'KPI' ? '#3B82F6' : result.type === 'Dimension' ? '#10B981' : '#F59E0B',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        marginRight: '1rem',
                        flexShrink: 0
                      }}>
                        {result.type}
                      </span>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          margin: '0 0 0.5rem 0',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: 'var(--ifm-font-color-base)'
                        }}>
                          {result.title}
                        </h3>
                        {result.description && (
                          <p style={{
                            margin: '0 0 0.5rem 0',
                            color: 'var(--ifm-color-emphasis-600)',
                            lineHeight: '1.4'
                          }}>
                            {result.description}
                          </p>
                        )}
                        {result.tags.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                            {result.tags.slice(0, 5).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                style={{
                                  fontSize: '0.75rem',
                                  backgroundColor: 'var(--ifm-color-emphasis-100)',
                                  color: 'var(--ifm-color-emphasis-700)',
                                  padding: '0.125rem 0.375rem',
                                  borderRadius: '3px',
                                  border: '1px solid var(--ifm-color-emphasis-200)'
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                            {result.tags.length > 5 && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-500)' }}>
                                +{result.tags.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ifm-color-emphasis-600)' }}>
                  <p>No results found for "{searchQuery}"</p>
                  <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    Try different keywords or check your spelling.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* No search query */}
          {!searchQuery && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ifm-color-emphasis-600)' }}>
              <p>Enter a search term above to find KPIs, Dimensions, and Events.</p>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}
