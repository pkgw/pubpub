import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@blueprintjs/core';

require('./pubInlineMenu.scss');

const propTypes = {
	pubData: PropTypes.object.isRequired,
	editorChangeObject: PropTypes.object.isRequired,
	getAbsolutePosition: PropTypes.func.isRequired,
};

const PubInlineMenu = (props)=> {
	const selection = props.editorChangeObject.selection || {};
	const selectionBoundingBox = props.editorChangeObject.selectionBoundingBox || {};

	if (!props.editorChangeObject.selection || selection.empty || props.editorChangeObject.selectedNode) { return null; }

	const menuStyle = {
		position: 'absolute',
		...props.getAbsolutePosition(selectionBoundingBox.top - 50, selectionBoundingBox.left)
	};
	const menuItems = props.editorChangeObject.menuItems;
	const menuItemsObject = menuItems.reduce((prev, curr)=> {
		return { ...prev, [curr.title]: curr };
	}, {});
	const formattingItems = [
		{ key: 'header1', icon: 'header-one' },
		{ key: 'header2', icon: 'header-two' },
		{ key: 'strong', icon: 'bold' },
		{ key: 'em', icon: 'italic' },
	];
	return (
		<div className="pub-inline-menu-component pt-elevation-2" style={menuStyle}>
			{formattingItems.map((item)=> {
				if (!menuItemsObject[item.key]) { return null; }
				return (
					<Button
						className="pt-minimal"
						icon={item.icon}
						active={menuItemsObject[item.key].isActive}
						onClick={menuItemsObject[item.key].run}
						onMouseDown={(evt)=> {
							evt.preventDefault();
						}}
					/>
				);
			})}
		</div>
	);
};


PubInlineMenu.propTypes = propTypes;
export default PubInlineMenu;
