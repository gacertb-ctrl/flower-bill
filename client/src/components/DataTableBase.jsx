import React, { useState, useMemo } from 'react';
import DataTable from 'react-data-table-component';

// Custom Filter Component
const FilterComponent = ({ filterText, onFilter, onClear, t }) => (
    <div className="input-group mb-3" style={{ maxWidth: '300px' }}>
        <input
            id="search"
            type="text"
            className="form-control"
            placeholder={t('searchPlaceholder') || "Search..."}
            aria-label="Search Input"
            value={filterText}
            onChange={onFilter}
        />
        <button className="btn btn-outline-secondary" type="button" onClick={onClear}>
            X
        </button>
    </div>
);

const DataTableBase = ({ columns, data, t }) => {
    const [filterText, setFilterText] = useState('');
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

    // Filter Logic: Search across all object keys
    const filteredItems = useMemo(() => {
        if (!filterText) return data;
        return data.filter(item =>
            Object.values(item).some(val =>
                String(val).toLowerCase().includes(filterText.toLowerCase())
            )
        );
    }, [data, filterText]);

    const subHeaderComponentMemo = useMemo(() => {
        const handleClear = () => {
            if (filterText) {
                setResetPaginationToggle(!resetPaginationToggle);
                setFilterText('');
            }
        };

        return (
            <FilterComponent
                onFilter={e => setFilterText(e.target.value)}
                onClear={handleClear}
                filterText={filterText}
                t={t}
            />
        );
    }, [filterText, resetPaginationToggle, t]);

    return (
        <DataTable
            columns={columns}
            data={filteredItems}
            pagination
            paginationResetDefaultPage={resetPaginationToggle} // Reset page on new search
            subHeader
            subHeaderComponent={subHeaderComponentMemo}
            persistTableHead
            highlightOnHover
            pointerOnHover
            responsive
            striped
        />
    );
};

export default DataTableBase;