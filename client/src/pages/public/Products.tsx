import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { productAPI } from '@/lib/api';
import type { Product, Category } from '@/lib/types';
import ProductCard from '@/components/common/ProductCard';
import Spinner from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/Spinner';
import { Button, Input, Select } from '@/components/ui/Form';
import { formatPrice } from '@/lib/constants';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const params = useMemo(() => ({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page') || '1'),
  }), [searchParams]);

  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    productAPI.getCategories().then((res) => {
      if ('categories' in res) setCategories(res.categories);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    productAPI.getProducts({
      search: params.search || undefined,
      category: params.category !== 'all' ? params.category : undefined,
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      sort: params.sort,
      page: params.page,
      limit: 9,
    }).then((res) => {
      if ('products' in res) {
        setProducts(res.products);
        setTotalPages(res.totalPages);
        setTotal(res.total);
      }
      setLoading(false);
    });
  }, [params.search, params.category, params.minPrice, params.maxPrice, params.sort, params.page]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'all' && value !== '') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasFilters = params.search || params.category !== 'all' || params.minPrice || params.maxPrice;

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Categories</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => updateParam('category', 'all')}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              params.category === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => updateParam('category', c._id)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                params.category === c._id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Price Range</h3>
        <div className="space-y-3">
          <Input
            type="number"
            placeholder="Min price"
            value={params.minPrice}
            onChange={(e) => updateParam('minPrice', e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max price"
            value={params.maxPrice}
            onChange={(e) => updateParam('maxPrice', e.target.value)}
          />
        </div>
      </div>

      {hasFilters && (
        <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
          <X className="w-4 h-4" /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">All Products</h1>
        <p className="text-sm text-slate-500 mt-1">
          {loading ? 'Loading...' : `${total} product${total !== 1 ? 's' : ''} found`}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 bg-white border border-slate-200 rounded-xl p-5">
            <FilterPanel />
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1">
          {/* Top bar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>

          <div className="flex items-center gap-3 ml-auto">
            {params.search && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-sm text-slate-600">
                <Search className="w-3.5 h-3.5" />
                "{params.search}"
              </div>
            )}
            <Select
              value={params.sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="!w-auto"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </Select>
          </div>
          </div>

          {/* Products grid */}
          {loading ? (
            <Spinner className="py-20" size="lg" />
          ) : products.length === 0 ? (
            <EmptyState
              icon={<Search className="w-8 h-8" />}
              title="No products found"
              message="Try adjusting your search or filters to find what you're looking for."
              action={<Button onClick={clearFilters}>Clear Filters</Button>}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={params.page === 1}
                    onClick={() => updateParam('page', String(params.page - 1))}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => updateParam('page', String(pg))}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        pg === params.page
                          ? 'bg-slate-900 text-white'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={params.page === totalPages}
                    onClick={() => updateParam('page', String(params.page + 1))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Filters</h2>
              <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
            </div>
            <FilterPanel />
            <Button fullWidth className="mt-6" onClick={() => setShowFilters(false)}>
              Show {total} results
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
