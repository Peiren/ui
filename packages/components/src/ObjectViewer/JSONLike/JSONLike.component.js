import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import invariant from 'invariant';

import Icon from '../../Icon';
import TooltipTrigger from '../../TooltipTrigger';
import theme from './JSONLike.scss';

function noop() { }

const VALIDE_TYPES = ['number', 'string', 'boolean'];
const COMPLEX_TYPES = ['object', 'array'];

export function NativeValue({ data, edit, onClick, onChange, jsonpath }) {
	const type = typeof data;
	let display = data;
	let inputType = 'number';
	if (type === 'boolean') {
		display = data.toString();
		inputType = 'checkbox';
	} else if (type === 'string') {
		inputType = 'text';
	}
	if (edit) {
		return <input type={inputType} value={data} onChange={e => onChange(e, { jsonpath })} />;
	}
	return (
		<button
			type="button"
			className={`btn btn-link btn-xs ${theme[type]} ${theme.native}`}
			onClick={e => onClick(e, { data, edit, jsonpath })} >
			{display}
		</button >
	);
}

NativeValue.propTypes = {
	data: PropTypes.oneOfType([
		PropTypes.bool,
		PropTypes.number,
		PropTypes.string,
	]),
	edit: PropTypes.bool,
	onClick: PropTypes.func,
	onChange: PropTypes.func,
	jsonpath: PropTypes.string,
};

/**
 * return JSONPath braket notation
 * @param  {string} key    object key
 * @param  {string} prefix current jsonpath
 * @param  {string} type   one of 'array' or 'object'
 * @return {string}        jsonpath
 */
export function getJSONPath(key, prefix, type) {
	if (type === 'array') {
		return `${prefix}[${key}]`;
	}
	return `${prefix}['${key}']`;
}

export function LineItem({ name, onMouseOver, mouseOverData, children }) {
	const props = {};

	if (onMouseOver && onMouseOver !== noop) {
		props.onMouseOver = e => onMouseOver(e, mouseOverData);
	}

	return (
		<span {...props}>
			{name ? <span className={theme.name}>{name}</span> : null}
			{children}
		</span>
	);
}

LineItem.propTypes = {
	name: PropTypes.string,
	onMouseOver: PropTypes.func,
	children: PropTypes.node,
	mouseOverData: PropTypes.object,  // eslint-disable-line react/forbid-prop-types
};

export function getDataInfo(data, tupleLabel) {
	const info = {
		type: typeof data,
		keys: Object.keys(data),
	};

	if (VALIDE_TYPES.indexOf(info.type) === -1) {
		invariant(true, `Type ${info.type} is not supported`);
	}

	if (Array.isArray(data)) {
		info.type = 'array';
		info.length = data.length;
	} else if (info.type === 'object') {
		info.keys = Object.keys(data);
		info.length = info.keys.length;

		if (tupleLabel && tupleLabel.length > 0) {
			info.type = tupleLabel;
		}
	}

	return info;
}

function abstracter(acc, item) {
	const arrayAbstract = '[...]';
	const objectAbstract = '{...}';

	if (Array.isArray(item)) {
		return acc.length > 0 ? `${acc}, ${arrayAbstract}` : arrayAbstract;
	} else if (typeof item === 'object') {
		return acc.length > 0 ? `${acc}, ${objectAbstract}` : objectAbstract;
	}
	return acc.length > 0 ? `${acc}, ${item}` : `${item}`;
}

export function getDataAbstract(data) {
	let abstract = '';

	if (Array.isArray(data)) {
		abstract = data.reduce((acc, item) => abstracter(acc, item), abstract);
	} else if (typeof data === 'object') {
		const oKeys = Object.keys(data);

		abstract = oKeys.reduce((acc, key) => abstracter(acc, data[key]), abstract);
	}

	return abstract;
}

export function Item({ data, name, opened, edited, jsonpath, ...props }) {
	if (props.tupleLabel) {
		COMPLEX_TYPES.push(props.tupleLabel);
	}

	if (data === undefined) {
		return null;
	}
	const info = getDataInfo(data, props.tupleLabel);
	const isNativeType = COMPLEX_TYPES.indexOf(info.type) === -1;
	const isEdited = edited.indexOf(jsonpath) !== -1 && !!props.onChange;
	const isOpened = opened.indexOf(jsonpath) !== -1 || props.onClick === noop;

	if (isNativeType) {
		return (
			<LineItem
				name={name}
				onMouseOver={props.onMouseOver}
				mouseOverData={{ data, isOpened, isEdited }}
			>
				<NativeValue
					data={data}
					edit={isEdited}
					jsonpath={jsonpath}
					onClick={props.onClick}
					onChange={props.onChange}
				/>
			</LineItem>
		);
	}

	const iconName = isOpened ? 'talend-caret-down' : 'talend-chevron-left';
	const iconTransform = isOpened ? null : 'rotate-180';
	const btn = classNames(
		'btn btn-xs btn-link',
		theme.btn,
	);

	return (
		<LineItem name={name} mouseOverData={{ data, isOpened, isEdited }}>
			<span className={theme.hierarchical}>
				<button
					type="button"
					className={btn}
					onClick={e => props.onClick(e, { data, isOpened, jsonpath })}
				>
					<Icon name={iconName} transform={iconTransform} />
					{info.type}
					<TooltipTrigger
						className="offset"
						label={getDataAbstract(data)}
						tooltipPlacement="right">
						<sup className="badge">{info.length}</sup>
					</TooltipTrigger>
				</button>
				<ul className={!isOpened ? 'hidden' : null}>
					{info.keys.map((key, i) => {
						const jpath = getJSONPath(key, jsonpath, info.type);
						return (
							<li key={i}>
								<Item
									{...props}
									data={data[key]}
									name={key}
									jsonpath={jpath}
									opened={opened}
									edited={edited}
								/>
							</li>
						);
					})}
				</ul>
			</span>
		</LineItem>
	);
}

Item.propTypes = {
	data: PropTypes.oneOfType([
		PropTypes.bool,
		PropTypes.number,
		PropTypes.string,
		PropTypes.object,
		PropTypes.array,
	]),
	name: PropTypes.string,
	opened: PropTypes.arrayOf(PropTypes.string),
	edited: PropTypes.arrayOf(PropTypes.string),
	jsonpath: PropTypes.string,
	tupleLabel: PropTypes.string,
	onMouseOver: PropTypes.func,
	onClick: PropTypes.func,
	onSubmit: PropTypes.func,
	onChange: PropTypes.func,
};

Item.defaultProps = {
	opened: [],
	edited: [],
	jsonpath: '$',
	onMouseOver: noop,
	onClick: noop,
};

/**
 * display a tree view json like.
 * this is an indented list of item where each item render 'id: type #items'
 * @param {object} props react
 */
export function JSONLike({ onSubmit, ...props }) {
	if (onSubmit) {
		return (
			<form
				className={`tc-object-viewer ${theme.container} `}
				onSubmit={(event) => {
					onSubmit(event);
					event.preventDefault();
				}}
			>
				{props.rootLabel}
				<Item {...props} />
			</form>
		);
	}
	return (
		<div className={`tc-object-viewer ${theme.container} `}>
			{props.rootLabel}
			<Item {...props} />
		</div>
	);
}

JSONLike.propTypes = {
	onSubmit: PropTypes.func,
	rootLabel: PropTypes.string,
	tupleLabel: PropTypes.string,
};

export default JSONLike;
