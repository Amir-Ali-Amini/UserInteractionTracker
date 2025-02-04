// src/background_test.ts

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// chrome.webNavigation.onCommitted.addListener(
//   (details) => {
//     if (details.frameId === 0) {
//       // Only inject into the main frame
//       chrome.scripting.executeScript({
//         target: { tabId: details.tabId },
//         files: ['js/injected.js'],
//         world: 'MAIN' // Ensures the script is injected into the main world
//       })
//     }
//   },
//   { url: [{ urlMatches: '.*amazon\\.com.*' }, { urlMatches: 'file://.*' }] }
// )
// chrome.tabs.onCreated.addListener((tab) => {
//   if (tab.url.includes('amazon.com') || tab.url.includes('file')) {

//       chrome.scripting.executeScript({
//         target: { tabId: details.tabId },
//         files: ['js/injected.js'],
//         world: 'MAIN' // Ensures the script is injected into the main world
//       })
//   }
// })
// chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
//   if (changeInfo.status === 'loading' && (tab.url.includes('amazon.com') || tab.url.includes('file'))) {
//     chrome.scripting.executeScript({
//       target: { tabId: tabId },
//       files: ['js/injected.js'],
//       world: 'MAIN' // Ensures the script is injected into the main world
//     })
//   }
// })
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { v4 as uuidv4 } from 'uuid'
import { nav, refinement_option, recipes } from './recipe'
let upload_url = 'http://userdatacollect.hailab.io/upload'
let interactions: any[] = []
const interactionsLimit = 100
let screenshots: [string, string][] = []
let reasonsAnnotation: any[] = []
const reasonsLimit = 100
const screenshotLimit = 100
let actionSequenceId = 0
let uploadTimer: NodeJS.Timer | null = null
let userId: string = ''
import { popup_probability } from './config'

interface TabHistory {
    backStack: string[]
    forwardStack: string[]
    currentUrl: string | null
}

const tabNavigationHistory: {
    [tabId: number]: TabHistory
} = {}

function analyzeNavigation(tabId: number, url: string): 'new' | 'back' | 'forward' | 'reload' {
    if (!tabNavigationHistory[tabId]) {
        tabNavigationHistory[tabId] = {
            backStack: [],
            forwardStack: [],
            currentUrl: null
        }
    }

    const history = tabNavigationHistory[tabId]

    if (!history.currentUrl) {
        history.currentUrl = url
        return 'new'
    }
    if (history.currentUrl === url) {
        return 'reload'
    }

    if (history.backStack.length > 0 && history.backStack[history.backStack.length - 1] === url) {
        history.forwardStack.push(history.currentUrl!)
        history.currentUrl = history.backStack.pop()!
        return 'back'
    }

    if (
        history.forwardStack.length > 0 &&
        history.forwardStack[history.forwardStack.length - 1] === url
    ) {
        history.backStack.push(history.currentUrl!)
        history.currentUrl = history.forwardStack.pop()!
        return 'forward'
    }

    history.backStack.push(history.currentUrl!)
    history.forwardStack = []
    history.currentUrl = url
    return 'new'
}

// Replace the simple question with a more detailed one based on event type
function getCustomQuestion(eventType: string, data: any): string {
    switch (eventType) {
        case 'click':
            // Check if it's a specific type of click
            if (data.target.innerText === 'Set Up Now') {
                return "Why did you choose 'Set Up Now' instead of buy once, and why do you like this particular product?"
            } else if (data.target.id === 'buy-now-button') {
                return 'Why did you choose to buy this product immediately, and what convinced you to skip further exploration of other options? Why do you like this particular product?'
            } else if (data.target.className?.includes('sc-product-link')) {
                return 'What made you click on this product, and what specific aspects attracted your attention compared to other search results?'
            } else if (data.target.id === 'add-to-cart-button') {
                return 'Why did you decide to add this item to your cart, and are you planning to buy it now or later? What convinced you that this item was the right choice for your needs?'
            } else {
                return 'What was your reason for clicking on this element?'
            }
        case 'scroll':
            return 'What are you doing while scrolling—are you browsing search results, looking at reviews, or something else, and what are you hoping to find?'
        case 'input':
            return 'What are you searching for, and how did you decide on the search terms you used? Are you looking for a specific product, brand, or feature?'
        case 'navigation':
            if (data.navigationType === 'back') {
                return 'Why did you decide to go back to the previous page, and what were you hoping to revisit or reconsider?'
            } else if (data.navigationType === 'forward') {
                return 'Why did you decide to return to this page after previously navigating away, and what new or unresolved information are you looking for now?'
            }
            return `What is the reason for this ${data.navigationType} navigation?`
        case 'tabActivate':
            return `Why did you switch to this tab? Do you have specific task or information in mind?`
        default:
            return `What is the reason for the ${eventType} action?`
    }
}

// Add new function to handle screenshot saving
async function saveScreenshot_1(screenshotDataUrl: string, screenshotId: string) {
    if (screenshotDataUrl) {
        // Get existing screenshots from storage
        let result = await chrome.storage.local.get({ screenshots: [] })
        let storeScreenshots = result.screenshots || []

        // Add new screenshot
        storeScreenshots.push([screenshotDataUrl, screenshotId])

        // Save back to storage
        await chrome.storage.local.set({ screenshots: storeScreenshots })
        return true
    }
    return false
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    ; (async () => {
        if (message.action === 'saveData') {
            try {
                actionSequenceId++
                const currentactionSequenceId = actionSequenceId
                console.log(currentactionSequenceId)
                message.data.actionSequenceId = currentactionSequenceId
                const uuid = uuidv4()
                message.data.uuid = uuid
                const saveData = async () => {
                    console.log('saveData ', message.data.eventType)
                    let result = await chrome.storage.local.get({ interactions: [] })
                    result = result.interactions || []
                    result.push(message.data)
                    await chrome.storage.local.set({ interactions: result })
                }
                // popup
                // await sendPopup(sender.tab?.id, message.data.timestamp, message.data.eventType, actionSequenceId)
                await Promise.all([
                    saveData(),
                    sendPopup(sender.tab?.id, message.data.timestamp, message.data.eventType, currentactionSequenceId, message.data, uuid)    
                ])
                sendResponse({ success: true })
            } catch (error) {
                console.error('Error in saveData:', error)
                sendResponse({ success: false, error: (error as Error).message })
            }
            return true // Keep message channel open for async response
        }

        // Capture screenshot on demand
        if (message.action === 'captureScreenshot') {
            try {
                console.log('get screenshot request')
                const screenshotDataUrl = await captureScreenshot()
                if (screenshotDataUrl) {
                    const success = await saveScreenshot_1(screenshotDataUrl, message.screenshotId)
                    sendResponse({ success, message: success ? undefined : 'Failed to capture screenshot' })
                } else {
                    sendResponse({ success: false, message: 'Failed to capture screenshot' })
                }
            } catch (error) {
                console.error('Error in captureScreenshot:', error)
                sendResponse({ success: false, message: 'Failed to capture screenshot' })
            }
            return true
        }

        // Download data on user request
        if (message.action === 'downloadData') {
            try {
                console.log('downloadData')
                const success = await uploadDataToServer()
                sendResponse({ success })
            } catch (error) {
                console.error('Error handling download:', error)
                sendResponse({ success: false, error: (error as Error).message })
            }
            return true
        }

        if (message.action === 'clearMemoryCache') {
            try {
                interactions = []
                screenshots = []
                reasonsAnnotation = []
                actionSequenceId = 0
                sendResponse({ success: true })
            } catch (error) {
                console.error('Error handling clearMemoryCache:', error)
                sendResponse({ success: false, error: (error as Error).message })
            }
            return true
        }
        if (message.action === 'getRecipe' && sender.tab?.id) {
            try {
                selectRecipe(sender.tab.id, message.url)
                    .then((recipe) => {
                        sendResponse({ recipe: recipe })
                    })
                    .catch((error) => {
                        sendResponse({ error: error.message })
                    })
            } catch (error) {
                console.error('Error handling getRecipe:', error)
                sendResponse({ success: false, error: (error as Error).message })
            }
            return true // Indicate that sendResponse will be called asynchronously
        }
    })()
    return true // Keeps the message channel open for async responses
})

// Capture the screenshot in the current tab
async function captureScreenshot() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (tab) {
            return await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'jpeg', quality: 25 })
        }
    } catch (error) {
        console.error('Error capturing screenshot:', error)
    }
    return null
}

function hashCode(str: string) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i)
        hash |= 0
    }
    console.log('Hash value before return:', hash)
    return hash.toString()
}

const saveHTML = async (htmlContent: string, currentSnapshotId: string) => {
    let result = await chrome.storage.local.get({ htmlSnapshots: {} })
    const htmlSnapshots = result.htmlSnapshots || {}
    htmlSnapshots[currentSnapshotId] = htmlContent
    await chrome.storage.local.set({ htmlSnapshots })
}

const saveInteraction = async (
    eventType: string,
    timestamp: string,
    target_url: string,
    htmlSnapshotId: string,
    currentactionSequenceId: number,
    uuid: string
) => {
    const data = {
        eventType,
        timestamp,
        target_url,
        htmlSnapshotId,
        actionSequenceId: currentactionSequenceId,
        uuid: uuid
    }
    let interactions = await chrome.storage.local.get({ interactions: [] })
    let storeInteractions = interactions.interactions || []
    storeInteractions.push(data)
    await chrome.storage.local.set({ interactions: storeInteractions })
}

const saveScreenshot = async (windowId: number, timestamp: string) => {
    const screenshotDataUrl = await chrome.tabs.captureVisibleTab(windowId, {
        format: 'jpeg',
        quality: 25
    })

    const screenshotId = `screenshot_${timestamp}`
    await saveScreenshot_1(screenshotDataUrl, screenshotId)
}
const sendPopup = async (
    tabId: number,
    timestamp: string,
    eventType: string,
    currentactionSequenceId: number,
    data: any,
    uuid: string
) => {
    const question = getCustomQuestion(eventType, data)
    if (Math.random() < popup_probability && tabId) {
        try {
            const reason = await chrome.tabs.sendMessage(tabId, {
                action: 'show_popup',
                question: question
            })
            if (reason && reason.input !== null) {
                const newitem = {
                    actionSequenceId: currentactionSequenceId,
                    timestamp: timestamp,
                    eventType: eventType,
                    reason: reason,
                    uuid: uuid
                }
                let result = await chrome.storage.local.get({ reasonsAnnotation: [] })
                let storeReasonsAnnotation = result.reasonsAnnotation || []
                // Add new reason
                storeReasonsAnnotation.push(newitem)
                // Save back to storage
                await chrome.storage.local.set({ reasonsAnnotation: storeReasonsAnnotation })
            }
        } catch (error) {
            console.error('Error popup:', error)
        }
    }
}

// listen to switches between activated tabs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
        const tabId = activeInfo.tabId
        const tab = await chrome.tabs.get(tabId)
        if (!tab) {
            console.error(`Failed to get tab with ID: ${tabId}`)
            return
        }
        console.log(`Switched to tab ${tabId} with URL: ${tab.url}`)
        if (tab.url && (tab.url.includes('amazon.com') || tab.url.includes('file'))) {
            const timestamp = new Date().toISOString()
            const currentSnapshotId = `html_${hashCode(tab.url)}_${timestamp}`
            chrome.tabs.sendMessage(tabId, { action: 'getHTML' }, async (response) => {
                const htmlContent = response?.html
                // await saveHTML(htmlContent, currentSnapshotId)
                // await saveInteraction('tabActivate', timestamp, tab.url, currentSnapshotId, actionSequenceId)
                // await saveScreenshot(tab.windowId, timestamp)

                actionSequenceId++
                const currentactionSequenceId = actionSequenceId
                const uuid = uuidv4()
                await Promise.all([
                    saveHTML(htmlContent, currentSnapshotId),
                    saveInteraction(
                        'tabActivate',
                        timestamp,
                        tab.url,
                        currentSnapshotId,
                        currentactionSequenceId,
                        uuid
                    ),
                    saveScreenshot(tab.windowId, timestamp),
                    sendPopup(tabId, timestamp, 'tabActivate', currentactionSequenceId, {}, uuid)
                ])
            })
        }
    } catch (error) {
        console.error('Error in tab activate handler:', error)
    }
})

async function selectRecipe(tabId: number, url: string) {
    const parsedUrl = new URL(url)
    const path = parsedUrl.pathname

    for (const recipe of recipes) {
        const matchMethod = recipe.match_method || 'text'

        if (matchMethod === 'text') {
            try {
                // Execute script in tab to check for matching element
                const [{ result: hasMatch }] = await chrome.scripting.executeScript({
                    target: { tabId },
                    func: (selector, matchText) => {
                        const element = document.querySelector(selector)
                        return (
                            element &&
                            (!matchText ||
                                (element.textContent?.toLowerCase().includes(matchText.toLowerCase()) ?? false))
                        )
                    },
                    args: [recipe.match, recipe.match_text || '']
                })

                if (hasMatch) {
                    return recipe
                }
            } catch (error) {
                console.error('Error checking text match:', error)
            }
        } else if (matchMethod === 'url' && recipe.match === path) {
            return recipe
        }
    }

    throw new Error(`No matching recipe found for path: ${path}`)
}

chrome.webNavigation.onCommitted.addListener(async (details) => {
    if (details.frameId !== 0) return
    console.log('webNavigation onCommitted event triggered:', details)
    if (details.url.includes('amazon.com') || details.url.includes('file')) {
        const navigationType = analyzeNavigation(details.tabId, details.url)
        console.log(`Navigation type: ${navigationType} for tab ${details.tabId} to ${details.url}`)
        const timestamp = new Date().toISOString()
        chrome.tabs.sendMessage(details.tabId, { action: 'getHTML' }, async (response) => {
            const htmlContent = response?.html
            const currentSnapshotId = `html_${hashCode(details.url)}_${timestamp}`

            // await saveHTML(htmlContent, currentSnapshotId)
            // await saveInteraction('navigation', timestamp, details.url, currentSnapshotId)
            // await saveScreenshot((await chrome.tabs.get(details.tabId)).windowId, timestamp)
            actionSequenceId++
            const currentactionSequenceId = actionSequenceId
            const uuid = uuidv4()
            await Promise.all([
                saveHTML(htmlContent, currentSnapshotId),
                saveInteraction(
                    'navigation',
                    timestamp,
                    details.url,
                    currentSnapshotId,
                    currentactionSequenceId,
                    uuid
                ),
                saveScreenshot((await chrome.tabs.get(details.tabId)).windowId, timestamp)
            ])
            if (navigationType !== 'new' && navigationType !== 'reload') {
                console.log('send message to popup navigation')
                await sendPopup(details.tabId, timestamp, 'navigation', currentactionSequenceId, {
                    navigationType: navigationType
                }, uuid)
            }
        })
    }
})

// Add cleanup when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
    delete tabNavigationHistory[tabId]
})

// Add this function to handle data upload
async function uploadDataToServer() {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const folderName = `DATA/SESSION_${timestamp}`

        // Get userId and data from storage
        const userIdResult = await chrome.storage.local.get({ userId: '' })
        const currentUserId = userIdResult.userId

        const snapshots = await chrome.storage.local.get({ htmlSnapshots: [] })
        const interact = await chrome.storage.local.get({ interactions: [] })
        const orderDetails = await chrome.storage.local.get({ orderDetails: [] })
        const screen = await chrome.storage.local.get({ screenshots: [] })
        const ReasonsAnnotation = await chrome.storage.local.get({ reasonsAnnotation: [] })

        let htmlSnapshots = snapshots.htmlSnapshots || {}
        let storeInteractions = interact.interactions || []
        let storeorderDetails = orderDetails.orderDetails || []
        let storeScreenshots = screen.screenshots || []
        let storeReasonsAnnotation = ReasonsAnnotation.reasonsAnnotation || []

        // const allInteractions = [...storeInteractions, ...interactions];
        // const allScreenshots = [...storeScreenshots, ...screenshots];
        // const allReasons = [...storeReasonsAnnotation, ...reasonsAnnotation];

        // Upload session info
        const sessionInfo = new Blob(
            [
                `Session data for timestamp: ${timestamp}, user id: ${currentUserId} \n order details: \n ${JSON.stringify(
                    orderDetails
                )}`
            ],
            { type: 'text/plain' }
        )
        const sessionFormData = new FormData()
        sessionFormData.append('file', sessionInfo, `${folderName}/session_info.txt`)
        console.log('uploading session info')
        await fetch(upload_url, {
            method: 'POST',
            body: sessionFormData
        })

        // Upload HTML snapshots as separate files
        console.log('uploading html snapshots')
        for (const [snapshotId, htmlContent] of Object.entries(htmlSnapshots)) {
            const htmlBlob = new Blob([htmlContent], { type: 'text/html' })
            const formData = new FormData()
            formData.append('file', htmlBlob, `${folderName}/html/${snapshotId}.html`)
            await fetch(upload_url, { method: 'POST', body: formData })
        }

        // Upload interactions JSON
        console.log('uploading interactions')
        const fullData = {
            interactions: storeInteractions,
            reasons: storeReasonsAnnotation,
            orderDetails: orderDetails
        }
        const interactionsBlob = new Blob([JSON.stringify(fullData, null, 2)], {
            type: 'application/json'
        })
        const jsonFormData = new FormData()

        jsonFormData.append('file', interactionsBlob, `${folderName}/interactions.json`)
        await fetch(upload_url, {
            method: 'POST',
            body: jsonFormData
        })

        // Upload screenshots
        console.log('uploading screenshots')
        for (const [screenshotData, screenshotId] of storeScreenshots) {
            const response = await fetch(screenshotData)
            const blob = await response.blob()
            const formData = new FormData()
            formData.append(
                'file',
                blob,
                `${folderName}/screenshots/${screenshotId.replace(/[:.]/g, '-')}.jpg`
            )
            console.log('uploading screenshots')
            await fetch(upload_url, {
                method: 'POST',
                body: formData
            })
        }

        // Clear cache after successful upload
        chrome.storage.local.remove([
            'htmlSnapshots',
            'interactions',
            'orderDetails',
            'screenshots',
            'reasonsAnnotation'
        ])
        interactions.length = 0
        screenshots.length = 0
        reasonsAnnotation.length = 0

        return true
    } catch (error) {
        console.error('Error uploading data:', error)
        return false
    }
}

// Start the periodic upload timer
function startPeriodicUpload() {
    if (!uploadTimer) {
        uploadTimer = setInterval(uploadDataToServer, 60000) // 60 seconds
    }
}

// Stop the periodic upload timer
function stopPeriodicUpload() {
    if (uploadTimer) {
        clearInterval(uploadTimer)
        uploadTimer = null
    }
}

// startPeriodicUpload();
