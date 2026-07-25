import React, { useState, useEffect } from 'react';
import { 
  Database, Search, Plus, Save, Trash2, Edit2, ShieldAlert,
  ChevronLeft, ChevronRight, AlertCircle, RotateCcw
} from 'lucide-react';
import { 
  fetchCrudMetadata, fetchCrudList, 
  createCrudRecord, updateCrudRecord, deleteCrudRecord 
} from '../utils/api';

export default function DatabaseManager() {
  const [metadata, setMetadata] = useState<any>({});
  const [selectedTable, setSelectedTable] = useState<string>('District');
  const [records, setRecords] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  
  // Search, Filter & Sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Form states
  const [selectedRecordId, setSelectedRecordId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [formErrors, setFormErrors] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load schemas on mount
  useEffect(() => {
    fetchCrudMetadata().then(meta => {
      setMetadata(meta);
      const tables = Object.keys(meta);
      if (tables.length > 0) {
        setSelectedTable(tables[0]);
      }
    });
  }, []);

  // Fetch table records when table, search, sort, or pagination changes
  useEffect(() => {
    if (!selectedTable) return;
    loadTableData();
  }, [selectedTable, pagination.page, sortField, sortOrder]);

  const loadTableData = () => {
    setIsLoading(true);
    fetchCrudList(selectedTable, {
      page: pagination.page,
      limit: pagination.limit,
      search: searchTerm,
      sortField,
      sortOrder
    }).then(res => {
      setRecords(res.data || []);
      setPagination(res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      setIsLoading(false);
    }).catch(() => {
      showNotification('error', 'Failed to fetch table records.');
      setIsLoading(false);
    });
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleTableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTable(e.target.value);
    setSelectedRecordId(null);
    setFormData({});
    setFormErrors(null);
    setSearchTerm('');
    setSortField('');
    setPagination({ page: 1, limit: 10, total: 0, totalPages: 1 });
  };

  const handleEditClick = (record: any) => {
    const pk = metadata[selectedTable]?.primaryKey;
    setSelectedRecordId(record[pk]);
    setFormData({ ...record });
    setFormErrors(null);
  };

  const handleAddNew = () => {
    setSelectedRecordId(null);
    const defaults: any = {};
    const fields = metadata[selectedTable]?.fields || {};
    Object.keys(fields).forEach(key => {
      if (fields[key].default !== undefined) {
        defaults[key] = fields[key].default;
      } else if (fields[key].type === 'number') {
        defaults[key] = 0;
      } else if (fields[key].type === 'boolean') {
        defaults[key] = false;
      } else {
        defaults[key] = '';
      }
    });
    setFormData(defaults);
    setFormErrors(null);
  };

  const handleInputChange = (fieldName: string, value: any, type: string) => {
    let cleanVal = value;
    if (type === 'number') {
      cleanVal = value === '' ? '' : Number(value);
    } else if (type === 'boolean') {
      cleanVal = value === 'true' || value === true;
    }
    setFormData((prev: any) => ({
      ...prev,
      [fieldName]: cleanVal
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors(null);
    setIsLoading(true);
    
    try {
      if (selectedRecordId !== null) {
        // Update
        await updateCrudRecord(selectedTable, selectedRecordId, formData);
        showNotification('success', `Record ${selectedRecordId} updated successfully.`);
      } else {
        // Create
        await createCrudRecord(selectedTable, formData);
        showNotification('success', 'New record created successfully.');
      }
      setSelectedRecordId(null);
      setFormData({});
      loadTableData();
    } catch (err: any) {
      setFormErrors(err.error || 'Failed to save record. Check permissions or inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm(`Are you sure you want to delete record ID ${id}?`)) return;
    setIsLoading(true);
    try {
      await deleteCrudRecord(selectedTable, id);
      showNotification('success', 'Record deleted successfully.');
      setSelectedRecordId(null);
      setFormData({});
      loadTableData();
    } catch (err: any) {
      showNotification('error', err.error || 'Failed to delete record. Access denied.');
    } finally {
      setIsLoading(false);
    }
  };

  const tableSchema = metadata[selectedTable] || null;
  const fields = tableSchema ? tableSchema.fields : {};
  const pkField = tableSchema ? tableSchema.primaryKey : '';

  return (
    <div className="space-y-6">
      {/* Upper Navigation & Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Database className="h-5 w-5 text-sky-800" />
            KSP Master Database & Registry Management
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Browse tables, manage registers, and audit modifications dynamically.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">Select Table Registry:</label>
          <select 
            value={selectedTable} 
            onChange={handleTableChange}
            className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-800 bg-slate-50 text-slate-800 font-medium"
          >
            {Object.keys(metadata).map(table => (
              <option key={table} value={table}>{metadata[table].displayName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`p-4 rounded-md flex items-center justify-between gap-3 border ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-sm font-bold opacity-60 hover:opacity-100 px-1"
          >
            ×
          </button>
        </div>
      )}

      {/* Dual Layout Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Table List View */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 flex flex-col min-h-[500px]">
          {/* Table Header Controls */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between gap-3 bg-slate-50/50">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search registry..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadTableData()}
                className="pl-9 pr-4 py-2 border border-slate-300 rounded text-sm w-full focus:outline-none focus:border-sky-800"
              />
            </div>

            <div className="flex gap-2">
              <button 
                onClick={loadTableData}
                className="px-3 py-2 border border-slate-300 rounded text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-1.5"
              >
                <RotateCcw className="h-4 w-4" />
                Refresh
              </button>
              <button 
                onClick={handleAddNew}
                className="px-3 py-2 bg-sky-800 text-white rounded text-sm font-semibold hover:bg-sky-900 flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Add Record
              </button>
            </div>
          </div>

          {/* Table View */}
          <div className="flex-1 overflow-x-auto">
            {isLoading ? (
              <div className="h-full flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-800"></div>
              </div>
            ) : records.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Database className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="font-semibold text-slate-500">No records found</p>
                <p className="text-sm mt-1">This table is empty. Click Add Record to create one.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600 font-semibold uppercase text-xs">
                    {Object.keys(fields).map(field => (
                      <th 
                        key={field} 
                        className="px-4 py-3 cursor-pointer hover:bg-slate-100/80"
                        onClick={() => {
                          setSortField(field);
                          setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                        }}
                      >
                        {field} {sortField === field && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {records.map((record, index) => (
                    <tr key={index} className="hover:bg-slate-50/40">
                      {Object.keys(fields).map(field => (
                        <td key={field} className="px-4 py-3 font-mono text-xs">
                          {typeof record[field] === 'boolean' 
                            ? (record[field] ? 'True' : 'False') 
                            : String(record[field] ?? '')}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                        <button 
                          onClick={() => handleEditClick(record)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"
                          title="Edit Record"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(record[pkField])}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                          title="Soft Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Table Footer Pagination */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total items)
            </span>
            <div className="flex gap-1">
              <button 
                disabled={pagination.page <= 1}
                onClick={() => setPagination((prev: any) => ({ ...prev, page: prev.page - 1 }))}
                className="p-1.5 border border-slate-300 rounded disabled:opacity-50 hover:bg-slate-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((prev: any) => ({ ...prev, page: prev.page + 1 }))}
                className="p-1.5 border border-slate-300 rounded disabled:opacity-50 hover:bg-slate-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Form Editor Panel */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 flex flex-col">
          <div className="border-b border-slate-200 pb-3 mb-4">
            <h3 className="text-lg font-bold text-slate-800">
              {selectedRecordId !== null ? `Modify Record ID: ${selectedRecordId}` : 'Add New Entry'}
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Fields will be validated against schemas rules automatically.
            </p>
          </div>

          {Object.keys(formData).length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-slate-400">
              <Database className="h-8 w-8 mb-2 text-slate-300" />
              <p className="font-medium text-slate-500 text-sm">No record selected</p>
              <p className="text-xs">Click Edit on a row or Add Record to begin.</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              {formErrors && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs font-semibold flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{formErrors}</span>
                </div>
              )}

              {Object.entries(fields).map(([fieldName, config]: [string, any]) => {
                const isPk = fieldName === pkField;
                const isSystemField = ['CreatedAt', 'CreatedBy', 'UpdatedAt', 'UpdatedBy', 'IsDeleted', 'VersionNumber'].includes(fieldName);
                if (isSystemField) return null; // handled automatically

                return (
                  <div key={fieldName} className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block uppercase tracking-wider">
                      {fieldName} {config.required && <span className="text-rose-500">*</span>}
                    </label>

                    {config.type === 'boolean' ? (
                      <select
                        value={String(formData[fieldName] ?? false)}
                        onChange={e => handleInputChange(fieldName, e.target.value === 'true', 'boolean')}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-800 bg-white"
                      >
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    ) : (
                      <input
                        type={config.type === 'number' ? 'number' : 'text'}
                        value={formData[fieldName] ?? ''}
                        disabled={isPk && selectedRecordId !== null}
                        onChange={e => handleInputChange(fieldName, e.target.value, config.type)}
                        placeholder={`Enter ${fieldName}...`}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-800 disabled:bg-slate-100"
                        maxLength={config.maxLength}
                      />
                    )}
                    {config.references && (
                      <span className="text-[10px] text-sky-800 font-semibold block">
                        ↳ References lookup field: {config.references}
                      </span>
                    )}
                  </div>
                );
              })}

              <div className="pt-4 border-t border-slate-100 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setFormData({})}
                  className="px-4 py-2 border border-slate-300 rounded text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-sky-800 text-white rounded text-sm font-semibold hover:bg-sky-900 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  Save Entry
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
