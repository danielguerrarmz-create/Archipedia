import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  ControlButton,
  MiniMap,
  NodeTypes,
  EdgeTypes,
  Connection,
  Node,
  NodeMouseHandler,
  ReactFlowInstance,
  Edge,
  EdgeMouseHandler,
  useStore,
} from 'reactflow';
import 'reactflow/dist/style.css';
import '../../styles/canvas.css';
import { useCanvasStore } from '../../stores/canvasStore';
import { arePortsCompatible } from '../../lib/NodeRegistry';
import { AnEdge } from './AnEdge';
import { Palette } from './Palette';
import { EmptyCanvas } from './EmptyCanvas';
import { consumePendingCanvasSeed } from '../../lib/canvasTemplates';
import { PrecedentNode } from '../Nodes/PrecedentNode';
import { TextNode } from '../Nodes/TextNode';
import { ImageNode } from '../Nodes/ImageNode';
import { AttributeFilterNode } from '../Nodes/AttributeFilterNode';
import { ScalarNode } from '../Nodes/ScalarNode';
import { OperatorANDNode } from '../Nodes/OperatorANDNode';
import { OperatorORNode } from '../Nodes/OperatorORNode';
import { OperatorNOTNode } from '../Nodes/OperatorNOTNode';
import { ResultsNode } from '../Nodes/ResultsNode';
import { GenerateNode } from '../Nodes/GenerateNode';
import { ValidateNode } from '../Nodes/ValidateNode';
import { StyleReferenceNode } from '../Nodes/StyleReferenceNode';
import { ChildNodeGroup } from './ChildNodeGroup';
import { NodeData, ParameterMatrix, PrecedentProject } from '../../types/nodes';
import { MultiplyOutputsDialog } from '../Dialogs/MultiplyOutputsDialog';
import { calculateGridPosition, calculateHorizontalLayout, calculateVerticalLayout } from '../../lib/layoutAlgorithms';
import { 
  createNode, 
  createPrecedentNode,
  createTextNode,
  createImageNode,
  createAttributeFilterNode,
  createScalarNode,
  createResultsNode,
  createOperatorANDNode,
  createOperatorORNode,
  createOperatorNOTNode,
  createGenerateNode,
  createValidateNode,
  createStyleReferenceNode,
} from '../../lib/nodeFactory';
import { SearchResult } from '../../stores/searchStore';
import { SelectionContextMenu } from '../ContextMenu/SelectionContextMenu';
import { TemplatesDialog } from '../Dialogs/TemplatesDialog';
import { CustomSelectionBox } from './CustomSelectionBox';

const nodeTypes: NodeTypes = {
  precedent: PrecedentNode,
  text: TextNode,
  image: ImageNode,
  attributeFilter: AttributeFilterNode,
  scalar: ScalarNode,
  operatorAND: OperatorANDNode,
  operatorOR: OperatorORNode,
  operatorNOT: OperatorNOTNode,
  results: ResultsNode,
  generate: GenerateNode,
  validate: ValidateNode,
  styleReference: StyleReferenceNode,
  default: TextNode,
};

const edgeTypes: EdgeTypes = {
  anEdge: AnEdge,
};

/** A mono zoom readout that reflects the live react-flow zoom. */
const ZoomReadout: React.FC = () => {
  const zoom = useStore((s) => s.transform[2]);
  return <div className="an-zoom-readout">{Math.round(zoom * 100)}%</div>;
};

interface NodeCanvasProps {
  initialPrecedents?: SearchResult[];
  onOpenTemplates?: () => void;
}

export const NodeCanvas: React.FC<NodeCanvasProps> = ({ initialPrecedents = [], onOpenTemplates }) => {
  const [showMultiplyDialog, setShowMultiplyDialog] = useState(false);
  const [selectedNodeForMultiply, setSelectedNodeForMultiply] = useState<Node<NodeData> | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Expose templates dialog to parent
  useEffect(() => {
    if (onOpenTemplates) {
      // Store the open function in a way parent can call it
      (window as any).__openTemplates = () => setShowTemplatesDialog(true);
    }
  }, [onOpenTemplates]);
  const reactFlowWrapperRef = useRef<HTMLDivElement>(null);
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNodes,
    deleteNode,
    selectedNodes,
    groupNodes,
    ungroupNodes,
  } = useCanvasStore();

  // Convert search results to precedent nodes on mount
  useEffect(() => {
    if (initialPrecedents && Array.isArray(initialPrecedents) && initialPrecedents.length > 0 && nodes.length === 0) {
      const precedentProjects: PrecedentProject[] = initialPrecedents.map((result: SearchResult) => ({
        id: result.id,
        title: result.name,
        thumbnail: result.imageUrl || (typeof result.url === 'string' ? result.url : ''),
        attributes: {
          circulation: typeof result.typology === 'string' ? result.typology : '',
          materiality: Array.isArray(result.materials) ? result.materials.join('+') : (result.materials || ''),
          climate:
            Array.isArray(result.climate)
              ? result.climate.join('+')
              : (typeof result.climate === 'string' ? result.climate : ''),
        },
      }));

      const precedentNode = createPrecedentNode(
        { x: 100, y: 200 },
        precedentProjects
      );
      addNodes([precedentNode]);
    }
  }, [initialPrecedents, nodes.length, addNodes]);

  // "Open in canvas" hand-off: a Precedent seed stashed by openProjectInCanvas().
  useEffect(() => {
    if (nodes.length !== 0) return;
    const seed = consumePendingCanvasSeed();
    if (seed && seed.length > 0) {
      const node = createPrecedentNode({ x: 120, y: 200 }, seed);
      (node as any).selected = true;
      addNodes([node]);
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnect = useCallback(
    (connection: Connection) => {
      // Only connect if we're still in connecting state (Esc not pressed)
      if (isConnecting) {
        onConnect(connection);
      }
      setIsConnecting(false);
    },
    [onConnect, isConnecting]
  );

  const handleConnectStart = useCallback(() => {
    setIsConnecting(true);
  }, []);

  const handleConnectEnd = useCallback(() => {
    setIsConnecting(false);
  }, []);

  // Handle Esc key to cancel connection/unselect nodes and Delete/Backspace to delete edges/nodes
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isConnecting) {
          event.preventDefault();
          setIsConnecting(false);
        } else if (selectedNodes.length > 0) {
          // Unselect all nodes
          event.preventDefault();
          onNodesChange(selectedNodes.map(nodeId => ({ type: 'select', id: nodeId, selected: false })));
        } else if (selectedEdgeId) {
          // Unselect edge
          event.preventDefault();
          setSelectedEdgeId(null);
        }
      } else if ((event.key === 'Backspace' || event.key === 'Delete')) {
        // Prioritize deleting selected nodes over edges
        if (selectedNodes.length > 0) {
          event.preventDefault();
          selectedNodes.forEach(nodeId => {
            deleteNode(nodeId);
          });
        } else if (selectedEdgeId) {
          // Delete selected edge
          event.preventDefault();
          const edgeToRemove = edges.find(e => {
            const edgeId = e.id || `${e.source}-${e.sourceHandle || ''}-${e.target}-${e.targetHandle || ''}`;
            return edgeId === selectedEdgeId;
          });
          if (edgeToRemove) {
            onEdgesChange([{ type: 'remove', id: edgeToRemove.id || selectedEdgeId }]);
            setSelectedEdgeId(null);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isConnecting, selectedEdgeId, selectedNodes, edges, onEdgesChange, onNodesChange, deleteNode]);

  const handleEdgeMouseEnter: EdgeMouseHandler = useCallback((event, edge) => {
    const edgeId = edge.id || `${edge.source}-${edge.sourceHandle || ''}-${edge.target}-${edge.targetHandle || ''}`;
    setHoveredEdgeId(edgeId);
  }, []);

  const handleEdgeMouseLeave: EdgeMouseHandler = useCallback(() => {
    setHoveredEdgeId(null);
  }, []);

  const handleEdgeClick: EdgeMouseHandler = useCallback((event, edge) => {
    event.stopPropagation();
    const edgeId = edge.id || `${edge.source}-${edge.sourceHandle || ''}-${edge.target}-${edge.targetHandle || ''}`;
    setSelectedEdgeId(edgeId === selectedEdgeId ? null : edgeId);
  }, [selectedEdgeId]);

  const handlePaneClick = useCallback(() => {
    // Deselect edge when clicking on empty canvas
    setSelectedEdgeId(null);
    setContextMenu(null);
  }, []);

  const handlePaneContextMenu = useCallback((event: React.MouseEvent) => {
    // Only show context menu if multiple nodes are selected
    if (selectedNodes.length >= 2) {
      event.preventDefault();
      setContextMenu({ x: event.clientX, y: event.clientY });
    }
  }, [selectedNodes.length]);

  const handleGroupNodes = useCallback(() => {
    if (selectedNodes.length >= 2) {
      groupNodes(selectedNodes);
      setContextMenu(null);
    }
  }, [selectedNodes, groupNodes]);

  const handleUngroupNodes = useCallback(() => {
    if (selectedNodes.length > 0) {
      // Find the group ID of the first selected node
      const firstNode = nodes.find(n => selectedNodes.includes(n.id));
      if (firstNode && (firstNode.data as any).groupId) {
        const groupId = (firstNode.data as any).groupId;
        ungroupNodes(groupId);
        setContextMenu(null);
      }
    }
  }, [selectedNodes, nodes, ungroupNodes]);

  // Check if all selected nodes are in the same group
  const canUngroup = useMemo(() => {
    if (selectedNodes.length === 0) return false;
    const selectedNodeData = nodes
      .filter(n => selectedNodes.includes(n.id))
      .map(n => (n.data as any).groupId);
    if (selectedNodeData.length === 0) return false;
    const firstGroupId = selectedNodeData[0];
    return firstGroupId && selectedNodeData.every(g => g === firstGroupId);
  }, [selectedNodes, nodes]);

  const handleSaveWorkflow = useCallback(() => {
    // Open templates dialog in save mode
    setShowTemplatesDialog(true);
    setContextMenu(null);
  }, []);

  const handleLoadTemplate = useCallback((template: { nodes: Node<NodeData>[]; edges: Edge[] }) => {
    // Clear current canvas and load template
    const newNodes = template.nodes.map(node => ({
      ...node,
      position: {
        x: node.position.x + 100, // Offset slightly
        y: node.position.y + 100,
      },
    }));
    addNodes(newNodes);
      // Add edges
      template.edges.forEach(edge => {
        onConnect({
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle || null,
          targetHandle: edge.targetHandle || null,
        });
      });
  }, [addNodes, onConnect]);

  const handleNodeContextMenu: NodeMouseHandler = useCallback((event, node) => {
    event.preventDefault();
    setSelectedNodeForMultiply(node);
    setShowMultiplyDialog(true);
  }, []);

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Calculate selection box bounds for multi-select
  const selectionBox = useMemo(() => {
    if (selectedNodes.length < 2 || !reactFlowInstance) return null;
    
    const selectedNodeObjects = nodes.filter(n => selectedNodes.includes(n.id));
    if (selectedNodeObjects.length === 0) return null;

    // Calculate bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    selectedNodeObjects.forEach(node => {
      const position = node.position;
      const width = (node.width as number) || 300;
      const height = (node.height as number) || 200;
      
      minX = Math.min(minX, position.x);
      minY = Math.min(minY, position.y);
      maxX = Math.max(maxX, position.x + width);
      maxY = Math.max(maxY, position.y + height);
    });

    // Convert to screen coordinates
    const screenMin = reactFlowInstance.project({ x: minX, y: minY });
    const screenMax = reactFlowInstance.project({ x: maxX, y: maxY });

    return {
      x: screenMin.x,
      y: screenMin.y,
      width: screenMax.x - screenMin.x,
      height: screenMax.y - screenMin.y,
    };
  }, [selectedNodes, nodes, reactFlowInstance]);

  // Handle middle mouse button panning
  useEffect(() => {
    if (!reactFlowInstance) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
        setIsPanning(true);
        setPanStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning && reactFlowInstance) {
        e.preventDefault();
        const deltaX = e.clientX - panStart.x;
        const deltaY = e.clientY - panStart.y;
        const viewport = reactFlowInstance.getViewport();
        reactFlowInstance.setViewport({ ...viewport, x: viewport.x + deltaX, y: viewport.y + deltaY });
        setPanStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 1) {
        setIsPanning(false);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [reactFlowInstance, isPanning, panStart]);

  const handlePaneDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      
      // Try to get precedent data first
      let data = event.dataTransfer.getData('application/archipedia-precedent');
      let nodeType = 'precedent';
      
      // If no precedent data, try other node types
      if (!data) {
        data = event.dataTransfer.getData('application/archipedia-node-type');
        if (data) {
          nodeType = data;
        } else {
          // If no recognized data, don't create a node
          return;
        }
      }

      if (reactFlowInstance) {
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        if (nodeType === 'precedent' && data) {
          try {
            const project: SearchResult = JSON.parse(data);
            const precedentProject: PrecedentProject = {
              id: project.id,
              title: project.name,
              thumbnail: project.imageUrl || project.url || '',
              attributes: {
                circulation: project.typology || '',
                materiality: Array.isArray(project.materials) ? project.materials.join('+') : (project.materials || ''),
                climate: Array.isArray(project.climate) ? project.climate.join('+') : (typeof project.climate === 'string' ? project.climate : ''),
              },
            };

            const newNode = createPrecedentNode(position, [precedentProject]);
            console.log('[NodeCanvas] Creating precedent node:', newNode.type, newNode.data.type);
            addNodes([newNode]);
          } catch (error) {
            console.error('Error parsing dropped data:', error);
          }
        } else if (['text', 'image', 'attributeFilter', 'scalar', 'results', 'operatorAND', 'operatorOR', 'operatorNOT', 'generate', 'validate', 'styleReference'].includes(nodeType)) {
          // Handle other node types
          let newNode: Node<NodeData> | null = null;
          
          switch (nodeType) {
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
          }
          
          if (newNode) {
            console.log('[NodeCanvas] Creating node:', nodeType, newNode.type, newNode.data.type);
            addNodes([newNode]);
          }
        }
      }
    },
    [addNodes, reactFlowInstance]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleMultiplyConfirm = useCallback(
    (matrix: ParameterMatrix, layoutMode: 'grid' | 'horizontal' | 'vertical') => {
      if (!selectedNodeForMultiply) return;

      const combinations = matrix.axis1.flatMap((a1) =>
        matrix.axis2.map((a2) => ({ a1, a2 }))
      );

      const basePosition = selectedNodeForMultiply.position;
      const childNodes = combinations.map((combo, index) => {
        let position;
        switch (layoutMode) {
          case 'grid':
            position = calculateGridPosition(index, combinations.length);
            break;
          case 'horizontal':
            position = calculateHorizontalLayout(index);
            break;
          case 'vertical':
            position = calculateVerticalLayout(index);
            break;
        }

        return createNode(
          selectedNodeForMultiply.data.type,
          {
            x: basePosition.x + position.x + 320,
            y: basePosition.y + position.y,
          },
          {
            ...selectedNodeForMultiply.data,
            label: `${selectedNodeForMultiply.data.label} (${combo.a1}, ${combo.a2})`,
            variant: combo,
          }
        );
      });

      addNodes(childNodes);
      setShowMultiplyDialog(false);
      setSelectedNodeForMultiply(null);
    },
    [selectedNodeForMultiply, addNodes]
  );

  // All edges adopt the custom AnEdge; styling is driven by class/state inside it.
  const styledEdges = useMemo(() => {
    return edges.map((edge) => {
      const edgeId = edge.id || `${edge.source}-${edge.sourceHandle || ''}-${edge.target}-${edge.targetHandle || ''}`;
      const isSelected = selectedEdgeId === edgeId;
      const srcNode = nodes.find((n) => n.id === edge.source);
      const running = (srcNode?.data as any)?.executionStatus === 'running';

      return {
        ...edge,
        id: edgeId,
        type: 'anEdge',
        data: { ...(edge.data || {}), running },
        selected: isSelected,
      };
    });
  }, [edges, selectedEdgeId, nodes]);

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'anEdge',
      animated: false,
    }),
    []
  );

  // Type-aware connection validation wired into react-flow.
  const isValidConnection = useCallback(
    (connection: Connection): boolean => {
      if (!connection.source || !connection.target) return false;
      if (connection.source === connection.target) return false;
      const src = nodes.find((n) => n.id === connection.source);
      const tgt = nodes.find((n) => n.id === connection.target);
      if (!src || !tgt) return false;
      // If either port id is unknown to the registry, fall back to permissive.
      return arePortsCompatible(
        (src.data as any).type,
        connection.sourceHandle || 'output',
        (tgt.data as any).type,
        connection.targetHandle || 'input'
      );
    },
    [nodes]
  );

  // Stable per-canvas index so each node can show a P·NN stamp.
  const nodeIndexById = useMemo(() => {
    const m: Record<string, number> = {};
    nodes.forEach((n, i) => { m[n.id] = i; });
    return m;
  }, [nodes]);

  // EmptyCanvas hands us a pre-wired starter graph; stamp it + fit.
  const handleSeedTemplate = useCallback(
    (seed: { nodes: Node<NodeData>[]; edges: Array<Partial<Connection>> }) => {
      addNodes(seed.nodes);
      seed.edges.forEach((edge) => {
        onConnect({
          source: edge.source || null,
          target: edge.target || null,
          sourceHandle: edge.sourceHandle || null,
          targetHandle: edge.targetHandle || null,
        } as Connection);
      });
      requestAnimationFrame(() => {
        reactFlowInstance?.fitView({ padding: 0.35 });
      });
    },
    [addNodes, onConnect, reactFlowInstance]
  );

  return (
    <>
      <div
        ref={reactFlowWrapperRef}
        className="an-canvas-wrap"
        onDragOver={handleDragOver}
        onDrop={handlePaneDrop}
      >
        {/* Static concrete grain — never animated */}
        <div className="an-canvas-grain" aria-hidden />

        <ReactFlow
          nodes={nodes.map(node => {
            const nodeData = node.data as any;
            const isGrouped = !!nodeData.groupId;
            // Grouped nodes can be dragged, but they'll move together
            // Selected nodes cannot be dragged (for slider interaction)
            return {
              ...node,
              data: { ...nodeData, __index: nodeIndexById[node.id] ?? 0 },
              draggable: !selectedNodes.includes(node.id) && !isGrouped ? true : !selectedNodes.includes(node.id),
            };
          })}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onConnectStart={handleConnectStart}
          onConnectEnd={handleConnectEnd}
          onEdgeMouseEnter={handleEdgeMouseEnter}
          onEdgeMouseLeave={handleEdgeMouseLeave}
          onEdgeClick={handleEdgeClick}
          onPaneClick={handlePaneClick}
          onPaneContextMenu={handlePaneContextMenu}
          onNodeContextMenu={handleNodeContextMenu}
          isValidConnection={isValidConnection}
          selectNodesOnDrag={false}
          selectionOnDrag={true}
          onInit={setReactFlowInstance}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          fitViewOptions={{ padding: 0.35 }}
          minZoom={0.25}
          maxZoom={1.5}
          attributionPosition="bottom-left"
          panOnDrag={true}
          panOnScroll={false}
          zoomOnScroll={true}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          connectionLineType={"step" as any}
          connectionLineStyle={{ stroke: 'var(--signal)', strokeWidth: 1.5, strokeDasharray: '4 4' }}
          snapToGrid={true}
          snapGrid={[24, 24]}
        >
          {/* Two-layer modular grid: fine lines + coarser node dots */}
          <Background
            id="an-lines"
            variant={BackgroundVariant.Lines}
            gap={24}
            color="rgba(21,22,26,.05)"
          />
          <Background
            id="an-dots"
            variant={BackgroundVariant.Dots}
            gap={120}
            size={1.5}
            color="rgba(21,22,26,.10)"
          />
          <Controls showZoom showFitView showInteractive={false}>
            <ControlButton title="Zoom level" onClick={() => reactFlowInstance?.fitView({ padding: 0.35 })}>
              <ZoomReadout />
            </ControlButton>
          </Controls>
          <MiniMap
            pannable
            zoomable
            nodeColor={(node: Node<NodeData>) => {
              const status = (node.data as any)?.executionStatus;
              const local = (node.data as any)?.status;
              const selected = (node as any).selected;
              if (selected || status === 'running' || local === 'generating' || local === 'validating') {
                return 'var(--signal)';
              }
              return 'var(--ink-400)';
            }}
            nodeStrokeColor="transparent"
            maskColor="rgba(21,22,26,0.06)"
            style={{
              backgroundColor: 'var(--concrete-100)',
              boxShadow: 'var(--raised)',
              borderRadius: 'var(--radius-lg)',
              border: 'none',
            }}
          />
        </ReactFlow>

        {/* ONE unified left rail */}
        <Palette onSeedTemplate={handleSeedTemplate} reactFlowInstance={reactFlowInstance} />

        {/* Empty-state: starter templates */}
        {nodes.length === 0 && <EmptyCanvas onSeed={handleSeedTemplate} />}
      </div>

      {showMultiplyDialog && (
        <MultiplyOutputsDialog
          open={showMultiplyDialog}
          onClose={() => {
            setShowMultiplyDialog(false);
            setSelectedNodeForMultiply(null);
          }}
          onConfirm={handleMultiplyConfirm}
        />
      )}

      {selectionBox && selectedNodes.length >= 2 && (
        <CustomSelectionBox
          x={selectionBox.x}
          y={selectionBox.y}
          width={selectionBox.width}
          height={selectionBox.height}
          onGroup={handleGroupNodes}
          onUngroup={canUngroup ? handleUngroupNodes : undefined}
          onSaveWorkflow={handleSaveWorkflow}
          selectedCount={selectedNodes.length}
          canUngroup={canUngroup}
        />
      )}

      {contextMenu && selectedNodes.length >= 2 && (
        <SelectionContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onGroup={handleGroupNodes}
          onUngroup={canUngroup ? handleUngroupNodes : undefined}
          onSaveWorkflow={handleSaveWorkflow}
          selectedCount={selectedNodes.length}
          canUngroup={canUngroup}
        />
      )}

      {showTemplatesDialog && (
        <TemplatesDialog
          open={showTemplatesDialog}
          onClose={() => setShowTemplatesDialog(false)}
          onLoadTemplate={handleLoadTemplate}
          currentNodes={nodes}
          currentEdges={edges}
        />
      )}
    </>
  );
};

