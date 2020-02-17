import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@blueprintjs/core';
import Icon from 'components/Icon/Icon';
import PageAutocomplete from './PageAutocomplete';

require('./navDrag.scss');

const propTypes = {
	initialNav: PropTypes.array.isRequired,
	pages: PropTypes.array.isRequired,
	onChange: PropTypes.func.isRequired,
};

class NavDrag extends Component {
	constructor(props) {
		super(props);
		this.state = {
			nav: props.initialNav.slice(1, props.initialNav.length),
		};
		this.cleanOutputNav = this.cleanOutputNav.bind(this);
		this.reorder = this.reorder.bind(this);
		this.onDragEnd = this.onDragEnd.bind(this);
		this.addItem = this.addItem.bind(this);
		this.removeItem = this.removeItem.bind(this);
	}

	onDragEnd(result) {
		if (!result.destination) {
			return null;
		}
		return this.setState((prevState) => {
			const items =
				result.destination.droppableId === 'mainDroppable'
					? this.reorder(prevState.nav, result.source.index, result.destination.index)
					: prevState.nav.map((item) => {
							if (item.id === result.destination.droppableId) {
								return {
									...item,
									children: this.reorder(
										item.children,
										result.source.index,
										result.destination.index,
									),
								};
							}
							return item;
					  });
			this.props.onChange([this.props.initialNav[0].id, ...this.cleanOutputNav(items)]);
			return { nav: items };
		});
	}

	cleanOutputNav(populatedNav) {
		return populatedNav.map((item) => {
			if (!item.children) {
				return item.id;
			}
			return {
				id: item.id,
				title: item.title,
				children: item.children.map((child) => {
					return child.id;
				}),
			};
		});
	}

	reorder(list, startIndex, endIndex) {
		const result = Array.from(list);
		const [removed] = result.splice(startIndex, 1);
		result.splice(endIndex, 0, removed);

		return result;
	}

	addItem(newItem, dropdownId) {
		this.setState((prevState) => {
			const newItems = dropdownId
				? prevState.nav.map((item) => {
						if (item.id === dropdownId) {
							return {
								...item,
								children: [newItem, ...item.children],
							};
						}
						return item;
				  })
				: [newItem, ...prevState.nav];

			this.props.onChange([this.props.initialNav[0].id, ...this.cleanOutputNav(newItems)]);
			return { nav: newItems };
		});
	}

	removeItem(itemId, dropdownId) {
		this.setState((prevState) => {
			const newItems = !dropdownId
				? prevState.nav.filter((item) => {
						return item.id !== itemId;
				  })
				: prevState.nav.map((item) => {
						if (item.id === dropdownId) {
							return {
								...item,
								children: item.children.filter((subItem) => {
									return subItem.id !== itemId;
								}),
							};
						}
						return item;
				  });
			this.props.onChange([this.props.initialNav[0].id, ...this.cleanOutputNav(newItems)]);
			return { nav: newItems };
		});
	}

	render() {
		const homeTitle = this.props.pages.reduce((prev, curr) => {
			if (!curr.slug) {
				return curr.title;
			}
			return prev;
		}, '');
		return (
			<div className="nav-drag-component">
				<div className="new-collection-wrapper">
					<PageAutocomplete
						pages={this.props.pages}
						usedItems={this.state.nav}
						onSelect={(newItem) => {
							this.addItem(newItem, undefined);
						}}
						allowCustom={true}
					/>
				</div>
				<DragDropContext onDragEnd={this.onDragEnd}>
					<div className="main-list-wrapper">
						<Droppable droppableId="mainDroppable" direction="horizontal">
							{(provided, snapshot) => (
								<div
									ref={provided.innerRef}
									className={`main-list ${
										snapshot.isDraggingOver ? 'dragging' : ''
									}`}
									{...provided.droppableProps}
								>
									<div className="nav-item-background accent-background" />
									<div className="nav-item accent-color">{homeTitle}</div>
									{this.state.nav.map((item, index) => {
										return (
											<Draggable
												key={`draggable-${item.id}`}
												draggableId={item.id}
												index={index}
											>
												{(providedItem, snapshotItem) => (
													<div
														ref={providedItem.innerRef}
														className={`nav-item accent-color ${
															snapshotItem.isDragging
																? 'dragging'
																: ''
														}`}
														{...providedItem.draggableProps}
													>
														<span
															{...providedItem.dragHandleProps}
															className="dragger-horiz"
														>
															<span className="bp3-icon-standard bp3-icon-drag-handle-vertical" />
															{!item.children && !item.isPublic && (
																<Icon icon="lock2" iconSize={14} />
															)}
															{item.title}
															{item.children && (
																<span className="bp3-icon-standard bp3-icon-caret-down bp3-align-right" />
															)}
														</span>
														<Button
															onClick={() => {
																this.removeItem(item.id);
															}}
															className="bp3-icon-small-cross bp3-minimal"
														/>

														{item.children && (
															<div className="dropdown-wrapper bp3-card bp3-elevation-2">
																<PageAutocomplete
																	pages={this.props.pages}
																	usedItems={item.children}
																	placeholder="Add..."
																	onSelect={(newItem) => {
																		this.addItem(
																			newItem,
																			item.id,
																		);
																	}}
																/>
																<Droppable droppableId={item.id}>
																	{(providedSub, snapshotSub) => (
																		<div
																			ref={
																				providedSub.innerRef
																			}
																			className={`sub-list ${
																				snapshotSub.isDraggingOver
																					? 'dragging'
																					: ''
																			}`}
																			{...providedSub.droppableProps}
																		>
																			{item.children.map(
																				(
																					child,
																					childIndex,
																				) => {
																					return (
																						<Draggable
																							key={`subitem-${item.id}-${child.id}`}
																							draggableId={
																								child.id
																							}
																							index={
																								childIndex
																							}
																						>
																							{(
																								providedItemSub,
																								snapshotItemSub,
																							) => (
																								<div
																									ref={
																										providedItemSub.innerRef
																									}
																									className={`sub-nav-item ${
																										snapshotItemSub.isDragging
																											? 'dragging'
																											: ''
																									}`}
																									{...providedItemSub.draggableProps}
																								>
																									<span
																										{...providedItemSub.dragHandleProps}
																										className="dragger-vert"
																									>
																										<span className="bp3-icon-standard bp3-icon-drag-handle-horizontal" />
																										{!child.children &&
																											!child.isPublic && (
																												<Icon
																													icon="lock2"
																													iconSize={
																														14
																													}
																												/>
																											)}
																										{
																											child.title
																										}
																									</span>
																									<Button
																										onClick={() => {
																											this.removeItem(
																												child.id,
																												item.id,
																											);
																										}}
																										className="bp3-minimal bp3-icon-small-cross"
																									/>
																								</div>
																							)}
																						</Draggable>
																					);
																				},
																			)}
																			{
																				providedSub.placeholder
																			}
																		</div>
																	)}
																</Droppable>
															</div>
														)}
													</div>
												)}
											</Draggable>
										);
									})}
									{provided.placeholder}
								</div>
							)}
						</Droppable>
					</div>
				</DragDropContext>
			</div>
		);
	}
}

NavDrag.propTypes = propTypes;
export default NavDrag;
