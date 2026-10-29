import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { FolderOpen, X, SortAsc } from 'lucide-react';
import {
  ClassicSearchBar,
  FilterSidebar,
  SearchResultCard,
  BoardDrawer,
  type MatchEmphasis,
  type MultiImageData,
  type FilterState,
  type SearchResultData,
  type ProjectImage,
} from '../components/ClassicSearch';
import { AppHeader } from '../components/AppHeader';
import { UploadPrivacyNote } from '../components/UploadPrivacyNote';
import { useBoardStore } from '../stores/boardStore';
import { useSelectionStore } from '../stores/selectionStore';
import { SelectionToolbar, SearchExportDialog } from '../components/Export';
import { toast } from 'sonner';
import { ErrorPanel } from '../components/ErrorPanel';
import { Skeleton } from '../components/ui/skeleton'; // side-effect: injects an-skeleton CSS
import { searchByText, searchByImageFile, searchHybrid, searchByMultipleImages, searchByImageId, toAbsoluteUrl, SearchError } from '../lib/navigatorApi';
import { addToHistory } from '../lib/searchHistory';
import { consumePendingImageSearch } from '../lib/pendingImageSearch';

type SortOption = 'best' | 'visual' | 'semantic';

const EMPTY_FILTERS: FilterState = {
  typology: [],
  country: [],
  climate_bin: [],
  massing_type: [],
  tags: [],
  architect: [],
  wwr_band: [],
  // Exclusion filters
  exclude_typology: [],
  exclude_climate_bin: [],
  exclude_massing_type: [],
  exclude_project_ids: [],
};

export function ClassicSearchPage() {
  const [, setLocation] = useLocation();

  // URL state
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  const initialTypology = params.get('typology')?.split(',').filter(Boolean) || [];
  const initialCountry = params.get('country')?.split(',').filter(Boolean) || [];
  const initialEmphasis = (params.get('emphasis') as MatchEmphasis) || 'balanced';

  // Search state
  const [query, setQuery] = useState(initialQuery);
  const [uploadedImage, setUploadedImage] = useState<File | string | null>(null);
  const [multiImageData, setMultiImageData] = useState<MultiImageData | null>(null);
  const [emphasis, setEmphasis] = useState<MatchEmphasis>(initialEmphasis);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);
  const [results, setResults] = useState<SearchResultData[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('best');
  const [searchError, setSearchError] = useState<{ message: string; suggestion?: string } | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 12;

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    ...EMPTY_FILTERS,
    typology: initialTypology,
    country: initialCountry,
  });

  // Board state
  const { isDrawerOpen, openDrawer, closeDrawer, saveToActiveBoard, boards, activeBoardId } =
    useBoardStore();

  // Selection state for export
  const { clearSelection, selectRange, getSelectedArray, getSelectedCount } = useSelectionStore();
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Active filter chips
  const activeFilterChips = useMemo(() => {
    const chips: { category: keyof FilterState; value: string }[] = [];
    Object.entries(filters).forEach(([key, values]) => {
      if (Array.isArray(values)) {
        values.forEach((value) => {
          chips.push({ category: key as keyof FilterState, value });
        });
      }
    });
    return chips;
  }, [filters]);

  // Update URL when search params change
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (filters.typology.length) params.set('typology', filters.typology.join(','));
    if (filters.country.length) params.set('country', filters.country.join(','));
    if (emphasis !== 'balanced') params.set('emphasis', emphasis);

    const qs = params.toString();
    const newUrl = qs ? `/search/classic?${qs}` : '/search/classic';

    // Update URL without navigation
    window.history.replaceState(null, '', newUrl);
  }, [query, filters.typology, filters.country, emphasis]);

  // On mount, honor a hand-off from the landing page. A dropped/picked
  // reference image (parked in pendingImageSearch — it can't ride the URL)
  // takes priority and runs an image search; otherwise fall back to the
  // initial `?q=` text query.
  useEffect(() => {
    const pendingImage = consumePendingImageSearch();
    if (pendingImage) {
      performSearch(initialQuery, pendingImage, initialEmphasis);
    } else if (initialQuery.trim()) {
      performSearch(initialQuery, null, initialEmphasis);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Perform search
  const performSearch = useCallback(
    async (
      searchQuery: string,
      searchImage: File | string | null,
      searchEmphasis: MatchEmphasis
    ) => {
      if (!searchQuery.trim() && !searchImage) return;

      setIsSearching(true);
      setHasSearched(true);
      setSearchError(null);
      setQuery(searchQuery);
      setUploadedImage(searchImage);
      setEmphasis(searchEmphasis);
      setCurrentPage(1);  // Reset pagination on new search

      try {
        let apiResults: any[] = [];
        let apiHasMore = false;
        let apiTotalCount = 0;

        // Decide which API to call based on input type
        const hasImage = searchImage && searchImage instanceof File;
        const hasText = searchQuery.trim().length > 0;
        
        if (hasImage && hasText) {
          // Hybrid search: both image and text
          const wVisual = searchEmphasis === 'visual' ? 0.7 : searchEmphasis === 'semantic' ? 0.3 : 0.5;
          const wText = 1.0 - wVisual;
          const response = await searchHybrid({
            file: searchImage as File,
            query: searchQuery.trim(),
            topK: 50,
            page: 1,
            pageSize: PAGE_SIZE,
            wVisual,
            wText,
          });
          apiResults = response.results || [];
          apiHasMore = response.has_more ?? false;
          apiTotalCount = response.total_count ?? apiResults.length;
        } else if (hasImage) {
          // Image-only search
          const response = await searchByImageFile(searchImage as File, {
            topK: 50,
            page: 1,
            pageSize: PAGE_SIZE,
            wVisual: searchEmphasis === 'visual' ? 1.0 : 0.5,
            wAttr: searchEmphasis === 'semantic' ? 0.5 : 0.25,
          });
          apiResults = response.results || [];
          apiHasMore = response.has_more ?? false;
          apiTotalCount = response.total_count ?? apiResults.length;
        } else if (hasText) {
          // Text-only search
          const response = await searchByText(searchQuery, { topK: 50, page: 1, pageSize: PAGE_SIZE });
          apiResults = response.results || [];
          apiHasMore = response.has_more ?? false;
          apiTotalCount = response.total_count ?? apiResults.length;
        }
        
        setHasMore(apiHasMore);
        setTotalCount(apiTotalCount);

        // Transform API results to SearchResultData format
        const transformedResults: SearchResultData[] = apiResults.map((result, index) => {
          const score = result.score ?? (1 - (result.distance ?? 0.5));
          const thumbUrl = toAbsoluteUrl(result.thumb_url) || '';

          // Build images array from image_urls (full R2 URLs) if available
          let projectImages: ProjectImage[] = [];
          if (result.image_urls && Array.isArray(result.image_urls) && result.image_urls.length > 0) {
            projectImages = result.image_urls.map((url: string, idx: number) => ({
              image_id: `img_${result.project_id}_${idx}`,
              thumb_url: url,
              image_url: url,
            }));
          } else if (thumbUrl) {
            // Fallback to single thumbnail
            projectImages = [
              {
                image_id: result.image_id || `img_${result.project_id}_01`,
                thumb_url: thumbUrl,
                image_url: thumbUrl,
              },
            ];
          }

          return {
            project_id: result.project_id || `project-${index}`,
            project_title: result.title || result.project_id || 'Unknown Project',
            architect: result.architect || 'Unknown Architect',
            location_display: result.country || 'Unknown Location',
            year: result.year || 2024,
            image_id: result.image_id || `img_${result.project_id}_01`,
            thumb_url: projectImages[0]?.thumb_url || thumbUrl,
            image_url: projectImages[0]?.image_url || thumbUrl,
            images: projectImages,
            score: score,
            match_reason: result.match_reason || (
              searchEmphasis === 'visual'
                ? 'Visual similarity'
                : searchEmphasis === 'semantic'
                ? 'Semantic match'
                : 'Balanced match'
            ),
            badges: {
              typology: result.typology ? [result.typology] : [],
              country: result.country ? [result.country] : [],
              climate_bin: result.climate_bin ? [result.climate_bin] : [],
            },
          };
        });

        setResults(transformedResults);
        
        // Record successful search to history
        addToHistory(searchQuery, !!searchImage, transformedResults.length);
      } catch (error) {
        console.error('Search failed:', error);
        
        // Handle structured search errors
        if (error instanceof SearchError) {
          setSearchError({
            message: error.message,
            suggestion: error.suggestion,
          });
          setResults([]);
        } else {
          // Generic error — surface to user honestly, no fake results
          setSearchError({
            message: "Couldn't reach the index",
            suggestion: 'Check your connection and try again.',
          });
          setResults([]);
          toast.error('Search failed. Please try again.');
        }
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  // Perform multi-image search
  const performMultiImageSearch = useCallback(
    async (
      searchQuery: string,
      imageData: MultiImageData,
      searchEmphasis: MatchEmphasis
    ) => {
      if (imageData.files.length === 0 && !searchQuery.trim()) return;

      setIsSearching(true);
      setHasSearched(true);
      setSearchError(null);
      setQuery(searchQuery);
      setMultiImageData(imageData);
      setUploadedImage(null); // Clear single image
      setEmphasis(searchEmphasis);
      setCurrentPage(1);

      try {
        const response = await searchByMultipleImages(imageData.files, {
          fusionMode: imageData.fusionMode,
          negativeFiles: imageData.negativeFiles,
          topK: 50,
          page: 1,
          pageSize: PAGE_SIZE,
          wVisual: searchEmphasis === 'visual' ? 1.0 : searchEmphasis === 'semantic' ? 0.3 : 0.7,
          wAttr: searchEmphasis === 'semantic' ? 0.5 : 0.25,
        });

        const apiResults = response.results || [];
        const apiHasMore = response.has_more ?? false;
        const apiTotalCount = response.total_count ?? apiResults.length;
        
        setHasMore(apiHasMore);
        setTotalCount(apiTotalCount);

        // Transform results
        const transformedResults: SearchResultData[] = apiResults.map((result, index) => {
          const score = result.score ?? (1 - (result.distance ?? 0.5));
          const thumbUrl = toAbsoluteUrl(result.thumb_url) || '';

          let projectImages: ProjectImage[] = [];
          if (result.image_urls && Array.isArray(result.image_urls) && result.image_urls.length > 0) {
            projectImages = result.image_urls.map((url: string, idx: number) => ({
              image_id: `img_${result.project_id}_${idx}`,
              thumb_url: url,
              image_url: url,
            }));
          } else if (thumbUrl) {
            projectImages = [
              {
                image_id: result.image_id || `img_${result.project_id}_01`,
                thumb_url: thumbUrl,
                image_url: thumbUrl,
              },
            ];
          }

          const fusionLabel = imageData.files.length > 1
            ? (imageData.fusionMode === 'average' ? 'Multi-image (all)' : 'Multi-image (any)')
            : 'Visual similarity';

          return {
            project_id: result.project_id || `project-${index}`,
            project_title: result.title || result.project_id || 'Unknown Project',
            architect: result.architect || 'Unknown Architect',
            location_display: result.country || 'Unknown Location',
            year: result.year || 2024,
            image_id: result.image_id || `img_${result.project_id}_01`,
            thumb_url: projectImages[0]?.thumb_url || thumbUrl,
            image_url: projectImages[0]?.image_url || thumbUrl,
            images: projectImages,
            score: score,
            match_reason: result.match_reason || fusionLabel,
            badges: {
              typology: result.typology ? [result.typology] : [],
              country: result.country ? [result.country] : [],
              climate_bin: result.climate_bin ? [result.climate_bin] : [],
            },
          };
        });

        setResults(transformedResults);
        
        // Record to history
        const historyText = searchQuery || `${imageData.files.length} images`;
        addToHistory(historyText, true, transformedResults.length);
        
        if (imageData.negativeFiles.length > 0) {
          toast.success(`Found ${transformedResults.length} results (excluding ${imageData.negativeFiles.length} negative reference${imageData.negativeFiles.length > 1 ? 's' : ''})`);
        }
      } catch (error) {
        console.error('Multi-image search failed:', error);
        
        if (error instanceof SearchError) {
          setSearchError({
            message: error.message,
            suggestion: error.suggestion,
          });
          setResults([]);
        } else {
          toast.error('Multi-image search failed. Please try again.');
          setResults([]);
        }
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  // Sort results (filtering is done server-side to avoid duplicate work)
  const sortedResults = useMemo(() => {
    const sorted = [...results];
    switch (sortBy) {
      case 'visual':
        // In a real implementation, would sort by visual score
        return sorted;
      case 'semantic':
        // In a real implementation, would sort by semantic score
        return sorted;
      case 'best':
      default:
        return sorted.sort((a, b) => b.score - a.score);
    }
  }, [results, sortBy]);

  // Load more results (pagination)
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    
    try {
      let apiResults: any[] = [];
      let apiHasMore = false;
      
      const hasImage = uploadedImage && uploadedImage instanceof File;
      const hasText = query.trim().length > 0;
      
      if (hasImage && hasText) {
        const wVisual = emphasis === 'visual' ? 0.7 : emphasis === 'semantic' ? 0.3 : 0.5;
        const wText = 1.0 - wVisual;
        const response = await searchHybrid({
          file: uploadedImage as File,
          query: query.trim(),
          topK: 50,
          page: nextPage,
          pageSize: PAGE_SIZE,
          wVisual,
          wText,
        });
        apiResults = response.results || [];
        apiHasMore = response.has_more ?? false;
      } else if (hasImage) {
        const response = await searchByImageFile(uploadedImage as File, {
          topK: 50,
          page: nextPage,
          pageSize: PAGE_SIZE,
          wVisual: emphasis === 'visual' ? 1.0 : 0.5,
          wAttr: emphasis === 'semantic' ? 0.5 : 0.25,
        });
        apiResults = response.results || [];
        apiHasMore = response.has_more ?? false;
      } else if (hasText) {
        const response = await searchByText(query, { topK: 50, page: nextPage, pageSize: PAGE_SIZE });
        apiResults = response.results || [];
        apiHasMore = response.has_more ?? false;
      }
      
      // Transform and append results
      const transformedResults: SearchResultData[] = apiResults.map((result, index) => {
        const score = result.score ?? (1 - (result.distance ?? 0.5));
        const thumbUrl = toAbsoluteUrl(result.thumb_url) || '';
        
        let projectImages: ProjectImage[] = [];
        if (result.image_urls && Array.isArray(result.image_urls) && result.image_urls.length > 0) {
          projectImages = result.image_urls.map((url: string, idx: number) => ({
            image_id: `img_${result.project_id}_${idx}`,
            thumb_url: url,
            image_url: url,
          }));
        } else if (thumbUrl) {
          projectImages = [{
            image_id: result.image_id || `img_${result.project_id}_01`,
            thumb_url: thumbUrl,
            image_url: thumbUrl,
          }];
        }
        
        return {
          project_id: result.project_id || `project-${index}`,
          project_title: result.title || result.project_id || 'Unknown Project',
          architect: result.architect || 'Unknown Architect',
          location_display: result.country || 'Unknown Location',
          year: result.year || 2024,
          image_id: result.image_id || `img_${result.project_id}_01`,
          thumb_url: projectImages[0]?.thumb_url || thumbUrl,
          image_url: projectImages[0]?.image_url || thumbUrl,
          images: projectImages,
          score: score,
          match_reason: result.match_reason || 'Match',
          badges: {
            typology: result.typology ? [result.typology] : [],
            country: result.country ? [result.country] : [],
            climate_bin: result.climate_bin ? [result.climate_bin] : [],
          },
        };
      });
      
      setResults(prev => [...prev, ...transformedResults]);
      setCurrentPage(nextPage);
      setHasMore(apiHasMore);
    } catch (error) {
      console.error('Load more failed:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMore, isLoadingMore, uploadedImage, query, emphasis]);

  // Handlers
  const handleSearch = (q: string, image: File | string | null, emp: MatchEmphasis) => {
    performSearch(q, image, emp);
  };

  const handleMultiImageSearch = (q: string, imageData: MultiImageData, emp: MatchEmphasis) => {
    performMultiImageSearch(q, imageData, emp);
  };

  const handleClearSearch = () => {
    setQuery('');
    setUploadedImage(null);
    setMultiImageData(null);
    setResults([]);
    setHasSearched(false);
    setCurrentPage(1);
    setHasMore(false);
    setTotalCount(0);
    clearSelection(); // Clear selection when starting new search
  };

  // Handle shift-click range selection
  const handleShiftSelect = useCallback((fromIndex: number, toIndex: number) => {
    selectRange(sortedResults, fromIndex, toIndex);
  }, [sortedResults, selectRange]);

  // Handle export dialog
  const handleOpenExport = useCallback(() => {
    const selectedCount = getSelectedCount();
    if (selectedCount === 0) {
      toast.error('Select at least one project to export');
      return;
    }
    setShowExportDialog(true);
  }, [getSelectedCount]);

  const handleClearFilters = () => {
    setFilters(EMPTY_FILTERS);
  };

  const handleRemoveFilterChip = (category: keyof FilterState, value: string) => {
    const currentValues = filters[category];
    if (Array.isArray(currentValues)) {
      setFilters({
        ...filters,
        [category]: currentValues.filter((v) => v !== value),
      });
    }
  };

  const handleOpenResult = (result: SearchResultData, currentImageIndex?: number) => {
    const imageId = currentImageIndex !== undefined && result.images 
      ? result.images[currentImageIndex]?.image_id 
      : result.image_id;
    setLocation(`/project/${result.project_id}?image_id=${imageId}&from=search`);
  };

  const handleSaveResult = (result: SearchResultData, currentImage?: ProjectImage) => {
    const imageToSave = currentImage || { 
      image_id: result.image_id, 
      thumb_url: result.thumb_url, 
      image_url: result.image_url 
    };
    saveToActiveBoard({
      project_id: result.project_id,
      image_id: imageToSave.image_id,
      thumb_url_snapshot: imageToSave.thumb_url,
      image_url_snapshot: imageToSave.image_url,
      title_snapshot: result.project_title,
      architect_snapshot: result.architect,
      location_snapshot: result.location_display,
      year_snapshot: result.year,
      added_from: {
        query,
        filters: {
          typology: filters.typology,
          country: filters.country,
        },
      },
    });
    toast.success('Saved to board', {
      action: {
        label: 'View',
        onClick: () => openDrawer(),
      },
    });
  };

  const handleSearchLikeThis = async (result: SearchResultData, currentImage?: ProjectImage) => {
    // Use the currently displayed image's embedding to search for similar projects
    const imageId = currentImage?.image_id || result.image_id;
    
    if (!imageId) {
      toast.error('Cannot search: no image ID available');
      return;
    }
    
    setIsSearching(true);
    setHasSearched(true);
    setSearchError(null);
    setQuery(''); // Clear text query since this is visual-only search
    setUploadedImage(null);
    setMultiImageData(null);
    setCurrentPage(1);
    
    toast.info(`Finding projects similar to "${result.project_title}"...`);
    
    try {
      const response = await searchByImageId(imageId, {
        topK: 50,
        page: 1,
        pageSize: PAGE_SIZE,
        wVisual: 1.0,
        wAttr: 0.25,
      });
      
      const apiResults = response.results || [];
      const apiHasMore = response.has_more ?? false;
      const apiTotalCount = response.total_count ?? apiResults.length;
      
      setHasMore(apiHasMore);
      setTotalCount(apiTotalCount);
      
      // Transform results
      const transformedResults: SearchResultData[] = apiResults.map((apiResult, index) => {
        const score = apiResult.score ?? (1 - (apiResult.distance ?? 0.5));
        const thumbUrl = toAbsoluteUrl(apiResult.thumb_url) || '';
        
        let projectImages: ProjectImage[] = [];
        if (apiResult.image_urls && Array.isArray(apiResult.image_urls) && apiResult.image_urls.length > 0) {
          projectImages = apiResult.image_urls.map((url: string, idx: number) => ({
            image_id: `img_${apiResult.project_id}_${idx}`,
            thumb_url: url,
            image_url: url,
          }));
        } else if (thumbUrl) {
          projectImages = [{
            image_id: apiResult.image_id || `img_${apiResult.project_id}_01`,
            thumb_url: thumbUrl,
            image_url: thumbUrl,
          }];
        }
        
        return {
          project_id: apiResult.project_id || `project-${index}`,
          project_title: apiResult.title || apiResult.project_id || 'Unknown Project',
          architect: apiResult.architect || 'Unknown Architect',
          location_display: apiResult.country || 'Unknown Location',
          year: apiResult.year || 2024,
          image_id: apiResult.image_id || `img_${apiResult.project_id}_01`,
          thumb_url: projectImages[0]?.thumb_url || thumbUrl,
          image_url: projectImages[0]?.image_url || thumbUrl,
          images: projectImages,
          score: score,
          match_reason: apiResult.match_reason || 'Similar visual style',
          badges: {
            typology: apiResult.typology ? [apiResult.typology] : [],
            country: apiResult.country ? [apiResult.country] : [],
            climate_bin: apiResult.climate_bin ? [apiResult.climate_bin] : [],
          },
        };
      });
      
      setResults(transformedResults);
      
      // Record to history
      addToHistory(`Similar to: ${result.project_title}`, true, transformedResults.length);
      
      toast.success(`Found ${transformedResults.length} similar projects`);
    } catch (error) {
      console.error('Search like this failed:', error);
      
      if (error instanceof SearchError) {
        setSearchError({
          message: error.message,
          suggestion: error.suggestion,
        });
        setResults([]);
      } else {
        toast.error('Search failed. Please try again.');
        setResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Check if an item is saved
  const isItemSaved = (projectId: string) => {
    const activeBoard = boards.find((b) => b.id === activeBoardId);
    if (!activeBoard) return false;
    return activeBoard.blocks.some(
      (block) => block.type === 'reference' && block.data.project_id === projectId
    );
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      {/* Canonical dark studio header */}
      <AppHeader
        active="search"
        right={
          <button
            onClick={() => openDrawer()}
            className="appheader-cta"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              background: 'transparent',
              color: 'var(--studio-ink)',
              border: '1px solid var(--studio-line-strong)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              fontWeight: 500,
              transition: 'background var(--dur-1) var(--ease-press), border-color var(--dur-1) var(--ease-press)',
            }}
          >
            <FolderOpen size={16} />
            Boards
            {boards.length > 0 && (
              <span
                className="mono-meta"
                style={{
                  background: 'rgba(255,255,255,0.10)',
                  color: 'var(--studio-stone)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-sm)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {boards.reduce((acc, b) => acc + (b.blocks?.length || 0), 0)}
              </span>
            )}
          </button>
        }
      />

      {/* Search band — clean debossed field on concrete */}
      <div
        style={{
          position: 'sticky',
          top: 60,
          zIndex: 90,
          background: 'var(--concrete-0)',
          borderBottom: '1px solid var(--hairline)',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '14px 24px',
          }}
        >
          <ClassicSearchBar
            initialQuery={query}
            onSearch={handleSearch}
            onMultiImageSearch={handleMultiImageSearch}
            onClear={handleClearSearch}
            isSearching={isSearching}
            enableMultiImage={true}
          />
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
            <UploadPrivacyNote tone="light" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '24px',
          display: 'flex',
          gap: '24px',
        }}
      >
        {/* Left Sidebar - Filters */}
        <FilterSidebar
          filters={filters}
          onFilterChange={setFilters}
          onClearFilters={handleClearFilters}
        />

        {/* Main Results Area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Results Header */}
          {hasSearched && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span
                  className="mono-meta"
                  style={{
                    fontVariantNumeric: 'tabular-nums',
                    color: 'var(--ink-700)',
                  }}
                >
                  {isSearching ? 'Searching…' : `${sortedResults.length} results`}
                </span>

                {/* Active Filter Chips */}
                {activeFilterChips.map((chip) => (
                  <span
                    key={`${chip.category}-${chip.value}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '3px 10px',
                      background: 'var(--concrete-100)',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: '0 0 0 1px var(--hairline)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '0.06em',
                      color: 'var(--ink-700)',
                    }}
                  >
                    {chip.value}
                    <button
                      onClick={() => handleRemoveFilterChip(chip.category, chip.value)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '1px',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'var(--ink-500)',
                      }}
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SortAsc size={14} style={{ color: 'var(--ink-400)' }} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    height: 32,
                    padding: '0 10px',
                    background: 'var(--concrete-0)',
                    boxShadow: 'var(--deboss)',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--ink-900)',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="best">Best match</option>
                  <option value="visual">Most visually similar</option>
                  <option value="semantic">Most semantically similar</option>
                </select>
              </div>
            </div>
          )}

          {/* Results Grid */}
          {isSearching ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--concrete-0)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--raised)',
                    overflow: 'hidden',
                  }}
                >
                  <Skeleton style={{ width: '100%', paddingBottom: '66.67%', height: 0, borderRadius: 0 }} />
                  <div style={{ padding: '12px 16px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Skeleton style={{ height: 16, width: '70%', borderRadius: 'var(--radius-sm)' }} />
                    <Skeleton style={{ height: 11, width: '50%', borderRadius: 'var(--radius-sm)' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : hasSearched ? (
            searchError ? (
              <ErrorPanel
                message={searchError.message}
                detail={searchError.suggestion}
                onRetry={() => {
                  setSearchError(null);
                  handleClearSearch();
                }}
                retryLabel="Try again"
              />
            ) : sortedResults.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '20px',
                }}
              >
                {sortedResults.map((result, index) => (
                  <SearchResultCard
                    key={result.project_id}
                    result={result}
                    index={index}
                    onOpen={handleOpenResult}
                    onSave={handleSaveResult}
                    onSearchLikeThis={handleSearchLikeThis}
                    onShiftSelect={handleShiftSelect}
                    isSaved={isItemSaved(result.project_id)}
                    enableSelection={true}
                  />
                ))}
                
                {/* Load More Button */}
                {hasMore && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px', gridColumn: '1 / -1' }}>
                    <button
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      style={{
                        height: 44,
                        padding: '0 32px',
                        background: isLoadingMore ? 'var(--concrete-200)' : 'var(--signal)',
                        color: isLoadingMore ? 'var(--ink-400)' : '#fff',
                        boxShadow: 'var(--emboss)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: isLoadingMore ? 'not-allowed' : 'pointer',
                        fontFamily: 'var(--font-body)',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'background var(--dur-1) var(--ease-press)',
                      }}
                    >
                      {isLoadingMore ? 'Loading…' : `Load more · `}
                      {!isLoadingMore && (
                        <span className="mono-meta" style={{ color: 'rgba(255,255,255,0.75)', fontVariantNumeric: 'tabular-nums' }}>
                          {results.length}/{totalCount}
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '64px 40px',
                  background: 'var(--concrete-0)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 0 0 1px var(--hairline)',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '20px',
                    fontWeight: 600,
                    marginBottom: '10px',
                    color: 'var(--ink-900)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  No results found
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    color: 'var(--ink-500)',
                    marginBottom: '24px',
                    lineHeight: 1.6,
                  }}
                >
                  Try adjusting your filters or search terms
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  {activeFilterChips.length > 0 && (
                    <button
                      onClick={handleClearFilters}
                      style={{
                        height: 40,
                        padding: '0 20px',
                        background: 'var(--concrete-100)',
                        color: 'var(--ink-900)',
                        boxShadow: 'var(--emboss)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        fontSize: '14px',
                        fontWeight: 500,
                      }}
                    >
                      Clear filters
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleClearSearch();
                      handleClearFilters();
                    }}
                    style={{
                      height: 40,
                      padding: '0 20px',
                      background: 'var(--signal)',
                      color: '#fff',
                      boxShadow: 'var(--emboss)',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    Start new search
                  </button>
                </div>
              </div>
            )
          ) : (
            // Empty state before search
            <div
              style={{
                textAlign: 'center',
                padding: '80px 40px',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '24px',
                  fontWeight: 600,
                  marginBottom: '12px',
                  color: 'var(--ink-900)',
                  letterSpacing: '-0.02em',
                }}
              >
                Find your next architectural precedent
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '15px',
                  color: 'var(--ink-500)',
                  marginBottom: '28px',
                  maxWidth: '480px',
                  margin: '0 auto 28px',
                  lineHeight: 1.6,
                }}
              >
                Search by description, upload a reference image, or both to discover relevant
                architectural projects.
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  justifyContent: 'center',
                }}
              >
                {[
                  'Timber atrium school',
                  'Courtyard housing Mexico',
                  'Brutalist museum',
                  'Sustainable office tower',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => performSearch(suggestion, null, 'balanced')}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '0.06em',
                      padding: '6px 14px',
                      background: 'var(--concrete-100)',
                      border: 'none',
                      boxShadow: '0 0 0 1px var(--hairline)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      color: 'var(--ink-700)',
                      transition: 'background var(--dur-1) var(--ease-press)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--concrete-200)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--concrete-100)';
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Board Drawer */}
      <BoardDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />

      {/* Selection Toolbar */}
      <SelectionToolbar 
        allResults={sortedResults} 
        onExport={handleOpenExport} 
      />

      {/* Export Dialog */}
      {showExportDialog && (
        <SearchExportDialog
          projects={getSelectedArray()}
          onClose={() => setShowExportDialog(false)}
        />
      )}

    </div>
  );
}

