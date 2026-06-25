import { test, expect } from '@playwright/test'

test.describe('Whack-a-Mole Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('shows start screen with Start Game button', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Whack-a-Mole' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Start Game' })).toBeVisible()
  })

  test('starts game on button click and shows game board', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Game' }).click()

    await expect(page.locator('.game-board')).toBeVisible()
    await expect(page.locator('.scoreboard')).toBeVisible()
    await expect(page.locator('.score-display')).toContainText('Score: 0')
  })

  test('timer counts down from 30', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Game' }).click()

    await expect(page.locator('.timer-display')).toContainText('30s')
    await page.waitForTimeout(1100)
    const timerText = await page.locator('.timer-display').textContent()
    const seconds = parseInt(timerText?.replace(/\D/g, '') ?? '30')
    expect(seconds).toBeLessThan(30)
  })

  test('moles appear during gameplay', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Game' }).click()

    await expect(page.locator('.mole-visible')).toBeVisible({ timeout: 3000 })
  })

  test('clicking a visible mole increases score', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Game' }).click()

    const mole = page.locator('.mole-visible').first()
    await mole.waitFor({ timeout: 3000 })
    await mole.click()

    await expect(page.locator('.score-display')).not.toContainText('Score: 0')
  })

  test('game ends after 30 seconds and shows game over', async ({ page }) => {
    test.setTimeout(40_000)

    await page.getByRole('button', { name: 'Start Game' }).click()

    await expect(page.getByRole('heading', { name: 'Game Over!' })).toBeVisible({ timeout: 35_000 })
    await expect(page.getByPlaceholder('Enter your name')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Submit Score' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Play Again' })).toBeVisible()
  })

  test('can play again after game over', async ({ page }) => {
    test.setTimeout(40_000)

    await page.getByRole('button', { name: 'Start Game' }).click()

    await expect(page.getByRole('heading', { name: 'Game Over!' })).toBeVisible({ timeout: 35_000 })

    await page.getByRole('button', { name: 'Play Again' }).click()

    await expect(page.locator('.game-board')).toBeVisible()
    await expect(page.locator('.score-display')).toContainText('Score: 0')
  })

  test('submit score button disabled when name is empty', async ({ page }) => {
    test.setTimeout(40_000)

    await page.getByRole('button', { name: 'Start Game' }).click()
    await expect(page.getByRole('heading', { name: 'Game Over!' })).toBeVisible({ timeout: 35_000 })

    await expect(page.getByRole('button', { name: 'Submit Score' })).toBeDisabled()
  })

  test('submit score button enabled when name entered', async ({ page }) => {
    test.setTimeout(40_000)

    await page.getByRole('button', { name: 'Start Game' }).click()
    await expect(page.getByRole('heading', { name: 'Game Over!' })).toBeVisible({ timeout: 35_000 })

    await page.getByPlaceholder('Enter your name').fill('TestPlayer')
    await expect(page.getByRole('button', { name: 'Submit Score' })).toBeEnabled()
  })

  test('game board has 9 mole holes', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Game' }).click()

    const holes = page.locator('.mole-hole')
    await expect(holes).toHaveCount(9)
  })
})
