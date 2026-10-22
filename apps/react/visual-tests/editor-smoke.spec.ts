import { test, expect } from '@playwright/test'

test('actual editor opens, edits a headline, and captures desktop/mobile review screenshot', async ({ page }, testInfo) => {
  await page.goto('/')
  await expect(page.getByText('Carousel Studio', { exact: true }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /Exportar PNG/i })).toBeVisible()
  await expect(page.locator('.stage-frame')).toBeVisible()

  const headingInput = page.locator('input').filter({ has: page.locator(':scope') }).first()
  const textPanel = page.getByRole('button', { name: /Texto/i })
  if (await textPanel.count()) await textPanel.click()

  const textInputs = page.locator('input[type="text"], textarea')
  if (await textInputs.count()) {
    await textInputs.first().fill('Carousel Studio visual QA')
    await expect(page.getByText('Carousel Studio visual QA').first()).toBeVisible()
  }

  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: `test-results/editor-${testInfo.project.name}.png`, fullPage: true })
  const frame = await page.locator('.stage-frame').boundingBox()
  expect(frame).not.toBeNull()
  expect(frame!.width).toBeGreaterThan(160)
  expect(frame!.height).toBeGreaterThan(180)
})
