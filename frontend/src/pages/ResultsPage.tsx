import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import { ChevronUp, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useSearchStore, SearchResult } from "../stores/searchStore";
import { searchByText, toAbsoluteUrl } from "../lib/navigatorApi";
import { useCanvasStore } from "../stores/canvasStore";
import { NodeCanvas } from "../components/Canvas/NodeCanvas";
import { AppHeader } from "../components/AppHeader";
import { ResultsGridCompact } from "../components/SearchResults/ResultsGridCompact";
import { PrecedentProject } from "../types/nodes";
import { UserButton } from "../components/UserButton";
import { 
  createTextNode, 
  createImageNode, 
  createPrecedentNode,
  createAttributeFilterNode, 
  createScalarNode, 
  createResultsNode,
  createOperatorANDNode, 
  createOperatorORNode, 
  createOperatorNOTNode,
  createGenerateNode,
  createValidateNode,
  createStyleReferenceNode
} from "../lib/nodeFactory";

export function ResultsPage() {
  const [, setLocation] = useLocation();
  // wouter's useLocation only returns pathname, use window.location.search for query params
  const params = new URLSearchParams(window.location.search);
  const initialSearchQuery = params.get("q") || "";
  const imageParam = params.get("image");
  
  // Use persisted state from store
  const { 
    searchResults, 
    setSearchResults, 
    setSearchQuery: setStoreQuery,
    searchQuery: storedQuery,
    canvasFilters,
    setCanvasFilters,
    canvasFusionWeights,
    setCanvasFusionWeights,
    canvasHasSearched,
    setCanvasHasSearched,
  } = useSearchStore();
  
  // Initialize local state from store or URL params
  const [currentSearchQuery, setCurrentSearchQuery] = useState(initialSearchQuery || storedQuery);
  const [hasSearched, setHasSearched] = useState(canvasHasSearched || !!initialSearchQuery);
  const [isSearching, setIsSearching] = useState(false);
  
  // Use store state for filters and weights (persisted)
  const filters = canvasFilters;
  const setFilters = setCanvasFilters;
  const fusionWeights = canvasFusionWeights;
  const setFusionWeights = setCanvasFusionWeights;

  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);
  const [researchPanelCollapsed, setResearchPanelCollapsed] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const { nodes, edges, addNodes, executeWorkflow, selectedNodes } = useCanvasStore();

  // RUN relates to the canvas: only enabled when there's a graph to run, shows a
  // running state, and reports honestly whether the index answered.
  const runGraph = useCallback(async () => {
    if (nodes.length === 0 || isRunning) return;
    setIsRunning(true);
    const t = toast.loading("Running graph…");
    try {
      await executeWorkflow();
      const after = useCanvasStore.getState().nodes;
      const errored = after.some((n: any) => n.data?.executionStatus === "error");
      if (errored) {
        toast.error("Couldn't reach the index", { id: t, description: "Some nodes failed — results weren't updated." });
      } else {
        toast.success("Graph run complete", { id: t });
      }
    } catch (err) {
      console.error("Workflow execution failed:", err);
      toast.error("Run failed", { id: t, description: "Couldn't complete the graph. Check your connection and try again." });
    } finally {
      setIsRunning(false);
    }
  }, [nodes.length, isRunning, executeWorkflow]);
  
  // Get selected node's execution results (if any)
  const selectedNode = useMemo(() => {
    if (selectedNodes.length === 0) return null;
    return nodes.find((n) => n.id === selectedNodes[0]) || null;
  }, [selectedNodes, nodes]);
  
  // Check if selected node has results to display
  const selectedNodeResults = useMemo(() => {
    if (!selectedNode) return null;
    const data = selectedNode.data as any;
    
    // Don't show results panel for generate/validate/styleReference nodes - they have their own output handling
    if (data.type === 'generate' || data.type === 'validate' || data.type === 'styleReference') {
      return null;
    }
    
    // Helper to transform project/result objects to SearchResult format
    const transformProject = (p: any): SearchResult => ({
      id: p.id || p.project_id || '',
      name: p.title || p.name || 'Project',
      imageUrl: p.thumbnail || p.thumb_url || '',
      url: p.thumbnail || p.thumb_url || '',
      buildingType: p.attributes?.typology || p.typology || '',
      climate: p.attributes?.climate ? [p.attributes.climate] : [],
      matchPercentage: 90,
      similarityScore: 0.9,
      visualScore: 0.9,
      spatialScore: 0.9,
      attributeScore: 0.9,
      typology: p.attributes?.typology || p.typology || '',
    });
    
    const transformResult = (r: any, idx: number): SearchResult => ({
      id: String(r.project_id || r.id || `result_${idx}`),
      name: String(r.title || r.project_id || 'Result'),
      imageUrl: r.thumb_url ? toAbsoluteUrl(r.thumb_url) : undefined,
      url: r.thumb_url ? toAbsoluteUrl(r.thumb_url) : undefined,
      buildingType: r.typology || '',
      climate: r.climate_bin ? [r.climate_bin] : [],
      matchPercentage: Math.max(10, 100 - idx),
      similarityScore: r.score ?? (1 - (r.distance ?? 0.5)),
      visualScore: 0.8,
      spatialScore: 0.8,
      attributeScore: 0.8,
      typology: r.typology || '',
    });
    
    // Check for projects array (from Precedent nodes or execution results)
    if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
      return data.projects.map(transformProject);
    }
    
    // Check for executionResult with projects array (from ResultsNode or TextNode)
    if (data.executionResult?.projects && Array.isArray(data.executionResult.projects) && data.executionResult.projects.length > 0) {
      return data.executionResult.projects.map(transformProject);
    }
    
    // Check for executionResult with results array
    if (data.executionResult?.results && Array.isArray(data.executionResult.results) && data.executionResult.results.length > 0) {
      return data.executionResult.results.map(transformResult);
    }
    
    // Check for executionResult.output array (from ResultsNode)
    if (data.executionResult?.output && Array.isArray(data.executionResult.output) && data.executionResult.output.length > 0) {
      return data.executionResult.output.map(transformProject);
    }
    
    return null;
  }, [selectedNode]);

  const performTextSearch = useCallback(async (query: string) => {
    const q = query.trim();
    if (!q) return;

    setIsSearching(true);
    setHasSearched(true);
    setCanvasHasSearched(true);
    try {
      const resp = await searchByText(q, { topK: 50 });
      const mapped: SearchResult[] = (resp.results || []).map((r: any, idx: number) => {
        const baseScore = 0.65 + Math.random() * 0.25;
        const imageUrl = toAbsoluteUrl(r.thumb_url) || undefined;
        return {
          id: String(r.project_id || `text_${idx}`),
          name: String(r.title || r.project_id || 'Result'),
          imageUrl,
          url: imageUrl,
          buildingType: r.typology || undefined,
          climate: r.climate_bin ? [String(r.climate_bin)] : [],
          matchPercentage: Math.max(10, 100 - idx),
          similarityScore: Math.max(0.1, 1 - idx / 100),
          visualScore: Math.max(0.3, Math.min(1.0, baseScore)),
          spatialScore: Math.max(0.3, Math.min(1.0, baseScore)),
          attributeScore: Math.max(0.3, Math.min(1.0, baseScore)),
          typology: r.typology ? String(r.typology) : undefined,
        } as any;
      });
      setSearchResults(mapped);
      setStoreQuery(q);
    } catch (error) {
      // HONEST FAILURE — a precedent tool must never invent buildings. When the
      // index is unreachable, clear results and say so; do NOT fabricate matches.
      console.error('Text search failed:', error);
      setSearchResults([]);
      setStoreQuery(q);
      toast.error("Couldn't reach the index", {
        description: "Results weren't updated. Check your connection and try again.",
      });
    } finally {
      setIsSearching(false);
    }
  }, [setIsSearching, setHasSearched, setSearchResults, setStoreQuery, setCanvasHasSearched]);

  // If URL provides a query (e.g. /results?q=...), run a text search on load.
  useEffect(() => {
    if (!initialSearchQuery.trim()) return;
    if (searchResults.length > 0) return;
    performTextSearch(initialSearchQuery);
  }, [initialSearchQuery, searchResults.length, performTextSearch]);

  // Track if we've already handled the image param
  const imageParamHandledRef = useRef(false);
  
  // Track if we've already handled the query param for canvas node creation
  const queryParamHandledRef = useRef(false);

  // Create an image node if imageParam is present in URL
  useEffect(() => {
    if (imageParam && !imageParamHandledRef.current) {
      imageParamHandledRef.current = true;
      const imageNode = createImageNode(
        { x: 100, y: 200 },
        imageParam
      );
      addNodes([imageNode]);
    }
  }, [imageParam, addNodes]);
  
  // Create a text node with query, connect to a results node, and auto-execute
  useEffect(() => {
    const query = initialSearchQuery.trim();
    if (!query) return;
    if (queryParamHandledRef.current) return;
    if (nodes.length > 0) return; // Don't add if there are already nodes on canvas
    
    queryParamHandledRef.current = true;
    
    // Create a text node with the search query
    const textNode = createTextNode(
      { x: 200, y: 150 },
      query
    );
    
    // Create a results node positioned to the right of the text node
    const resultsNode = createResultsNode(
      { x: 650, y: 100 },
      0
    );
    
    // Add both nodes
    const { addEdges } = useCanvasStore.getState();
    addNodes([textNode, resultsNode]);
    
    // Create an edge connecting text node output to results node input
    const edge = {
      id: `edge-${textNode.id}-${resultsNode.id}`,
      source: textNode.id,
      sourceHandle: 'output',
      target: resultsNode.id,
      targetHandle: 'input',
    };
    
    // Add the edge after a brief delay to ensure nodes are added
    setTimeout(() => {
      addEdges([edge]);
      
      // Execute from the results node (triggers upstream text node first)
      const { executeFromNode, setSelectedNodes } = useCanvasStore.getState();
      executeFromNode(resultsNode.id).then(() => {
        // Select the results node after execution so its results appear in the panel
        setSelectedNodes([resultsNode.id]);
      });
    }, 100);
  }, [initialSearchQuery, nodes.length, addNodes]);

  // Filter results
  const filteredResults = useMemo(() => {
    return searchResults.filter((result) => {
      const typologyMatch = filters.typology.length === 0 || 
        filters.typology.includes(result.typology || '');
      
      const resultClimate = Array.isArray(result.climate) 
        ? result.climate 
        : result.climate 
          ? [result.climate] 
          : [];
      const climateMatch = filters.climate.length === 0 || 
        filters.climate.some(c => 
          resultClimate.some(rc => 
            rc.toLowerCase().includes(c.toLowerCase()) || 
            c.toLowerCase().includes(rc.toLowerCase())
          )
        );
      
      return typologyMatch && climateMatch;
    });
  }, [searchResults, filters]);

  const handleDragStart = useCallback((e: React.DragEvent, project: SearchResult) => {
    e.dataTransfer.setData('application/archipedia-precedent', JSON.stringify(project));
  }, []);

  // Add node to canvas
  const addNodeToCanvas = useCallback((type: string) => {
    const position = {
      x: 50 + Math.random() * 200,
      y: 50 + Math.random() * 200,
    };
    
    let newNode: ReturnType<typeof createTextNode> | null = null;
    switch (type) {
      case 'text':
        newNode = createTextNode(position, '');
        break;
      case 'image':
        newNode = createImageNode(position);
        break;
      case 'attributeFilter':
        newNode = createAttributeFilterNode(position);
        break;
      case 'scalar':
        newNode = createScalarNode(position);
        break;
      case 'results':
        newNode = createResultsNode(position, 0);
        break;
      case 'operatorAND':
        newNode = createOperatorANDNode(position);
        break;
      case 'operatorOR':
        newNode = createOperatorORNode(position);
        break;
      case 'operatorNOT':
        newNode = createOperatorNOTNode(position);
        break;
      case 'generate':
        newNode = createGenerateNode(position);
        break;
      case 'validate':
        newNode = createValidateNode(position);
        break;
      case 'styleReference':
        newNode = createStyleReferenceNode(position);
        break;
      default:
        console.warn(`Unknown node type: ${type}, defaulting to text node`);
        newNode = createTextNode(position, '');
        break;
    }

    if (newNode) {
      addNodes([newNode]);
      setSelectedNodeType(null);
    } else {
      console.error(`Failed to create node of type: ${type}`);
    }
  }, [addNodes, setSelectedNodeType]);

  // Execute workflow from Recipe Builder
  const handleExecuteWorkflow = useCallback((workflow: any) => {
    const startX = 100;
    let currentX = startX;
    const startY = 200;
    let currentY = startY;
    const nodeSpacing = 350;

    const workflowNodes: any[] = [];

    workflow.nodes.forEach((nodeConfig: any, index: number) => {
      const position = { x: currentX, y: currentY };
      let newNode: any = null;

      if (nodeConfig.type === 'text') {
        newNode = createTextNode(position, 'Synthesize design principles...');
        newNode.data.prompt = 'Synthesize design principles from precedents';
      }

      if (newNode) {
        workflowNodes.push(newNode);
        currentX += nodeSpacing;
      }
    });

    addNodes(workflowNodes);
  }, [addNodes]);

  // Import Precedent Stack
  const handleImportPrecedentStack = useCallback(() => {
    const selectedProjects = filteredResults.slice(0, 3).map((result): PrecedentProject => ({
      id: result.id,
      title: result.name,
      thumbnail: result.imageUrl || result.url || '',
      attributes: {
        circulation: result.typology || '',
        materiality: result.materials?.join('+') || '',
        climate: result.climate || '',
      },
    }));

    const position = {
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
    };

    const stackNode = createPrecedentNode(position, selectedProjects);
    addNodes([stackNode]);
  }, [filteredResults, addNodes]);

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--concrete-50)',
        overflow: 'hidden',
      }}
    >
      <AppHeader active="canvas" />

      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden', position: 'relative' }}>
      {/* ===== LEFT (75%) = CANVAS ===== */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          width: '75%',
        }}
      >
        {/* Canvas docked toolbar — dark, to sit on the black studio ground.
            RUN is the one Signal action; it is inert until there's a graph. */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--studio-ground-2, #16150f)',
            border: '1px solid var(--studio-line)',
            boxShadow: '0 8px 24px -12px rgba(0,0,0,0.7)',
            padding: '6px 8px',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {/* RUN — runs the whole graph; disabled when the canvas is empty */}
          <button
            onClick={runGraph}
            disabled={nodes.length === 0 || isRunning}
            title={nodes.length === 0 ? 'Add nodes to run the graph' : 'Run the whole graph'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.12em',
              padding: '7px 16px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: nodes.length === 0 ? 'rgba(255,255,255,0.06)' : 'var(--signal)',
              color: nodes.length === 0 ? 'var(--studio-stone-dim)' : '#FFFFFF',
              cursor: nodes.length === 0 || isRunning ? 'not-allowed' : 'pointer',
              fontWeight: 500,
              opacity: isRunning ? 0.8 : 1,
              transition: 'background-color var(--dur-1) var(--ease-press)',
            }}
            onMouseEnter={(e) => { if (nodes.length > 0 && !isRunning) e.currentTarget.style.backgroundColor = 'var(--signal-hover)'; }}
            onMouseLeave={(e) => { if (nodes.length > 0) e.currentTarget.style.backgroundColor = 'var(--signal)'; }}
          >
            <span style={{
              width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: nodes.length === 0 ? 'var(--studio-stone-dim)' : '#fff',
              animation: isRunning ? 'an-square-pulse 1s linear infinite' : 'none',
            }} />
            {isRunning ? 'RUNNING…' : 'RUN'}
          </button>

          <div style={{ width: 1, height: 22, background: 'var(--studio-line)' }} />

          <UserButton />
        </div>

        {/* Canvas Content */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            background: 'var(--concrete-50)',
          overflow: 'hidden',
        }}
      >
          <NodeCanvas />

        </div>

        {/* The unified left rail (Palette) + empty-canvas templates now live
            inside <NodeCanvas/> — no separate legacy palette here. */}
      </div>

      {/* ===== RIGHT PANEL = RESEARCH (collapsible) ===== */}

      {/* Floating "Research" re-opener tab — visible only when panel is collapsed */}
      {researchPanelCollapsed && (
        <button
          onClick={() => setResearchPanelCollapsed(false)}
          title="Open Research panel"
          style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 40,
            background: 'var(--studio-ground-2)',
            border: '1px solid var(--studio-line-strong)',
            borderRight: 'none',
            borderRadius: '6px 0 0 6px',
            color: 'var(--studio-stone)',
            fontFamily: 'var(--font-primary)',
            fontSize: '10px',
            fontWeight: 400,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '14px 8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          Research
          <ChevronRight size={12} />
        </button>
      )}

      {/* Panel itself */}
      {!researchPanelCollapsed && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid var(--studio-line-strong)',
            width: '25%',
            minWidth: 0,
            background: 'var(--studio-ground-solid)',
            position: 'relative',
          }}
        >
          {/* Panel header */}
          <div
            style={{
              borderBottom: '1px solid var(--studio-line)',
              padding: '12px 16px',
              flexShrink: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            onClick={() => setResearchPanelCollapsed(true)}
          >
            <h3
              style={{
                fontFamily: 'var(--font-primary)',
                fontSize: '10px',
                fontWeight: 400,
                color: 'var(--studio-stone)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                margin: 0,
              }}
            >
              Research
            </h3>
            <ChevronRight size={14} color="var(--studio-stone-dim)" />
          </div>

          {/* Search Input */}
          <div
            style={{
              borderBottom: '1px solid var(--studio-line)',
              padding: '12px 16px',
              flexShrink: 0,
            }}
          >
            <input
              type="text"
              placeholder="Search precedents…"
              value={currentSearchQuery}
              onChange={(e) => setCurrentSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && currentSearchQuery.trim() && !isSearching) {
                  performTextSearch(currentSearchQuery);
                }
              }}
              style={{
                fontFamily: 'var(--font-primary)',
                fontSize: '12px',
                padding: '9px 12px',
                width: '100%',
                border: '1px solid var(--studio-line)',
                borderRadius: 'var(--radius-md)',
                boxSizing: 'border-box',
                background: 'transparent',
                color: 'var(--studio-ink)',
                outline: 'none',
              }}
            />
          </div>

          {/* Fusion Weights */}
          <div
            style={{
              borderBottom: '1px solid var(--studio-line)',
              padding: '14px 16px',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: '10px',
                  fontWeight: 400,
                  color: 'var(--studio-stone)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  margin: 0,
                }}
              >
                Fusion Weights
              </h3>
              <a
                href="/how-it-works"
                style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: '9px',
                  color: 'var(--signal)',
                  textDecoration: 'none',
                  letterSpacing: '0.04em',
                  opacity: 0.85,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.85')}
              >
                How weighting works →
              </a>
            </div>

            <style>{`
              .studio-range {
                width: 100%;
                height: 3px;
                border-radius: 2px;
                appearance: none;
                outline: none;
                cursor: pointer;
              }
              .studio-range::-webkit-slider-thumb {
                appearance: none;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: var(--studio-ink);
                cursor: pointer;
                box-shadow: 0 1px 3px rgba(0,0,0,0.5);
              }
              .studio-range::-moz-range-thumb {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: var(--studio-ink);
                cursor: pointer;
                border: none;
                box-shadow: 0 1px 3px rgba(0,0,0,0.5);
              }
              .studio-tooltip {
                position: relative;
                display: inline-flex;
                align-items: center;
              }
              .studio-tooltip .studio-tooltip-bubble {
                display: none;
                position: absolute;
                left: 18px;
                top: 50%;
                transform: translateY(-50%);
                background: var(--studio-ground-2);
                border: 1px solid var(--studio-line-strong);
                color: var(--studio-stone);
                font-family: var(--font-primary);
                font-size: 10px;
                line-height: 1.5;
                padding: 8px 10px;
                border-radius: 4px;
                width: 200px;
                z-index: 100;
                pointer-events: none;
                white-space: normal;
              }
              .studio-tooltip:hover .studio-tooltip-bubble,
              .studio-tooltip:focus-within .studio-tooltip-bubble {
                display: block;
              }
              .studio-tooltip-trigger {
                width: 14px;
                height: 14px;
                border-radius: 50%;
                border: 1px solid var(--studio-line-strong);
                color: var(--studio-stone-dim);
                font-family: var(--font-primary);
                font-size: 9px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                cursor: default;
                flex-shrink: 0;
                background: transparent;
                padding: 0;
                line-height: 1;
              }
              .studio-panel-input::placeholder {
                color: var(--studio-stone-dim);
              }
            `}</style>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                {
                  label: 'Visual',
                  key: 'visual' as const,
                  value: fusionWeights.visual,
                  tooltip: 'Pure visual similarity from the image embedding: facade, silhouette, geometry, material read.',
                  color: 'var(--signal)',
                  trackDim: 'rgba(31,63,255,0.18)',
                },
                {
                  label: 'Spatial',
                  key: 'spatial' as const,
                  value: fusionWeights.spatial,
                  tooltip: 'Massing & organization: courtyard, linear, tower, or cluster — the building\'s volumetric type.',
                  color: '#64B5FF',
                  trackDim: 'rgba(100,181,255,0.18)',
                },
                {
                  label: 'Regional',
                  key: 'attribute' as const,
                  value: fusionWeights.attribute,
                  tooltip: 'Climate & context: the locale and climate the project responds to.',
                  color: '#32C864',
                  trackDim: 'rgba(50,200,100,0.18)',
                },
              ].map((slider) => (
                <div key={slider.label}>
                  <div
                    style={{
                      fontFamily: 'var(--font-primary)',
                      fontSize: '9px',
                      fontWeight: 300,
                      color: 'var(--studio-stone)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>{slider.label}</span>
                      <span className="studio-tooltip">
                        <button
                          className="studio-tooltip-trigger"
                          tabIndex={0}
                          aria-label={`What is ${slider.label} weight?`}
                        >
                          ?
                        </button>
                        <span className="studio-tooltip-bubble">{slider.tooltip}</span>
                      </span>
                    </div>
                    <span style={{ color: 'var(--studio-stone-dim)' }}>{slider.value}%</span>
                  </div>
                  <input
                    type="range"
                    className="studio-range"
                    min="0"
                    max="100"
                    value={slider.value}
                    onChange={(e) => {
                      const newValue = parseInt(e.target.value);
                      const newWeights = { ...fusionWeights };
                      newWeights[slider.key] = newValue;
                      const total = newWeights.visual + newWeights.spatial + newWeights.attribute;
                      if (total > 0) {
                        setCanvasFusionWeights({
                          visual: Math.round((newWeights.visual / total) * 100),
                          spatial: Math.round((newWeights.spatial / total) * 100),
                          attribute: Math.round((newWeights.attribute / total) * 100),
                        });
                      }
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    style={{
                      background: `linear-gradient(to right, ${slider.color} 0%, ${slider.color} ${slider.value}%, ${slider.trackDim} ${slider.value}%, ${slider.trackDim} 100%)`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Results Grid */}
          {(hasSearched || selectedNodeResults || searchResults.length > 0) && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div
                style={{
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--studio-line)',
                  fontSize: '10px',
                  fontWeight: 400,
                  fontFamily: 'var(--font-primary)',
                  color: 'var(--studio-stone)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {selectedNodeResults ? (
                    <span>Node Results ({selectedNodeResults.length})</span>
                  ) : (
                    <>
                      <span>Ranked Results {!isSearching && `(${filteredResults.length})`}</span>
                      {isSearching && (
                        <div
                          style={{
                            width: '10px',
                            height: '10px',
                            border: '1.5px solid var(--studio-line-strong)',
                            borderTop: '1.5px solid var(--studio-stone)',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                          }}
                        />
                      )}
                    </>
                  )}
                </div>
                {selectedNodeResults && selectedNode ? (
                  <span style={{ fontSize: '9px', color: 'var(--studio-stone-dim)', fontStyle: 'italic' }}>
                    {(selectedNode.data as any).type === 'precedent' ? 'Precedent Node' : `${(selectedNode.data as any).type} node`}
                  </span>
                ) : currentSearchQuery && !isSearching ? (
                  <span style={{ fontSize: '9px', color: 'var(--studio-stone-dim)', fontStyle: 'italic' }}>
                    "{currentSearchQuery}"
                  </span>
                ) : null}
              </div>
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: isSearching && !selectedNodeResults ? 'center' : 'flex-start',
                  justifyContent: isSearching && !selectedNodeResults ? 'center' : 'flex-start',
                }}
              >
                {isSearching && !selectedNodeResults ? (
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        border: '2px solid var(--studio-line)',
                        borderTop: '2px solid var(--studio-stone)',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        margin: '0 auto 10px',
                      }}
                    />
                    <div
                      style={{
                        fontFamily: 'var(--font-primary)',
                        fontSize: '10px',
                        color: 'var(--studio-stone-dim)',
                      }}
                    >
                      Searching precedents...
                    </div>
                  </div>
                ) : (
                  <ResultsGridCompact
                    projects={selectedNodeResults || filteredResults}
                    weights={fusionWeights}
                    onDragStart={handleDragStart}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
