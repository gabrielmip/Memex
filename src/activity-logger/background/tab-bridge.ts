import { browser, Tabs } from 'webextension-polyfill-ts'

import tabManager from './tab-manager'
import TabChangeListeners from './tab-change-listeners'
import PageVisitLogger from './log-page-visit'
import { TabChangeListener } from './types'

const pageVisitLogger = new PageVisitLogger({ tabManager })
const tabChangeListener = new TabChangeListeners({
    tabManager,
    pageVisitLogger,
})

// Used to stop of tab updated event listeners while the
//  tracking of existing tabs is happening.
let tabQueryP = new Promise(resolve => resolve())

const isTabLoaded = (tab: Tabs.Tab) => tab.status === 'complete'

export const tabUpdatedListener: TabChangeListener = async (
    tabId,
    changeInfo,
    tab,
) => {
    await tabQueryP

    if (changeInfo.status) {
        tabManager.setTabLoaded(tabId, changeInfo.status === 'complete')
    }

    if (changeInfo.favIconUrl) {
        await tabChangeListener.handleFavIcon(tabId, changeInfo, tab)
    }

    if (changeInfo.url) {
        await tabChangeListener.handleUrl(tabId, changeInfo, tab)
    }
}

export async function trackExistingTabs({ isNewInstall = false }) {
    let resolveTabQueryP
    tabQueryP = new Promise(resolve => (resolveTabQueryP = resolve))
    const tabs = await browser.tabs.query({})

    for (const browserTab of tabs) {
        tabManager.trackTab(browserTab, {
            isLoaded: isTabLoaded(browserTab),
            isBookmarked: await tabChangeListener.checkBookmark(browserTab.url),
        })

        await tabChangeListener.injectContentScripts(browserTab).catch(e => e)

        if (!isNewInstall) {
            continue
        }

        if (browserTab.url) {
            tabChangeListener._handleVisitIndexing(
                browserTab.id,
                browserTab,
                browserTab,
            )
        }
    }

    resolveTabQueryP()
}

export async function trackNewTab(id: number) {
    const browserTab = await browser.tabs.get(id)

    tabManager.trackTab(browserTab, {
        isLoaded: isTabLoaded(browserTab),
        isBookmarked: await tabChangeListener.checkBookmark(browserTab.url),
    })
}
