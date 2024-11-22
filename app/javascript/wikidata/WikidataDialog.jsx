/**
 * @providesModule WikidataDialog
 * @flow
 */

import * as React from 'react'
import { Dialog } from '@blueprintjs/core'
import type { IntlShape } from 'react-intl'
import { injectIntl, FormattedMessage } from 'react-intl'

type Props = {
    openDialog: boolean,
    setOpenDialog: (open: boolean) => void,
    intl: IntlShape,
}

const WikidataDialog = ({ openDialog, setOpenDialog, intl }: Props) => {
    return (
        <Dialog
            isOpen={openDialog}
            icon="graph"
            className="pt-dark"
            title={intl.formatMessage({ id: 'catalog.wikidata.wikidataDialogTitle' })}
            style={{ width: 700 }}
            onClose={() => setOpenDialog(false)}>
                <div style={{ margin: '16px' }}>
                    <FormattedMessage id="catalog.wikidata.aboutWikidata" />
                </div>
        </Dialog>
    )
}

export default injectIntl(WikidataDialog)
