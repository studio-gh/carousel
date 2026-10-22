import { test, expect } from '@playwright/test'

test('headline regression fixture renders two lines and both reference surfaces', async ({ page }) => {
  await page.goto('/tests/preview.html')
  await page.waitForFunction(() => (window as any).__visualFixtureReady === true)
  await page.evaluate(() => document.fonts.ready)
  await expect(page.locator('#headline')).toBeVisible()
  const lineCount = await page.locator('#headline').evaluate(el => {
    const children = Array.from(el.childNodes)
    return children.length
  })
  expect(lineCount).toBeGreaterThan(0)
  const bounds = await page.locator('#headline').boundingBox()
  expect(bounds).not.toBeNull()
  expect(bounds!.width).toBeGreaterThan(100)
  const canvasSize = await page.locator('#export-canvas').evaluate((node: HTMLCanvasElement) => ({ width: node.width, height: node.height }))
  expect(canvasSize).toEqual({ width: 1080, height: 1350 })
  await page.screenshot({ path: 'test-results/headline-fixture.png', fullPage: true })
})
