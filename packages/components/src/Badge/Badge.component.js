import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import i18n from 'i18next';
import { translate } from 'react-i18next';

import I18N_DOMAIN_COMPONENTS from '../constants';
import Action from '../Actions/Action';
import theme from './Badge.scss';

function renderDeleteIcon(onDelete, disabled, t) {
	return (
		<Action
			label={t('BADGE_DELETE', { defaultValue: 'delete' })}
			hideLabel
			onClick={(e, ...rest) => { e.stopPropagation(); onDelete(e, ...rest); }}
			disabled={disabled}
			icon="talend-cross"
			className={classNames('tc-badge-delete-icon', theme['tc-badge-delete-icon'])}
		/>
	);
}

function Badge({ label, category, onDelete, onSelect, selected, disabled, t }) {
	const badgeClasses = classNames(
		'tc-badge', theme['tc-badge'],
		selected && ['tc-badge-selected', theme['tc-badge-selected']],
		disabled && ['tc-badge-disabled', theme['tc-badge-disabled']],
	);
	const labelClasses = classNames('tc-badge-label', theme['tc-badge-label']);
	const categoryClasses = classNames('tc-badge-category', theme['tc-badge-category']);

	return (
		<div className={badgeClasses} onClick={!disabled && onSelect}>
			{category && <span className={categoryClasses}>
				{category}
			</span>}
			<span className={labelClasses}>
				{label}
			</span>
			{onDelete && renderDeleteIcon(onDelete, disabled, t)}
		</div>
	);
}

Badge.propTypes = {
	label: PropTypes.string,
	category: PropTypes.string,
	onDelete: PropTypes.func,
	onSelect: PropTypes.func,
	selected: PropTypes.bool,
	disabled: PropTypes.bool,
	t: PropTypes.func.isRequired,
};

Badge.defaultProps = {
	selected: false,
	disabled: false,
};

export default translate(I18N_DOMAIN_COMPONENTS, { i18n: i18n.init() })(Badge);
