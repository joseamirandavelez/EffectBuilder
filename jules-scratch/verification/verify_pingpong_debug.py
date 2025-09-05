import os
from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Listen for all console events and print them
        page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))

        # Get the absolute path to test.html
        test_html_path = os.path.abspath('test.html')

        # Navigate to the local file
        page.goto(f'file://{test_html_path}')

        # Wait for the canvas to be visible and stable
        canvas = page.locator('#signalCanvas')
        expect(canvas).to_be_visible()

        # Give a short delay for rendering to complete
        page.wait_for_timeout(1000)

        # Take a screenshot
        page.screenshot(path='jules-scratch/verification/verification_debug.png')

        browser.close()

if __name__ == "__main__":
    run()
