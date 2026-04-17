import React, { useState } from 'react';
import { Dropdown, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

// Custom Toggle to look like a form control
const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <div
        ref={ref}
        tabIndex={0} // ✅ important: makes it focusable
        onClick={(e) => {
            e.preventDefault();
            onClick(e);
        }}
        onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e); // open dropdown
            }
            // Let TAB behave naturally → move to next field
        }}
        className="form-control d-flex justify-content-between align-items-center bg-white"
        style={{ cursor: 'pointer', userSelect: 'none' }}
    >
        <span className="text-truncate">{children}</span>
        <span className="text-muted" style={{ fontSize: '0.8em' }}>▼</span>
    </div>
));

// Custom Menu with Search Input
const CustomMenu = React.forwardRef(
    (
        { children, style, className, 'aria-labelledby': labeledBy, onSelect },
        ref
    ) => {
        const [value, setValue] = useState('');
        const [focusedIndex, setFocusedIndex] = useState(0);
        const { t } = useTranslation();

        const items = React.Children.toArray(children);

        const filteredItems = items.filter(
            (child) =>
                !value ||
                (child.props.children &&
                    child.props.children.toString().toLowerCase().includes(value.toLowerCase()))
        );

        const handleKeyDown = (e) => {
            if (!filteredItems.length) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setFocusedIndex((prev) =>
                        prev < filteredItems.length - 1 ? prev + 1 : 0
                    );
                    break;

                case 'ArrowUp':
                    e.preventDefault();
                    setFocusedIndex((prev) =>
                        prev > 0 ? prev - 1 : filteredItems.length - 1
                    );
                    break;

                case 'Enter':
                    e.preventDefault();
                    const selected = filteredItems[focusedIndex];
                    if (selected) {
                        onSelect?.(selected.props.eventKey); // triggers parent → closes dropdown
                    }
                    break;
            }
        };

        return (
            <div
                ref={ref}
                style={style}
                className={className}
                aria-labelledby={labeledBy}
                onKeyDown={handleKeyDown}
            >
                <div className="p-2 sticky-top bg-white border-bottom">
                    <Form.Control
                        autoFocus
                        placeholder={t('searchPlaceholder') || "Type to filter..."}
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value);
                            setFocusedIndex(0);
                        }}
                    />
                </div>

                <ul
                    className="list-unstyled mb-0"
                    style={{ maxHeight: '200px', overflowY: 'auto' }}
                >
                    {filteredItems.map((child, index) =>
                        React.cloneElement(child, {
                            className: `${child.props.className || ''
                                } ${index === focusedIndex ? 'bg-primary text-white' : ''}`,
                        })
                    )}

                    {filteredItems.length === 0 && (
                        <li className="p-2 text-muted text-center small">
                            {t('noResults') || "No results found"}
                        </li>
                    )}
                </ul>
            </div>
        );
    }
);

const SearchableSelect = ({ options, value, onChange, name, placeholder }) => {
    const { t } = useTranslation();
    const [show, setShow] = useState(false);

    const selectedItem = options.find(
        opt => opt.code?.toString() === value?.toString()
    );

    return (
        <Dropdown
            show={show}
            onToggle={(isOpen) => setShow(isOpen)}
            onSelect={(eventKey) => {
                onChange({ target: { name, value: eventKey } });
                setShow(false); // ✅ CLOSE DROPDOWN
            }}
        >
            <Dropdown.Toggle as={CustomToggle} id={`dropdown-${name}`}>
                {selectedItem
                    ? selectedItem.name
                    : (placeholder || t('selectPlaceholder') || "Select...")}
            </Dropdown.Toggle>

            <Dropdown.Menu
                as={CustomMenu}
                className="w-100 shadow"
                onSelect={(eventKey) => {
                    onChange({ target: { name, value: eventKey } });
                    setShow(false); // ✅ CLOSE DROPDOWN
                }}
            >
                {options.map((opt) => (
                    <Dropdown.Item key={opt.code} eventKey={opt.code}>
                        {opt.name}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
};
export {
    SearchableSelect
};