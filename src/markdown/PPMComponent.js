import React, { PropTypes } from 'react';
import MDReactComponent from './MDReactComponent';

import abbr from 'markdown-it-abbr';
import emoji from 'markdown-it-emoji';
import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';
import container from 'markdown-it-container';
import ppm from './markdown-it-ppm';
import mathIt from 'markdown-it-math';

import {parsePluginString} from '../utils/parsePlugins';
import Plugins from '../components/EditorPlugins/index';
import InputFields from '../components/EditorPluginFields/index';

import MathComponent from './MathComponent';

import murmur from 'murmurhash';





const MathOptions = {
	inlineOpen: '$$',
	inlineClose: '$$',
	blockOpen: '$$$',
	blockClose: '$$$',
	inlineRenderer: function(str) {
		return 'math';
	},
	blockRenderer: function(str) {
		return 'math';
	},
};

const PPMComponent = React.createClass({
	propTypes: {
		markdown: PropTypes.string,

		assets: PropTypes.object,
		references: PropTypes.object,
		selections: PropTypes.array,

	},

	getInitialState() {
		this.globals = {};
		return {};
	},

	getDefaultProps: function() {
		return {
			markdown: '',
			assets: {},
			references: {},
			selections: [],
		};
	},

	handleIterate: function(globals, Tag, props, children) {
		let Component = Tag;
		const id = children[0] && children[0].replace ? children[0].replace(/\s/g, '-').toLowerCase() : undefined;

		switch(Tag) {
		case 'h1': 
			globals.toc.push({id: id, title: children[0], level: 1,});
			globals.tocH1.push({id: id, title: children[0], level: 1,});
			props.id = id;
			break;
		case 'h2': 
			globals.toc.push({ id: id, title: children[0], level: 2,});
			props.id = id;
			break;
		case 'h3': 
			globals.toc.push({ id: id, title: children[0], level: 3,});
			props.id = id;
			break;
		case 'h4': 
			globals.toc.push({ id: id, title: children[0], level: 4,});
			props.id = id;
			break;
		case 'h5': 
			globals.toc.push({ id: id, title: children[0], level: 5,});
			props.id = id;
			break;
		case 'h6': 
			globals.toc.push({ id: id, title: children[0], level: 6,});
			props.id = id;
			break;

		case 'table':
			props.className = 'table table-striped';
			break;
		case 'div':
			if (props['data-info']) {
				props.className = props.className ? props.className + props['data-info'] : props['data-info'];
			}
			break;
		case 'ppm':
			props.className = 'ppm';
			if (children.length > 1) {
				console.warn('A component should not have multiple children', children);
			}

			if (children[0] === 'pagebreak') {
				return <div className={'pagebreak'} style={{display: 'block', borderTop: '1px dashed #ddd'}}></div>
			}
			if (children[0] === 'linebreak') {
				return <div className={'linebreak p-block'} style={{display: 'block', height: '1.5em'}}></div>
			}


			const pluginName = children[0].split(':')[0];
			const plugin = Plugins[pluginName];
			if (!plugin) {
				console.warn('Could not find a plugin');
				return <span {...props}>{children}</span>;
			}

			Component = plugin.Component;
			const PluginInputFields = plugin.InputFields;
			const pluginString = children[0];
			let pluginProps = parsePluginString(pluginString);

			for (const propName in pluginProps) {
				const propVal = pluginProps[propName];
				const pluginInputField = PluginInputFields.find( field => field.title === propName);
				if (pluginInputField) {
					let inputVal = pluginProps[propName];
					const InputFieldType = pluginInputField.type;
					const Field = InputFields[InputFieldType];
					if (InputFields[InputFieldType].transform) {
						pluginProps[propName] = InputFields[InputFieldType].transform(propVal, pluginInputField.params, this.props.assets, this.props.references, this.props.selections);
					}
				}
			}

			if (plugin.Config.prerender) {
				({globals, pluginProps} = plugin.Config.prerender(globals, pluginProps));
			}

			return <Component {...props} {...pluginProps} />;
			break;

		case 'code':
			if (props['data-language']) {
				return <Tag {...props} className={'codeBlock'} dangerouslySetInnerHTML={{__html: window.hljs.highlight(props['data-language'], children[0]).value}} />
			};
			break;
		case 'math':
			return <MathComponent>{children[0]}</MathComponent>;
			break;
		case 'p':
			props.className = 'p-block';
			props['data-hash'] = murmur.v2(children[0]);
			Component = 'div';
			break;
		}

		return <Component {...props}>{children}</Component>;
	},

	render: function() {
		for (const member in this.globals) delete this.globals[member];
		this.globals.tocH1 = [];
		this.globals.toc = [];

		return (
			<MDReactComponent
				text={this.props.markdown}
				onIterate={this.handleIterate.bind(this, this.globals)}
				markdownOptions={{
					typographer: true,
					linkify: true,
				}}
				plugins={[
					abbr,
					emoji,
					sub,
					sup,
					{plugin: mathIt, args: [MathOptions]},
					{plugin: container, args: ['blank', {validate: ()=>{return true;}}]},
					ppm
				]} />
		);
	}
});

export default PPMComponent;
