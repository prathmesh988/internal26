'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  GripVertical,
  MoreHorizontal,
  Columns3,
  Plus,
  Eye,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { PriorityBadge, StatusBadge } from '@/components/shared';

interface EnhancedTableProps {
  data: any[];
  onSelectionChange?: (selected: string[]) => void;
  onRowAction?: (action: string, rowId: string) => void;
}

export const EnhancedTable: React.FC<EnhancedTableProps> = ({
  data,
  onSelectionChange,
  onRowAction,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'id',
    'title',
    'ward',
    'priority',
    'status',
  ]);
  const [draggedRow, setDraggedRow] = useState<string | null>(null);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const allColumns = [
    { id: 'id', label: 'ID' },
    { id: 'title', label: 'Title' },
    { id: 'ward', label: 'Ward' },
    { id: 'priority', label: 'Priority' },
    { id: 'status', label: 'Status' },
  ];

  const handleSelectAll = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([]);
      onSelectionChange?.([]);
    } else {
      const allIds = data.map((row) => row.id);
      setSelectedRows(allIds);
      onSelectionChange?.(allIds);
    }
  };

  const handleSelectRow = (rowId: string) => {
    let updated: string[];
    if (selectedRows.includes(rowId)) {
      updated = selectedRows.filter((id) => id !== rowId);
    } else {
      updated = [...selectedRows, rowId];
    }
    setSelectedRows(updated);
    onSelectionChange?.(updated);
  };

  const handleToggleColumn = (columnId: string) => {
    let updated: string[];
    if (visibleColumns.includes(columnId)) {
      updated = visibleColumns.filter((id) => id !== columnId);
    } else {
      updated = [...visibleColumns, columnId];
    }
    setVisibleColumns(updated);
  };

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedRows.length} selected
          </span>
          {selectedRows.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex gap-2 ml-4"
            >
              <Button
                size="sm"
                variant="ghost"
                className="text-foreground/80 hover:bg-muted"
                onClick={() => onRowAction?.('delete', selectedRows.join(','))}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-2 relative">
          {/* Customize Columns Menu */}
          <div className="relative">
            <Button
              size="sm"
              variant="outline"
              className="border-border text-foreground/80 hover:bg-muted"
              onClick={() => setShowColumnMenu(!showColumnMenu)}
            >
              <Columns3 className="w-4 h-4 mr-2" />
              Columns
            </Button>
            {showColumnMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-0 top-full mt-2 bg-muted border border-border rounded-lg shadow-lg z-10 min-w-48"
              >
                <div className="p-2">
                  {allColumns.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => handleToggleColumn(col.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-accent transition-colors ${
                        visibleColumns.includes(col.id)
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 border rounded flex items-center justify-center ${
                          visibleColumns.includes(col.id)
                            ? 'bg-primary border-primary'
                            : 'border-border'
                        }`}
                      >
                        {visibleColumns.includes(col.id) && (
                          <Check className="w-3 h-3 text-primary-foreground" />
                        )}
                      </div>
                      {col.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Add Section Menu */}
          <div className="relative">
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setShowAddMenu(!showAddMenu)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
            {showAddMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-0 top-full mt-2 bg-muted border border-border rounded-lg shadow-lg z-10 min-w-40"
              >
                <button
                  onClick={() => {
                    onRowAction?.('add-complaint', '');
                    setShowAddMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-foreground/80 hover:bg-accent transition-colors hover:text-foreground"
                >
                  New Complaint
                </button>
                <button
                  onClick={() => {
                    onRowAction?.('bulk-import', '');
                    setShowAddMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-foreground/80 hover:bg-accent transition-colors hover:text-foreground border-t border-border"
                >
                  Bulk Import
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {/* Checkbox */}
              <th className="text-left py-3 px-4">
                <Checkbox
                  checked={selectedRows.length === data.length && data.length > 0}
                  onChange={handleSelectAll}
                />
              </th>

              {/* Drag Handle Column */}
              <th className="text-left py-3 px-2" />

              {/* Regular Columns */}
              {allColumns
                .filter((col) => visibleColumns.includes(col.id))
                .map((col) => (
                  <th
                    key={col.id}
                    className="text-left py-3 px-4 text-muted-foreground font-semibold"
                  >
                    {col.label}
                  </th>
                ))}

              {/* Actions Column */}
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`border-b border-border transition-all ${
                  selectedRows.includes(row.id)
                    ? 'bg-accent/50'
                    : 'hover:bg-muted/50'
                }`}
                whileHover={{ scale: 1.01 }}
              >
                {/* Checkbox */}
                <td className="py-3 px-4">
                  <Checkbox
                    checked={selectedRows.includes(row.id)}
                    onChange={() => handleSelectRow(row.id)}
                  />
                </td>

                {/* Drag Handle */}
                <td className="py-3 px-2 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-4 h-4 text-muted-foreground hover:text-foreground/80 transition-colors" />
                </td>

                {/* Data Columns */}
                {visibleColumns.includes('id') && (
                  <td className="py-3 px-4 text-foreground/80 font-mono">{row.id.slice(0, 8)}</td>
                )}
                {visibleColumns.includes('title') && (
                  <td className="py-3 px-4 text-foreground/80">{row.title}</td>
                )}
                {visibleColumns.includes('ward') && (
                  <td className="py-3 px-4 text-foreground/80">{row.wardCode}</td>
                )}
                {visibleColumns.includes('priority') && (
                  <td className="py-3 px-4">
                    <PriorityBadge priority={row.priority} />
                  </td>
                )}
                {visibleColumns.includes('status') && (
                  <td className="py-3 px-4">
                    <StatusBadge status={row.status} />
                  </td>
                )}

                {/* Actions */}
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 h-auto"
                      onClick={() => onRowAction?.('view', row.id)}
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 h-auto"
                      onClick={() => onRowAction?.('edit', row.id)}
                      title="Edit"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-400 hover:bg-muted p-1 h-auto"
                      onClick={() => onRowAction?.('delete', row.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
