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
  getLoadingForAuthorNames,
} from 'amo/reducers/addonsByAuthors';
import {
  ADDON_TYPE_DICT,
  ADDON_TYPE_EXTENSION,
  ADDON_TYPE_LANG,
  ADDON_TYPE_THEME,
} from 'core/constants';
import { withErrorHandler } from 'core/errorHandler';
import translate from 'core/i18n/translate';
import type { AddonsByAuthors } from 'amo/reducers/addonsByAuthors';
import type { ErrorHandlerType } from 'core/errorHandler';
import type { AddonType } from 'core/types/addons';
import type { I18nType } from 'core/types/i18n';
import type { DispatchFunc } from 'core/types/redux';

import './styles.scss';


const DEFAULT_ADDON_MAX = 3;

type Props = {|
  addons?: Array<AddonType> | null,
  addonType?: string,
  authorNames: Array<string>,
  dispatch: DispatchFunc,
  errorHandler: ErrorHandlerType,
  i18n: I18nType,
  loading?: boolean,
  numberOfAddons?: number,
|};

export class MoreAddonsByAuthorsCardBase extends React.Component<Props> {
  componentWillMount() {
    const { addons, addonType, authorNames } = this.props;

    if (!addons) {
      this.dispatchFetchAddonsByAuthors({ addonType, authorNames });
    }
  }

  componentWillReceiveProps({
    addonType: newAddonType,
    authorNames: newAuthorNames,
  }: Props) {
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

  dispatchFetchAddonsByAuthors({ addonType, authorNames }: any) {
    this.props.dispatch(fetchAddonsByAuthors({
      addonType,
      authors: authorNames,
      errorHandlerId: this.props.errorHandler.id,
    }));
  }

  render() {
    const {
      addons,
      addonType,
      authorNames,
      i18n,
      loading,
      numberOfAddons,
    } = this.props;

    if (!loading && (!addons || !addons.length)) {
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
        loading={loading}
        placeholderCount={numberOfAddons}
      />
    );
  }
}

export const mapStateToProps = (
  state: {| addonsByAuthors: AddonsByAuthors |}, ownProps: Props
) => {
  const { addonType, authorNames, numberOfAddons } = ownProps;

  let addons = getAddonsForUsernames(
    state.addonsByAuthors, authorNames, addonType);
  addons = addons ?
    addons.slice(0, numberOfAddons || DEFAULT_ADDON_MAX) : addons;
  const loading = getLoadingForAuthorNames(
    state.addonsByAuthors, authorNames, addonType);

  return { addons, loading };
};

export default compose(
  translate(),
  connect(mapStateToProps),
  withErrorHandler({ name: 'MoreAddonsByAuthorsCard' }),
)(MoreAddonsByAuthorsCardBase);
