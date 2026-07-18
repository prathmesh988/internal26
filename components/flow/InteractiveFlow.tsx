import React, { useState, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  MiniMap,
  Controls,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ComplaintWorkflowNode from './ComplaintWorkflowNode';

const snapGrid: [number, number] = [20, 20];
const nodeTypes = {
  selectorNode: ComplaintWorkflowNode,
};

const defaultViewport = { x: 0, y: 0, zoom: 1.1 };

const getPriorityByCategory = (cat: string) => {
  switch (cat) {
    case 'OVERFLOW': return 'HIGH Priority';
    case 'ILLEGAL_DUMPING': return 'CRITICAL Priority';
    case 'SPILL': return 'MEDIUM Priority';
    default: return 'LOW Priority';
  }
};

const getDispatchTimeByCategory = (cat: string) => {
  switch (cat) {
    case 'OVERFLOW': return 'SLA: 24h';
    case 'ILLEGAL_DUMPING': return 'SLA: 4h';
    default: return 'SLA: 48h';
  }
};

export default function InteractiveFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [category, setCategory] = useState('MISSED_PICKUP');

  const onCategoryChange = useCallback((newCategory: string) => {
    setCategory(newCategory);
  }, []);

  useEffect(() => {
    setNodes([
      {
        id: '1',
        type: 'input',
        data: { 
          label: (
            <div className="text-left">
              <div className="font-bold text-foreground">1. Citizen Filing</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Report submitted via WasteFlow app</p>
            </div>
          ) 
        },
        position: { x: -80, y: 80 },
        sourcePosition: 'right',
        className: 'bg-card border-2 border-border rounded-xl shadow-md p-3 w-56 text-foreground',
      },
      {
        id: '2',
        type: 'selectorNode',
        data: { onChange: onCategoryChange, category: category },
        position: { x: 200, y: 50 },
      },
      {
        id: '3',
        type: 'output',
        data: { 
          label: (
            <div className="text-left">
              <div className="font-bold text-foreground">3A. Route Dispatcher</div>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">{getPriorityByCategory(category)}</p>
              <p className="text-[10px] text-muted-foreground">{getDispatchTimeByCategory(category)} • Dispatching team</p>
            </div>
          ) 
        },
        position: { x: 580, y: 20 },
        targetPosition: 'left',
        className: 'bg-card border-2 border-emerald-500/20 rounded-xl shadow-md p-3 w-56 text-foreground',
      },
      {
        id: '4',
        type: 'output',
        data: { 
          label: (
            <div className="text-left">
              <div className="font-bold text-foreground">3B. Citizen Rewards</div>
              <p className="text-[10px] text-blue-600 font-semibold mt-0.5">+50 WasteCoins Pending</p>
              <p className="text-[10px] text-muted-foreground">Credited on worker validation</p>
            </div>
          ) 
        },
        position: { x: 580, y: 150 },
        targetPosition: 'left',
        className: 'bg-card border-2 border-blue-500/20 rounded-xl shadow-md p-3 w-56 text-foreground',
      },
    ]);

    setEdges([
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        animated: true,
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
      },
      {
        id: 'e2a-3',
        source: '2',
        sourceHandle: 'a',
        target: '3',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 },
      },
      {
        id: 'e2b-4',
        source: '2',
        sourceHandle: 'b',
        target: '4',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      },
    ]);
  }, [category, onCategoryChange]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges],
  );

  return (
    <div className="h-[380px] w-full border-2 border-border rounded-2xl overflow-hidden shadow-inner relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        snapToGrid={true}
        snapGrid={snapGrid}
        defaultViewport={defaultViewport}
        fitView
        attributionPosition="bottom-left"
        colorMode="system"
        className="w-full h-full"
        style={{ background: 'var(--background)' }}
      >
        <Background gap={12} size={1} />
        <MiniMap 
          style={{ height: 80, width: 120 }} 
          className="!bg-card border rounded-lg overflow-hidden shadow-md"
          zoomable
          pannable
        />
        <Controls 
          className="bg-card border rounded-lg shadow-md"
        />
        <Panel position="top-right">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border shadow-sm text-[11px] font-semibold text-foreground bg-gradient-to-r from-card to-muted/20">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Interactive Simulator</span>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
