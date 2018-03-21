/* @flow */
import makeClassName from 'classnames';
import deepEqual from 'deep-eql';
import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';

import AddonsCard from 'amo/components/AddonsCard';
import {
  fetchAddonsByAuthors,
  getAddonsForUsernames,
} from 'amo/reducers/addonsByAuthors';
import {
  ADDON_TYPE_DICT,
  ADDON_TYPE_EXTENSION,
  ADDON_TYPE_LANG,
  ADDON_TYPE_THEME,
} from 'core/constants';
import { withErrorHandler } from 'core/errorHandler';
import translate from 'core/i18n/translate';
import type { ErrorHandlerType } from 'core/errorHandler';
import type { AddonType } from 'core/types/addons';
import type { I18nType } from 'core/types/i18n';
import type { DispatchFunc } from 'core/types/redux';

import './styles.scss';


const DEFAULT_ADDON_MAX = 3;

type Props = {|
  addons?: Array<AddonType>,
  addonType?: string,
  authorNames?: Array<string>,
  dispatch: DispatchFunc,
  errorHandler: ErrorHandlerType,
  i18n: I18nType,
  numberOfAddons?: number,
|};

export class MoreAddonsByAuthorsCard extends React.Component<Props> {
  componentWillMount() {
    const { addons, addonType, authorNames } = this.props;

    if (!addons) {
      this.dispatchFetchAddonsByAuthors({ addonType, authorNames });
    }
  }

  componentWillReceiveProps({
    addonType: newAddonType,
    authorNames: newAuthorNames,
  }) {
    const {
      addonType: oldAddonType,
      authorNames: oldAuthorNames,
    } = this.props;

    if (
      oldAddonType !== newAddonType ||
      !deepEqual(oldAuthorNames, newAuthorNames)
    ) {
      this.dispatchFetchAddonsByAuthors({
        addonType: newAddonType,
        authorNames: newAuthorNames,
      });
    }
  }

  dispatchFetchAddonsByAuthors({ addonType, authorNames } = {}) {
    if (!authorNames || !authorNames.length) {
      return;
    }

    this.props.dispatch(fetchAddonsByAuthors({
      addonType,
      authors: authorNames,
      errorHandlerId: this.props.errorHandler.id,
    }));
  }

  render() {
    const { addons, addonType, authorNames, i18n, ...cardProps } = this.props;

    if (!addons || addons.length === 0) {
      return null;
    }

    let header;
    switch (addonType) {
      case ADDON_TYPE_DICT:
        header = i18n.ngettext(
          i18n.sprintf(
            i18n.gettext('More dictionaries by %(author)s'),
            { author: authorNames[0] }
          ),
          i18n.gettext('More dictionaries by these translators'),
          authorNames.length
        );
        break;
      case ADDON_TYPE_EXTENSION:
        header = i18n.ngettext(
          i18n.sprintf(
            i18n.gettext('More extensions by %(author)s'),
            { author: authorNames[0] }
          ),
          i18n.gettext('More extensions by these developers'),
          authorNames.length
        );
        break;
      case ADDON_TYPE_LANG:
        header = i18n.ngettext(
          i18n.sprintf(
            i18n.gettext('More language packs by %(author)s'),
            { author: authorNames[0] }
          ),
          i18n.gettext('More language packs by these translators'),
          authorNames.length
        );
        break;
      case ADDON_TYPE_THEME:
        header = i18n.ngettext(
          i18n.sprintf(
            i18n.gettext('More themes by %(author)s'),
            { author: authorNames[0] }
          ),
          i18n.gettext('More themes by these artists'),
          authorNames.length
        );
        break;
      default:
        header = i18n.ngettext(
          i18n.sprintf(
            i18n.gettext('More add-ons by %(author)s'),
            { author: authorNames[0] }
          ),
          i18n.gettext('More add-ons by these developers'),
          authorNames.length
        );
    }

    const classnames = makeClassName('MoreAddonsByAuthorsCard', {
      'MoreAddonsByAuthorsCard--theme': addonType === ADDON_TYPE_THEME,
    });

    return (
      <AddonsCard
        addons={addons}
        className={classnames}
        header={header}
        {...cardProps}
      />
    );
  }
}

export const mapStateToProps = (state: Object, ownProps: Props) => {
  const { addonType, authorNames, numberOfAddons } = ownProps;

  let addons;
  if (addonType && authorNames && authorNames.length) {
    addons = getAddonsForUsernames(state.addonsByAuthors, authorNames)
      .filter((addon) => {
        return addon.type === addonType;
      })
      .slice(0, numberOfAddons || DEFAULT_ADDON_MAX);
  }

  return { addons };
};

export default compose(
  translate(),
  connect(mapStateToProps),
  withErrorHandler({ name: 'MoreAddonsByAuthorsCard' }),
)(MoreAddonsByAuthorsCard);
