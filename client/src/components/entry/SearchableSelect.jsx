import React, { useState } from 'react';
import { Dropdown, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

// Custom Toggle to look like a form control
const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <div
        ref={ref}
        onClick={(e) => {
            e.preventDefault();
            onClick(e);
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
    ({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {
        const [value, setValue] = useState('');
        const { t } = useTranslation();

        return (
            <div
                ref={ref}
                style={style}
                className={className}
                aria-labelledby={labeledBy}
            >
                <div className="p-2 sticky-top bg-white border-bottom">
                    <Form.Control
                        autoFocus
                        placeholder={t('searchPlaceholder') || "Type to filter..."}
                        onChange={(e) => setValue(e.target.value)}
                        value={value}
                    />
                </div>
                <ul className="list-unstyled mb-0" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {React.Children.toArray(children).filter(
                        (child) =>
                            !value ||
                            (child.props.children &&
                                child.props.children.toString().toLowerCase().includes(value.toLowerCase()))
                    )}
                    {React.Children.toArray(children).filter((child) => !value || (child.props.children && child.props.children.toString().toLowerCase().includes(value.toLowerCase()))).length === 0 && (
                        <li className="p-2 text-muted text-center small">{t('noResults') || "No results found"}</li>
                    )}
                </ul>
            </div>
        );
    },
);

const SearchableSelect = ({ options, value, onChange, name, placeholder }) => {
    const { t } = useTranslation();

    // Find selected item to display its name
    // console.log('SearchableSelect options:', name, options, value);
    const selectedItem = options.find(opt => opt.code?.toString() === value?.toString());

    return (
        <Dropdown onSelect={(eventKey) => onChange({ target: { name, value: eventKey } })}>
            <Dropdown.Toggle as={CustomToggle} id={`dropdown-${name}`}>
                {selectedItem ? selectedItem.name : (placeholder || t('selectPlaceholder') || "Select...")}
            </Dropdown.Toggle>

            <Dropdown.Menu as={CustomMenu} className="w-100 shadow">
                {options.map((opt) => (
                    <Dropdown.Item
                        key={opt.code}
                        eventKey={opt.code}
                        active={value?.toString() === opt.code?.toString()}
                    >
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