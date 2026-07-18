import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

interface ComplaintWorkflowNodeProps {
  data: {
    category: string;
    onChange: (val: string) => void;
  };
}

export default memo(function ComplaintWorkflowNode({ data }: ComplaintWorkflowNodeProps) {
  return (
    <div className="bg-card border-2 border-primary/20 rounded-xl shadow-lg p-4 w-60 text-xs text-foreground bg-gradient-to-br from-card to-muted/20">
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-2 h-2 !bg-primary border-none" 
      />
      <div className="space-y-3">
        <div className="font-bold flex items-center gap-2">
          <span className="size-2 rounded-full bg-yellow-500 animate-ping" />
          <span className="text-primary font-bold">AI Workflow Dispatcher</span>
        </div>
        
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">
            Simulation Category
          </label>
          <select
            value={data.category}
            onChange={(e) => data.onChange(e.target.value)}
            className="w-full bg-background border rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary cursor-pointer text-foreground font-semibold"
          >
            <option value="MISSED_PICKUP">Missed Pickup</option>
            <option value="OVERFLOW">Overflowing Bins</option>
            <option value="SPILL">Spillage</option>
            <option value="ILLEGAL_DUMPING">Illegal Dumping</option>
          </select>
        </div>

        <div className="text-[10px] text-muted-foreground leading-relaxed">
          Routes priority routing logic & schedules alerts instantly.
        </div>
      </div>
      <Handle 
        type="source" 
        position={Position.Right} 
        id="a" 
        style={{ top: '35%' }} 
        className="w-2 h-2 !bg-emerald-500 border-none" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="b" 
        style={{ top: '65%' }} 
        className="w-2 h-2 !bg-blue-500 border-none" 
      />
    </div>
  );
});
